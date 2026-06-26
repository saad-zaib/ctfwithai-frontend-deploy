import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, Loader, AlertCircle, Flame } from "lucide-react";
import api from "../services/api";

/* ─────────────────────────────────────────────
   Aurius Design Tokens
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

/* rank-specific palette */
const RANK = {
  1: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.07)",
    border: "rgba(217,119,6,0.22)",
  },
  2: {
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.07)",
    border: "rgba(156,163,175,0.22)",
  },
  3: {
    color: "#b45309",
    bg: "rgba(180,83,9,0.07)",
    border: "rgba(180,83,9,0.22)",
  },
};

/* ─── PillTag ─── */
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
        flexShrink: 0,
      }}
    />
    {children}
  </span>
);

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("all_time");
  const [firstBloods, setFirstBloods] = React.useState({});
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchLeaderboard();
    fetchFirstBloods();
  }, [timeframe]);

  const fetchFirstBloods = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats/feed?limit=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await res.json();
      const counts = {};
      (data.feed || []).forEach((e) => {
        if (e.first_blood) counts[e.user_id] = (counts[e.user_id] || 0) + 1;
      });
      setFirstBloods(counts);
    } catch (_) {}
  };

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.getLeaderboard(100, timeframe);
      setLeaderboard(
        (data.entries || []).filter((e) => (e.total_points || 0) > 0),
      );
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    const s = { width: 18, height: 18 };
    if (rank === 1) return <Trophy style={{ ...s, color: "#d97706" }} />;
    if (rank === 2) return <Medal style={{ ...s, color: "#9ca3af" }} />;
    if (rank === 3) return <Award style={{ ...s, color: "#b45309" }} />;
    return null;
  };

  /* ── Loading ── */
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
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: C.accentBg,
              border: `1px solid ${C.accentBdr}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Loader
              style={{
                width: 24,
                height: 24,
                color: C.accent,
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
          <p style={{ color: C.text3, fontSize: 13, fontWeight: 500 }}>
            Loading leaderboard…
          </p>
        </div>
      </div>
    );

  /* ── Error ── */
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
            border: "1px solid rgba(220,38,38,0.24)",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            boxShadow: "0 24px 60px rgba(0,0,0,0.08)",
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
            Error Loading Leaderboard
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
            onClick={fetchLeaderboard}
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
              boxShadow: "0 4px 18px rgba(249,115,22,0.28)",
              transition: "all 0.22s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 28px rgba(249,115,22,0.38)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 18px rgba(249,115,22,0.28)";
            }}
          >
            Retry
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
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }

        .lb-card { transition: border-color 0.26s ease, box-shadow 0.26s ease, transform 0.26s ease; }
        .lb-card:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(249,115,22,0.10), 0 2px 8px ${C.shadowMd} !important; }
        .lb-card:hover .lb-sweep { width: 100% !important; }

        .lb-rank-1:hover { border-color: rgba(217,119,6,0.42) !important; box-shadow: 0 14px 40px rgba(217,119,6,0.14), 0 2px 8px ${C.shadowMd} !important; }
        .lb-rank-2:hover { border-color: rgba(156,163,175,0.42) !important; box-shadow: 0 14px 40px rgba(156,163,175,0.12), 0 2px 8px ${C.shadowMd} !important; }
        .lb-rank-3:hover { border-color: rgba(180,83,9,0.42) !important;   box-shadow: 0 14px 40px rgba(180,83,9,0.14), 0 2px 8px ${C.shadowMd} !important; }

        .lb-tf-btn { transition: all 0.22s ease; }
        .lb-tf-btn:hover { border-color: ${C.accentBdr} !important; color: ${C.accent} !important; }
      `}</style>

      <div style={{ width: "100%", padding: "36px 40px" }}>
        {/* ══ HEADER ══ */}
        <div
          style={{ marginBottom: 32, animation: "slideUp 0.4s ease-out both" }}
        >
          <PillTag>Rankings</PillTag>
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
            Global <span style={{ color: C.accent }}>Leaderboard</span>
          </h1>
          <p
            style={{
              color: C.text3,
              fontSize: 13,
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            Top hackers ranked by their achievements
          </p>
        </div>

        {/* ══ TIMEFRAME TABS ══ */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 28,
            animation: "slideUp 0.4s ease-out 0.08s both",
          }}
        >
          {["all_time", "monthly", "weekly"].map((tf) => {
            const active = timeframe === tf;
            const label = tf
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className="lb-tf-btn"
                style={{
                  padding: "8px 18px",
                  borderRadius: 30,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  border: `1px solid ${active ? C.accentBdr : C.border}`,
                  background: active ? C.accentBg : C.cardBg,
                  color: active ? C.accent : C.text3,
                  boxShadow: active ? "none" : `0 1px 3px ${C.shadow}`,
                  transition: "all 0.22s ease",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ══ EMPTY STATE ══ */}
        {leaderboard.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              boxShadow: `0 1px 3px ${C.shadow}`,
              animation: "slideUp 0.4s ease-out 0.1s both",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: C.accentBg,
                border: `1px solid ${C.accentBdr}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trophy style={{ width: 28, height: 28, color: C.accent }} />
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: C.text1,
                marginBottom: 8,
                letterSpacing: -0.4,
              }}
            >
              No Entries Yet
            </h3>
            <p style={{ color: C.text3, fontSize: 13, fontWeight: 500 }}>
              Be the first to complete a challenge!
            </p>
          </div>
        ) : (
          /* ══ ENTRIES LIST ══ */
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const rankStyle = RANK[rank];
              const isTopThree = rank <= 3;

              return (
                <div
                  key={entry.user_id || index}
                  className={`lb-card${isTopThree ? ` lb-rank-${rank}` : ""}`}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: isTopThree ? rankStyle.bg : C.cardBg,
                    border: `1px solid ${isTopThree ? rankStyle.border : C.border}`,
                    borderRadius: 16,
                    padding: "18px 22px",
                    boxShadow: `0 1px 3px ${C.shadow}`,
                    animation: `slideUp 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    {/* Left: rank + avatar + name */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      {/* Rank number / icon */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 11,
                          flexShrink: 0,
                          background: isTopThree ? rankStyle.bg : C.sectionBg,
                          border: `1px solid ${isTopThree ? rankStyle.border : C.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getRankIcon(rank) || (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: C.text3,
                              fontFamily: "'DM Sans', sans-serif",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar circle */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: isTopThree
                            ? rankStyle.color
                            : C.sectionBg,
                          border: `1px solid ${isTopThree ? rankStyle.border : C.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          color: isTopThree ? "#fff" : C.text3,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {(entry.username || entry.user_id || "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      {/* Name + meta */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: C.text1,
                              fontFamily: "'DM Sans', sans-serif",
                              letterSpacing: -0.2,
                            }}
                          >
                            {entry.username || entry.user_id}
                          </span>

                          {/* First blood badge */}
                          {firstBloods[entry.user_id] > 0 && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 8,
                                fontWeight: 800,
                                letterSpacing: 1,
                                padding: "2px 7px",
                                borderRadius: 5,
                                background: "rgba(220,38,38,0.08)",
                                color: "#dc2626",
                                border: "1px solid rgba(220,38,38,0.22)",
                                textTransform: "uppercase",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              🩸 {firstBloods[entry.user_id]}x Blood
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: 10,
                            color: C.text3,
                            marginTop: 2,
                            fontFamily: "monospace",
                            letterSpacing: 0.2,
                          }}
                        >
                          {entry.machines_solved || 0} machines pwned
                        </p>
                      </div>
                    </div>

                    {/* Right: points */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p
                        style={{
                          fontSize: 30,
                          fontWeight: 800,
                          color: isTopThree ? rankStyle.color : C.text1,
                          fontFamily: "'DM Sans', sans-serif",
                          letterSpacing: -1,
                          lineHeight: 1,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {(entry.total_points || 0).toLocaleString()}
                      </p>
                      <p
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          color: C.text3,
                          fontFamily: "'DM Sans', sans-serif",
                          marginTop: 3,
                        }}
                      >
                        points
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: `1px solid ${isTopThree ? rankStyle.border : C.border}`,
                    }}
                  >
                    {[
                      {
                        label: "Machines Solved",
                        val: entry.machines_solved || 0,
                      },
                      {
                        label: "Total Points",
                        val: (entry.total_points || 0).toLocaleString(),
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          textAlign: "center",
                          padding: "10px 8px",
                          borderRadius: 10,
                          background: isTopThree
                            ? "rgba(255,255,255,0.5)"
                            : C.sectionBg,
                          border: `1px solid ${isTopThree ? rankStyle.border : C.border}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: isTopThree ? rankStyle.color : C.text1,
                            fontFamily: "'DM Sans', sans-serif",
                            lineHeight: 1,
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: -0.5,
                          }}
                        >
                          {s.val}
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: 1.2,
                            textTransform: "uppercase",
                            color: C.text3,
                            fontFamily: "'DM Sans', sans-serif",
                            marginTop: 4,
                          }}
                        >
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom sweep line */}
                  <div
                    className="lb-sweep"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      height: 2,
                      borderRadius: "0 0 16px 16px",
                      background: isTopThree
                        ? `linear-gradient(90deg, ${rankStyle.color}, ${rankStyle.color}99)`
                        : `linear-gradient(90deg, ${C.accent}, #fb923c)`,
                      width: "0%",
                      transition: "width 0.42s ease",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
