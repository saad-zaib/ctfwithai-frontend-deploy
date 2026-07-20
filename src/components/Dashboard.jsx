import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server, Cpu, Activity, ChevronRight, AlertCircle,
  Flag, Clock, ArrowUpRight, Flame, Loader, Terminal,
  Sparkles, RotateCw, PlayCircle, BookOpen, CheckCircle, Timer,
  TrendingUp, Zap, Trophy, Star, Shield,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Dot,
} from 'recharts';
import api from '../services/api';
import { T } from '../design/tokens';
import Card from './ui/Card';
import { DiffBadge, PillTag, LiveBadge } from './ui/Badge';

const API_BASE = process.env.REACT_APP_API_URL || "";
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});
const formatName = (name) => name?.length > 14 ? name.slice(0, 14) + '…' : name;

const UserAvatar = ({ avatarUrl, username, size = 30, style: extraStyle = {} }) => {
  const initials = (username || '?').slice(0, 2).toUpperCase();
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={username}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0, ...extraStyle,
      }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: T.accent, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff',
      fontFamily: T.font, flexShrink: 0, ...extraStyle,
    }}>
      {initials}
    </div>
  );
};

/* ── Animated counter ── */
const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setCount(Math.round(e * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
};

/* ═══════════════════════════════════════════════════════════
   StatCard
═══════════════════════════════════════════════════════════ */
const StatCard = ({ icon: Icon, label, value, suffix = '', isLive }) => {
  const animated = useCounter(typeof value === 'number' ? value : 0);
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.cardBg,
        border: `1px solid ${T.border}`,
        borderRadius: T.cardRadius,
        padding: T.cardPad,
        boxShadow: hov ? T.shadowCardHover : T.shadowCard,
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13,
          background: T.accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon style={{ width: 20, height: 20, color: T.accent }} />
        </div>
        {isLive && <LiveBadge />}
      </div>

      <p style={{
        fontSize: 36, fontWeight: 800, color: T.text1,
        fontFamily: T.font, lineHeight: 1, letterSpacing: -1.5,
        fontVariantNumeric: 'tabular-nums',
        marginBottom: 6,
      }}>
        {animated}{suffix}
      </p>
      <p style={{
        fontSize: 13, fontWeight: 500, color: T.text3,
        fontFamily: T.font, letterSpacing: -0.1,
      }}>
        {label}
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Live Solve Feed
═══════════════════════════════════════════════════════════ */
const SolveFeedPanel = ({ style }) => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats/feed?limit=25`, { headers: authHeaders() });
      const data = await res.json();
      setFeed(data.feed || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchFeed();
    const iv = setInterval(fetchFeed, 15000);
    return () => clearInterval(iv);
  }, [fetchFeed]);

  const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  };

  return (
    <Card padded={false} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', ...style }}>
      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity style={{ width: 20, height: 20, color: T.accent }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.3 }}>
            Live Solve Feed
          </span>
        </div>
        <LiveBadge />
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
          <Loader style={{ width: 20, height: 20, color: T.accent, animation: 'spin 1s linear infinite' }} />
        </div>
      ) : feed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <Flag style={{ width: 24, height: 24, color: T.border, margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: T.text3, fontFamily: T.font }}>No solves yet. Be the first.</p>
        </div>
      ) : (
        <div className="db-scroll" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 14px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {feed.map((entry, i) => (
            <FeedRow key={entry.submission_id || i} entry={entry} timeAgo={timeAgo} i={i} />
          ))}
        </div>
      )}
    </Card>
  );
};

const FeedRow = ({ entry, timeAgo, i }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '4px 7px', borderRadius: 12,
        background: hov ? T.accentBg : '#F9F9F9',
        border: `1px solid ${hov ? T.accentBorder : T.border}`,
        transition: 'all 0.18s ease',
        animation: `slideUp 0.3s ease-out ${i * 0.025}s both`,
      }}
    >
      {/* Avatar + username */}
      <UserAvatar avatarUrl={entry.avatar_url || null} username={entry.username} size={32} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: T.text1, fontFamily: T.font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {formatName(entry.username)}
      </span>

      {/* Right: points · first blood · time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {entry.points > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#16A34A',
            background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: 6, padding: '2px 7px', fontFamily: T.font,
          }}>
            +{entry.points}pts
          </span>
        )}
        {entry.first_blood && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            padding: '2px 7px', borderRadius: 6,
            background: 'rgba(220,38,38,0.07)', color: '#DC2626',
            border: '1px solid rgba(220,38,38,0.18)',
            textTransform: 'uppercase', fontFamily: T.font, whiteSpace: 'nowrap',
          }}>
            First Blood
          </span>
        )}
        <span style={{ fontSize: 11, color: T.text3, fontFamily: T.font, whiteSpace: 'nowrap' }}>
          {timeAgo(entry.submitted_at)} ago
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Quick Actions
═══════════════════════════════════════════════════════════ */
const ACTIONS = [
  { icon: Cpu,    label: 'Browse Machines',  sub: 'View your lab environments', route: '/machines' },
  { icon: Sparkles, label: 'Generate AI Lab', sub: 'AI-powered machine creation', route: '/vuln-ai' },
  { icon: Trophy, label: 'Leaderboard',      sub: 'See top hackers',            route: '/leaderboard' },
  { icon: Zap,    label: 'Daily Challenge',  sub: 'For You picks',              route: '/recommendations' },
];

const QuickActionCard = ({ icon: Icon, label, sub, route, navigate }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => navigate(route)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderRadius: 10,
        background: hov ? T.accentBg : '#F9F9F9',
        border: `1px solid ${hov ? T.accentBorder : T.border}`,
        cursor: 'pointer', fontFamily: T.font,
        transition: 'all 0.18s ease',
        boxShadow: hov ? '0 4px 16px rgba(249,115,22,0.08)' : 'none',
        width: '100%', textAlign: 'left',
        transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s ease',
      }}>
        <Icon style={{ width: 20, height: 20, color: hov ? T.accent : T.text3 }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: T.text1, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </p>
        <p style={{ fontSize: 10, color: T.text3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</p>
      </div>
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════
   Machine Row (Available Labs panel)
═══════════════════════════════════════════════════════════ */
const VULN_ICON_MAP = {
  sqli: '💉', sql: '💉', injection: '💉',
  xss: '🎯', csrf: '🔄',
  ssrf: '🌐', web: '🌐', http: '🌐',
  rce: '💥', command: '💥', exec: '💥',
  auth: '🔐', jwt: '🔐', password: '🔐', crypto: '🔐',
  lfi: '📂', path: '📂', traversal: '📂', file: '📂',
  ssti: '🧩', template: '🧩',
  xxe: '📄', xml: '📄',
  privesc: '⬆️', priv: '⬆️', privilege: '⬆️',
  network: '📡', tcp: '📡',
  default: '🛡️',
};

const getVulnIcon = (machine) => {
  const src = ((machine.cve_id || machine.variant || machine.service_name || '') + ' ' + (machine.service_name || '')).toLowerCase();
  for (const [key, icon] of Object.entries(VULN_ICON_MAP)) {
    if (key !== 'default' && src.includes(key)) return icon;
  }
  return VULN_ICON_MAP.default;
};

const getCategoryLabel = (machine) => {
  const svc = (machine.service_name || '').toLowerCase();
  if (svc.includes('web') || svc.includes('http') || svc.includes('ssrf') || svc.includes('xss') || svc.includes('sqli') || svc.includes('sql')) return 'Web Exploitation';
  if (svc.includes('crypto') || svc.includes('password') || svc.includes('hash') || svc.includes('jwt') || svc.includes('auth')) return 'Cryptography';
  if (svc.includes('rce') || svc.includes('command') || svc.includes('exec') || svc.includes('injection')) return 'System Exploitation';
  if (svc.includes('priv') || svc.includes('linux') || svc.includes('os')) return 'Privilege Escalation';
  if (svc.includes('network') || svc.includes('tcp')) return 'Network';
  if (svc.includes('file') || svc.includes('lfi') || svc.includes('path')) return 'File Access';
  if (svc) return svc.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return 'Web Exploitation';
};

const DIFF_STYLES = {
  Easy:   { color: '#16A34A', bg: 'rgba(22,163,74,0.10)',  border: 'rgba(22,163,74,0.22)' },
  Medium: { color: '#F97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.22)' },
  Hard:   { color: '#DC2626', bg: 'rgba(220,38,38,0.10)',  border: 'rgba(220,38,38,0.22)' },
  Expert: { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.22)' },
  Insane: { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.22)' },
};

const MachineRow = ({ machine, onClick, diffMap, isLast }) => {
  const [hov, setHov] = useState(false);
  const diff = diffMap[machine.difficulty] || 'Medium';
  const ds = DIFF_STYLES[diff] || DIFF_STYLES.Medium;
  const icon = getVulnIcon(machine);
  const category = getCategoryLabel(machine);
  const name = machine.cve_id || machine.variant || machine.machine_id || 'Unknown Lab';
  const shortId = (machine.machine_id || '').replace('machine_', '').slice(0, 12);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '18px 20px',
        cursor: 'pointer',
        background: hov ? T.accentBg : 'transparent',
        borderBottom: isLast ? 'none' : `1px solid ${T.border}`,
        transition: 'background 0.15s ease',
      }}
    >
      {/* Icon box */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: T.accentBg, border: `1px solid ${T.accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block',
          fontSize: 13.5, fontWeight: 700, color: T.text1,
          fontFamily: T.font, letterSpacing: -0.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 3,
        }}>
          {name}
        </span>
        <span style={{ fontSize: 11.5, color: T.text3, fontFamily: T.font }}>
          {category} · {shortId}
        </span>
      </div>

      {/* Diff badge */}
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
        color: ds.color, background: ds.bg, border: `1px solid ${ds.border}`,
        borderRadius: 6, padding: '3px 8px', flexShrink: 0,
        textTransform: 'uppercase', fontFamily: T.font,
      }}>
        {diff}
      </span>

      {/* Play button */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: hov ? T.accent : T.accentBg,
        border: `1px solid ${hov ? T.accent : T.accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}>
        <PlayCircle style={{ width: 16, height: 16, color: hov ? '#fff' : T.accent }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Top Hackers Panel
═══════════════════════════════════════════════════════════ */
const SHIELD_COLORS = {
  1: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.28)' }, // gold
  2: { color: '#94A3B8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.28)' }, // silver
  3: { color: '#CD7F32', bg: 'rgba(205,127,50,0.10)',  border: 'rgba(205,127,50,0.28)' }, // bronze
};

const TopHackersPanel = () => {
  const [hackers, setHackers] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const API_BASE = process.env.REACT_APP_API_URL || '';
  const currentUserId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetch(`${API_BASE}/api/leaderboard?limit=100`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const entries = (data?.entries || []).filter(e => (e.total_points || 0) > 0);
        setHackers(entries.slice(0, 3));
        const myIdx = entries.findIndex(e => e.user_id === currentUserId);
        if (myIdx >= 3) setMyEntry({ ...entries[myIdx], rank: myIdx + 1 });
        else if (myIdx !== -1) setMyEntry(null); // already in top 3
      })
      .catch(() => {});
  }, [currentUserId]);

  const renderRow = (h, rank, isMe = false) => {
    const sc = SHIELD_COLORS[rank];
    const isTop3 = rank <= 3;
    return (
      <div key={h.user_id || rank} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 0',
        background: isMe ? T.accentBg : 'transparent',
        borderRadius: isMe ? 10 : 0,
        paddingLeft: isMe ? 8 : 0, paddingRight: isMe ? 8 : 0,
      }}>
        {/* Shield / rank */}
        {isTop3 ? (
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield style={{ width: 22, height: 22, color: sc.color, fill: sc.color }} />
          </div>
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: isMe ? '#fff' : '#F9F9F9', border: `1px solid ${isMe ? T.accentBorder : T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: isMe ? T.accent : T.text3, fontFamily: T.font,
          }}>
            {rank}
          </div>
        )}

        {/* Name + machines */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: isMe ? 700 : 600, color: isMe ? T.accent : T.text1,
            fontFamily: T.font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {h.username || h.user_id}{isMe ? ' (you)' : ''}
          </p>
          <p style={{ fontSize: 11, color: T.text3, fontFamily: T.font, marginTop: 1 }}>
            {h.machines_solved || 0} machines
          </p>
        </div>

        {/* Points */}
        <p style={{
          fontSize: 14, fontWeight: 800, flexShrink: 0,
          color: isMe ? T.accent : T.text1,
          fontFamily: T.font, fontVariantNumeric: 'tabular-nums',
        }}>
          {(h.total_points || 0).toLocaleString()}
        </p>
      </div>
    );
  };

  if (!hackers.length) return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      <p style={{ fontSize: 13, color: T.text3, fontFamily: T.font }}>No rankings yet.</p>
    </div>
  );

  return (
    <div>
      {hackers.map((h, i) => renderRow(h, i + 1))}
      {myEntry && (
        <>
          <div style={{ height: 1, background: T.border, margin: '6px 0' }} />
          {renderRow(myEntry, myEntry.rank, true)}
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const userId   = localStorage.getItem('userId') || '';
  const username = localStorage.getItem('username') || 'Hacker';

  const [stats, setStats]                   = useState({ machines: 0, campaigns: 0, running: 0 });
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState(null);
  const [diffFilter, setDiffFilter]         = useState('All');
  const [userMachines, setUserMachines]     = useState([]);
  const [pointsChartData, setPointsChartData] = useState([]);
  const [todayStats, setTodayStats]         = useState({ solved: 0, flags: 0 });
  const [totalStats, setTotalStats]         = useState({ solved: 0, points: 0, streak: 0 });
  const [userCampaigns, setUserCampaigns]   = useState([]);
  const [assignedCampaigns, setAssignedCampaigns] = useState([]);
  const [startingCampaign, setStartingCampaign]   = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const [statsRes, progressRes, campaignsRes, machinesRes] = await Promise.all([
        fetch(`${API_BASE}/api/stats?user_id=${encodeURIComponent(userId)}`, { headers: authHeaders() })
          .then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/progress`, { headers: authHeaders() })
          .then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/campaigns`, { headers: authHeaders() })
          .then(r => r.ok ? r.json() : []).catch(() => []),
        api.getMachines().catch(() => []),
      ]);

      const machineList = Array.isArray(machinesRes) ? machinesRes : [];
      const runningCount = machineList.filter(m => m.is_running || m.container?.status === 'running').length;
      setStats({ machines: machineList.length, campaigns: statsRes?.total_campaigns ?? 0, running: runningCount });
      setUserCampaigns(Array.isArray(campaignsRes) ? campaignsRes : []);
      const sorted = [...machineList].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setUserMachines(sorted.slice(0, 5));

      try {
        const assignedRes = await api.getAssignedCampaigns();
        const assignedList = Array.isArray(assignedRes)
          ? assignedRes
          : (assignedRes?.campaigns || assignedRes?.assignments || []);
        const normalized = (assignedList || []).map(item => {
          if (item?.campaign && typeof item.campaign === 'object') {
            const { campaign, ...assignment } = item;
            return { ...campaign, assignment };
          }
          return item;
        });
        setAssignedCampaigns(normalized);
      } catch (_) {}

      const subs = progressRes?.recent_submissions || [];
      const today = new Date().toDateString();
      const tSubs = subs.filter(s => new Date(s.submitted_at).toDateString() === today);
      setTodayStats({ solved: tSubs.filter(s => s.correct).length, flags: tSubs.length });

      const userRow = progressRes?.user || {};
      setTotalStats({ solved: userRow.machines_solved || 0, points: userRow.total_points || 0, streak: userRow.current_streak || 0 });

      // Build real points-per-day for the last 7 days from actual solves
      // Use `solves` (correct=true, limit 50) and the DB field is `points_awarded`
      const solvesList = progressRes?.solves || [];
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { dateStr: d.toDateString(), day: d.toLocaleDateString('en-US', { weekday: 'short' }), points: 0 };
      });
      solvesList.forEach(s => {
        const ds = new Date(s.submitted_at).toDateString();
        const slot = last7.find(x => x.dateStr === ds);
        if (slot) slot.points += (s.points_awarded || 0);
      });
      // Cumulative so the chart shows total points earned through each day
      let cumulative = 0;
      const cumulativeData = last7.map(slot => {
        cumulative += slot.points;
        return { day: slot.day, points: cumulative };
      });
      setPointsChartData(cumulativeData);

      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [userId, username]);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(async () => {
      try {
        const machines = await api.getMachines({ forceRefresh: true }).catch(() => []);
        const running = machines.filter(m => m.is_running || m.container?.status === 'running').length;
        setStats(prev => ({ ...prev, running, machines: machines.length }));
        const sorted = [...machines].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setUserMachines(sorted.slice(0, 5));
      } catch {}
    }, 5000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const diffMap = { 1: 'Easy', 2: 'Easy', 3: 'Medium', 4: 'Hard', 5: 'Expert' };

  /* ── Loading ── */
  if (isLoading) return (
    <div style={{
      minHeight: '100vh', background: T.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.font,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          position: 'relative', width: 44, height: 44, margin: '0 auto 14px',
        }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${T.accentBorder}` }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: T.accent,
            animation: 'spin 1s linear infinite',
          }} />
        </div>
        <p style={{ color: T.text3, fontSize: 14, fontWeight: 500 }}>Loading dashboard…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div style={{
      minHeight: '100vh', background: T.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, fontFamily: T.font,
    }}>
      <div style={{
        maxWidth: 420, width: '100%',
        background: T.cardBg, border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: T.cardRadius, padding: 40, textAlign: 'center',
        boxShadow: T.shadowCardHover,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: T.errorBg, border: '1px solid rgba(239,68,68,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px',
        }}>
          <AlertCircle style={{ width: 24, height: 24, color: T.error }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text1, marginBottom: 8, letterSpacing: -0.4 }}>
          Connection Failed
        </h2>
        <p style={{ color: T.text3, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{error}</p>
        <button
          onClick={fetchAll}
          style={{
            padding: '11px 28px', background: T.accent, border: 'none',
            borderRadius: T.btnRadius, color: '#fff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', fontFamily: T.font,
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', fontFamily: T.font }}>
      <style>{`
        @keyframes slideUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin      { to { transform:rotate(360deg); } }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.6)} }
        .db-tab-btn { transition: color 0.18s, border-color 0.18s; }
        .db-scroll::-webkit-scrollbar { width: 4px; }
        .db-scroll::-webkit-scrollbar-track { background: transparent; }
        .db-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .db-scroll::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }

        /* ── Responsive ── */
        .db-main-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .db-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .db-labs-card   { height: 600px; }
        .db-right-col   { height: 600px; }
        .db-stats-grid  { grid-template-columns: repeat(4,1fr); }
        .db-progress-grid { grid-template-columns: minmax(0,1.6fr) minmax(0,3fr) minmax(0,2fr); }
        .db-progress-col  { border-right: 1px solid #ECECEC; }
        .db-wrap        { padding: 32px; }

        @media (max-width: 1024px) {
          .db-main-grid   { grid-template-columns: 1fr; }
          .db-bottom-grid { grid-template-columns: 1fr; }
          .db-labs-card   { height: auto; }
          .db-right-col   { height: auto; flex-direction: row !important; }
          .db-stats-grid  { grid-template-columns: repeat(2,1fr); }
          .db-progress-grid { grid-template-columns: 1fr; }
          .db-progress-col  { border-right: none; border-bottom: 1px solid #ECECEC; }
          .db-wrap        { padding: 20px; }
        }

        @media (max-width: 640px) {
          .db-right-col   { flex-direction: column !important; }
          .db-stats-grid  { grid-template-columns: repeat(2,1fr); }
          .db-wrap        { padding: 14px; }
        }
      `}</style>

      <div className="db-wrap" style={{ maxWidth: T.contentMaxWidth, margin: '0 auto' }}>

        {/* ═══ PAGE HEADER ═══ */}
        <div style={{
          marginBottom: 32,
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          animation: 'slideUp 0.4s ease both',
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800,
              color: T.text1, letterSpacing: -2, lineHeight: 1.1,
              fontFamily: T.font, marginTop: 10,
            }}>
              Welcome back,{' '}
              <span style={{ color: T.accent }}>{formatName(username)}</span>
            </h1>
            <p style={{ color: T.text3, fontSize: 14, marginTop: 6, fontWeight: 400 }}>
              {new Date().toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={fetchAll}
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', height: 44,
              background: T.cardBg, border: `1px solid ${T.border}`,
              borderRadius: T.btnRadius, color: T.text2, fontSize: 14,
              fontWeight: 500, cursor: 'pointer', fontFamily: T.font,
              boxShadow: T.shadowCard, transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.color = T.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; }}
          >
            <RotateCw style={{ width: 15, height: 15, animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* ═══ MAIN GRID ═══
            ┌──────────────────────────┬──────────────────┐
            │  Available Labs (tabs)   │  Current Machine │
            │                          ├──────────────────┤
            │                          │  Live Solve Feed │
            └──────────────────────────┴──────────────────┘
        */}
        <div className="db-main-grid" style={{
          animation: 'slideUp 0.4s ease 0.05s both',
        }}>
          {/* ── Left: Available Labs ── */}
          <Card padded={false} className="db-labs-card" style={{ overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Cpu style={{ width: 20, height: 20, color: T.accent }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.3 }}>
                  Available Labs
                </span>
              </div>
              <button
                onClick={() => navigate('/machines')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 600, color: T.accent,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: T.font, padding: '5px 8px', borderRadius: 7,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.accentBg}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                View all <ArrowUpRight style={{ width: 12, height: 12 }} />
              </button>
            </div>

            {/* Difficulty filter pills */}
            {(() => {
              const FILTERS = [
                { label: 'All',    color: '#111827', bg: 'rgba(17,24,39,0.06)',   border: 'rgba(17,24,39,0.15)' },
                { label: 'Easy',   color: '#16A34A', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.22)' },
                { label: 'Medium', color: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.22)' },
                { label: 'Hard',   color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.22)' },
              ];
              return (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '12px 20px',
                }}>
                  {FILTERS.map(f => {
                    const active = diffFilter === f.label;
                    return (
                      <button
                        key={f.label}
                        onClick={() => setDiffFilter(f.label)}
                        style={{
                          padding: '4px 11px', height: 26, borderRadius: 20,
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          fontFamily: T.font,
                          border: `1px solid ${active ? f.border : T.border}`,
                          background: active ? f.bg : 'transparent',
                          color: active ? f.color : T.text3,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = f.border; e.currentTarget.style.color = f.color; e.currentTarget.style.background = f.bg; } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text3; e.currentTarget.style.background = 'transparent'; } }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Machine list */}
            {(() => {
              const filtered = userMachines.filter(m => {
                if (diffFilter === 'All') return true;
                const d = diffMap[m.difficulty] || 'Medium';
                if (diffFilter === 'Hard') return d === 'Hard' || d === 'Expert' || d === 'Insane';
                return d === diffFilter;
              });
              return (
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 14px', boxSizing: 'border-box' }}>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 13,
                        background: T.accentBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 14px',
                      }}>
                        <Cpu style={{ width: 22, height: 22, color: T.accent }} />
                      </div>
                      <p style={{ fontSize: 14, color: T.text3, marginBottom: 16, fontWeight: 500, fontFamily: T.font }}>
                        {userMachines.length === 0
                          ? 'No machines yet — use Vuln AI to generate one.'
                          : `No ${diffFilter.toLowerCase()} machines found.`}
                      </p>
                      {userMachines.length === 0 && (
                        <button
                          onClick={() => navigate('/vuln-ai')}
                          style={{
                            fontSize: 14, color: T.accent, fontWeight: 600,
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: T.font,
                          }}
                        >
                          Open Vuln AI →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      border: `1px solid ${T.border}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}>
                      {filtered.map((m, i) => (
                        <MachineRow
                          key={m.machine_id || i}
                          machine={m}
                          diffMap={diffMap}
                          onClick={() => navigate('/machines')}
                          isLast={i === filtered.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>

          {/* ── Right column: two stacked cards ── */}
          <div className="db-right-col" style={{ display: 'flex', flexDirection: 'column', gap: T.gap, minWidth: 0 }}>

            {/* Current Machine */}
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {(() => {
                const running = userMachines.find(m => m.is_running || m.container?.status === 'running');

                if (!running) return (
                  <>
                    {/* Header */}
                    <div style={{
                      padding: '20px 24px 16px',
                      borderBottom: `1px solid ${T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Server style={{ width: 20, height: 20, color: T.accent }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.2 }}>
                          Current Machine
                        </span>
                      </div>
                      <LiveBadge />
                    </div>
                    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 11,
                        background: '#F3F4F6', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}>
                        <Server style={{ width: 18, height: 18, color: T.text3 }} />
                      </div>
                      <p style={{ fontSize: 13, color: T.text3, fontFamily: T.font, fontWeight: 500 }}>
                        No machine running
                      </p>
                      <button
                        onClick={() => navigate('/machines')}
                        style={{
                          marginTop: 10, fontSize: 13, color: T.accent,
                          fontWeight: 600, background: 'none', border: 'none',
                          cursor: 'pointer', fontFamily: T.font,
                        }}
                      >
                        Browse Machines →
                      </button>
                    </div>
                  </>
                );

                const diff = diffMap[running.difficulty] || 'Medium';
                const machineUrl = running.url || running.ip || `${running.machine_id}`;
                const terminalUrl = running.terminal_url;
                const expiresAt = running.expires_at || running.expiration || null;
                const expiryLabel = expiresAt
                  ? (() => {
                      const ms = Math.max(0, new Date(expiresAt) - Date.now());
                      const h = Math.floor(ms / 3600000);
                      const m = Math.floor((ms % 3600000) / 60000);
                      return h > 0 ? `${h}h ${m}m` : `${m}m`;
                    })()
                  : '—';

                const diffColors = {
                  Easy:   { color: '#16A34A', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.22)' },
                  Medium: { color: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.22)' },
                  Hard:   { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.22)' },
                  Expert: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.22)' },
                };
                const dc = diffColors[diff] || diffColors.Medium;

                return (
                  <>
                    {/* ── Header row ── */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 20px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 9,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Server style={{ width: 20, height: 20, color: T.accent }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.3 }}>
                          Current Machine
                        </span>
                      </div>
                      <LiveBadge />
                    </div>

                    {/* ── Machine identity: large icon left, name + meta + IP/Expires right ── */}
                    <div style={{ display: 'flex', alignItems: 'stretch', gap: 16, padding: '4px 20px 18px' }}>
                      {/* Large icon box — tall, spans name + IP rows */}
                      <div style={{
                        width: 110, borderRadius: 18, flexShrink: 0,
                        background: T.accentBg, border: `1px solid ${T.accentBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 38, minHeight: 110,
                      }}>
                        {getVulnIcon(running)}
                      </div>

                      {/* Right column: name + category/diff + IP/Expires grid */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        {/* Name + category + diff */}
                        <div style={{ marginBottom: 10 }}>
                          <p style={{
                            fontSize: 15, fontWeight: 700, color: T.text1,
                            fontFamily: T.font, letterSpacing: -0.4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            marginBottom: 6,
                          }}>
                            {running.cve_id || running.variant || running.machine_id}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>
                              {getCategoryLabel(running)}
                            </span>
                            <span style={{ color: T.border }}>•</span>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                              background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`,
                              fontFamily: T.font, letterSpacing: 0.4, textTransform: 'uppercase',
                            }}>
                              {diff}
                            </span>
                          </div>
                        </div>

                        {/* IP Address | Expires */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[
                            { label: 'IP Address', val: machineUrl, clickable: true },
                            { label: 'Expires', val: expiryLabel },
                          ].map(row => (
                            <div key={row.label} style={{
                              padding: '8px 10px', borderRadius: 10,
                              background: '#F9F9F9', border: `1px solid ${T.border}`,
                              minWidth: 0,
                            }}>
                              <p style={{ fontSize: 10, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: T.font, marginBottom: 3 }}>
                                {row.label}
                              </p>
                              {row.clickable ? (
                                <a
                                  href={`http://${machineUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: T.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textDecoration: 'none' }}
                                >
                                  {row.val}
                                </a>
                              ) : (
                                <p style={{ fontSize: 12, fontWeight: 700, color: T.text1, fontFamily: T.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {row.val}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── Open Terminal button ── */}
                    <div style={{ padding: '0 20px 20px' }}>
                      {terminalUrl ? (
                        <a
                          href={terminalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            width: '100%', height: 44,
                            background: T.accent, color: '#fff',
                            borderRadius: 12, fontSize: 13, fontWeight: 600,
                            fontFamily: T.font, textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(249,115,22,0.25)',
                            transition: 'opacity 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          <ArrowUpRight style={{ width: 15, height: 15 }} />
                          Open Terminal
                        </a>
                      ) : (
                        <button
                          onClick={() => navigate('/machines')}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            width: '100%', height: 44,
                            background: T.accentBg, color: T.accent,
                            border: `1px solid ${T.accentBorder}`,
                            borderRadius: 12, fontSize: 13, fontWeight: 600,
                            fontFamily: T.font, cursor: 'pointer',
                          }}
                        >
                          <ArrowUpRight style={{ width: 15, height: 15 }} />
                          Open Terminal
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </Card>

            {/* Live Solve Feed */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <SolveFeedPanel style={{ flex: 1, height: '100%' }} />
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM GRID: My Statistics + Quick Actions ═══ */}
        <div className="db-bottom-grid" style={{
          animation: 'slideUp 0.4s ease 0.1s both',
          marginBottom: T.gap,
        }}>
          {/* My Statistics */}
          <Card padded={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp style={{ width: 20, height: 20, color: T.accent }} />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.3 }}>
                My Statistics
              </h2>
            </div>

            <div className="db-stats-grid" style={{ display: 'grid', gap: 10, alignItems: 'stretch', padding: '0 20px 20px' }}>
              {[
                { icon: Server,   label: 'Machines',      value: stats.machines,    suffix: '',  color: '#F97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.22)' },
                { icon: Flag,     label: 'Flags Captured', value: todayStats.flags,  suffix: '',  color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.22)' },
                { icon: Star,     label: 'Points',         value: totalStats.points, suffix: '',  color: '#F97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.22)' },
                { icon: Flame,    label: 'Streak',         value: totalStats.streak, suffix: 'd', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.22)' },
              ].map(({ icon: Icon, label, value, suffix, color, bg, border, isLive }) => (
                <div key={label} style={{
                  padding: '22px 14px', borderRadius: 12,
                  background: bg, border: `1px solid ${T.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 20, height: 20, color }} />
                    </div>
                    {isLive && <span style={{ marginLeft: 6 }}><LiveBadge /></span>}
                  </div>
                  <p style={{
                    fontSize: 22, fontWeight: 800, color,
                    fontFamily: T.font, lineHeight: 1, letterSpacing: -0.8,
                    fontVariantNumeric: 'tabular-nums', marginBottom: 2,
                  }}>
                    {value}{suffix}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 500, color: color + 'CC', fontFamily: T.font }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card padded={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles style={{ width: 20, height: 20, color: T.accent }} />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.3 }}>
                Quick Actions
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 20px' }}>
              {ACTIONS.map(a => (
                <QuickActionCard key={a.label} {...a} navigate={navigate} />
              ))}
            </div>
          </Card>
        </div>

        {/* ═══ PROGRESS OVERVIEW ═══ */}
        <Card padded={false} style={{ marginTop: T.gap, animation: 'slideUp 0.4s ease 0.2s both' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp style={{ width: 20, height: 20, color: T.accent }} />
            </div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.3 }}>
              Progress Overview
            </h2>
          </div>

          <div className="db-progress-grid" style={{ display: 'grid', alignItems: 'stretch', gap: 0 }}>

            {/* Running Labs — first column */}
            <div className="db-progress-col" style={{ padding: '14px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Activity style={{ width: 16, height: 16, color: '#DC2626', flexShrink: 0 }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: T.text3, letterSpacing: 0.4, textTransform: 'uppercase', fontFamily: T.font }}>Running Labs</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: T.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                  <Activity style={{ width: 13, height: 13, color: '#DC2626' }} />
                </div>
                <LiveBadge />
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: T.text1, fontFamily: T.font, lineHeight: 1, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
                {stats.running}
              </p>
              <p style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>Active now</p>
            </div>

            {/* Points chart */}
            <div className="db-progress-col" style={{ padding: '14px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <TrendingUp style={{ width: 16, height: 16, color: T.accent, flexShrink: 0 }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: T.text3, letterSpacing: 0.4, textTransform: 'uppercase', fontFamily: T.font }}>Points Over Time</p>
              </div>
              {(() => {
                const CustomDot = (props) => {
                  const { cx, cy } = props;
                  return <circle cx={cx} cy={cy} r={4} fill="#F97316" stroke="#fff" strokeWidth={2} />;
                };
                const CustomTooltip = ({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 14px', boxShadow: T.shadowCardHover, fontFamily: T.font }}>
                      <p style={{ fontSize: 11, color: T.text3, marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{payload[0].value} pts</p>
                    </div>
                  );
                };
                return (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={pointsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pointsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#F97316" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: T.text3, fontFamily: T.font }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: T.text3, fontFamily: T.font }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: T.accentBorder, strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="points" stroke="#F97316" strokeWidth={2.5} fill="url(#pointsGrad)" dot={<CustomDot />} activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }} animationDuration={900} animationEasing="ease-out" />
                    </AreaChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>

            {/* Top Hackers */}
            <div style={{ padding: '14px 20px 20px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Trophy style={{ width: 16, height: 16, color: '#D97706', flexShrink: 0 }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: T.text3, letterSpacing: 0.4, textTransform: 'uppercase', fontFamily: T.font }}>Top Hackers</p>
              </div>
              <TopHackersPanel />
            </div>

          </div>
        </Card>

        {/* ═══ ASSIGNED CAMPAIGNS ═══ */}
        {assignedCampaigns.length > 0 && (
          <div style={{ marginTop: T.gap, animation: 'slideUp 0.4s ease 0.2s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen style={{ width: 15, height: 15, color: '#7c3aed' }} />
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.3 }}>
                Assigned Campaigns
              </h2>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                background: 'rgba(139,92,246,0.08)', color: '#7c3aed',
                border: '1px solid rgba(139,92,246,0.18)', fontFamily: T.font,
              }}>
                {assignedCampaigns.length}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {assignedCampaigns.map(c => {
                const assignment = c.assignment || {};
                const status = assignment.status || 'pending';
                const isActive   = status === 'active';
                const isExpired  = status === 'expired';
                const isCompleted = status === 'completed';
                const statusColors = {
                  pending:   { bg: T.warningBg, color: T.warning, border: 'rgba(245,158,11,0.20)' },
                  active:    { bg: T.successBg, color: T.success, border: T.successBorder },
                  completed: { bg: 'rgba(59,130,246,0.07)', color: '#3b82f6', border: 'rgba(59,130,246,0.18)' },
                  expired:   { bg: T.errorBg,   color: T.error,   border: 'rgba(239,68,68,0.18)' },
                };
                const sc = statusColors[status] || statusColors.pending;
                let timeLeft = null;
                if (isActive && assignment.expires_at) {
                  const diff = Math.max(0, new Date(assignment.expires_at) - Date.now());
                  const mins = Math.floor(diff / 60000);
                  const secs = Math.floor((diff % 60000) / 1000);
                  timeLeft = `${mins}:${secs.toString().padStart(2, '0')}`;
                }

                return (
                  <Card key={c.campaign_id} padded={false} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.campaign_name}
                          </p>
                          <p style={{ fontSize: 12, color: T.text3, marginTop: 3, fontFamily: T.font }}>
                            {c.machine_count || 0} machines · {c.time_limit_minutes || 30} min
                          </p>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                          background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                          textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 0, fontFamily: T.font,
                        }}>
                          {status}
                        </span>
                      </div>

                      {isActive && assignment.expires_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <Timer style={{ width: 12, height: 12, color: T.success, flexShrink: 0 }} />
                          <div style={{ flex: 1, height: 4, borderRadius: 4, background: T.border, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 4,
                              background: `linear-gradient(90deg, ${T.success}, #4ade80)`,
                              width: `${Math.max(0, Math.min(100, (new Date(assignment.expires_at) - Date.now()) / (c.time_limit_minutes * 60000) * 100))}%`,
                              transition: 'width 1s linear',
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.success, fontFamily: T.fontMono, flexShrink: 0 }}>
                            {timeLeft}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '0 20px 16px' }}>
                      <button
                        disabled={isExpired || isCompleted || startingCampaign === c.campaign_id}
                        onClick={async () => {
                          if (isActive) { navigate(`/campaigns/${c.campaign_id}`); return; }
                          try {
                            setStartingCampaign(c.campaign_id);
                            await api.startCampaign(c.campaign_id);
                            navigate(`/campaigns/${c.campaign_id}`);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setStartingCampaign(null);
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                          width: '100%', height: 40, borderRadius: 10, border: 'none',
                          fontSize: 13, fontWeight: 600, cursor: (isExpired || isCompleted) ? 'not-allowed' : 'pointer',
                          fontFamily: T.font, transition: 'all 0.18s ease',
                          background: isExpired ? T.errorBg : isCompleted ? 'rgba(59,130,246,0.08)' : isActive ? T.accentBg : T.accent,
                          color: isExpired ? T.error : isCompleted ? '#3b82f6' : isActive ? T.accent : '#fff',
                          opacity: (isExpired || isCompleted) ? 0.7 : 1,
                          boxShadow: (!isExpired && !isCompleted && !isActive) ? '0 4px 14px rgba(249,115,22,0.25)' : 'none',
                        }}
                      >
                        {startingCampaign === c.campaign_id ? (
                          <><Loader style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Starting…</>
                        ) : isCompleted ? (
                          <><CheckCircle style={{ width: 13, height: 13 }} /> Completed</>
                        ) : isExpired ? (
                          <><Clock style={{ width: 13, height: 13 }} /> Expired</>
                        ) : isActive ? (
                          <><PlayCircle style={{ width: 13, height: 13 }} /> Continue Campaign</>
                        ) : (
                          <><PlayCircle style={{ width: 13, height: 13 }} /> Start Campaign</>
                        )}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
