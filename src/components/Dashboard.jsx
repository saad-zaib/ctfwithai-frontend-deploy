import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Server,
  Cpu,
  Activity,
  Shield,
  ChevronRight,
  AlertCircle,
  Flag,
  Clock,
  Award,
  ArrowUpRight,
  Flame,
  Loader,
  Target,
  Sparkles,
  RotateCw,
  PlayCircle,
  BookOpen,
  CheckCircle,
  Timer,
} from "lucide-react";
import api from "../services/api";

/* ─────────────────────────────────────────────
   Aurius Design Tokens  (matches LandingPage / Login / Register)
───────────────────────────────────────────── */
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
  shadowMd: "rgba(0,0,0,0.10)",
};

/* ─────────────────────────────────────────────
   Constants / helpers  (unchanged)
───────────────────────────────────────────── */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const formatName = (name) =>
  name?.length > 10 ? name.slice(0, 10) + "..." : name;

/* ── animated counter hook (unchanged) ── */
const useCounter = (target, duration = 1400) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const start = performance.now();
    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setCount(Math.round(e * target));
      if (p < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return count;
};

/* ═══════════════════════════════════════════
   StatCard
═══════════════════════════════════════════ */
const StatCard = ({ icon: Icon, label, value, accent, delay, isLive }) => {
  const animated = useCounter(value ?? 0, 1200);

  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "22px 22px 20px",
        cursor: "default",
      }}
    >
      {/* icon + live badge row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: C.accentBg,
            border: `1px solid ${C.accentBdr}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ width: 18, height: 18, color: accent }} />
        </div>

        {isLive && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "#059669",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
                animation: "livePulse 1.8s ease-in-out infinite",
              }}
            />
            live
          </span>
        )}
      </div>

      {/* counter */}
      <p
        style={{
          fontSize: 38,
          fontWeight: 800,
          color: C.text1,
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1,
          marginBottom: 4,
          letterSpacing: -1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {animated}
      </p>

      {/* label */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: C.text3,
          fontFamily: "'DM Sans', sans-serif",
          marginTop: 4,
        }}
      >
        {label}
      </p>

    </div>
  );
};

/* ═══════════════════════════════════════════
   SolveFeedPanel  (all logic unchanged)
═══════════════════════════════════════════ */
const SolveFeedPanel = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats/feed?limit=25`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setFeed(data.feed || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const iv = setInterval(fetchFeed, 15000);
    return () => clearInterval(iv);
  }, []);

  const timeAgo = (iso) => {
    if (!iso) return "";
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  };

  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "20px 20px 16px",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            color: C.text1,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: -0.2,
          }}
        >
          <Activity style={{ width: 15, height: 15, color: C.accent }} />
          Solve Feed
        </h2>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: "#059669",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#10b981",
              animation: "livePulse 1.8s ease-in-out infinite",
            }}
          />
          live
        </span>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px 0",
          }}
        >
          <Loader
            style={{
              width: 20,
              height: 20,
              color: C.accent,
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      ) : feed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 0" }}>
          <Flag
            style={{
              width: 26,
              height: 26,
              color: C.border,
              margin: "0 auto 10px",
            }}
          />
          <p
            style={{
              fontSize: 12,
              color: C.text3,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            No solves yet. Be the first.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            maxHeight: 284,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: `${C.border} transparent`,
          }}
        >
          {feed.map((entry, i) => (
            <FeedRow
              key={entry.submission_id}
              entry={entry}
              i={i}
              timeAgo={timeAgo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* feed row extracted to allow hover state */
const FeedRow = ({ entry, i, timeAgo }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 10,
        background: hov ? C.accentBg : C.sectionBg,
        border: `1px solid ${hov ? C.accentBdr : C.border}`,
        transition: "all 0.2s ease",
        animation: `slideUp 0.3s ease-out ${i * 0.03}s both`,
      }}
    >
      {/* avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          background: C.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {entry.username?.slice(0, 1).toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.text1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {formatName(entry.username)}
          </span>
          {entry.first_blood && (
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: 1,
                padding: "2px 6px",
                borderRadius: 5,
                background: "rgba(220,38,38,0.08)",
                color: "#dc2626",
                border: "1px solid rgba(220,38,38,0.22)",
                textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              1st Blood
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 10,
            color: C.text3,
            fontFamily: "monospace",
            marginTop: 1,
          }}
        >
          <span style={{ color: C.accent }}>
            {entry.machine_id?.replace("machine_", "").slice(0, 10)}
          </span>
          {entry.points > 0 && (
            <span style={{ color: "#059669", marginLeft: 4 }}>
              +{entry.points}pts
            </span>
          )}
        </p>
      </div>

      <span
        style={{
          fontSize: 10,
          color: C.text3,
          flexShrink: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {timeAgo(entry.submitted_at)}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════
   DiffBadge  (logic unchanged, styled to match system)
═══════════════════════════════════════════ */
const DiffBadge = ({ level }) => {
  const map = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#f97316",
    Expert: "#ef4444",
  };
  const color = map[level] || C.accent;
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: 6,
        color,
        background: color + "14",
        border: `1px solid ${color}38`,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {level}
    </span>
  );
};

/* ═══════════════════════════════════════════
   PillTag  (matches LandingPage exactly)
═══════════════════════════════════════════ */
const PillTag = ({ children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "4px 13px",
      borderRadius: 30,
      background: C.accentBg,
      border: `1px solid ${C.accentBdr}`,
      color: C.accent,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: C.accent,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
    {children}
  </span>
);

/* ═══════════════════════════════════════════
   DASHBOARD (main component — all logic unchanged)
═══════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "";
  const username = localStorage.getItem("username") || "Hacker";

  const [stats, setStats] = useState({ machines: 0, campaigns: 0, running: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("machines");
  const [userMachines, setUserMachines] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [todayStats, setTodayStats] = useState({ solved: 0, flags: 0 });
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [assignedCampaigns, setAssignedCampaigns] = useState([]);
  const [startingCampaign, setStartingCampaign] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const [statsRes, progressRes, campaignsRes, lbRes, machinesRes] =
        await Promise.all([
          fetch(`${API_BASE}/api/stats?user_id=${encodeURIComponent(userId)}`, {
            headers: authHeaders(),
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch(
            `${API_BASE}/api/users/${encodeURIComponent(userId)}/progress`,
            { headers: authHeaders() },
          )
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch(
            `${API_BASE}/api/users/${encodeURIComponent(userId)}/campaigns`,
            { headers: authHeaders() },
          )
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
          fetch(`${API_BASE}/api/leaderboard`, { headers: authHeaders() })
            .then((r) => (r.ok ? r.json() : { entries: [] }))
            .catch(() => ({ entries: [] })),
          api.getMachines().catch(() => []),
        ]);

      const userMachineList = Array.isArray(machinesRes) ? machinesRes : [];
      const runningCount = userMachineList.filter(
        (m) => m.is_running || m.container?.status === "running",
      ).length;

      setStats({
        machines: userMachineList.length,
        campaigns: statsRes?.total_campaigns ?? 0,
        running: runningCount,
      });

      setUserCampaigns(Array.isArray(campaignsRes) ? campaignsRes : []);
      setUserMachines(userMachineList.slice(0, 10));

      // Fetch assigned campaigns (teacher-assigned or friend-shared)
      try {
        const assignedRes = await api.getAssignedCampaigns();
        const assignedList = Array.isArray(assignedRes)
          ? assignedRes
          : (assignedRes?.campaigns || assignedRes?.assignments || []);
        const normalized = (assignedList || []).map((item) => {
          if (item?.campaign && typeof item.campaign === "object") {
            const { campaign, ...assignment } = item;
            return { ...campaign, assignment };
          }
          return item;
        });
        setAssignedCampaigns(normalized);
      } catch (_) { /* not critical */ }

      const subs = progressRes?.recent_submissions || [];
      const today = new Date().toDateString();
      const tSubs = subs.filter(
        (s) => new Date(s.submitted_at).toDateString() === today,
      );
      setTodayStats({
        solved: tSubs.filter((s) => s.correct).length,
        flags: tSubs.length,
      });

      const lb = Array.isArray(lbRes) ? lbRes : lbRes?.entries || [];
      setLeaderboard(
        lb
          .filter((e) => (e.total_points || 0) > 0)
          .map((e) => ({
            ...e,
            isYou: e.user_id === userId || e.username === username,
          })),
      );

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
        const machines = await api.getMachines().catch(() => []);
        const running = machines.filter(
          (m) => m.is_running || m.container?.status === "running",
        ).length;
        setStats((prev) => ({ ...prev, running, machines: machines.length }));
      } catch {}
    }, 5000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const diffMap = { 1: "Easy", 2: "Easy", 3: "Medium", 4: "Hard", 5: "Expert" };

  /* ── Loading state ── */
  if (isLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
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
          <p style={{ color: C.text3, fontSize: 13, fontWeight: 500 }}>
            Loading dashboard…
          </p>
        </div>
      </div>
    );

  /* ── Error state ── */
  if (error)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');`}</style>
        <div
          style={{
            maxWidth: 440,
            width: "100%",
            background: C.cardBg,
            border: `1px solid rgba(220,38,38,0.24)`,
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            boxShadow: `0 24px 60px rgba(0,0,0,0.08)`,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(220,38,38,0.06)",
              border: "1px solid rgba(220,38,38,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <AlertCircle style={{ width: 26, height: 26, color: "#dc2626" }} />
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: C.text1,
              marginBottom: 8,
              letterSpacing: -0.4,
            }}
          >
            Connection Failed
          </h2>
          <p
            style={{
              color: C.text3,
              fontSize: 13,
              lineHeight: 1.75,
              marginBottom: 24,
            }}
          >
            {error}
          </p>
          <button
            onClick={fetchAll}
            style={{
              padding: "11px 28px",
              background: C.accent,
              border: "none",
              borderRadius: 30,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );

  /* ══════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════ */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes livePulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

        .db-tab-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.8px; text-transform: uppercase;
          border: none; background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .db-scroll::-webkit-scrollbar        { width: 4px; }
        .db-scroll::-webkit-scrollbar-track  { background: transparent; }
        .db-scroll::-webkit-scrollbar-thumb  { background: ${C.border}; border-radius: 4px; }

        .db-row-hover { transition: background 0.18s; }
        .db-row-hover:hover { background: ${C.accentBg} !important; }

        .db-action-btn { transition: all 0.22s ease; }
        .db-action-btn:hover { background: ${C.accentBg} !important; border-color: ${C.accentBdr} !important; }
        .db-action-btn:hover .db-chevron { color: ${C.accent} !important; transform: translateX(2px); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px" }}>
        {/* ══ HEADER ══ */}
        <div
          style={{
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <PillTag>Dashboard</PillTag>
            <h1
              style={{
                fontSize: "clamp(26px,4vw,40px)",
                fontWeight: 800,
                color: C.text1,
                letterSpacing: -1.5,
                lineHeight: 1.1,
                fontFamily: "'DM Sans', sans-serif",
                marginTop: 10,
              }}
            >
              Welcome back,{" "}
              <span style={{ color: C.accent }}>{formatName(username)}</span>
            </h1>
            <p
              style={{
                color: C.text3,
                fontSize: 13,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {new Date().toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <button
            onClick={fetchAll}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 30,
              color: C.text2,
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.22s ease",
              opacity: isLoading ? 0.5 : 1,
              boxShadow: `0 1px 4px ${C.shadow}`,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = C.accentBdr;
                e.currentTarget.style.color = C.accent;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.text2;
            }}
          >
            <RotateCw
              style={{
                width: 14,
                height: 14,
                animation: isLoading ? "spin 1s linear infinite" : "none",
              }}
            />
            Refresh
          </button>
        </div>

        {/* ══ TOP GRID: Tabbed panel + Solve Feed ══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* ── Machines / Leaderboard tab panel ── */}
          <div
            style={{
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* tab bar */}
            <div
              style={{
                display: "flex",
                borderBottom: `1px solid ${C.border}`,
                background: C.cardBg,
                padding: "0 4px",
              }}
            >
              {[
                { key: "machines", label: "Machines", icon: Cpu },
                { key: "leaderboard", label: "Leaderboard", icon: Award },
              ].map((t, idx) => (
                <React.Fragment key={t.key}>
                  {idx > 0 && (
                    <div
                      style={{
                        width: 1,
                        height: 16,
                        background: C.border,
                        margin: "auto 4px",
                      }}
                    />
                  )}
                  <button
                    onClick={() => setActiveTab(t.key)}
                    className="db-tab-btn"
                    style={{
                      borderBottomColor:
                        activeTab === t.key ? C.accent : "transparent",
                      color: activeTab === t.key ? C.accent : C.text3,
                    }}
                  >
                    <t.icon style={{ width: 13, height: 13 }} />
                    {t.label}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* tab content */}
            <div
              className="db-scroll"
              style={{ height: 320, overflowY: "auto" }}
            >
              {/* ─ Machines tab ─ */}
              {activeTab === "machines" &&
                (userMachines.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "52px 24px" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: C.accentBg,
                        border: `1px solid ${C.accentBdr}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <Cpu style={{ width: 20, height: 20, color: C.accent }} />
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: C.text3,
                        marginBottom: 12,
                        fontWeight: 500,
                      }}
                    >
                      No machines yet — use Vuln AI to generate one.
                    </p>
                    <button
                      onClick={() => navigate("/vuln-ai")}
                      style={{
                        fontSize: 13,
                        color: C.accent,
                        fontWeight: 700,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.7")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      Open Vuln AI →
                    </button>
                  </div>
                ) : (
                  <div>
                    {userMachines.map((m, i) => {
                      const running =
                        m.is_running || m.container?.status === "running";
                      const diff = diffMap[m.difficulty] || "Medium";
                      return (
                        <div
                          key={m.machine_id || i}
                          className="db-row-hover"
                          onClick={() => navigate("/machines")}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "12px 20px",
                            borderBottom: `1px solid ${C.border}`,
                            cursor: "pointer",
                            background: "transparent",
                          }}
                        >
                          {/* status dot */}
                          <div
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: running ? "#10b981" : C.border,
                              boxShadow: running ? "0 0 6px #10b981" : "none",
                            }}
                          />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: C.text1,
                                  fontFamily: "monospace",
                                  letterSpacing: -0.3,
                                }}
                              >
                                {m.cve_id || m.variant || m.machine_id}
                              </span>
                              <DiffBadge level={diff} />
                            </div>
                            <p
                              style={{
                                fontSize: 10,
                                color: C.text3,
                                fontFamily: "monospace",
                                marginTop: 2,
                              }}
                            >
                              {running ? "RUNNING" : "STOPPED"} ·{" "}
                              {m.machine_id
                                ?.replace("machine_", "")
                                .slice(0, 10)}
                            </p>
                          </div>

                          <ArrowUpRight
                            style={{
                              width: 14,
                              height: 14,
                              color: C.border,
                              transition: "color 0.2s",
                              flexShrink: 0,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}

              {/* ─ Leaderboard tab ─ */}
              {activeTab === "leaderboard" &&
                (leaderboard.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "52px 24px" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: C.accentBg,
                        border: `1px solid ${C.accentBdr}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <Award
                        style={{ width: 20, height: 20, color: C.accent }}
                      />
                    </div>
                    <p
                      style={{ fontSize: 13, color: C.text3, fontWeight: 500 }}
                    >
                      No entries yet.
                    </p>
                  </div>
                ) : (
                  <div>
                    {leaderboard.slice(0, 8).map((u, i) => {
                      const rankColor =
                        i === 0
                          ? "#d97706"
                          : i === 1
                            ? "#9ca3af"
                            : i === 2
                              ? "#b45309"
                              : C.text3;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "11px 20px",
                            borderBottom: `1px solid ${C.border}`,
                            background: u.isYou ? C.accentBg : "transparent",
                            transition: "background 0.18s",
                          }}
                        >
                          {/* rank */}
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              width: 18,
                              textAlign: "center",
                              color: rankColor,
                              fontFamily: "'DM Sans', sans-serif",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {i + 1}
                          </span>

                          {/* avatar */}
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 800,
                              background: u.isYou ? C.accent : C.sectionBg,
                              border: `1px solid ${u.isYou ? C.accent : C.border}`,
                              color: u.isYou ? "#fff" : C.text3,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {(u.username || "?").slice(0, 2).toUpperCase()}
                          </div>

                          <div style={{ flex: 1 }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: u.isYou ? C.accent : C.text1,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {formatName(u.username)}
                              {u.isYou ? " · you" : ""}
                            </span>
                            {u.machines_solved > 0 && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  fontSize: 10,
                                  color: C.text3,
                                  fontFamily: "monospace",
                                }}
                              >
                                {u.machines_solved} pwned
                              </span>
                            )}
                          </div>

                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: C.text1,
                              fontFamily: "'DM Sans', sans-serif",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {(u.total_points || 0).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}

                    <div style={{ padding: "12px 20px" }}>
                      <button
                        onClick={() => navigate("/leaderboard")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.accent,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                          fontFamily: "'DM Sans', sans-serif",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.7")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        View Full Board{" "}
                        <ArrowUpRight style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* ── Solve Feed ── */}
          <SolveFeedPanel />
        </div>

        {/* ══ STAT CARDS ══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <StatCard
            icon={Server}
            label="Machines"
            value={stats.machines}
            accent={C.accent}
            delay={0}
          />
          <StatCard
            icon={Activity}
            label="Running"
            value={stats.running}
            accent={C.accent}
            delay={0.07}
            isLive
          />
          <StatCard
            icon={Flame}
            label="Today Solves"
            value={todayStats.solved}
            accent={C.accent}
            delay={0.14}
          />
        </div>

        {/* ══ BOTTOM GRID: Today's Stats + Quick Actions ══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* ─ Today's Stats card ─ */}
          <div
            style={{
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "20px 22px",
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                color: C.text1,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: -0.2,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: C.accentBg,
                  border: `1px solid ${C.accentBdr}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock style={{ width: 14, height: 14, color: C.accent }} />
              </div>
              Today's Stats
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                { label: "Solved", val: todayStats.solved, color: C.text1 },
                { label: "Flags", val: todayStats.flags, color: C.text1 },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    textAlign: "center",
                    padding: "18px 12px",
                    borderRadius: 12,
                    background: C.sectionBg,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      color: s.color,
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: -1,
                    }}
                  >
                    {s.val}
                  </p>
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      color: s.color,
                      opacity: 0.6,
                      marginTop: 5,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: 11,
                color: C.text3,
                marginTop: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}
            >
              {userCampaigns.length} campaign
              {userCampaigns.length !== 1 ? "s" : ""} total
            </p>
          </div>

          {/* ─ Quick Actions card ─ */}
          <div
            style={{
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "20px 22px",
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                color: C.text1,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: -0.2,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: C.accentBg,
                  border: `1px solid ${C.accentBdr}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles style={{ width: 14, height: 14, color: C.accent }} />
              </div>
              Quick Actions
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  icon: Cpu,
                  label: "Browse Machines",
                  sub: "View your lab environments",
                  color: C.accent,
                  route: "/machines",
                },
                {
                  icon: Award,
                  label: "Leaderboard",
                  sub: "See top hackers",
                  color: C.accent,
                  route: "/leaderboard",
                },
                {
                  icon: Target,
                  label: "Vuln AI",
                  sub: "Generate new machines",
                  color: C.accent,
                  route: "/vuln-ai",
                },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.route)}
                  className="db-action-btn"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    background: C.sectionBg,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: a.color + "14",
                        border: `1px solid ${a.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <a.icon
                        style={{ width: 15, height: 15, color: a.color }}
                      />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.text1,
                          lineHeight: 1.2,
                        }}
                      >
                        {a.label}
                      </p>
                      <p style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>
                        {a.sub}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className="db-chevron"
                    style={{
                      width: 15,
                      height: 15,
                      color: C.border,
                      transition: "all 0.22s",
                      flexShrink: 0,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* ══ ASSIGNED CAMPAIGNS SECTION ══ */}
        {assignedCampaigns.length > 0 && (
          <div
            style={{
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h2
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.text1,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: -0.2,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "rgba(139,92,246,0.10)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookOpen style={{ width: 14, height: 14, color: "#8b5cf6" }} />
                </div>
                Assigned Campaigns
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "rgba(139,92,246,0.10)",
                    color: "#8b5cf6",
                    border: "1px solid rgba(139,92,246,0.22)",
                  }}
                >
                  {assignedCampaigns.length}
                </span>
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              {assignedCampaigns.map((c, i) => {
                const assignment = c.assignment || {};
                const status = assignment.status || "pending";
                const isActive = status === "active";
                const isExpired = status === "expired";
                const isCompleted = status === "completed";
                const statusColors = {
                  pending: { bg: "rgba(245,158,11,0.08)", color: "#d97706", border: "rgba(245,158,11,0.22)" },
                  active:  { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.22)" },
                  completed: { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.22)" },
                  expired: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.22)" },
                };
                const sc = statusColors[status] || statusColors.pending;

                // Countdown for active campaigns
                let timeLeft = null;
                if (isActive && assignment.expires_at) {
                  const diff = Math.max(0, new Date(assignment.expires_at) - Date.now());
                  const mins = Math.floor(diff / 60000);
                  const secs = Math.floor((diff % 60000) / 1000);
                  timeLeft = `${mins}:${secs.toString().padStart(2, '0')}`;
                }

                return (
                  <div
                    key={c.campaign_id}
                    style={{
                      background: C.cardBg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.campaign_name}
                        </p>
                        <p style={{ fontSize: 10, color: C.text3, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
                          {c.machine_count || 0} machines · {c.time_limit_minutes || 30} min
                        </p>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: "uppercase", letterSpacing: 1, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                        {status}
                      </span>
                    </div>

                    {/* Timer bar for active campaigns */}
                    {isActive && assignment.expires_at && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Timer style={{ width: 12, height: 12, color: "#059669", flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 4, borderRadius: 4, background: C.border, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 4,
                              background: "linear-gradient(90deg, #10b981, #34d399)",
                              width: `${Math.max(0, Math.min(100, (new Date(assignment.expires_at) - Date.now()) / (c.time_limit_minutes * 60000) * 100))}%`,
                              transition: "width 1s linear",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", fontFamily: "monospace", flexShrink: 0 }}>
                          {timeLeft}
                        </span>
                      </div>
                    )}

                    {/* Action button */}
                    <button
                      disabled={isExpired || isCompleted || startingCampaign === c.campaign_id}
                      onClick={async () => {
                        if (isActive) {
                          navigate(`/campaigns/${c.campaign_id}`);
                          return;
                        }
                        // Start campaign
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: (isExpired || isCompleted) ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s ease",
                        background: isExpired ? "rgba(239,68,68,0.08)"
                          : isCompleted ? "rgba(59,130,246,0.08)"
                          : isActive ? C.accentBg
                          : "linear-gradient(135deg, #f97316, #fb923c)",
                        color: isExpired ? "#ef4444"
                          : isCompleted ? "#3b82f6"
                          : isActive ? C.accent
                          : "#fff",
                        opacity: isExpired || isCompleted ? 0.7 : 1,
                        boxShadow: (!isExpired && !isCompleted && !isActive) ? "0 4px 14px rgba(249,115,22,0.30)" : "none",
                      }}
                    >
                      {startingCampaign === c.campaign_id ? (
                        <><Loader style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> Starting...</>
                      ) : isCompleted ? (
                        <><CheckCircle style={{ width: 12, height: 12 }} /> Completed</>
                      ) : isExpired ? (
                        <><Clock style={{ width: 12, height: 12 }} /> Expired</>
                      ) : isActive ? (
                        <><PlayCircle style={{ width: 12, height: 12 }} /> Continue Campaign</>
                      ) : (
                        <><PlayCircle style={{ width: 12, height: 12 }} /> Start Campaign</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* /bottom grid */}
      </div>
      {/* /container */}
    </div>
  );
};

export default Dashboard;
