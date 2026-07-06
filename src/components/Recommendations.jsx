import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Zap, Target, RefreshCw, Flame, Calendar,
  BarChart2, BookOpen, ArrowRight, ChevronRight, Shield, Star,
} from "lucide-react";
import api from "../services/api";

const C = {
  pageBg:    "#fbeae2",
  cardBg:    "#ffffff",
  text1:     "#181818",
  text2:     "#3d3d3d",
  text3:     "#797979",
  border:    "#e8e2db",
  accent:    "#f97316",
  accentBg:  "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
  green:     "#16a34a",
  greenBg:   "rgba(22,163,74,0.08)",
  greenBdr:  "rgba(22,163,74,0.22)",
  purple:    "#7c3aed",
  purpleBg:  "rgba(124,58,237,0.08)",
  purpleBdr: "rgba(124,58,237,0.22)",
  sectionBg: "#fbeae2",
};

const DIFF_COLORS = {
  easy:   { color: C.green,  bg: C.greenBg,  border: C.greenBdr },
  medium: { color: C.accent, bg: C.accentBg, border: C.accentBdr },
  hard:   { color: C.purple, bg: C.purpleBg, border: C.purpleBdr },
  Easy:   { color: C.green,  bg: C.greenBg,  border: C.greenBdr },
  Medium: { color: C.accent, bg: C.accentBg, border: C.accentBdr },
  Hard:   { color: C.purple, bg: C.purpleBg, border: C.purpleBdr },
};

const levelColor = (score) =>
  score >= 80 ? C.green : score >= 50 ? C.accent : score >= 20 ? "#f59e0b" : "#e5e7eb";

/* ── Progress ring ─────────────────────────────────────────── */
const ProgressRing = ({ pct, size = 120, stroke = 10 }) => {
  const R = (size - stroke) / 2;
  const CIRC = 2 * Math.PI * R;
  const dash = (pct / 100) * CIRC;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={C.accent} strokeWidth={stroke}
          strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: C.text1, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: 10, color: C.text3, fontWeight: 600, marginTop: 2 }}>Mastery</span>
      </div>
    </div>
  );
};

/* ── NCF recommendation card ────────────────────────────────── */
const RecommendationCard = ({ rec, rank, onVulnAI }) => {
  const diff = DIFF_COLORS[rec.difficulty] || DIFF_COLORS.Medium;
  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px",
      background: C.cardBg, display: "flex", gap: 14, alignItems: "flex-start",
      cursor: "pointer", transition: "border-color 0.15s",
    }}
      onClick={() => onVulnAI(`Build me a ${rec.difficulty} ${rec.vuln_type.replace(/_/g, " ")} lab`)}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.accentBdr}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
      title="Click to build this in VulnAI"
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: rank === 1 ? C.accentBg : "#f5f3f0",
        border: `1px solid ${rank === 1 ? C.accentBdr : C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: 14,
        color: rank === 1 ? C.accent : C.text3, flexShrink: 0,
      }}>{rank}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text1 }}>
            {rec.vuln_type.replace(/_/g, " ")}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, borderRadius: 30, padding: "3px 9px",
            color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`,
            textTransform: "capitalize",
          }}>{rec.difficulty}</span>
          <span style={{
            fontSize: 11, color: C.text3, background: "#f5f3f0",
            borderRadius: 30, padding: "3px 9px", border: `1px solid ${C.border}`,
          }}>{rec.category}</span>
          {rec.trend_score > 0.4 && (
            <span style={{
              fontSize: 11, fontWeight: 700, borderRadius: 30, padding: "3px 9px",
              color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
              display: "flex", alignItems: "center", gap: 3,
            }}>
              <Flame style={{ width: 10, height: 10 }} /> Trending
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {rec.tags?.map(tag => (
            <span key={tag} style={{
              fontSize: 10.5, color: C.text3, background: "#f5f3f0",
              borderRadius: 20, padding: "2px 7px", border: `1px solid ${C.border}`,
            }}>#{tag}</span>
          ))}
        </div>

        <div style={{ marginBottom: 8 }}>
          {rec.reasons?.map((r, i) => (
            <p key={i} style={{ fontSize: 12, color: C.text2, marginBottom: 2 }}>• {r}</p>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11.5, color: C.text3, minWidth: 80 }}>Model confidence</span>
          <div style={{ flex: 1, height: 5, background: C.border, borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: `${Math.round((rec.confidence || 0) * 100)}%`,
              background: (rec.confidence || 0) > 0.7 ? C.green : (rec.confidence || 0) > 0.4 ? C.accent : C.text3,
            }} />
          </div>
          <span style={{ fontSize: 11, color: C.text3, minWidth: 32 }}>
            {Math.round((rec.confidence || 0) * 100)}%
          </span>
        </div>

        {rec.cold_start && (
          <p style={{ fontSize: 11, color: C.text3, marginTop: 6, fontStyle: "italic" }}>
            Based on learners similar to you — personalises as you solve more challenges.
          </p>
        )}
      </div>

      <ChevronRight style={{ width: 15, height: 15, color: C.text3, flexShrink: 0, marginTop: 4 }} />
    </div>
  );
};

/* ── Trending sidebar section ───────────────────────────────── */
const TrendingSection = ({ trending, period, icon: Icon }) => (
  <div>
    <h4 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
      <Icon style={{ width: 14, height: 14, color: C.accent }} />{period}
    </h4>
    {trending?.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {trending.map((item, i) => {
          const diff = DIFF_COLORS[item.difficulty] || DIFF_COLORS.Medium;
          return (
            <div key={item.vuln_type} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 10,
              border: `1px solid ${C.border}`, background: "#f9f7f5",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text3, minWidth: 18 }}>#{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                {item.vuln_type.replace(/_/g, " ")}
              </span>
              <span style={{
                fontSize: 10.5, fontWeight: 700, borderRadius: 30, padding: "2px 8px",
                color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`,
                textTransform: "capitalize",
              }}>{item.difficulty}</span>
              <div style={{ width: 50, height: 5, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99, background: C.accent,
                  width: `${Math.round((item.trend_score || 0) * 100)}%`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p style={{ fontSize: 12.5, color: C.text3 }}>No trend data yet.</p>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const Recommendations = () => {
  const navigate  = useNavigate();
  const [userId]  = useState(() => localStorage.getItem("userId") || "");
  const [data,     setData]     = useState(null);
  const [trending, setTrending] = useState(null);
  const [skills,   setSkills]   = useState(null);
  const [userRow,  setUserRow]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const goToVulnAI = (prompt) => {
    localStorage.setItem("vulnai_suggest", prompt);
    navigate("/vuln-ai");
  };

  const load = useCallback(async () => {
    if (!userId) { setError("Not logged in."); setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const [recRes, trendRes, skillsRes, progressRes] = await Promise.allSettled([
        api.getUserRecommendations(userId, 5),
        api.getTrending(),
        api.getUserSkills(userId),
        api.getUserProgress(userId),
      ]);
      if (recRes.status      === "fulfilled") setData(recRes.value);
      if (trendRes.status    === "fulfilled") setTrending(trendRes.value);
      if (skillsRes.status   === "fulfilled") setSkills(skillsRes.value);
      if (progressRes.status === "fulfilled") setUserRow(progressRes.value?.user || null);
    } catch (e) {
      setError(e?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: C.text3, fontSize: 13 }}>Loading your progress...</p>
    </div>
  );
  if (error) return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>
      <p style={{ color: "#dc2626" }}>{error}</p>
    </div>
  );

  const recs          = data?.recommendations || [];
  const cats          = skills?.skill_categories || [];
  const vulnBreakdown = skills?.vuln_type_breakdown || [];
  const totalSolves   = skills?.total_solves || userRow?.machines_solved || 0;
  const streak        = userRow?.current_streak || 0;
  const longestStreak = userRow?.longest_streak || 0;
  const points        = userRow?.total_points || 0;
  const rank          = userRow?.rank;

  // Overall mastery: average of categories with at least 1 solve
  const scored    = cats.filter(c => c.score > 0);
  const overallPct = scored.length
    ? Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length)
    : 0;

  // Skill recs from the skills endpoint (simpler, category-level)
  const skillRecs = skills?.recommendations || [];

  return (
    <div className="resp-page-pad" style={{
      maxWidth: 1100, margin: "0 auto", padding: "34px 28px",
      fontFamily: "'DM Sans','Inter',sans-serif", color: C.text1,
    }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: "0 0 4px" }}>For You</h1>
          <p style={{ color: C.text3, fontSize: 13.5, margin: 0 }}>
            Real-time progress · personalised suggestions · {totalSolves} lab{totalSolves !== 1 ? "s" : ""} solved
          </p>
        </div>
        <button onClick={load} style={{
          display: "flex", alignItems: "center", gap: 6,
          border: `1px solid ${C.border}`, background: C.cardBg,
          borderRadius: 30, padding: "9px 14px", fontSize: 12.5,
          fontWeight: 600, cursor: "pointer", color: C.text2,
        }}>
          <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
        </button>
      </div>

      <div className="resp-grid-1col" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Overall Progress Hero ── */}
          <div style={{
            background: C.cardBg, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "22px 24px",
            display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
          }}>
            <ProgressRing pct={overallPct} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 4px" }}>Overall Progress</h2>
              <p style={{ fontSize: 13, color: C.text3, margin: "0 0 16px" }}>
                {totalSolves === 0
                  ? "Solve your first lab to start tracking progress."
                  : `${totalSolves} lab${totalSolves !== 1 ? "s" : ""} across ${scored.length} categor${scored.length !== 1 ? "ies" : "y"}.`}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { icon: "🔥", label: "Streak",  val: `${streak}d` },
                  { icon: "🏆", label: "Best",    val: `${longestStreak}d` },
                  { icon: "⚡", label: "Points",  val: points },
                  ...(rank ? [{ icon: "🌐", label: "Rank", val: `#${rank}` }] : []),
                ].map(s => (
                  <div key={s.label} style={{
                    background: C.accentBg, border: `1px solid ${C.accentBdr}`,
                    borderRadius: 10, padding: "8px 14px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.accent }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: C.text3, fontWeight: 600 }}>{s.icon} {s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Skill Breakdown ── */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 7 }}>
              <BarChart2 style={{ width: 16, height: 16, color: C.accent }} /> Skill Breakdown
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {cats.map(cat => {
                const nextThreshold = cat.score < 20 ? 20 : cat.score < 50 ? 50 : cat.score < 80 ? 80 : 100;
                const toNext = nextThreshold - cat.score;
                const nextLabel = cat.score < 20 ? "Intermediate" : cat.score < 50 ? "Advanced" : cat.score < 80 ? "Expert" : "Max";
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
                      <span style={{ fontSize: 11, color: C.text3 }}>
                        {cat.score}/100 · {cat.solves} solve{cat.solves !== 1 ? "s" : ""}
                        {cat.score < 100 ? ` · ${toNext}pts → ${nextLabel}` : " · Max!"}
                      </span>
                    </div>
                    <div style={{ position: "relative", height: 9, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${cat.score}%`,
                        background: levelColor(cat.score),
                        transition: "width 0.7s ease",
                      }} />
                      {[20, 50, 80].filter(t => t > (cat.score || 0)).slice(0, 1).map(t => (
                        <div key={t} style={{
                          position: "absolute", top: 0, bottom: 0, left: `${t}%`,
                          width: 2, background: "rgba(0,0,0,0.12)", borderRadius: 1,
                        }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── VulnAI Skill Suggestions (from /skills endpoint) ── */}
          {skillRecs.length > 0 && (
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                  <Zap style={{ width: 16, height: 16, color: C.accent }} /> Focus Areas
                </h3>
                <button onClick={() => navigate("/vuln-ai")} style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700,
                  color: C.accent, background: "none", border: "none", cursor: "pointer", padding: 0,
                }}>Open VulnAI <ArrowRight style={{ width: 13, height: 13 }} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {skillRecs.map(rec => {
                  const d = DIFF_COLORS[rec.suggested_difficulty] || DIFF_COLORS.medium;
                  const prompt = `Build me a ${rec.suggested_difficulty} ${rec.category} lab`;
                  return (
                    <div key={rec.category} style={{
                      border: `1px solid ${C.border}`, borderRadius: 12,
                      padding: "13px 15px", background: C.sectionBg,
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                      cursor: "pointer", transition: "border-color 0.15s",
                    }}
                      onClick={() => goToVulnAI(prompt)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.accentBdr}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                    >
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{rec.category}</p>
                        <p style={{ fontSize: 12, color: C.text3, margin: 0 }}>{rec.reason}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, borderRadius: 30, padding: "4px 10px",
                          color: d.color, background: d.bg, border: `1px solid ${d.border}`,
                          textTransform: "capitalize",
                        }}>{rec.suggested_difficulty}</span>
                        <ChevronRight style={{ width: 14, height: 14, color: C.text3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── NCF Personalised Recommendations ── */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 7 }}>
              <Target style={{ width: 16, height: 16, color: C.accent }} /> Recommended For You
            </h3>
            {recs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recs.map((rec, i) => (
                  <RecommendationCard key={rec.vuln_type} rec={rec} rank={i + 1} onVulnAI={goToVulnAI} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <Shield style={{ width: 32, height: 32, color: C.border, margin: "0 auto 10px" }} />
                <p style={{ fontSize: 13, color: C.text3, marginBottom: 14 }}>
                  Solve a few challenges to unlock personalised recommendations.
                </p>
                <button onClick={() => navigate("/vuln-ai")} style={{
                  padding: "9px 22px", borderRadius: 30,
                  background: C.accent, color: "#fff", border: "none",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>Start with VulnAI →</button>
              </div>
            )}
          </div>

          {/* ── Vuln Types Practiced ── */}
          {vulnBreakdown.length > 0 && (
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 7 }}>
                <BookOpen style={{ width: 16, height: 16, color: C.accent }} /> Vulnerability Types Practiced
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {vulnBreakdown.map(v => (
                  <div key={v.vuln_type} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    border: `1px solid ${C.border}`, borderRadius: 20,
                    padding: "5px 12px", background: C.sectionBg, cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                    onClick={() => goToVulnAI(`Build me a ${v.vuln_type.replace(/_/g, " ")} vulnerability lab`)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.accentBdr}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                    title="Click to practice in VulnAI"
                  >
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text2 }}>
                      {v.vuln_type.replace(/_/g, " ")}
                    </span>
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

        {/* ══ RIGHT COLUMN: Trending ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Badges */}
          {skills?.badges?.length > 0 && (
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 7 }}>
                <Star style={{ width: 14, height: 14, color: C.accent }} /> Badges Earned
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.badges.map(b => (
                  <div key={b.name} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    border: `1px solid ${C.accentBdr}`, background: C.accentBg,
                    borderRadius: 30, padding: "7px 12px",
                  }}>
                    <span style={{ fontSize: 16 }}>{b.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text1 }}>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div style={{
            background: C.cardBg, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "18px", position: "sticky", top: 16,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 7 }}>
              <Flame style={{ width: 15, height: 15, color: "#dc2626" }} /> What's Trending
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <TrendingSection trending={trending?.trending_weekly}  period="This Week"  icon={Flame} />
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <TrendingSection trending={trending?.trending_monthly} period="This Month" icon={Calendar} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Recommendations;
