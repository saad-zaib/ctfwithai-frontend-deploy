import React, { useState, useEffect } from "react";
import {
  Server,
  Target,
  Loader,
  AlertCircle,
  CheckCircle,
  Send,
  ExternalLink,
  Play,
  Square,
  RotateCw,
  Trash2,
  Flag,
  BookOpen,
  Users,
  Zap,
  Trophy,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { T } from "../design/tokens";
import { PillTag } from "./ui/Badge";

/* ── Design token alias so unchanged code below still compiles ── */
const C = {
  pageBg:    T.pageBg,
  sectionBg: T.pageBg,
  cardBg:    T.cardBg,
  text1:     T.text1,
  text2:     T.text2,
  text3:     T.text3,
  border:    T.border,
  accent:    T.accent,
  accentBg:  T.accentBg,
  accentBdr: T.accentBorder,
  shadow:    T.shadowCard,
  shadowMd:  '0 4px 16px rgba(0,0,0,0.08)',
};



/* ─── IconBox (small square icon container) ─── */
const IconBox = ({ size = 28, radius = 8, children }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      background: C.accentBg,
      border: `1px solid ${C.accentBdr}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

/* ─── ActionIconBtn (start / stop / restart / remove) ─── */
const ActionIconBtn = ({ onClick, disabled, title, bgColor, children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: `1px solid ${bgColor}38`,
        background: hov ? bgColor + "28" : bgColor + "14",
        color: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
};

/* ─── WriteupButton ─── */
const WriteupButton = ({ machineId }) => {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ borderTop: "1px solid #e8e2db", padding: "10px 18px" }}>
      <button
        onClick={() => window.open(`/walkthrough/${machineId}`, "_blank")}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <BookOpen style={{ width: 13, height: 13, color: hov ? "#f97316" : "#797979", transition: "color 0.2s" }} />
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: hov ? "#f97316" : "#3d3d3d",
          transition: "color 0.2s",
        }}>
          View Walkthrough
        </span>
        <span style={{ fontSize: 11, color: hov ? "#f97316" : "#797979", transition: "color 0.2s" }}>↗</span>
      </button>
    </div>
  );
};

// ── Hack Together Invite Modal ────────────────────────────────────────────────
const HackTogetherModal = ({ machine, onClose, navigate }) => {
  const [mode, setMode]           = useState("coop");
  const [query, setQuery]         = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected]   = useState(null); // { user_id, username }
  const [friends, setFriends]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(null);
  const userId = localStorage.getItem("userId") || "";
  const searchTimer = React.useRef(null);

  useEffect(() => {
    api.getFriends(userId).then(d => setFriends(d.friends || [])).catch(() => {});
  }, [userId]);

  // Live search as user types
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!query.trim() || query.trim().length < 2) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.searchUsers(query.trim());
        setSearchResults((res.users || res || []).filter(u => u.user_id !== userId));
      } catch (_) {}
      setSearching(false);
    }, 350);
  }, [query, userId]);

  const send = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const res = await api.inviteToSession(machine.machine_id, selected.user_id, mode);
      setSent(res.session_id);
    } catch (e) {
      alert(e?.message || "Failed to send invite.");
    } finally {
      setSending(false);
    }
  };

  const C2 = {
    bg: "#ffffff", border: "#e8e2db", accent: "#f97316",
    accentBg: "rgba(249,115,22,0.08)", accentBdr: "rgba(249,115,22,0.22)",
    green: "#16a34a", greenBg: "rgba(22,163,74,0.08)", greenBdr: "rgba(22,163,74,0.22)",
    purple: "#7c3aed", purpleBg: "rgba(124,58,237,0.08)", purpleBdr: "rgba(124,58,237,0.22)",
    text1: "#181818", text2: "#3d3d3d", text3: "#797979",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, fontFamily: "'DM Sans','Inter',sans-serif",
    }} onClick={onClose}>
      <div style={{
        background: C2.bg, borderRadius: 18, padding: "28px 28px 24px",
        width: 440, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        border: `1px solid ${C2.border}`,
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Hack Together</h3>
            <p style={{ fontSize: 12.5, color: C2.text3, margin: "3px 0 0" }}>
              {machine.variant || machine.machine_id}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X style={{ width: 18, height: 18, color: C2.text3 }} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
            <CheckCircle style={{ width: 40, height: 40, color: C2.green, margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Invite sent to {selected?.username}!</p>
            <p style={{ fontSize: 13, color: C2.text3, marginBottom: 20 }}>
              They'll get a notification — once they accept you'll hack together.
            </p>
            <button onClick={() => navigate(`/coop/${sent}`)} style={{
              background: C2.accent, color: "white", border: "none",
              borderRadius: 30, padding: "10px 20px", fontWeight: 700,
              fontSize: 13, cursor: "pointer", width: "100%",
            }}>
              Open Session Room →
            </button>
          </div>
        ) : (
          <>
            {/* Mode picker */}
            <p style={{ fontSize: 12, fontWeight: 700, color: C2.text3, marginBottom: 10, letterSpacing: 0.5 }}>
              SELECT MODE
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { key: "coop", icon: Users,  label: "Co-op", sub: "Solve together, share points", color: C2.green,  bg: C2.greenBg,  bdr: C2.greenBdr },
                { key: "race", icon: Trophy, label: "Race",  sub: "First to flag wins",           color: C2.purple, bg: C2.purpleBg, bdr: C2.purpleBdr },
              ].map(({ key, icon: Icon, label, sub, color, bg, bdr }) => (
                <button key={key} onClick={() => setMode(key)} style={{
                  border: `2px solid ${mode === key ? bdr : C2.border}`,
                  borderRadius: 12, padding: "14px 12px", cursor: "pointer",
                  background: mode === key ? bg : "transparent",
                  textAlign: "left", transition: "all 0.15s",
                }}>
                  <Icon style={{ width: 18, height: 18, color: mode === key ? color : C2.text3, marginBottom: 6 }} />
                  <p style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 2px", color: mode === key ? C2.text1 : C2.text2 }}>{label}</p>
                  <p style={{ fontSize: 11, color: C2.text3, margin: 0 }}>{sub}</p>
                </button>
              ))}
            </div>

            {/* Friend picker */}
            <p style={{ fontSize: 12, fontWeight: 700, color: C2.text3, marginBottom: 8, letterSpacing: 0.5 }}>
              INVITE A PLAYER
            </p>

            {/* Friends quick-select */}
            {friends.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: C2.text3, marginBottom: 6 }}>Your friends</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {friends.map(f => (
                    <button key={f.user_id}
                      onClick={() => { setSelected(f); setQuery(f.username); setSearchResults([]); }}
                      style={{
                        padding: "5px 12px", borderRadius: 30, fontSize: 12.5, fontWeight: 600,
                        border: `1px solid ${selected?.user_id === f.user_id ? C2.accentBdr : C2.border}`,
                        background: selected?.user_id === f.user_id ? C2.accentBg : "#f9f7f5",
                        color: selected?.user_id === f.user_id ? C2.accent : C2.text2,
                        cursor: "pointer",
                      }}>
                      {f.username}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search box */}
            <div style={{ position: "relative", marginBottom: 6 }}>
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null); }}
                placeholder="Search by username…"
                style={{
                  width: "100%", border: `1px solid ${selected ? C2.accentBdr : C2.border}`,
                  borderRadius: 10, padding: "10px 12px", fontSize: 13, outline: "none",
                  fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box",
                  background: selected ? C2.accentBg : "#fff",
                }}
              />
              {searching && (
                <Loader style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  width: 14, height: 14, color: C2.text3, animation: "spin 1s linear infinite",
                }} />
              )}
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && !selected && (
              <div style={{
                border: `1px solid ${C2.border}`, borderRadius: 10, overflow: "hidden",
                marginBottom: 12, maxHeight: 180, overflowY: "auto",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}>
                {searchResults.map((u, i) => (
                  <button key={u.user_id}
                    onClick={() => { setSelected(u); setQuery(u.username); setSearchResults([]); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", border: "none", cursor: "pointer",
                      background: i % 2 === 0 ? "#fff" : "#f9f7f5",
                      borderBottom: i < searchResults.length - 1 ? `1px solid ${C2.border}` : "none",
                      textAlign: "left",
                    }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg,#f97316,#7c3aed)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: "white",
                    }}>
                      {(u.username || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: C2.text1 }}>{u.username}</p>
                      {u.full_name && <p style={{ fontSize: 11.5, color: C2.text3, margin: 0 }}>{u.full_name}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected user pill */}
            {selected && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
                padding: "8px 12px", borderRadius: 30, border: `1px solid ${C2.accentBdr}`,
                background: C2.accentBg, width: "fit-content",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "linear-gradient(135deg,#f97316,#7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "white",
                }}>
                  {selected.username[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C2.accent }}>{selected.username}</span>
                <button onClick={() => { setSelected(null); setQuery(""); }} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1,
                }}>
                  <X style={{ width: 13, height: 13, color: C2.accent }} />
                </button>
              </div>
            )}

            {!selected && !query && (
              <p style={{ fontSize: 12, color: C2.text3, marginBottom: 14 }}>
                Type at least 2 characters to search all players on the platform.
              </p>
            )}

            {/* Mode description */}
            <div style={{
              padding: "10px 12px", borderRadius: 10, marginBottom: 18,
              background: mode === "coop" ? C2.greenBg : C2.purpleBg,
              border: `1px solid ${mode === "coop" ? C2.greenBdr : C2.purpleBdr}`,
              fontSize: 12.5, color: C2.text2, lineHeight: 1.5,
            }}>
              {mode === "coop"
                ? "Both of you connect to the same lab. First to find the flag gets 60% of points, second gets 40%. Chat live while you hack."
                : "Each of you gets your own copy of the lab. Race to submit the flag first. Winner gets full points, loser gets 30%."}
            </div>

            <button onClick={send} disabled={sending || !selected} style={{
              width: "100%", background: selected ? C2.accent : "#e5e7eb",
              color: "white", border: "none", borderRadius: 30,
              padding: "12px", fontWeight: 800, fontSize: 14,
              cursor: selected ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {sending ? <Loader style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Zap style={{ width: 16, height: 16 }} />}
              {sending ? "Sending invite…" : selected ? `Invite ${selected.username}` : "Select a player first"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Machines = () => {
  const [userId] = useState(() => localStorage.getItem("userId") || "user_default");
  const [hackInviteMachine, setHackInviteMachine] = useState(null);
  const [machines, setMachines] = useState(() => api.peekMachinesCache() || []);
  const [isLoading, setIsLoading] = useState(
    () => (api.peekMachinesCache() || []).length === 0,
  );
  const [error, setError] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [flagInput, setFlagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [containerAction, setContainerAction] = useState({});
  const navigate = useNavigate();
  const [actionMessages, setActionMessages] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(() => {
      fetchMachines({ forceRefresh: true, silent: true });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const next = {};
    for (const m of machines) {
      const s = Number(m?.expires_in_seconds);
      if (Number.isFinite(s) && s >= 0) next[m.machine_id] = Math.max(0, Math.floor(s));
    }
    setCountdowns((prev) => ({ ...prev, ...next }));
  }, [machines]);

  useEffect(() => {
    const t = setInterval(() => {
      let hitExpiry = false;
      setCountdowns((prev) => {
        const out = {};
        for (const [k, v] of Object.entries(prev)) {
          const n = Math.max(0, Number(v || 0) - 1);
          if (Number(v || 0) > 0 && n === 0) hitExpiry = true;
          out[k] = n;
        }
        return out;
      });
      if (hitExpiry) {
        fetchMachines({ forceRefresh: true, silent: true });
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const fetchMachines = async ({ forceRefresh = false, silent = false } = {}) => {
    const shouldShowSpinner = !silent && machines.length === 0;
    try {
      if (shouldShowSpinner) setIsLoading(true);
      const data = await api.getMachines({ forceRefresh });
      setMachines(Array.isArray(data) ? data : []);
      setError(null);
      return true;
    } catch (err) {
      console.error("❌ Error fetching machines:", err);
      setError(err.message);
      return false;
    } finally {
      if (shouldShowSpinner) setIsLoading(false);
    }
  };

  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshMessage("Refreshing machines...");
    const ok = await fetchMachines({ forceRefresh: true, silent: true });
    setRefreshMessage(
      ok
        ? `Refreshed at ${new Date().toLocaleTimeString()}`
        : "Refresh failed. Try again.",
    );
    setTimeout(() => {
      setRefreshMessage("");
    }, 2200);
    setIsRefreshing(false);
  };

  const showActionMessage = (containerId, message, type = "success") => {
    console.log(`💬 Action message: ${message} (${type})`);
    setActionMessages((prev) => ({
      ...prev,
      [containerId]: { message, type },
    }));
    setTimeout(() => {
      setActionMessages((prev) => {
        const newMessages = { ...prev };
        delete newMessages[containerId];
        return newMessages;
      });
    }, 3000);
  };

  const handleContainerAction = async (
    containerId,
    action,
    machineName = "container",
  ) => {
    if (!containerId) {
      console.error("❌ No container ID provided");
      showActionMessage("error", "Container ID missing", "error");
      return;
    }
    console.log(`🔧 Action: ${action} on container: ${containerId}`);
    setContainerAction((prev) => ({ ...prev, [containerId]: action }));
    try {
      let result;
      switch (action) {
        case "start":
          result = await api.startContainer(containerId);
          showActionMessage(containerId, `✓ ${machineName} started`, "success");
          break;
        case "stop":
          result = await api.stopContainer(containerId);
          showActionMessage(containerId, `✓ ${machineName} stopped`, "success");
          break;
        case "restart":
          result = await api.restartContainer(containerId);
          showActionMessage(
            containerId,
            `✓ ${machineName} restarted`,
            "success",
          );
          break;
        default:
          showActionMessage(containerId, `Unknown action: ${action}`, "error");
          return;
      }
      setTimeout(() => {
        fetchMachines({ forceRefresh: true, silent: true });
      }, 2000);
    } catch (err) {
      console.error(`❌ Error ${action} container:`, err);
      showActionMessage(
        containerId,
        `Failed to ${action}: ${err.message}`,
        "error",
      );
    } finally {
      setContainerAction((prev) => ({ ...prev, [containerId]: null }));
    }
  };

  const handleDeleteMachine = async (machineId, machineName = "machine") => {
    if (
      !window.confirm(
        `Are you sure you want to completely delete ${machineName} from everywhere? This action cannot be undone and will destroy all its files and container.`,
      )
    ) {
      return;
    }

    console.log(`🗑️ Deleting machine entirely: ${machineId}`);
    setContainerAction((prev) => ({ ...prev, [machineId]: "delete" }));
    try {
      await api.deleteMachine(machineId);

      // Use the generic showActionMessage (which uses containerId dictionary lookup, so using machineId is structurally fine)
      showActionMessage(
        machineId,
        `✓ ${machineName} completely deleted`,
        "success",
      );

      setTimeout(() => fetchMachines({ forceRefresh: true, silent: true }), 2000);
    } catch (err) {
      console.error(`❌ Error deleting machine:`, err);
      showActionMessage(machineId, `Failed to delete: ${err.message}`, "error");
    } finally {
      setContainerAction((prev) => ({ ...prev, [machineId]: null }));
    }
  };

  const handleExtendMachine = async (machine) => {
    const mid = machine.machine_id;
    setContainerAction((prev) => ({ ...prev, [mid]: "extend" }));
    try {
      await api.extendMachineTimer(mid);
      showActionMessage(mid, "✓ Timer extended by 1 hour", "success");
      await fetchMachines({ forceRefresh: true, silent: true });
    } catch (err) {
      showActionMessage(mid, `Failed to extend timer: ${err.message}`, "error");
    } finally {
      setContainerAction((prev) => ({ ...prev, [mid]: null }));
    }
  };

  const handleSubmitFlag = async (machineId) => {
    if (!flagInput.trim()) {
      showActionMessage(machineId, "⚠ Please enter a flag", "warning");
      return;
    }
    console.log("🚩 Submitting flag for machine:", machineId);
    try {
      setSubmitting(true);
      setSubmitResult(null);
      const machine = machines.find(m => m.machine_id === machineId);
      const result = await api.validateFlag(machineId, flagInput, userId, machine?.campaign_id || null);
      console.log("✅ Flag validation result:", result);
      setSubmitResult(result);
      if (result.correct) {
        setFlagInput("");
        setTimeout(() => fetchMachines({ forceRefresh: true, silent: true }), 2000);
      }
    } catch (err) {
      console.error("❌ Flag submission error:", err);
      setSubmitResult({
        correct: false,
        message: err.message || "Failed to validate flag",
        points: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };


  const getContainerStatusColor = (status) =>
    ({
      running: "#10b981",
      exited: "#ef4444",
      paused: "#f59e0b",
      created: "#3b82f6",
    })[status?.toLowerCase()] || "#6b7280";

  const getContainerStatusLabel = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  /* ── Loading ── */
  if (isLoading && machines.length === 0)
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
            Loading machines…
          </p>
        </div>
      </div>
    );

  /* ── Error ── */
  if (error && machines.length === 0)
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
            Error Loading Machines
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
            onClick={() => fetchMachines({ forceRefresh: true })}
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
        background: T.pageBg,
        fontFamily: T.font,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes slideUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin      { to { transform:rotate(360deg); } }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

        .mach-card { transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease; }
        .mach-card:hover { border-color: ${C.accentBdr} !important; box-shadow: 0 8px 28px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04) !important; transform: translateY(-2px); }
        .mach-card:hover .mach-sweep { width: 100% !important; }

        .mach-flag-input:focus { outline: none; border-color: ${C.accentBdr} !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.08); }
        .mach-flag-input::placeholder { color: ${C.text3}; opacity: 0.6; }

        .mach-refresh-btn:hover { border-color: ${C.accentBdr} !important; color: ${C.accent} !important; }
      `}</style>

      <div className="resp-page-pad" style={{ maxWidth: T.contentMaxWidth, margin: "0 auto", padding: "32px" }}>
        {/* ══ HEADER ══ */}
        <div
          style={{
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            animation: "slideUp 0.4s ease-out both",
          }}
        >
          <div>
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
              Available <span style={{ color: C.accent }}>Machines</span>
            </h1>
            <p
              style={{
                color: C.text3,
                fontSize: 13,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {machines.length} machine{machines.length !== 1 ? "s" : ""} ready
              for exploitation
            </p>
          </div>

          <button
            onClick={handleRefreshClick}
            disabled={isLoading || isRefreshing}
            className="mach-refresh-btn"
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
              cursor: isLoading || isRefreshing ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.22s ease",
              opacity: isLoading || isRefreshing ? 0.5 : 1,
              boxShadow: `0 1px 4px ${C.shadow}`,
            }}
          >
            <RotateCw
              style={{
                width: 14,
                height: 14,
                animation:
                  isLoading || isRefreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {refreshMessage && (
          <p
            style={{
              marginTop: -18,
              marginBottom: 20,
              color: refreshMessage.includes("failed") ? "#dc2626" : C.text3,
              fontSize: 12,
              fontWeight: 600,
              animation: "slideDown 0.2s ease-out",
            }}
          >
            {refreshMessage}
          </p>
        )}

        {/* ══ EMPTY STATE ══ */}
        {machines.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
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
              <Server style={{ width: 28, height: 28, color: C.accent }} />
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
              No Machines Available
            </h3>
            <p
              style={{
                color: C.text3,
                fontSize: 13,
                marginBottom: 24,
                fontWeight: 500,
              }}
            >
              Create a campaign to generate machines
            </p>
            <button
              onClick={() => navigate("/vuln-ai")}
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
              Generate with Vuln AI
            </button>
          </div>
        ) : (
          /* ══ MACHINE GRID ══ */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(520px, 100%), 1fr))",
              gap: 16,
            }}
          >
            {machines.map((machine, index) => {
              const containerId = machine.container?.container_id;
              const containerStatus = machine.container?.status;
              const actionMsg = actionMessages[containerId] || actionMessages[machine.machine_id];
              const isActionLoading = containerAction[containerId];
              const statusColor = getContainerStatusColor(containerStatus);
              const isRunning =
                machine.is_running || containerStatus === "running";
              const machineUrl = machine.url || `http://${machine.machine_id}.ctfwithai.com`;
              const ttlSeconds =
                Number.isFinite(Number(countdowns[machine.machine_id]))
                  ? Number(countdowns[machine.machine_id])
                  : Number(machine.expires_in_seconds || 0);
              const isExpired = !!machine.is_expired || ttlSeconds <= 0;
              const ttlLow = ttlSeconds > 0 && ttlSeconds < 15 * 60;

              console.log(`Rendering machine ${machine.machine_id}:`, {
                has_container: !!machine.container,
                container_id: containerId,
                status: containerStatus,
                is_running: machine.is_running,
              });

              return (
                <div
                  key={machine.machine_id}
                  className="mach-card"
                  style={{
                    position: "relative",
                    background: C.cardBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: T.cardRadius,
                    overflow: "hidden",
                    boxShadow: T.shadowCard,
                    animation: `slideUp 0.4s ease-out ${index * 0.08}s both`,
                  }}
                >
                  {/* Toast */}
                  {actionMsg && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 10,
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        animation: "slideDown 0.3s ease-out",
                        background:
                          actionMsg.type === "success"
                            ? "#10b981"
                            : actionMsg.type === "error"
                              ? "#ef4444"
                              : "#f59e0b",
                        color: "#fff",
                      }}
                    >
                      {actionMsg.message}
                    </div>
                  )}

                  {/* ── Row 1: Header ── */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 18px",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <Target style={{ width: 16, height: 16, color: C.text3, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <h3
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.text1,
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: -0.2,
                            lineHeight: 1.2,
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {machine.variant}
                        </h3>
                        {machine.campaign_name && (
                          <p
                            style={{
                              fontSize: 10,
                              color: C.text3,
                              marginTop: 2,
                              fontWeight: 500,
                              fontFamily: "'DM Sans', sans-serif",
                              margin: "2px 0 0",
                            }}
                          >
                            {machine.campaign_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Row 2: Container status + controls ── */}
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    {machine.container ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: statusColor,
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.text2,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {getContainerStatusLabel(containerStatus)}
                          </span>
                          <code style={{ fontSize: 10, color: C.text3, fontFamily: "monospace" }}>
                            {containerId?.slice(0, 12)}
                          </code>
                          {!machine.is_running && containerStatus === "exited" && (
                            <span style={{ fontSize: 10, color: C.text3, fontFamily: "'DM Sans', sans-serif" }}>
                              — click Play to start
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {containerStatus !== "running" ? (
                            <ActionIconBtn
                              title="Start Container"
                              bgColor="#10b981"
                              disabled={isActionLoading === "start"}
                              onClick={async () => {
                                setContainerAction((prev) => ({ ...prev, [containerId]: "start" }));
                                try {
                                  await api.startMachineContainer(machine.machine_id);
                                  showActionMessage(containerId, `✓ ${machine.variant} started`, "success");
                                  setTimeout(() => fetchMachines({ forceRefresh: true, silent: true }), 3000);
                                } catch (err) {
                                  showActionMessage(containerId, `Failed: ${err.message}`, "error");
                                } finally {
                                  setContainerAction((prev) => ({ ...prev, [containerId]: null }));
                                }
                              }}
                            >
                              {isActionLoading === "start" ? (
                                <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                              ) : (
                                <Play style={{ width: 14, height: 14 }} />
                              )}
                            </ActionIconBtn>
                          ) : (
                            <ActionIconBtn
                              title="Stop Container"
                              bgColor="#ef4444"
                              disabled={isActionLoading === "stop"}
                              onClick={async () => {
                                setContainerAction((prev) => ({ ...prev, [containerId]: "stop" }));
                                try {
                                  await api.stopMachineContainer(machine.machine_id);
                                  showActionMessage(containerId, `✓ ${machine.variant} stopped`, "success");
                                  setTimeout(() => fetchMachines({ forceRefresh: true, silent: true }), 3000);
                                } catch (err) {
                                  showActionMessage(containerId, `Failed: ${err.message}`, "error");
                                } finally {
                                  setContainerAction((prev) => ({ ...prev, [containerId]: null }));
                                }
                              }}
                            >
                              {isActionLoading === "stop" ? (
                                <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                              ) : (
                                <Square style={{ width: 14, height: 14 }} />
                              )}
                            </ActionIconBtn>
                          )}
                          <ActionIconBtn
                            title="Restart Container"
                            bgColor="#3b82f6"
                            disabled={isActionLoading === "restart"}
                            onClick={async () => {
                              setContainerAction((prev) => ({ ...prev, [containerId]: "restart" }));
                              try {
                                await api.restartMachineContainer(machine.machine_id);
                                showActionMessage(containerId, `✓ ${machine.variant} restarted`, "success");
                                setTimeout(() => fetchMachines({ forceRefresh: true, silent: true }), 3000);
                              } catch (err) {
                                showActionMessage(containerId, `Failed: ${err.message}`, "error");
                              } finally {
                                setContainerAction((prev) => ({ ...prev, [containerId]: null }));
                              }
                            }}
                          >
                            {isActionLoading === "restart" ? (
                              <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            ) : (
                              <RotateCw style={{ width: 14, height: 14 }} />
                            )}
                          </ActionIconBtn>
                          <ActionIconBtn
                            title="Delete Machine"
                            bgColor="#ef4444"
                            disabled={isActionLoading === "delete"}
                            onClick={() => handleDeleteMachine(machine.machine_id, machine.variant)}
                          >
                            {isActionLoading === "delete" ? (
                              <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            ) : (
                              <Trash2 style={{ width: 14, height: 14 }} />
                            )}
                          </ActionIconBtn>
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                          <AlertCircle style={{ width: 12, height: 12 }} />
                          No container — click Launch to start
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <ActionIconBtn
                            title="Launch Machine"
                            bgColor="#10b981"
                            disabled={containerAction[machine.machine_id] === "start"}
                            onClick={async () => {
                              setContainerAction((prev) => ({ ...prev, [machine.machine_id]: "start" }));
                              try {
                                await api.startMachineContainer(machine.machine_id);
                                showActionMessage(machine.machine_id, `✓ ${machine.variant} launched`, "success");
                                setTimeout(() => fetchMachines({ forceRefresh: true, silent: true }), 3000);
                              } catch (err) {
                                showActionMessage(machine.machine_id, `Failed: ${err.message}`, "error");
                              } finally {
                                setContainerAction((prev) => ({ ...prev, [machine.machine_id]: null }));
                              }
                            }}
                          >
                            {containerAction[machine.machine_id] === "start" ? (
                              <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            ) : (
                              <Play style={{ width: 14, height: 14 }} />
                            )}
                          </ActionIconBtn>
                          <ActionIconBtn
                            title="Delete Machine"
                            bgColor="#ef4444"
                            disabled={containerAction[machine.machine_id] === "delete"}
                            onClick={() => handleDeleteMachine(machine.machine_id, machine.variant)}
                          >
                            {containerAction[machine.machine_id] === "delete" ? (
                              <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            ) : (
                              <Trash2 style={{ width: 14, height: 14 }} />
                            )}
                          </ActionIconBtn>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ── Row 3: Auto-delete timer + +1h ── */}
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: isExpired ? "#dc2626" : ttlLow ? "#b45309" : C.text3,
                        fontWeight: 500,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {isExpired ? "Machine expired" : `Auto delete in ${formatDuration(ttlSeconds)}`}
                    </span>
                    <button
                      onClick={() => handleExtendMachine(machine)}
                      disabled={isExpired || containerAction[machine.machine_id] === "extend"}
                      style={{
                        border: `1px solid ${isExpired ? C.border : C.accentBdr}`,
                        borderRadius: 5,
                        padding: "3px 9px",
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: isExpired || containerAction[machine.machine_id] === "extend" ? "not-allowed" : "pointer",
                        background: "transparent",
                        color: isExpired ? C.text3 : C.accent,
                        opacity: containerAction[machine.machine_id] === "extend" ? 0.6 : 1,
                      }}
                    >
                      {containerAction[machine.machine_id] === "extend" ? "..." : "Extend"}
                    </button>
                    <button
                      onClick={() => setHackInviteMachine(machine)}
                      style={{
                        border: "1px solid rgba(249,115,22,0.3)",
                        borderRadius: 6, padding: "3px 10px", fontSize: 11,
                        fontWeight: 700, cursor: "pointer",
                        background: "rgba(249,115,22,0.07)", color: "#f97316",
                        display: "flex", alignItems: "center", gap: 5,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <Users style={{ width: 11, height: 11 }} /> Hack Together
                    </button>
                  </div>

                  {/* ── Row 4: Access type + terminal link (only when running) ── */}
                  {isRunning && (
                    <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Sans', sans-serif" }}>
                        {machine.access_profile?.access_type === "network"
                          ? "Network Access"
                          : machine.access_profile?.access_type === "shell"
                            ? "Shell Access"
                            : "HTTP Only"}
                      </span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <a
                          href={machineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 11, color: C.accent, fontFamily: "monospace", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                          <ExternalLink style={{ width: 11, height: 11 }} />
                          {machineUrl}
                        </a>
                        {machine.terminal_url && (
                          <a
                            href={machine.terminal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 12px",
                              borderRadius: 6,
                              background: C.sectionBg,
                              color: C.text1,
                              border: `1px solid ${C.border}`,
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: "'DM Sans', sans-serif",
                              textDecoration: "none",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accentBdr)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
                          >
                            Open Terminal
                          </a>
                        )}
                        {/* VPN button
                        {machine.vpn_available && (
                          <button
                            onClick={async () => {
                              try {
                                const data = await api.vpnConnect(machine.machine_id);
                                if (data.config) {
                                  const blob = new Blob([data.config], { type: "text/plain" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `${machine.machine_id}.conf`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  showActionMessage(containerId, "✓ VPN config downloaded", "success");
                                }
                              } catch (err) {
                                showActionMessage(containerId, `VPN error: ${err.message}`, "error");
                              }
                            }}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, background: C.sectionBg, color: C.text1, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
                          >
                            Download VPN
                          </button>
                        )} */}
                      </div>
                    </div>
                  )}

                  {/* ── Row 5: solved/attempts (only when present) ── */}
                  {(machine.solved || (machine.attempts > 0 && !machine.solved)) && (
                    <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                      {machine.solved && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                          <CheckCircle style={{ width: 13, height: 13 }} />
                          Solved · +{machine.points_earned} pts
                        </span>
                      )}
                      {machine.attempts > 0 && !machine.solved && (
                        <span style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Sans', sans-serif" }}>
                          {machine.attempts} attempt{machine.attempts !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Row 6: Walkthrough ── */}
                  {machine.writeup_md && (
                    <WriteupButton machineId={machine.machine_id} />
                  )}

                  {/* ── Row 7: Flag submission ── */}
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="hackforge{...}"
                        value={selectedMachine === machine.machine_id ? flagInput : ""}
                        onFocus={() => { setSelectedMachine(machine.machine_id); setSubmitResult(null); }}
                        onChange={(e) => { setSelectedMachine(machine.machine_id); setFlagInput(e.target.value); setSubmitResult(null); }}
                        onKeyPress={(e) => { if (e.key === "Enter" && !machine.solved) handleSubmitFlag(machine.machine_id); }}
                        disabled={machine.solved}
                        className="mach-flag-input"
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: C.sectionBg,
                          border: `1px solid ${C.border}`,
                          borderRadius: 7,
                          color: C.text1,
                          fontSize: 12,
                          fontFamily: "monospace",
                          outline: "none",
                          opacity: machine.solved ? 0.5 : 1,
                          cursor: machine.solved ? "not-allowed" : "text",
                        }}
                      />
                      <button
                        onClick={() => handleSubmitFlag(machine.machine_id)}
                        disabled={submitting || !flagInput.trim() || machine.solved}
                        style={{
                          padding: "8px 14px",
                          background: C.accent,
                          border: "none",
                          borderRadius: 7,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          cursor: submitting || !flagInput.trim() || machine.solved ? "not-allowed" : "pointer",
                          opacity: submitting || !flagInput.trim() || machine.solved ? 0.5 : 1,
                          fontWeight: 700,
                          fontSize: 12,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          if (!submitting && flagInput.trim() && !machine.solved)
                            e.currentTarget.style.opacity = "0.85";
                        }}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        {submitting && selectedMachine === machine.machine_id ? (
                          <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                        ) : (
                          <Send style={{ width: 14, height: 14 }} />
                        )}
                      </button>
                      {machine.validation_passed && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "8px 12px",
                            borderRadius: 7,
                            border: "1px solid rgba(16,185,129,0.28)",
                            background: "rgba(16,185,129,0.06)",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#059669",
                            fontFamily: "'DM Sans', sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <CheckCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
                          Validated
                        </span>
                      )}
                    </div>

                    {submitResult && selectedMachine === machine.machine_id && (
                      <div
                        style={{
                          padding: "8px 12px",
                          borderRadius: 7,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: submitResult.correct ? "rgba(16,185,129,0.06)" : "rgba(220,38,38,0.06)",
                          border: `1px solid ${submitResult.correct ? "rgba(16,185,129,0.22)" : "rgba(220,38,38,0.22)"}`,
                        }}
                      >
                        {submitResult.correct ? (
                          <CheckCircle style={{ width: 13, height: 13, color: "#10b981", flexShrink: 0 }} />
                        ) : (
                          <AlertCircle style={{ width: 13, height: 13, color: "#dc2626", flexShrink: 0 }} />
                        )}
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: submitResult.correct ? "#059669" : "#dc2626", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                            {submitResult.message}
                          </p>
                          {submitResult.points > 0 && (
                            <p style={{ fontSize: 10, color: C.text3, marginTop: 2, fontFamily: "'DM Sans', sans-serif", margin: "2px 0 0" }}>
                              +{submitResult.points} points earned!
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {hackInviteMachine && (
        <HackTogetherModal
          machine={hackInviteMachine}
          onClose={() => setHackInviteMachine(null)}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default Machines;
