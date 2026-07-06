// src/services/api.js - Enhanced API Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const validateFlagLocally = (rawFlag) => {
  if (typeof rawFlag !== 'string') return { valid: false, error: 'Flag must be a string.' };
  const cleaned = rawFlag.trim();
  if (!cleaned) return { valid: false, error: 'Please enter a flag before submitting.' };
  return { valid: true, cleaned };
};


class APIService {
  constructor() {
    this._memoryCache = new Map();
  }

  // ── Auth helper ─────────────────────────────────────────────────────────────
  // Attaches the JWT stored in localStorage to every request so the backend
  // can verify the caller's identity.
  _authHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  _cacheUserKey() {
    return localStorage.getItem('userId') || 'anonymous';
  }

  _cacheKey(endpoint) {
    return `${this._cacheUserKey()}::${endpoint}`;
  }

  _readCache(endpoint, ttlMs) {
    const key = this._cacheKey(endpoint);
    const now = Date.now();
    const memEntry = this._memoryCache.get(key);
    if (memEntry && now - memEntry.ts < ttlMs) return memEntry.data;

    try {
      const raw = sessionStorage.getItem(`api-cache:${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || now - parsed.ts >= ttlMs) {
        sessionStorage.removeItem(`api-cache:${key}`);
        return null;
      }
      this._memoryCache.set(key, parsed);
      return parsed.data;
    } catch {
      return null;
    }
  }

  _writeCache(endpoint, data) {
    const key = this._cacheKey(endpoint);
    const entry = { ts: Date.now(), data };
    this._memoryCache.set(key, entry);
    try {
      sessionStorage.setItem(`api-cache:${key}`, JSON.stringify(entry));
    } catch {
      // Storage quota or browser policy failure — memory cache still works.
    }
  }

  _invalidateCachePrefix(endpointPrefix) {
    const userPrefix = `${this._cacheUserKey()}::${endpointPrefix}`;
    for (const key of this._memoryCache.keys()) {
      if (key.startsWith(userPrefix)) {
        this._memoryCache.delete(key);
      }
    }
    try {
      const storagePrefix = `api-cache:${userPrefix}`;
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(storagePrefix)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // ignore
    }
  }

  async _cachedGet(endpoint, { ttlMs = 15000, forceRefresh = false } = {}) {
    if (!forceRefresh) {
      const cached = this._readCache(endpoint, ttlMs);
      if (cached !== null) return cached;
    }
    const data = await this.request(endpoint);
    this._writeCache(endpoint, data);
    return data;
  }

  peekMachinesCache(ttlMs = 120000) {
    return this._readCache('/api/machines', ttlMs);
  }

  // ── Core request helper ──────────────────────────────────────────────────────
  async request(endpoint, options = {}) {
    try {
      const { headers: extraHeaders, ...restOptions } = options;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders(),
          ...extraHeaders,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'API request failed' }));

        // Surface the Retry-After header from rate-limit responses so callers
        // can display an accurate cooldown countdown to the user.
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const err = new Error(error.detail || 'Too many attempts. Please wait before retrying.');
          err.status = 429;
          err.retryAfter = retryAfter ? parseInt(retryAfter, 10) : 60;
          throw err;
        }
        const detail = error.detail;
        const message = typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map(e => e.msg || JSON.stringify(e)).join('; ')
            : detail
              ? JSON.stringify(detail)
              : 'API request failed';
        const err = new Error(message);
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      // Suppress expected 404s (e.g. my-assignment when user is campaign owner)
      // to keep the console clean — callers handle these gracefully
      if (error?.status !== 404 && !error?.message?.includes('404')) {
        console.error(`API Error (${endpoint}):`, error);
      }
      throw error;
    }
  }

  // ── Stats & Dashboard ────────────────────────────────────────────────────────
  async getStats(userId = null) {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
    return this.request(`/api/stats${query}`);
  }

  async getPlatformStats() {
    return this.request('/api/statistics');
  }

  // ── Campaigns ────────────────────────────────────────────────────────────────
  async createCampaign(campaignName, machineIds, timeLimitMinutes = 30) {
    const result = await this.request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        campaign_name: campaignName,
        machine_ids: machineIds,
        time_limit_minutes: timeLimitMinutes,
      }),
    });
    this._invalidateCachePrefix('/api/campaigns');
    return result;
  }

  async getUserCampaigns(options = {}) {
    return this._cachedGet('/api/campaigns', { ttlMs: 15000, ...options });
  }

  async getAssignedCampaigns() {
    return this.request('/api/campaigns/assigned');
  }

  async getOrgCampaigns() {
    return this.request('/api/campaigns/org');
  }

  async getCampaign(campaignId) {
    return this.request(`/api/campaigns/${campaignId}`);
  }

  async deleteCampaign(campaignId) {
    const result = await this.request(`/api/campaigns/${campaignId}`, { method: 'DELETE' });
    this._invalidateCachePrefix('/api/campaigns');
    return result;
  }

  // ── Campaign Assignment (teacher → students) ────────────────────────────────
  async assignCampaign(campaignId, userIds) {
    const result = await this.request(`/api/campaigns/${campaignId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
    this._invalidateCachePrefix('/api/campaigns');
    this._invalidateCachePrefix('/api/staff/students');
    return result;
  }

  async getCampaignAssignments(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/assignments`);
  }

  // ── Campaign Sharing (friends, max 5) ───────────────────────────────────────
  async shareCampaign(campaignId, userIds) {
    return this.request(`/api/campaigns/${campaignId}/share`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  // ── Campaign Timer ──────────────────────────────────────────────────────────
  async startCampaign(campaignId) {
    // Alias used by Dashboard "Start Campaign" button
    return this.request(`/api/campaigns/${campaignId}/start`, { method: 'POST' });
  }

  async startCampaignTimer(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/start`, { method: 'POST' });
  }

  async expireCampaign(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/expire`, { method: 'POST' });
  }

  async extendMyCampaignTimer(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/extend`, { method: 'POST' });
  }

  async extendActiveCampaignTimers(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/extend-active`, { method: 'POST' });
  }

  async getMyAssignment(campaignId) {
    // Returns the current user's assignment record for a specific campaign
    return this.request(`/api/campaigns/${campaignId}/my-assignment`);
  }

  // ── Campaign Progress & Grading (teacher view) ──────────────────────────────
  async getCampaignAllProgress(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/progress`);
  }

  async submitGrades(campaignId, grades) {
    return this.request(`/api/campaigns/${campaignId}/grades`, {
      method: 'POST',
      body: JSON.stringify({ grades }),
    });
  }

  async getCampaignGrades(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/grades`);
  }

  // ── Students (teacher management) ───────────────────────────────────────────
  async uploadStudentCSV(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/staff/students/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,  // multipart — no Content-Type header
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }
    return response.json();
  }

  async getTeacherStudents(options = {}) {
    return this._cachedGet('/api/staff/students', { ttlMs: 20000, ...options });
  }

  async getStudent(studentId) {
    return this.request(`/api/staff/students/${studentId}`);
  }

  // ── Teacher Settings (admin manages) ────────────────────────────────────────
  async getTeacherSettings(teacherId) {
    return this.request(`/api/auth/enterprise/staff/${teacherId}/settings`);
  }

  async updateTeacherSettings(teacherId, settings) {
    return this.request(`/api/auth/enterprise/staff/${teacherId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ── User Search (for campaign sharing) ──────────────────────────────────────
  async searchUsers(query) {
    return this.request(`/api/users/search?q=${encodeURIComponent(query)}`);
  }

  async getCampaignProgress(campaignId, userId) {
    return this.request(`/api/campaigns/${campaignId}/progress?user_id=${encodeURIComponent(userId)}`);
  }


  // ── Machines ─────────────────────────────────────────────────────────────────
  async getMachines(options = {}) {
    const { forceRefresh = false, ttlMs = 30000 } = options;
    if (forceRefresh) {
      const data = await this.request('/api/machines?refresh=true');
      this._writeCache('/api/machines', data);
      return data;
    }
    return this._cachedGet('/api/machines', { ttlMs });
  }

  async getMachine(machineId) {
    return this.request(`/api/machines/${machineId}`);
  }

  async extendMachineTimer(machineId) {
    const result = await this.request(`/api/machines/${machineId}/extend`, { method: 'POST' });
    this._invalidateCachePrefix('/api/machines');
    return result;
  }

  async deleteMachine(machineId) {
    const result = await this.request(`/api/machines/${machineId}`, { method: 'DELETE' });
    this._invalidateCachePrefix('/api/machines');
    return result;
  }

  async getMachineStats(machineId) {
    return this.request(`/api/machines/${machineId}/stats`);
  }

  // ── Flag validation ───────────────────────────────────────────────────────────
  /**
   * Submit a flag for validation.
   *
   * Validation happens in two layers:
   *   1. Client-side (instant, no network): format, length, allowed characters.
   *   2. Server-side (authoritative):        same rules + rate limiting.
   *
   * If the client-side check fails, an error is thrown immediately so the UI
   * can show the message without waiting for a network round-trip.
   *
   * The error thrown for a rate-limit (HTTP 429) carries:
   *   error.status      = 429
   *   error.retryAfter  = seconds until the user can try again
   *
   * @param {string} machineId
   * @param {string} flag        Raw user input (will be trimmed here and on server)
   * @param {string} userId
   */
  async validateFlag(machineId, flag, userId, campaignId = null) {
    // ── Layer 1: client-side validation ─────────────────────────────────────
    const check = validateFlagLocally(flag);
    if (!check.valid) {
      // Throw in the same shape as server errors so CampaignDetail.jsx can
      // display it with the same error-handling code path.
      throw new Error(check.error);
    }

    // ── Layer 2: server-side validation + rate limiting ──────────────────────
    return this.request('/api/flags/validate', {
      method: 'POST',
      body: JSON.stringify({
        machine_id: machineId,
        campaign_id: campaignId,
        flag: check.cleaned,   // send the trimmed value
        user_id: userId,
      }),
    });
  }

  // ── Docker — global ───────────────────────────────────────────────────────────
  async startContainers() {
    return this.request('/api/docker/start', { method: 'POST' });
  }

  async stopContainers() {
    return this.request('/api/docker/stop', { method: 'POST' });
  }

  async restartContainers() {
    return this.request('/api/docker/restart', { method: 'POST' });
  }

  async destroyContainers() {
    return this.request('/api/docker/destroy', { method: 'DELETE' });
  }

  async getDockerStatus() {
    return this.request('/api/docker/status');
  }

  async getCampaignContainers(campaignId) {
    return this.request(`/api/docker/campaign/${campaignId}/containers`);
  }

  // ── Docker — individual containers ───────────────────────────────────────────
  async startContainer(containerId) {
    const result = await this.request(`/api/docker/container/${containerId}/start`, { method: 'POST' });
    this._invalidateCachePrefix('/api/machines');
    return result;
  }

  async stopContainer(containerId) {
    const result = await this.request(`/api/docker/container/${containerId}/stop`, { method: 'POST' });
    this._invalidateCachePrefix('/api/machines');
    return result;
  }

  async restartContainer(containerId) {
    const result = await this.request(`/api/docker/container/${containerId}/restart`, { method: 'POST' });
    this._invalidateCachePrefix('/api/machines');
    return result;
  }

  async removeContainer(containerId) {
    return this.request(`/api/docker/container/${containerId}`, { method: 'DELETE' });
  }

  async getContainerLogs(containerId, tail = 100) {
    return this.request(`/api/docker/container/${containerId}/logs?tail=${tail}`);
  }

  // ── Docker — individual machines ─────────────────────────────────────────────
  async startMachineContainer(machineId) {
    return this.request(`/api/machines/${machineId}/docker/start`, { method: 'POST' });
  }

  async stopMachineContainer(machineId) {
    return this.request(`/api/machines/${machineId}/docker/stop`, { method: 'POST' });
  }

  async restartMachineContainer(machineId) {
    return this.request(`/api/machines/${machineId}/docker/restart`, { method: 'POST' });
  }

  async getMachineContainerStatus(machineId) {
    return this.request(`/api/machines/${machineId}/docker/status`);
  }

  async getMachineContainerLogs(machineId, tail = 100) {
    return this.request(`/api/machines/${machineId}/docker/logs?tail=${tail}`);
  }

  // ── Docker — campaign-level ───────────────────────────────────────────────────
  async startCampaignContainers(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/docker/start`, { method: 'POST' });
  }

  async stopCampaignContainers(campaignId) {
    return this.request(`/api/campaigns/${campaignId}/docker/stop`, { method: 'POST' });
  }

  // ── Users ─────────────────────────────────────────────────────────────────────
  async createUser(username, email, role = 'individual') {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify({ username, email, role }),
    });
  }

  async getUser(userId) {
    return this.request(`/api/users/${encodeURIComponent(userId)}`);
  }

  async getUserProgress(userId) {
    return this.request(`/api/users/${encodeURIComponent(userId)}/progress`);
  }

  async getUserSkills(userId) {
    return this.request(`/api/users/${encodeURIComponent(userId)}/skills`);
  }

  async getUserRecommendations(userId, topN = 5) {
    return this.request(`/api/users/${encodeURIComponent(userId)}/recommendations?top_n=${topN}`);
  }

  async logInteraction(userId, vulnType, outcome, machineId = null) {
    return this.request(`/api/users/${encodeURIComponent(userId)}/interaction`, {
      method: 'POST',
      body: JSON.stringify({ vuln_type: vulnType, outcome, machine_id: machineId }),
    });
  }

  async getTrending() {
    return this.request('/api/recommendations/trending');
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────────
  async getLeaderboard(limit = 100, timeframe = 'all_time') {
    return this.request(`/api/leaderboard?limit=${limit}&timeframe=${timeframe}`);
  }


  // ── VPN (WireGuard) ──────────────────────────────────────────────────────────
  async vpnConnect(machineId) {
    return this.request(`/api/vpn/${machineId}/connect`, { method: 'POST' });
  }

  async vpnDisconnect(machineId) {
    return this.request(`/api/vpn/${machineId}/disconnect`, { method: 'DELETE' });
  }

  async vpnStatus(machineId) {
    return this.request(`/api/vpn/${machineId}/status`);
  }

  // ── Health Check ──────────────────────────────────────────────────────────────
  async healthCheck() {
    return this.request('/health');
  }

  // ── Social ────────────────────────────────────────────────────────────────────
  async getPublicProfile(username) {
    return this.request(`/api/social/profiles/${encodeURIComponent(username)}`);
  }

  async sendFriendRequest(addresseeId) {
    return this.request(`/api/social/friends/request/${addresseeId}`, { method: 'POST' });
  }

  async respondFriendRequest(friendshipId, action) {
    return this.request(`/api/social/friends/respond/${friendshipId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
  }

  async removeFriend(friendId) {
    return this.request(`/api/social/friends/${friendId}`, { method: 'DELETE' });
  }

  async getFriends(userId) {
    return this.request(`/api/social/friends/${userId}`);
  }

  async getPendingRequests(userId) {
    return this.request(`/api/social/friends/${userId}/pending`);
  }

  async getNotifications(userId, limit = 30) {
    return this.request(`/api/social/notifications/${userId}?limit=${limit}`);
  }

  async getUnreadCount(userId) {
    return this.request(`/api/social/notifications/${userId}/unread-count`);
  }

  async markNotificationsRead(userId, notifIds = null) {
    return this.request(`/api/social/notifications/${userId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notif_ids: notifIds }),
    });
  }

  async setPrivacy(userId, isPrivate) {
    return this.request(`/api/social/privacy/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_private: isPrivate }),
    });
  }

  // ── Co-op / Race sessions ────────────────────────────────────────────────────
  async inviteToSession(machineId, friendId, mode) {
    return this.request('/api/coop/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machine_id: machineId, friend_id: friendId, mode }),
    });
  }

  async respondToSession(sessionId, action) {
    return this.request(`/api/coop/respond/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
  }

  async getCoopSession(sessionId) {
    return this.request(`/api/coop/session/${sessionId}`);
  }

  async getCoopSessions() {
    return this.request('/api/coop/sessions');
  }

  async sendChatMessage(sessionId, message) {
    return this.request(`/api/coop/session/${sessionId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  }

  async getChatMessages(sessionId) {
    return this.request(`/api/coop/session/${sessionId}/chat`);
  }

  async submitCoopFlag(sessionId, flag) {
    return this.request(`/api/coop/session/${sessionId}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag }),
    });
  }

  async cancelCoopSession(sessionId) {
    return this.request(`/api/coop/session/${sessionId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  }

  // ── Signal ──────────────────────────────────────────────────────────────────
  async getSignalFeed(limit = 50) {
    return this.request(`/api/signal/feed?limit=${limit}`);
  }

  async createPing(body, imageFile = null, parentId = null, boostOfId = null) {
    const token = localStorage.getItem('token') || '';
    const form = new FormData();
    if (body)       form.append('body', body);
    if (parentId)   form.append('parent_id', parentId);
    if (boostOfId)  form.append('boost_of_id', boostOfId);
    if (imageFile)  form.append('image', imageFile);
    const res = await fetch(`${API_BASE_URL}/api/signal/ping`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      const detail = e.detail;
      if (detail && typeof detail === 'object' && detail.code === 'content_blocked') {
        const err = new Error(detail.message || 'Ping blocked by content filter.');
        err.blocked = true;
        err.reason  = detail.reason || '';
        throw err;
      }
      throw new Error(typeof detail === 'string' ? detail : 'Failed to ping');
    }
    return res.json();
  }

  async getPingThread(pingId) {
    return this.request(`/api/signal/${pingId}/thread`);
  }

  async likePing(pingId) {
    return this.request(`/api/signal/${pingId}/like`, { method: 'POST' });
  }

  async unlikePing(pingId) {
    return this.request(`/api/signal/${pingId}/like`, { method: 'DELETE' });
  }

  async deletePing(pingId) {
    return this.request(`/api/signal/${pingId}`, { method: 'DELETE' });
  }

  async getUserPings(userId, limit = 30) {
    return this.request(`/api/signal/user/${userId}?limit=${limit}`);
  }
}

// Singleton export
const apiService = new APIService();
export default apiService;
