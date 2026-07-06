import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Award, Target, Trophy, AlertCircle, Camera, Upload, Zap, Star, TrendingUp, Users, Search, Copy, Check, UserMinus, UserPlus, Clock, Flame, BookOpen, ArrowRight, ChevronRight, Shield, BarChart2 } from "lucide-react";
import api from "../services/api";

const C = {
  pageBg: "#fbeae2",
  sectionBg: "#fbeae2",
  cardBg: "#ffffff",
  text1: "#181818",
  text2: "#3d3d3d",
  text3: "#797979",
  border: "#e8e2db",
  accent: "#f97316",
  accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
  shadow: "rgba(0,0,0,0.06)",
};

const getProfileDraftStorageKey = (userId) => `profileDraft:${userId || "anonymous"}`;
const getProfileAvatarStorageKey = (userId) => `profileAvatar:${userId || "anonymous"}`;

const TABS = ["Overview", "Skills", "Campaigns", "Submissions", "Friends"];

// Deterministic short tag from user_id  e.g. "user_abc123" → "#ABC123"
const makePlayerTag = (userId = "") => {
  const raw = userId.replace(/^user_/, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return "#" + (raw.slice(0, 6) || "??????");
};

const Profile = () => {
  const navigate = useNavigate();
  const [userId] = useState(() => localStorage.getItem("userId") || "");
  const [userProgress, setUserProgress] = useState(null);
  const [skills, setSkills] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  // Friends tab state
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendSearchResults, setFriendSearchResults] = useState([]);
  const [friendSearching, setFriendSearching] = useState(false);
  const [tagCopied, setTagCopied] = useState(false);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const friendSearchTimer = useRef(null);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [draft, setDraft] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
  });

  const fetchUserProgress = useCallback(async () => {
    if (!userId) {
      setError("You are not logged in.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const [progressData, skillsData] = await Promise.allSettled([
        api.getUserProgress(userId),
        api.getUserSkills(userId),
      ]);
      if (progressData.status === "fulfilled") setUserProgress(progressData.value || null);
      if (skillsData.status === "fulfilled") setSkills(skillsData.value || null);
    } catch (err) {
      setError(err?.message || "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  const loadFriends = useCallback(async () => {
    if (!userId) return;
    try {
      const [f, p] = await Promise.all([
        api.getFriends(userId),
        api.getPendingRequests(userId),
      ]);
      setFriends(f.friends || []);
      setPendingRequests(p.requests || p || []);
    } catch (_) {}
    setFriendsLoaded(true);
  }, [userId]);

  // Load friends when tab is opened
  useEffect(() => {
    if (activeTab === "Friends") loadFriends();
  }, [activeTab, loadFriends]);

  useEffect(() => {
    const key = getProfileDraftStorageKey(userId);
    const saved = localStorage.getItem(key);
    const avatarCache = localStorage.getItem(getProfileAvatarStorageKey(userId)) || "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved) || {};
        setDraft((prev) => ({ ...prev, ...parsed }));
        if (parsed.avatar || avatarCache) setAvatarFileName("Current profile photo");
      } catch {
        // Ignore invalid cached profile draft.
      }
    } else if (avatarCache) {
      setAvatarFileName("Current profile photo");
    }
    setIsDraftReady(true);
  }, [userId]);

  const user = userProgress?.user || {};

  useEffect(() => {
    if (!isDraftReady) return;
    const currentUsername = user.username || localStorage.getItem("username") || "User";
    const currentEmail = user.email || "";
    const prefs = user.preferences || {};
    setDraft((prev) => ({
      ...prev,
      username: prev.username || currentUsername,
      email: prev.email || currentEmail,
      // Seed from server — only if not already set by localStorage cache
      bio:      prev.bio      || prefs.bio      || "",
      location: prev.location || prefs.location || "",
      website:  prev.website  || prefs.website  || "",
    }));
    if (prefs.is_private !== undefined) {
      setIsPrivate(!!prefs.is_private);
    }
  }, [isDraftReady, user.username, user.email, user.preferences]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 62px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              width: 48,
              height: 48,
              margin: "0 auto 12px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `2px solid ${C.accentBdr}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: C.accent,
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
          <p style={{ color: C.text3, fontSize: 13 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 62px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: "100%",
            background: C.cardBg,
            border: "1px solid rgba(220,38,38,.24)",
            borderRadius: 12,
            padding: "24px 22px",
            boxShadow: `0 6px 24px ${C.shadow}`,
            textAlign: "center",
          }}
        >
          <AlertCircle
            style={{
              width: 38,
              height: 38,
              color: "#dc2626",
              margin: "0 auto 10px",
            }}
          />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text1, marginBottom: 6 }}>
            Error Loading Profile
          </h2>
          <p style={{ color: C.text3, fontSize: 13, marginBottom: 16 }}>{error}</p>
          <button
            onClick={fetchUserProgress}
            style={{
              padding: "10px 18px",
              borderRadius: 30,
              border: "none",
              background: C.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const campaigns = userProgress?.campaigns || [];
  const submissions = userProgress?.recent_submissions || [];
  const username = user.username || localStorage.getItem("username") || "User";
  const role = user.role || localStorage.getItem("role") || "individual";
  const email = user.email || "";
  const effectiveUsername = draft.username?.trim() || username;
  const effectiveEmail = draft.email?.trim() || email;
  const effectiveAvatar =
    draft.avatar || localStorage.getItem(getProfileAvatarStorageKey(userId)) || "";
  const initial = effectiveUsername.slice(0, 1).toUpperCase();

  const stats = [
    { icon: Award, label: "Total Points", value: user.total_points || 0 },
    { icon: Target, label: "Machines Solved", value: user.machines_solved || 0 },
    { icon: Trophy, label: "Campaigns Completed", value: user.campaigns_completed || 0 },
    { icon: User, label: "Global Rank", value: user.rank ? `#${user.rank}` : "N/A" },
  ];

  const handleDraftChange = (field, value) => {
    setSaveMessage("");
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveMessage("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handleDraftChange("avatar", String(reader.result || ""));
      setAvatarFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const nextUsername = draft.username.trim();
    if (!nextUsername) {
      setSaveMessage("Username cannot be empty.");
      return;
    }

    if (nextUsername !== username) {
      const confirmed = window.confirm(
        `Change username from "${username}" to "${nextUsername}"?`,
      );
      if (!confirmed) return;
    }

    try {
      await api.request(`/api/users/${userId}/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          username: nextUsername,
          bio:      draft.bio.trim(),
          location: draft.location.trim(),
          website:  draft.website.trim(),
        }),
      });

      // Keep avatar in localStorage (no server upload)
      if (draft.avatar) localStorage.setItem(getProfileAvatarStorageKey(userId), draft.avatar);
      else localStorage.removeItem(getProfileAvatarStorageKey(userId));
      if (nextUsername) localStorage.setItem("username", nextUsername);

      setSaveMessage("Profile saved!");
      // Reload to pull fresh server data
      await fetchUserProgress();
    } catch (e) {
      setSaveMessage(e?.message || "Failed to save profile.");
    }
  };

  const handleResetDraft = () => {
    setDraft({
      username,
      email,
      bio: "",
      location: "",
      website: "",
      avatar: "",
    });
    localStorage.removeItem(getProfileDraftStorageKey(userId));
    localStorage.removeItem(getProfileAvatarStorageKey(userId));
    setAvatarFileName("");
    setSaveMessage("Profile draft reset.");
  };

  return (
    <div
      className="resp-page-pad"
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "34px 28px",
        color: C.text1,
        fontFamily: "'DM Sans','Inter',sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, marginBottom: 5 }}>
          Your Profile
        </h1>
        <p style={{ color: C.text3, fontSize: 13.5 }}>
          Track your progress, campaigns, and recent submissions.
        </p>
      </div>

      <div
        className="resp-grid-1col"
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "22px 18px",
            boxShadow: "none",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                margin: "0 auto 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.accent,
                color: "#fff",
                fontSize: 28,
                fontWeight: 800,
                overflow: "hidden",
              }}
            >
              {effectiveAvatar ? (
                <img
                  src={effectiveAvatar}
                  alt={effectiveUsername}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initial
              )}
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 2 }}>{effectiveUsername}</h2>
            <p style={{ color: C.text3, fontSize: 12.5, marginBottom: 6 }}>{effectiveEmail}</p>
            {/* Player Tag — unique shareable ID like Clash of Clans */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(makePlayerTag(userId));
                setTagCopied(true);
                setTimeout(() => setTagCopied(false), 2000);
              }}
              title="Copy your player tag to share with friends"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20, marginBottom: 10,
                border: `1px solid ${C.accentBdr}`, background: C.accentBg,
                cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                color: C.accent, fontFamily: "monospace",
              }}>
              {makePlayerTag(userId)}
              {tagCopied
                ? <Check style={{ width: 11, height: 11 }} />
                : <Copy style={{ width: 11, height: 11 }} />}
            </button>
            <p style={{ fontSize: 10.5, color: C.text3, marginBottom: 8 }}>
              Share this tag so friends can find you
            </p>
            <span style={{ fontSize: 12, color: C.text3 }}>
              {role.replace("_", " ")}
            </span>
          </div>
        </div>

        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "18px",
            boxShadow: "none",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Statistics</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: 10,
            }}
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  border: `1px solid ${C.border}`,
                  background: C.sectionBg,
                  borderRadius: 12,
                  padding: "12px 10px",
                  textAlign: "center",
                }}
              >
                <Icon style={{ width: 18, height: 18, color: C.accent, margin: "0 auto 6px" }} />
                <p style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.05, marginBottom: 4 }}>
                  {value}
                </p>
                <p style={{ fontSize: 11.5, color: C.text3 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 0 }}>
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, paddingBottom: 0, minWidth: "max-content" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: "none",
                background: "none",
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? C.accent : C.text3,
                cursor: "pointer",
                borderBottom: activeTab === tab ? `2px solid ${C.accent}` : "2px solid transparent",
                marginBottom: -1,
                whiteSpace: "nowrap",
                minHeight: 44,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "Overview" && (
      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "18px",
          boxShadow: "none",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Account Settings</h3>
        <div
          className="resp-grid-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: 10,
          }}
        >
          <input
            value={draft.username}
            onChange={(e) => handleDraftChange("username", e.target.value)}
            placeholder="Username"
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
            }}
          />
          <input
            value={draft.email}
            placeholder="Email"
            readOnly
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
              background: "#f6f4f2",
              color: C.text3,
              cursor: "not-allowed",
            }}
          />
          <input
            value={draft.location}
            onChange={(e) => handleDraftChange("location", e.target.value)}
            placeholder="Location"
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
            }}
          />
          <input
            value={draft.website}
            onChange={(e) => handleDraftChange("website", e.target.value)}
            placeholder="Website"
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
            }}
          />
          <textarea
            value={draft.bio}
            onChange={(e) => handleDraftChange("bio", e.target.value)}
            placeholder="Short bio"
            rows={3}
            style={{
              gridColumn: "1 / -1",
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              id="profile-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor="profile-avatar-upload"
              style={{
                border: `1px dashed ${C.border}`,
                background: C.sectionBg,
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: C.accentBg,
                    border: `1px solid ${C.accentBdr}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.accent,
                  }}
                >
                  <Camera style={{ width: 16, height: 16 }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>
                    Upload profile photo
                  </p>
                  <p style={{ fontSize: 11.5, color: C.text3 }}>
                    PNG or JPG up to 5MB
                  </p>
                </div>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.accent,
                  border: `1px solid ${C.accentBdr}`,
                  background: C.accentBg,
                  borderRadius: 30,
                  padding: "6px 10px",
                }}
              >
                <Upload style={{ width: 12, height: 12 }} />
                Choose
              </span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <p style={{ fontSize: 12, color: C.text3 }}>
                {avatarFileName || (effectiveAvatar ? "Current profile photo" : "No file selected")}
              </p>
              {effectiveAvatar ? (
                <button
                  onClick={() => {
                    handleDraftChange("avatar", "");
                    setAvatarFileName("");
                  }}
                  style={{
                    border: `1px solid ${C.border}`,
                    background: C.sectionBg,
                    borderRadius: 10,
                    padding: "7px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>
        </div>
        {/* Privacy toggle */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderRadius: 12, marginTop: 14,
          border: `1px solid ${C.border}`, background: "#f9f7f5",
        }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>Private Profile</p>
            <p style={{ fontSize: 12, color: "#797979", margin: "2px 0 0" }}>
              Only friends can see your stats and skill progress.
            </p>
          </div>
          <button
            disabled={privacySaving}
            onClick={async () => {
              setPrivacySaving(true);
              const next = !isPrivate;
              try {
                await api.setPrivacy(userId, next);
                setIsPrivate(next);
              } catch (e) { alert(e?.message || "Failed to update privacy"); }
              setPrivacySaving(false);
            }}
            style={{
              width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
              background: isPrivate ? "#f97316" : "#e5e7eb",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute", top: 2,
              left: isPrivate ? 22 : 2,
              width: 20, height: 20, borderRadius: "50%", background: "white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
            }} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <button
            onClick={handleSaveProfile}
            style={{
              border: "none",
              background: C.accent,
              color: "#fff",
              borderRadius: 30,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
          <button
            onClick={handleResetDraft}
            style={{
              border: `1px solid ${C.border}`,
              background: C.cardBg,
              color: C.text2,
              borderRadius: 30,
              padding: "9px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          {saveMessage ? <span style={{ fontSize: 12, color: C.text3 }}>{saveMessage}</span> : null}
        </div>
      </div>

      )}

      {/* ── For You Tab (moved to /recommendations page) ── */}
      {activeTab === "DISABLED_For_You" && (() => {
        const cats = skills?.skill_categories || [];
        const totalSolves = skills?.total_solves || 0;
        const recs = skills?.recommendations || [];
        const vuln_breakdown = skills?.vuln_type_breakdown || [];
        const user = userProgress?.user || {};
        const streak = user.current_streak || 0;
        const longestStreak = user.longest_streak || 0;
        const points = user.total_points || 0;

        // Overall mastery: weighted average of all category scores
        const scored = cats.filter(c => c.score > 0);
        const overallPct = scored.length
          ? Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length)
          : 0;

        // Progress ring SVG params
        const R = 52, CIRC = 2 * Math.PI * R;
        const dash = (overallPct / 100) * CIRC;

        const DIFF_COLOR = { easy: "#16a34a", medium: C.accent, hard: "#dc2626", insane: "#7c3aed" };
        const levelColor = (score) => score >= 80 ? "#16a34a" : score >= 50 ? C.accent : score >= 20 ? "#f59e0b" : "#e5e7eb";

        // Build suggestion prompts for VulnAI deep-link
        const goToVulnAI = (prompt) => {
          localStorage.setItem("vulnai_suggest", prompt);
          navigate("/vuln-ai");
        };

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ── Hero: Overall Progress ── */}
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "22px 24px",
              display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
            }}>
              {/* Ring */}
              <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
                <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="60" cy="60" r={R} fill="none" stroke={C.border} strokeWidth="10" />
                  <circle cx="60" cy="60" r={R} fill="none" stroke={C.accent} strokeWidth="10"
                    strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.8s ease" }} />
                </svg>
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: C.text1, lineHeight: 1 }}>{overallPct}%</span>
                  <span style={{ fontSize: 10, color: C.text3, fontWeight: 600, marginTop: 2 }}>Mastery</span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 4px" }}>Your Progress</h2>
                <p style={{ fontSize: 13, color: C.text3, margin: "0 0 14px" }}>
                  {totalSolves === 0
                    ? "Start solving labs to unlock your skill profile."
                    : `${totalSolves} lab${totalSolves !== 1 ? "s" : ""} solved across ${scored.length} categor${scored.length !== 1 ? "ies" : "y"}.`}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { icon: "🔥", label: "Streak", val: `${streak}d` },
                    { icon: "🏆", label: "Best", val: `${longestStreak}d` },
                    { icon: "⚡", label: "Points", val: points },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: C.accentBg, border: `1px solid ${C.accentBdr}`,
                      borderRadius: 10, padding: "8px 14px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.accent }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: C.text3, fontWeight: 600 }}>{s.icon} {s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Skill Heatmap ── */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 7 }}>
                <BarChart2 style={{ width: 16, height: 16, color: C.accent }} /> Skill Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cats.map(cat => {
                  const nextThreshold = cat.score < 20 ? 20 : cat.score < 50 ? 50 : cat.score < 80 ? 80 : 100;
                  const toNext = nextThreshold - cat.score;
                  return (
                    <div key={cat.category}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{cat.category}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "2px 8px",
                            background: cat.score > 0 ? C.accentBg : "#f5f3f0",
                            color: cat.score > 0 ? C.accent : C.text3,
                            border: `1px solid ${cat.score > 0 ? C.accentBdr : C.border}`,
                          }}>{cat.level}</span>
                        </div>
                        <span style={{ fontSize: 11.5, color: C.text3 }}>
                          {cat.score}/100 · {cat.solves} solve{cat.solves !== 1 ? "s" : ""}
                          {cat.score < 100 ? ` · ${toNext} pts to ${cat.score < 20 ? "Intermediate" : cat.score < 50 ? "Advanced" : cat.score < 80 ? "Expert" : "Max"}` : ""}
                        </span>
                      </div>
                      <div style={{ position: "relative", height: 9, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 99,
                          width: `${cat.score}%`,
                          background: levelColor(cat.score),
                          transition: "width 0.7s ease",
                        }} />
                        {/* Next-level tick marks */}
                        {[20, 50, 80].filter(t => t > cat.score && t <= 100).slice(0, 1).map(t => (
                          <div key={t} style={{
                            position: "absolute", top: 0, bottom: 0, left: `${t}%`,
                            width: 2, background: "rgba(0,0,0,0.15)", borderRadius: 1,
                          }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── VulnAI Recommendations ── */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                  <Zap style={{ width: 16, height: 16, color: C.accent }} /> VulnAI Suggests For You
                </h3>
                <button onClick={() => navigate("/vuln-ai")} style={{
                  display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700,
                  color: C.accent, background: "none", border: "none", cursor: "pointer", padding: 0,
                }}>Open VulnAI <ArrowRight style={{ width: 13, height: 13 }} /></button>
              </div>
              {recs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recs.map((rec) => {
                    const prompt = `Build me a ${rec.suggested_difficulty} ${rec.category} lab`;
                    return (
                      <div key={rec.category} style={{
                        border: `1px solid ${C.border}`, borderRadius: 12,
                        padding: "14px 16px", background: C.sectionBg,
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        cursor: "pointer", transition: "border-color 0.15s",
                      }}
                        onClick={() => goToVulnAI(prompt)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = C.accentBdr}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>{rec.category}</p>
                          <p style={{ fontSize: 12, color: C.text3, margin: 0 }}>{rec.reason}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, borderRadius: 30, padding: "4px 10px",
                            color: DIFF_COLOR[rec.suggested_difficulty] || C.accent,
                            background: "rgba(249,115,22,0.06)",
                            border: `1px solid ${DIFF_COLOR[rec.suggested_difficulty] || C.accentBdr}`,
                            textTransform: "capitalize",
                          }}>{rec.suggested_difficulty}</span>
                          <ChevronRight style={{ width: 14, height: 14, color: C.text3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <Shield style={{ width: 32, height: 32, color: C.border, margin: "0 auto 10px" }} />
                  <p style={{ fontSize: 13, color: C.text3 }}>Solve a few labs and VulnAI will tailor suggestions for you.</p>
                  <button onClick={() => navigate("/vuln-ai")} style={{
                    marginTop: 12, padding: "8px 20px", borderRadius: 30,
                    background: C.accent, color: "#fff", border: "none",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>Start with VulnAI →</button>
                </div>
              )}
            </div>

            {/* ── Vuln Type Breakdown ── */}
            {vuln_breakdown.length > 0 && (
              <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 7 }}>
                  <BookOpen style={{ width: 16, height: 16, color: C.accent }} /> Vulnerability Types Practiced
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {vuln_breakdown.map(v => (
                    <div key={v.vuln_type} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      border: `1px solid ${C.border}`, borderRadius: 20,
                      padding: "5px 12px", background: C.sectionBg, cursor: "pointer",
                    }}
                      onClick={() => goToVulnAI(`Build me a ${v.vuln_type} vulnerability lab`)}
                      title="Click to practice in VulnAI"
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text2 }}>{v.vuln_type}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#fff",
                        background: C.accent, borderRadius: 20, padding: "1px 7px",
                      }}>{v.solves}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* ── Skills Tab ── */}
      {activeTab === "Skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Badges */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
              <Star style={{ width: 16, height: 16, color: C.accent }} /> Badges Earned
            </h3>
            {skills?.badges?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {skills.badges.map((b) => (
                  <div key={b.name} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    border: `1px solid ${C.accentBdr}`, background: C.accentBg,
                    borderRadius: 30, padding: "8px 14px",
                  }}>
                    <span style={{ fontSize: 18 }}>{b.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{b.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: C.text3 }}>No badges yet. Solve your first machine to earn one.</p>
            )}
          </div>

          {/* Skill bars per category */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
              <Zap style={{ width: 16, height: 16, color: C.accent }} /> Skill Levels
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(skills?.skill_categories || []).map((cat) => (
                <div key={cat.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{cat.category}</span>
                    <span style={{ fontSize: 12, color: C.text3 }}>
                      {cat.level} · {cat.solves} solve{cat.solves !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: `${cat.score}%`,
                      background: cat.score >= 80 ? "#16a34a" : cat.score >= 50 ? C.accent : cat.score >= 20 ? "#f59e0b" : "#e5e7eb",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                  <div style={{ textAlign: "right", fontSize: 11, color: C.text3, marginTop: 2 }}>{cat.score}/100</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
              <TrendingUp style={{ width: 16, height: 16, color: C.accent }} /> Recommended Focus Areas
            </h3>
            {skills?.recommendations?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {skills.recommendations.map((rec) => (
                  <div key={rec.category} style={{
                    border: `1px solid ${C.border}`, borderRadius: 12,
                    padding: "12px 14px", background: C.sectionBg,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 700 }}>{rec.category}</p>
                      <p style={{ fontSize: 12, color: C.text3 }}>{rec.reason}</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, borderRadius: 30, padding: "4px 10px",
                      color: C.accent, background: C.accentBg, border: `1px solid ${C.accentBdr}`,
                      textTransform: "capitalize", flexShrink: 0,
                    }}>
                      Try {rec.suggested_difficulty}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: C.text3 }}>Keep solving machines — recommendations will appear here.</p>
            )}
          </div>

        </div>
      )}

      {/* ── Campaigns Tab ── */}
      {activeTab === "Campaigns" && (
      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "18px",
          boxShadow: "none",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Your Campaigns</h3>
        {campaigns.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {campaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  background: C.sectionBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {campaign.campaign_name || campaign.campaign_id || "Campaign"}
                  </p>
                  <p style={{ fontSize: 12, color: C.text3 }}>
                    Level {campaign.difficulty || "-"} · {campaign.machine_count || 0} machines
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 30,
                      padding: "4px 10px",
                      color: campaign.completed ? "#15803d" : C.accent,
                      background: campaign.completed
                        ? "rgba(21,128,61,0.08)"
                        : C.accentBg,
                      border: campaign.completed
                        ? "1px solid rgba(21,128,61,0.2)"
                        : `1px solid ${C.accentBdr}`,
                    }}
                  >
                    {campaign.completed ? "Completed" : "In Progress"}
                  </span>
                  <p style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>
                    {campaign.total_points || 0} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: C.text3 }}>
            No campaigns yet. Start your first campaign to see progress here.
          </p>
        )}
      </div>
      )}

      {/* ── Submissions Tab ── */}
      {activeTab === "Submissions" && (
      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "18px",
          boxShadow: "none",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Recent Submissions</h3>
        {submissions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {submissions.map((submission) => (
              <div
                key={submission.submission_id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  background: C.sectionBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: submission.correct ? "#16a34a" : "#dc2626",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>
                      {submission.machine_name || submission.machine_id || "Machine"}
                    </p>
                    <p style={{ fontSize: 11.5, color: C.text3 }}>
                      {submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleString()
                        : "Unknown time"}
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.accent, flexShrink: 0 }}>
                  +{submission.points_awarded || 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: C.text3 }}>
            No submissions yet. Solve a machine to see activity.
          </p>
        )}
      </div>
      )}

      {/* ── Friends Tab ── */}
      {activeTab === "Friends" && (
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Friends</h3>
            <p style={{ fontSize: 12.5, color: C.text3, marginTop: 3 }}>
              {friends.length} friend{friends.length !== 1 ? "s" : ""}
              {pendingRequests.length > 0 && ` · ${pendingRequests.length} pending request${pendingRequests.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 20,
            border: `1px solid ${C.accentBdr}`, background: C.accentBg,
          }}>
            <Users style={{ width: 13, height: 13, color: C.accent }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.accent, fontFamily: "monospace" }}>
              {makePlayerTag(userId)}
            </span>
          </div>
        </div>

        {/* Search box */}
        <div style={{ position: "relative", marginBottom: 6 }}>
          <Search style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            width: 14, height: 14, color: C.text3, pointerEvents: "none",
          }} />
          <input
            value={friendSearch}
            onChange={e => {
              const q = e.target.value;
              setFriendSearch(q);
              setFriendSearchResults([]);
              clearTimeout(friendSearchTimer.current);
              if (!q.trim() || q.trim().length < 2) return;
              friendSearchTimer.current = setTimeout(async () => {
                setFriendSearching(true);
                try {
                  const res = await api.searchUsers(q.trim());
                  const results = res.users || res || [];
                  setFriendSearchResults(results.filter(u => u.user_id !== userId));
                } catch (_) {}
                setFriendSearching(false);
              }, 350);
            }}
            placeholder="Search by username or player tag (#ABC123)…"
            style={{
              width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
              border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: "none",
              fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box",
            }}
          />
          {friendSearching && (
            <div style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              width: 14, height: 14, border: `2px solid ${C.accent}`, borderTopColor: "transparent",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
          )}
        </div>

        {/* Search results */}
        {friendSearchResults.length > 0 && (
          <div style={{
            border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden",
            marginBottom: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
          }}>
            {friendSearchResults.map((u, i) => {
              const isFriend = friends.some(f => f.user_id === u.user_id);
              return (
                <div key={u.user_id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: i % 2 === 0 ? "#fff" : C.sectionBg,
                  borderBottom: i < friendSearchResults.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#f97316,#7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: "white",
                  }}>
                    {(u.username || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>{u.username}</p>
                    <p style={{ fontSize: 11, color: C.text3, margin: 0, fontFamily: "monospace" }}>
                      {makePlayerTag(u.user_id)}
                    </p>
                  </div>
                  {isFriend ? (
                    <span style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 600 }}>Friends</span>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await api.sendFriendRequest(u.user_id);
                          setFriendSearchResults(prev => prev.map(r =>
                            r.user_id === u.user_id ? { ...r, _sent: true } : r
                          ));
                        } catch (e) { alert(e?.message || "Failed"); }
                      }}
                      disabled={u._sent}
                      style={{
                        padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        border: `1px solid ${u._sent ? "#ccc" : C.accentBdr}`,
                        background: u._sent ? "#f3f4f6" : C.accentBg,
                        color: u._sent ? C.text3 : C.accent, cursor: u._sent ? "default" : "pointer",
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                      {u._sent ? <><Check style={{ width: 11, height: 11 }} /> Sent</> : <><UserPlus style={{ width: 11, height: 11 }} /> Add</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {friendSearch.trim().length >= 2 && !friendSearching && friendSearchResults.length === 0 && (
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 16 }}>No players found for "{friendSearch}"</p>
        )}

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, letterSpacing: 0.5, marginBottom: 10 }}>
              PENDING REQUESTS ({pendingRequests.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingRequests.map(r => (
                <div key={r.friendship_id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  border: `1px solid ${C.border}`, borderRadius: 10, background: C.sectionBg,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#7c3aed,#f97316)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: "white",
                  }}>
                    {(r.username || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>{r.username}</p>
                    <p style={{ fontSize: 11, color: C.text3, margin: 0, fontFamily: "monospace" }}>
                      {makePlayerTag(r.user_id)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={async () => {
                        try {
                          await api.respondFriendRequest(r.friendship_id, "accepted");
                          loadFriends();
                        } catch (e) { alert(e?.message || "Failed"); }
                      }}
                      style={{
                        padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        border: "1px solid rgba(22,163,74,0.3)", background: "rgba(22,163,74,0.08)",
                        color: "#16a34a", cursor: "pointer",
                      }}>Accept</button>
                    <button
                      onClick={async () => {
                        try {
                          await api.respondFriendRequest(r.friendship_id, "declined");
                          loadFriends();
                        } catch (e) { alert(e?.message || "Failed"); }
                      }}
                      style={{
                        padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        border: `1px solid ${C.border}`, background: "transparent",
                        color: C.text3, cursor: "pointer",
                      }}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, letterSpacing: 0.5, marginBottom: 10 }}>
          YOUR FRIENDS {friends.length > 0 && `(${friends.length})`}
        </p>
        {!friendsLoaded ? (
          <p style={{ fontSize: 13, color: C.text3 }}>Loading…</p>
        ) : friends.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: C.text3 }}>
            <Users style={{ width: 32, height: 32, margin: "0 auto 10px", opacity: 0.3 }} />
            <p style={{ fontSize: 13 }}>No friends yet.</p>
            <p style={{ fontSize: 12 }}>Search above or share your tag <strong style={{ fontFamily: "monospace", color: C.accent }}>{makePlayerTag(userId)}</strong> with others.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {friends.map(f => (
              <div key={f.user_id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                border: `1px solid ${C.border}`, borderRadius: 10, background: C.sectionBg,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#f97316,#7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "white",
                }}>
                  {(f.username || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a href={`/user/${f.username}`} style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, textDecoration: "none" }}>
                    {f.username}
                  </a>
                  <p style={{ fontSize: 11, color: C.text3, margin: 0, fontFamily: "monospace" }}>
                    {makePlayerTag(f.user_id)}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: C.text3, marginRight: 8 }}>
                  since {new Date(f.since).toLocaleDateString()}
                </span>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Remove ${f.username} from friends?`)) return;
                    try {
                      await api.removeFriend(f.user_id);
                      loadFriends();
                    } catch (e) { alert(e?.message || "Failed"); }
                  }}
                  title="Remove friend"
                  style={{
                    background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "4px 7px", cursor: "pointer", color: C.text3,
                    display: "flex", alignItems: "center",
                  }}>
                  <UserMinus style={{ width: 13, height: 13 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default Profile;
