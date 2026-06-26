import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Target,
  Shield,
  Play,
  Square,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Send,
  FileText,
  Activity,
  Trophy,
  ExternalLink,
  X,
  Cpu,
  Copy,
  Clock,
  Timer,
  Lock,
  Share2,
  UserPlus,
  RotateCw,
  BookOpen,
} from "lucide-react";
import CampaignShare from "./CampaignShare";
import CampaignAssign from "./CampaignAssign";


const C = {
  pageBg: "#fbeae2ff",
  sectionBg: "#fbeae2ff",
  cardBg: "#ffffff",
  text1: "#181818",
  text2: "#3d3d3d",
  text3: "#797979ff",
  border: "#e8e2db",
  accent: "#f97316",
  accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
  shadow: "rgba(0,0,0,0.06)",
  shadowMd: "rgba(0,0,0,0.10)",
};

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div
    style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "18px 20px",
      boxShadow: `0 1px 4px ${C.shadow}`,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: `${color}12`,
          border: `1px solid ${color}28`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon style={{ width: 15, height: 15, color }} />
      </div>
      <span
        style={{
          fontSize: 12,
          color: C.text3,
          fontFamily: "'DM Sans',sans-serif",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
    <p
      style={{
        fontSize: 26,
        fontWeight: 800,
        color: C.text1,
        fontFamily: "'DM Sans',sans-serif",
        lineHeight: 1,
      }}
    >
      {value}
    </p>
    {sub && (
      <p
        style={{
          fontSize: 11.5,
          color: C.text3,
          marginTop: 4,
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

/* ── ActionIconBtn (icon-only square button, matches Machines.jsx) ── */
const ActionIconBtn = ({ onClick, disabled, title, bgColor, children }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
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

/* ── WriteupButton ── */
const WriteupButton = ({ machineId }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{ borderTop: "1px solid #e8e2db", padding: "10px 18px" }}>
      <button
        onClick={() => window.open(`/walkthrough/${machineId}`, "_blank")}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
      >
        <BookOpen style={{ width: 13, height: 13, color: hov ? "#f97316" : "#797979", transition: "color 0.2s" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: hov ? "#f97316" : "#3d3d3d", transition: "color 0.2s" }}>View Walkthrough</span>
        <span style={{ fontSize: 11, color: hov ? "#f97316" : "#797979", transition: "color 0.2s" }}>↗</span>
      </button>
    </div>
  );
};

/* ── CampaignDetail ── */
const CampaignDetail = ({ campaignId: propCampaignId, onBack }) => {
  const [userId] = useState(() => localStorage.getItem("userId") || "");
  const role = localStorage.getItem("role") || "individual";
  const [campaignId, setCampaignId] = useState(propCampaignId);
  const [campaign, setCampaign] = useState(null);
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [actionMessages, setActionMessages] = useState({});
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [flagInput, setFlagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [timeLeftSec, setTimeLeftSec] = useState(null);
  const [containerLogs, setContainerLogs] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [api, setApi] = useState(null);
  const [sharingCampaign, setSharingCampaign] = useState(false);
  const [countdowns, setCountdowns] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    if (!propCampaignId) {
      const m = window.location.pathname.match(/\/campaigns\/([^/]+)/);
      if (m) setCampaignId(m[1]);
    } else setCampaignId(propCampaignId);
  }, [propCampaignId]);

  useEffect(() => {
    if (!userId) window.location.href = "/login";
  }, [userId]);

  useEffect(() => {
    if (!assignment || assignment.status !== "active" || !assignment.expires_at)
      return;
    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(assignment.expires_at) - Date.now()) / 1000),
      );
      setTimeLeftSec(diff);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [assignment]);

  const isTimerExpired = assignment?.status === "active" && timeLeftSec === 0;
  const hasAssignment = !!assignment;
  const timerColor =
    timeLeftSec === null
      ? null
      : timeLeftSec > 300
        ? "#16a34a"
        : timeLeftSec > 60
          ? "#d97706"
          : "#dc2626";

  const fetchContainers = useCallback(
    async (cur = api) => {
      if (!cur) return;
      try {
        const d = await cur.getCampaignContainers(campaignId);
        setContainers(d.containers || []);
      } catch (e) {
        console.error(e);
      }
    },
    [campaignId, api],
  );

  const fetchCampaignData = useCallback(
    async (cur = api) => {
      if (!cur) return;
      try {
        setIsLoading(true);
        const data = await cur.getCampaign(campaignId);
        setCampaign(data);
        const owner = data?.is_owner || data?.user_id === userId;
        if (owner) {
          await fetchContainers(cur);
        } else {
          setContainers([]);
        }
        // Silently try to get student assignment — 404 is expected for campaign owners
        try {
          const a = await cur.getMyAssignment(campaignId);
          if (a?.assignment_id) setAssignment(a);
          else setAssignment(null);
        } catch (_) {
          /* not assigned — normal for campaign creators, suppress console */
          setAssignment(null);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [campaignId, fetchContainers, api, userId],
  );

  useEffect(() => {
    import("../services/api").then((m) => setApi(m.default));
  }, []);

  useEffect(() => {
    if (api && campaignId) {
      fetchCampaignData(api);
    }
  }, [campaignId, api, fetchCampaignData]);

  useEffect(() => {
    if (!api || !campaignId) return;
    const owner = campaign?.is_owner || campaign?.user_id === userId;
    if (!owner) return;

    const iv = setInterval(() => fetchContainers(api), 3000);
    return () => clearInterval(iv);
  }, [campaign, userId, api, campaignId, fetchContainers]);

  // Seed countdowns from campaign machines via the machines API
  useEffect(() => {
    if (!api || !campaign?.machines?.length) return;
    api.getMachines({ forceRefresh: false }).then((allMachines) => {
      if (!Array.isArray(allMachines)) return;
      const machineMap = {};
      for (const m of allMachines) machineMap[m.machine_id] = m;
      setCountdowns((prev) => {
        const next = { ...prev };
        for (const m of campaign.machines) {
          const full = machineMap[m.machine_id];
          if (!full) continue;
          const s = Number(full.expires_in_seconds);
          if (Number.isFinite(s) && s >= 0) next[m.machine_id] = Math.max(0, Math.floor(s));
        }
        return next;
      });
    }).catch(() => {});
  }, [campaign, api]);

  // Tick countdowns every second; refresh campaign when one expires
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
      if (hitExpiry && api && campaignId) fetchCampaignData(api);
    }, 1000);
    return () => clearInterval(t);
  }, [api, campaignId, fetchCampaignData]);

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const showMsg = (machineId, message, type = "success") => {
    setActionMessages((p) => ({ ...p, [machineId]: { message, type } }));
    setTimeout(
      () =>
        setActionMessages((p) => {
          const n = { ...p };
          delete n[machineId];
          return n;
        }),
      2800,
    );
  };

  const handleAction = async (machineId, action, machineName, containerId = "") => {
    const actionTarget = containerId || machineId;
    const key = `${action}-${actionTarget}`;
    try {
      setActionLoading((p) => ({ ...p, [key]: true }));
      if (action === "remove" && !window.confirm(`Remove ${machineName}?`)) {
        setActionLoading((p) => ({ ...p, [key]: false }));
        return;
      }
      // Start/stop/restart by machine_id so campaign view matches Machines tab behavior.
      if (action === "start") await api.startMachineContainer(machineId);
      else if (action === "stop") await api.stopMachineContainer(machineId);
      else if (action === "restart") await api.restartMachineContainer(machineId);
      else if (action === "remove") {
        if (!containerId) throw new Error("No container found to remove.");
        await api.removeContainer(containerId);
      }
      const label =
        action === "start"
          ? "started"
          : action === "stop"
            ? "stopped"
            : action === "restart"
              ? "restarted"
              : "removed";
      showMsg(machineId, `${machineName} ${label}`, "success");
      setTimeout(() => {
        fetchContainers();
        setActionLoading((p) => ({ ...p, [key]: false }));
      }, 1800);
    } catch (e) {
      showMsg(machineId, `Failed: ${e.message}`, "error");
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const handleViewLogs = async (containerId, name) => {
    try {
      const logs = await api.getContainerLogs(containerId);
      setContainerLogs({ name, logs: logs.logs || "No logs available" });
    } catch (e) {
      setError(`Logs failed: ${e.message}`);
    }
  };

  const handleSubmitFlag = async (machineId) => {
    if (isTimerExpired) {
      showMsg(machineId, "⏰ Time expired — flag submission locked", "error");
      return;
    }
    if (!flagInput.trim()) {
      showMsg(machineId, "⚠ Enter a flag first", "warning");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitResult(null);
      const result = await api.validateFlag(
        machineId,
        flagInput,
        userId,
        campaignId,
      );
      setSubmitResult(result);
      if (result.correct) {
        setFlagInput("");
        setTimeout(fetchCampaignData, 1800);
      }
    } catch (e) {
      setSubmitResult({ correct: false, message: e.message, points: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtendMyTimer = async () => {
    try {
      setActionLoading((p) => ({ ...p, extendMyTimer: true }));
      await api.extendMyCampaignTimer(campaignId);
      showMsg("campaign", "Timer extended by 1 hour", "success");
      await fetchCampaignData();
    } catch (e) {
      showMsg("campaign", `Failed to extend timer: ${e.message}`, "error");
    } finally {
      setActionLoading((p) => ({ ...p, extendMyTimer: false }));
    }
  };

  const handleExtendAllTimers = async () => {
    try {
      setActionLoading((p) => ({ ...p, extendAllTimers: true }));
      const result = await api.extendActiveCampaignTimers(campaignId);
      const count = Number(result?.assignments_extended || 0);
      showMsg("campaign", `Extended ${count} active timer${count === 1 ? "" : "s"} by 1 hour`, "success");
      await fetchCampaignData();
    } catch (e) {
      showMsg("campaign", `Failed to extend timers: ${e.message}`, "error");
    } finally {
      setActionLoading((p) => ({ ...p, extendAllTimers: false }));
    }
  };

  const handleExtendMachine = async (machineId) => {
    const key = `extend-${machineId}`;
    try {
      setActionLoading((p) => ({ ...p, [key]: true }));
      await api.extendMachineTimer(machineId);
      showMsg(machineId, "✓ Timer extended by 1 hour", "success");
      // Re-seed the countdown from the updated machine data
      const allMachines = await api.getMachines({ forceRefresh: true });
      if (Array.isArray(allMachines)) {
        const updated = allMachines.find((m) => m.machine_id === machineId);
        if (updated) {
          const s = Number(updated.expires_in_seconds);
          if (Number.isFinite(s) && s >= 0)
            setCountdowns((prev) => ({ ...prev, [machineId]: Math.max(0, Math.floor(s)) }));
        }
      }
    } catch (e) {
      showMsg(machineId, `Failed to extend: ${e.message}`, "error");
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      setDeleting(true);
      await api.deleteCampaign(campaignId);
      setShowDeleteModal(false);
      onBack ? onBack() : (window.location.href = "/campaigns");
    } catch (e) {
      setError(`Delete failed: ${e.message}`);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getContainer = (machineId) => {
    const target = String(machineId || "").toLowerCase();
    if (!target) return null;
    const targetNoEngine = target.startsWith("engine_")
      ? target.slice("engine_".length)
      : target;
    const suffix = target.split("_").pop();
    return (
      containers.find((c) => {
        const cid = String(c?.machine_id || "").toLowerCase();
        const name = String(c?.Name || "").toLowerCase();
        const cidNoEngine = cid.startsWith("engine_")
          ? cid.slice("engine_".length)
          : cid;
        return (
          cid === target ||
          cidNoEngine === targetNoEngine ||
          name.includes(targetNoEngine) ||
          (!!suffix && (cid.includes(suffix) || name.includes(suffix)))
        );
      }) || null
    );
  };
  const getContainerUrl = (container) => {
    if (!container || container.State !== "running") return null;
    try {
      if (container.Ports?.length) {
        const p = container.Ports.find((x) => x.PublicPort);
        if (p)
          return `http://${process.env.REACT_APP_SERVER_HOST || "localhost"}:${p.PublicPort}`;
      }
      if (container.NetworkSettings?.Ports) {
        for (const [, bindings] of Object.entries(
          container.NetworkSettings.Ports,
        )) {
          if (bindings?.[0]?.HostPort)
            return `http://${process.env.REACT_APP_SERVER_HOST || "localhost"}:${bindings[0].HostPort}`;
        }
      }
    } catch {}
    return null;
  };
  const navigateBack = () =>
    onBack ? onBack() : (window.location.href = "/campaigns");

  /* Loading */
  if (!api || isLoading || !campaignId)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans',sans-serif",
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
          <p
            style={{
              color: C.text3,
              fontSize: 13,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {!campaignId ? "Resolving campaign…" : "Loading…"}
          </p>
        </div>
      </div>
    );

  /* Error */
  if (error && !campaign)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `1px solid rgba(220,38,38,.25)`,
            borderRadius: 20,
            padding: "40px 32px",
            maxWidth: 380,
            width: "100%",
            textAlign: "center",
            boxShadow: `0 4px 24px ${C.shadow}`,
          }}
        >
          <AlertCircle
            style={{
              width: 44,
              height: 44,
              color: "#dc2626",
              margin: "0 auto 12px",
            }}
          />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: C.text1,
              marginBottom: 8,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: 13.5,
              color: C.text3,
              marginBottom: 24,
              lineHeight: 1.75,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {error}
          </p>
          <button
            onClick={navigateBack}
            style={{
              padding: "10px 28px",
              background: C.accent,
              border: "none",
              borderRadius: 30,
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              boxShadow: `0 4px 18px rgba(249,115,22,.28)`,
            }}
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );

  const runningCount = containers.filter((c) => c.State === "running").length;
  const solvedCount = campaign?.progress?.solved || 0;
  const totalMachines =
    campaign?.progress?.total || campaign?.machine_count || 0;
  const pct = totalMachines
    ? Math.round((solvedCount / totalMachines) * 100)
    : 0;
  const isOwner = campaign?.is_owner || campaign?.user_id === userId;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.pageBg,
        fontFamily: "'DM Sans','Inter',sans-serif",
        color: C.text1,
      }}
    >
      {/* ambient blob */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse,rgba(249,115,22,0.06) 0%,transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .mc-card { animation: fadeUp .4s ease both; }

        .cd-flag-input {
          flex:1; padding:9px 14px;
          background:${C.sectionBg}; border:1px solid ${C.border};
          border-radius:10px; color:${C.text1}; font-size:12.5px;
          font-family:monospace; outline:none; transition:border-color .2s;
        }
        .cd-flag-input::placeholder { color:#c9c2bb; }
        .cd-flag-input:focus { border-color:${C.accent}; }

        .cd-log-pre {
          font-size:11.5px; color:#16a34a; font-family:monospace;
          background:${C.sectionBg}; padding:16px; border-radius:10px;
          white-space:pre-wrap; overflow-x:auto; line-height:1.7;
        }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.accentBdr}; border-radius:2px; }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 28px",
        }}
      >
        {sharingCampaign ? (
          role === "enterprise_staff" ? (
            <CampaignAssign
              campaignId={campaign.campaign_id}
              campaignName={campaign.campaign_name}
              onBack={() => setSharingCampaign(false)}
              onDone={() => setSharingCampaign(false)}
            />
          ) : (
            <CampaignShare
              campaignId={campaign.campaign_id}
              campaignName={campaign.campaign_name}
              onBack={() => setSharingCampaign(false)}
              onDone={() => setSharingCampaign(false)}
            />
          )
        ) : (
          <>
            {/* ── Timer Banner ── */}
            {hasAssignment && (
              <div
                style={{
                  marginBottom: 20,
                  borderRadius: 12,
                  padding: "12px 18px",
                  border: `1px solid ${isTimerExpired ? "#dc2626" : timerColor || "#d97706"}30`,
                  background: `${isTimerExpired ? "#dc2626" : timerColor || "#d97706"}08`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  animation: "fadeUp .3s ease both",
                }}
              >
                {isTimerExpired ? (
                  <Lock
                    style={{
                      width: 14,
                      height: 14,
                      color: "#dc2626",
                      flexShrink: 0,
                    }}
                  />
                ) : assignment?.status === "active" ? (
                  <Timer
                    style={{
                      width: 14,
                      height: 14,
                      color: timerColor,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Clock
                    style={{
                      width: 14,
                      height: 14,
                      color: "#d97706",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isTimerExpired ? (
                    <p
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#dc2626",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Time Expired — Submissions Locked
                    </p>
                  ) : assignment?.status === "active" &&
                    timeLeftSec !== null ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: timerColor,
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          Time Remaining: {Math.floor(timeLeftSec / 60)}:
                          {String(timeLeftSec % 60).padStart(2, "0")}
                        </p>
                        {timeLeftSec < 300 && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#dc2626",
                              letterSpacing: 1,
                              textTransform: "uppercase",
                            }}
                          >
                            ⚠ Running Low
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          height: 3,
                          borderRadius: 4,
                          background: C.border,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 4,
                            background: timerColor,
                            width: `${Math.min(100, (timeLeftSec / (campaign?.time_limit_minutes * 60 || 1800)) * 100)}%`,
                            transition: "width 1s linear",
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#d97706",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Assignment pending — click Start to begin timer
                    </p>
                  )}
                </div>
                {assignment?.status === "active" && (
                  <button
                    onClick={handleExtendMyTimer}
                    disabled={!!actionLoading.extendMyTimer || isTimerExpired}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 999,
                      border: "none",
                      padding: "6px 12px",
                      background: C.accent,
                      color: "#fff",
                      cursor: !!actionLoading.extendMyTimer || isTimerExpired ? "not-allowed" : "pointer",
                      opacity: !!actionLoading.extendMyTimer || isTimerExpired ? 0.55 : 1,
                    }}
                  >
                    {actionLoading.extendMyTimer ? "Extending..." : "+1h"}
                  </button>
                )}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 30,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    background: isTimerExpired
                      ? "rgba(220,38,38,.08)"
                      : `${timerColor || "#d97706"}12`,
                    color: isTimerExpired ? "#dc2626" : timerColor || "#d97706",
                    border: `1px solid ${isTimerExpired ? "rgba(220,38,38,.25)" : `${timerColor || "#d97706"}30`}`,
                    flexShrink: 0,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {assignment?.status || "pending"}
                </span>
              </div>
            )}

            {/* ── Top nav ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
                animation: "fadeUp .3s ease both",
              }}
            >
              <button
                onClick={navigateBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: C.text3,
                  fontSize: 13.5,
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  transition: "color .2s",
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
              >
                <ArrowLeft style={{ width: 15, height: 15 }} /> Campaigns
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                {isOwner && (
                  <button
                    onClick={() => setSharingCampaign(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 16px",
                      background: C.accentBg,
                      border: `1px solid ${C.accentBdr}`,
                      borderRadius: 30,
                      color: C.accent,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      transition: "all .2s",
                    }}
                  >
                    {role === "enterprise_staff" ? (
                      <>
                        <UserPlus style={{ width: 14, height: 14 }} /> Assign
                      </>
                    ) : (
                      <>
                        <Share2 style={{ width: 14, height: 14 }} /> Share
                      </>
                    )}
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleExtendAllTimers}
                    disabled={!!actionLoading.extendAllTimers}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 16px",
                      background: C.cardBg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 30,
                      color: C.text2,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: !!actionLoading.extendAllTimers ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      opacity: !!actionLoading.extendAllTimers ? 0.6 : 1,
                    }}
                  >
                    <Clock style={{ width: 14, height: 14 }} />
                    {actionLoading.extendAllTimers ? "Extending..." : "+1h"}
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 16px",
                      background: "rgba(220,38,38,.06)",
                      border: "1px solid rgba(220,38,38,.2)",
                      borderRadius: 30,
                      color: "#dc2626",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(220,38,38,.12)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "rgba(220,38,38,.06)")
                    }
                  >
                    <Trash2 style={{ width: 13, height: 13 }} /> Delete Campaign
                  </button>
                )}
              </div>
            </div>

            {/* ── Title ── */}
            <div
              style={{
                marginBottom: 24,
                animation: "fadeUp .35s ease .04s both",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: C.accentBg,
                    border: `1px solid ${C.accentBdr}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Shield style={{ width: 18, height: 18, color: C.accent }} />
                </div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.text1,
                    letterSpacing: -0.6,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {campaign?.campaign_name || "Campaign Details"}
                </h1>
              </div>
              <p
                style={{
                  color: C.text3,
                  fontSize: 13,
                  marginLeft: 50,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {totalMachines} machines · Created{" "}
                {campaign?.created_at
                  ? new Date(campaign.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            {/* ── Error banner ── */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  background: "rgba(220,38,38,.06)",
                  border: "1px solid rgba(220,38,38,.2)",
                  borderRadius: 10,
                  marginBottom: 20,
                  animation: "fadeUp .3s ease both",
                }}
              >
                <AlertCircle
                  style={{
                    width: 15,
                    height: 15,
                    color: "#dc2626",
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: 12.5,
                    flex: 1,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#dc2626",
                    display: "flex",
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}

            {/* ── Stats ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 14,
                marginBottom: 24,
                animation: "fadeUp .4s ease .08s both",
              }}
            >
              <StatCard
                icon={Target}
                label="Progress"
                value={`${solvedCount}/${totalMachines}`}
                color={C.accent}
                sub={`${pct}% complete`}
              />
              <StatCard
                icon={Trophy}
                label="Points"
                value={campaign?.progress?.total_points || 0}
                color={C.accent}
                sub="Total earned"
              />
              <StatCard
                icon={Activity}
                label="Running"
                value={runningCount}
                color={C.accent}
                sub="Active containers"
              />
              <StatCard
                icon={Cpu}
                label="Machines"
                value={totalMachines}
                color={C.accent}
                sub={`${containers.length} containers`}
              />
            </div>

            {/* ── Progress bar ── */}
            <div
              style={{
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "14px 20px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 14,
                animation: "fadeUp .4s ease .12s both",
                boxShadow: `0 1px 4px ${C.shadow}`,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 7,
                  borderRadius: 30,
                  background: C.sectionBg,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 30,
                    background: pct >= 100 ? "#16a34a" : C.accent,
                    width: `${pct}%`,
                    transition: "width .7s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: pct >= 100 ? "#16a34a" : C.text1,
                  fontFamily: "'DM Sans',sans-serif",
                  minWidth: 36,
                  textAlign: "right",
                }}
              >
                {pct}%
              </span>
            </div>

            {isOwner && (
              <div
                style={{
                  background: C.cardBg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: "14px 20px",
                  marginBottom: 24,
                  boxShadow: `0 1px 4px ${C.shadow}`,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: C.text3,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 10,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Assigned Users
                </p>
                {(campaign?.assignments || []).length === 0 ? (
                  <p
                    style={{
                      fontSize: 12.5,
                      color: C.text3,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    No users assigned yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(campaign?.assignments || []).map((a) => (
                      <span
                        key={a.assignment_id}
                        style={{
                          fontSize: 11.5,
                          padding: "4px 10px",
                          borderRadius: 30,
                          border: `1px solid ${C.border}`,
                          background: C.sectionBg,
                          color: C.text2,
                          fontFamily: "'DM Sans',sans-serif",
                        }}
                      >
                        {a.full_name || a.username || a.user_id} ({a.status})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Machines ── */}
            <div
              style={{
                animation: "fadeUp .4s ease .16s both",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
                gap: 16,
              }}
            >
              {campaign?.machines?.map((machine, index) => {
                const container = getContainer(machine.machine_id);
                const isRunning = container?.State === "running";
                const containerId = container?.Id || "";
                const containerUrl = getContainerUrl(container);
                const labDomainUrl = machine.url || `http://${machine.machine_id}.ctfwithai.com`;
                const msg = actionMessages[machine.machine_id];

                const ttlSeconds = Number.isFinite(Number(countdowns[machine.machine_id]))
                  ? Number(countdowns[machine.machine_id])
                  : 0;
                const isExpired = ttlSeconds <= 0 && countdowns[machine.machine_id] !== undefined;
                const ttlLow = ttlSeconds > 0 && ttlSeconds < 15 * 60;
                const hasTtl = countdowns[machine.machine_id] !== undefined;

                const containerStatus = container?.State || null;
                const getStatusColor = (s) => ({
                  running: C.accent,
                  exited: "#ef4444",
                  paused: "#f59e0b",
                  created: "#3b82f6",
                })[s?.toLowerCase()] || "#6b7280";
                const statusColor = getStatusColor(containerStatus);

                const actionKey = (act) => `${act}-${containerId || machine.machine_id}`;

                return (
                  <div
                    key={machine.machine_id}
                    className="mc-card"
                    style={{
                      position: "relative",
                      background: C.cardBg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      overflow: "hidden",
                      animation: `fadeUp 0.4s ease-out ${index * 0.08}s both`,
                    }}
                  >
                    {/* Toast */}
                    {msg && (
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
                          fontFamily: "'DM Sans',sans-serif",
                          animation: "fadeUp 0.3s ease-out",
                          background: msg.type === "success" ? "#10b981" : msg.type === "error" ? "#ef4444" : "#f59e0b",
                          color: "#fff",
                        }}
                      >
                        {msg.message}
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
                              fontFamily: "'DM Sans',sans-serif",
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
                          <p
                            style={{
                              fontSize: 10,
                              color: C.text3,
                              marginTop: 2,
                              fontWeight: 500,
                              fontFamily: "'DM Sans',sans-serif",
                              margin: "2px 0 0",
                            }}
                          >
                            {campaign?.campaign_name}
                          </p>
                        </div>
                      </div>
                      {machine.solved && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#059669",
                            fontFamily: "'DM Sans',sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircle style={{ width: 13, height: 13 }} />
                          Solved · +{machine.points_earned} pts
                        </span>
                      )}
                    </div>

                    {/* ── Row 2: Container status + controls (owner only) ── */}
                    {isOwner && (
                      <div
                        style={{
                          borderTop: `1px solid ${C.border}`,
                          padding: "12px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        {container ? (
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
                                  fontFamily: "'DM Sans',sans-serif",
                                }}
                              >
                                {containerStatus
                                  ? containerStatus.charAt(0).toUpperCase() + containerStatus.slice(1)
                                  : "Unknown"}
                              </span>
                              <code style={{ fontSize: 10, color: C.text3, fontFamily: "monospace" }}>
                                {containerId?.slice(0, 12)}
                              </code>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              {!isRunning ? (
                                <ActionIconBtn
                                  title="Start Container"
                                  bgColor="#10b981"
                                  disabled={!!actionLoading[actionKey("start")]}
                                  onClick={() => handleAction(machine.machine_id, "start", machine.variant, containerId)}
                                >
                                  {actionLoading[actionKey("start")] ? (
                                    <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                                  ) : (
                                    <Play style={{ width: 14, height: 14 }} />
                                  )}
                                </ActionIconBtn>
                              ) : (
                                <ActionIconBtn
                                  title="Stop Container"
                                  bgColor="#ef4444"
                                  disabled={!!actionLoading[actionKey("stop")]}
                                  onClick={() => handleAction(machine.machine_id, "stop", machine.variant, containerId)}
                                >
                                  {actionLoading[actionKey("stop")] ? (
                                    <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                                  ) : (
                                    <Square style={{ width: 14, height: 14 }} />
                                  )}
                                </ActionIconBtn>
                              )}
                              <ActionIconBtn
                                title="Restart Container"
                                bgColor="#3b82f6"
                                disabled={!!actionLoading[actionKey("restart")]}
                                onClick={() => handleAction(machine.machine_id, "restart", machine.variant, containerId)}
                              >
                                {actionLoading[actionKey("restart")] ? (
                                  <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                                ) : (
                                  <RotateCw style={{ width: 14, height: 14 }} />
                                )}
                              </ActionIconBtn>
                              {container && (
                                <ActionIconBtn
                                  title="View Logs"
                                  bgColor="#8b5cf6"
                                  disabled={false}
                                  onClick={() => handleViewLogs(containerId, container.Name)}
                                >
                                  <FileText style={{ width: 14, height: 14 }} />
                                </ActionIconBtn>
                              )}
                              <ActionIconBtn
                                title="Remove Container"
                                bgColor="#ef4444"
                                disabled={!container || !!actionLoading[actionKey("remove")]}
                                onClick={() => handleAction(machine.machine_id, "remove", machine.variant, containerId)}
                              >
                                {actionLoading[actionKey("remove")] ? (
                                  <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                                ) : (
                                  <Trash2 style={{ width: 14, height: 14 }} />
                                )}
                              </ActionIconBtn>
                            </div>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                              <AlertCircle style={{ width: 12, height: 12 }} />
                              No container — click Launch to start
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <ActionIconBtn
                                title="Launch Machine"
                                bgColor="#10b981"
                                disabled={!!actionLoading[`start-${machine.machine_id}`]}
                                onClick={() => handleAction(machine.machine_id, "start", machine.variant, "")}
                              >
                                {actionLoading[`start-${machine.machine_id}`] ? (
                                  <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                                ) : (
                                  <Play style={{ width: 14, height: 14 }} />
                                )}
                              </ActionIconBtn>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* ── Row 3: Auto-delete timer + extend (when TTL known) ── */}
                    {hasTtl && (
                      <div
                        style={{
                          borderTop: `1px solid ${C.border}`,
                          padding: "10px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: isExpired ? "#dc2626" : ttlLow ? "#b45309" : C.text3,
                            fontWeight: 500,
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          {isExpired ? "Machine expired" : `Auto delete in ${formatDuration(ttlSeconds)}`}
                        </span>
                        {isOwner && (
                          <button
                            onClick={() => handleExtendMachine(machine.machine_id)}
                            disabled={isExpired || !!actionLoading[`extend-${machine.machine_id}`]}
                            style={{
                              border: `1px solid ${isExpired ? C.border : C.accentBdr}`,
                              borderRadius: 5,
                              padding: "3px 9px",
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: "'DM Sans',sans-serif",
                              cursor: isExpired || !!actionLoading[`extend-${machine.machine_id}`] ? "not-allowed" : "pointer",
                              background: "transparent",
                              color: isExpired ? C.text3 : C.accent,
                              opacity: !!actionLoading[`extend-${machine.machine_id}`] ? 0.6 : 1,
                            }}
                          >
                            {actionLoading[`extend-${machine.machine_id}`] ? "..." : "Extend"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* ── Row 4: Access links (visible when running) ── */}
                    {isRunning && (
                      <div
                        style={{
                          borderTop: `1px solid ${C.border}`,
                          padding: "10px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Sans',sans-serif" }}>
                          Access
                        </span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <a
                            href={labDomainUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 11,
                              color: C.accent,
                              fontFamily: "monospace",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                          >
                            <ExternalLink style={{ width: 11, height: 11 }} />
                            {labDomainUrl}
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
                                fontFamily: "'DM Sans',sans-serif",
                                textDecoration: "none",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accentBdr)}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
                            >
                              Open Terminal
                            </a>
                          )}
                          {containerUrl && (
                            <button
                              onClick={() => navigator.clipboard.writeText(containerUrl)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: C.text3,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 11,
                                fontFamily: "'DM Sans',sans-serif",
                                padding: 0,
                              }}
                            >
                              <Copy style={{ width: 11, height: 11 }} />
                              Copy URL
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Row 5: Attempts (when present and not solved) ── */}
                    {machine.attempts > 0 && !machine.solved && (
                      <div
                        style={{
                          borderTop: `1px solid ${C.border}`,
                          padding: "10px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <span style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Sans',sans-serif" }}>
                          {machine.attempts} attempt{machine.attempts !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {/* ── Row 6: Walkthrough ── */}
                    {machine.writeup_md && (
                      <WriteupButton machineId={machine.machine_id} />
                    )}

                    {/* ── Row 7: Flag submission ── */}
                    {!machine.solved && (
                      <div
                        style={{
                          borderTop: `1px solid ${C.border}`,
                          padding: "12px 18px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="text"
                            placeholder="CTFWITHAI{...}"
                            value={selectedMachine === machine.machine_id ? flagInput : ""}
                            onFocus={() => { setSelectedMachine(machine.machine_id); setSubmitResult(null); }}
                            onChange={(e) => { setSelectedMachine(machine.machine_id); setFlagInput(e.target.value); setSubmitResult(null); }}
                            onKeyPress={(e) => { if (e.key === "Enter") handleSubmitFlag(machine.machine_id); }}
                            disabled={isTimerExpired}
                            className="cd-flag-input"
                            style={{ opacity: isTimerExpired ? 0.5 : 1, cursor: isTimerExpired ? "not-allowed" : "text" }}
                          />
                          <button
                            onClick={() => handleSubmitFlag(machine.machine_id)}
                            disabled={submitting || !flagInput.trim() || isTimerExpired}
                            style={{
                              padding: "8px 14px",
                              background: C.accent,
                              border: "none",
                              borderRadius: 7,
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              cursor: submitting || !flagInput.trim() || isTimerExpired ? "not-allowed" : "pointer",
                              opacity: submitting || !flagInput.trim() || isTimerExpired ? 0.5 : 1,
                              fontWeight: 700,
                              fontSize: 12,
                              fontFamily: "'DM Sans',sans-serif",
                              flexShrink: 0,
                              boxShadow: `0 4px 14px rgba(249,115,22,.25)`,
                            }}
                          >
                            {submitting && selectedMachine === machine.machine_id ? (
                              <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            ) : (
                              <Send style={{ width: 14, height: 14 }} />
                            )}
                          </button>
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
                              <p style={{ fontSize: 12, fontWeight: 700, color: submitResult.correct ? "#059669" : "#dc2626", fontFamily: "'DM Sans',sans-serif", margin: 0 }}>
                                {submitResult.message}
                              </p>
                              {submitResult.points > 0 && (
                                <p style={{ fontSize: 10, color: C.text3, marginTop: 2, fontFamily: "'DM Sans',sans-serif", margin: "2px 0 0" }}>
                                  +{submitResult.points} points earned!
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ══ Logs Modal ══ */}
      {containerLogs && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setContainerLogs(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(24,24,24,.45)",
            backdropFilter: "blur(16px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              width: "100%",
              maxWidth: 680,
              maxHeight: "75vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: `0 40px 100px rgba(0,0,0,.14)`,
              animation: "fadeUp .25s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "rgba(139,92,246,.1)",
                    border: "1px solid rgba(139,92,246,.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText
                    style={{ width: 14, height: 14, color: "#8b5cf6" }}
                  />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.text1,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Container Logs
                  </h3>
                  <p
                    style={{
                      fontSize: 11.5,
                      color: C.text3,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    {containerLogs.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContainerLogs(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: C.sectionBg,
                  border: `1px solid ${C.border}`,
                  color: C.text3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.accentBg;
                  e.currentTarget.style.color = C.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.sectionBg;
                  e.currentTarget.style.color = C.text3;
                }}
              >
                <X style={{ width: 13, height: 13 }} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              <pre className="cd-log-pre">{containerLogs.logs}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Modal ══ */}
      {isOwner && showDeleteModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(24,24,24,.45)",
            backdropFilter: "blur(16px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: C.cardBg,
              border: "1px solid rgba(220,38,38,.25)",
              borderRadius: 20,
              maxWidth: 380,
              width: "100%",
              padding: "36px 32px",
              textAlign: "center",
              boxShadow: `0 40px 100px rgba(0,0,0,.14)`,
              animation: "fadeUp .25s ease both",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(220,38,38,.08)",
                border: "1px solid rgba(220,38,38,.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 style={{ width: 24, height: 24, color: "#dc2626" }} />
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: C.text1,
                marginBottom: 8,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Delete Campaign?
            </h3>
            <p
              style={{
                fontSize: 13,
                color: C.text3,
                lineHeight: 1.75,
                marginBottom: 24,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              This will stop and remove all containers. This action cannot be
              undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: C.sectionBg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 30,
                  color: C.text2,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = C.accent)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = C.border)
                }
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "#dc2626",
                  border: "none",
                  borderRadius: 30,
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  transition: "all .2s",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? (
                  <>
                    <Loader
                      style={{
                        width: 14,
                        height: 14,
                        animation: "spin 1s linear infinite",
                      }}
                    />{" "}
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 style={{ width: 14, height: 14 }} /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;
