// src/components/LabChat.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Loader2,
  Shield,
  Zap,
  Terminal,
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import hackforgeLogo from "../assets/logo.png";

// ── Session persistence helpers ──────────────────────────────────────────────
const SESSIONS_KEY = (uid) => `vulnai_sessions_${uid || "anon"}`;

function loadSessions(uid) {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY(uid)) || "[]"); }
  catch { return []; }
}
function saveSessions(uid, sessions) {
  localStorage.setItem(SESSIONS_KEY(uid), JSON.stringify(sessions.slice(0, 40)));
}
function upsertSession(uid, id, messages) {
  if (!messages.some(m => m.role === "user")) return; // don't save empty
  const sessions = loadSessions(uid);
  const firstUser = messages.find(m => m.role === "user");
  const title = firstUser ? firstUser.text.slice(0, 48) + (firstUser.text.length > 48 ? "…" : "") : "New chat";
  const idx = sessions.findIndex(s => s.id === id);
  const entry = { id, title, messages, updatedAt: Date.now() };
  if (idx >= 0) sessions[idx] = entry;
  else sessions.unshift(entry);
  saveSessions(uid, sessions);
}
function deleteSession(uid, id) {
  saveSessions(uid, loadSessions(uid).filter(s => s.id !== id));
}
function newSessionId(uid) {
  return `${uid || "anon"}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

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

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const POLL_INTERVAL_MS = 5000;
const MAX_PROMPT_WORDS = 500;
const MAX_REVIEW_CHARS = 500;
const randomId = () => Math.random().toString(36).slice(2, 10);
const TS = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const countWords = (text = "") =>
  text.trim().split(/\s+/).filter(Boolean).length;

/* ─── Spinning logo ─── */
const SpinLogo = ({ spin = false, size = 28 }) => (
  <img
    src={hackforgeLogo}
    alt="VulnAI"
    width={size}
    height={size}
    style={{
      objectFit: "contain",
      flexShrink: 0,
      animation: spin ? "spin 1s linear infinite" : "none",
    }}
  />
);




const REDIRECT_DELAY_MS = 15000;

const REDIRECT_MESSAGES = [
  "Machine is ready. Setting things up…",
  "Finalising your environment…",
  "Almost there, hang tight…",
  "Preparing your lab…",
  "Just a moment…",
];

/* ─── Job card ─── */
const JobCard = ({ job }) => {
  const isDone   = job.status === "done";
  const isFailed = job.status === "failed";
  const isActive = !isDone && !isFailed;

  const [countdown, setCountdown] = useState(null);
  const [msgIdx, setMsgIdx]       = useState(0);

  useEffect(() => {
    if (!isDone) return;
    setCountdown(Math.ceil(REDIRECT_DELAY_MS / 1000));

    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(tick); return 0; }
        return c - 1;
      });
      setMsgIdx((i) => (i + 1) % REDIRECT_MESSAGES.length);
    }, 3000);

    const redirect = setTimeout(() => {
      window.location.href = "/machines";
    }, REDIRECT_DELAY_MS);

    return () => { clearInterval(tick); clearTimeout(redirect); };
  }, [isDone]);

  return (
    <div
      style={{
        marginTop: 6,
        padding: "8px 0",
        fontSize: 12,
        fontFamily: "'DM Sans', sans-serif",
        color: C.text3,
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      {(isActive || isDone) && (
        <Loader2
          style={{
            width: 12,
            height: 12,
            flexShrink: 0,
            color: C.text3,
            animation: "spin 1s linear infinite",
          }}
        />
      )}
      <span>
        {isActive  && "Building your lab…"}
        {isDone    && `${REDIRECT_MESSAGES[msgIdx]} Redirecting in ${countdown}s`}
        {isFailed  && (job.error || "Build failed.")}
      </span>
    </div>
  );
};

/* ─── Welcome screen ─── */
const WelcomeScreen = ({ displayName }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      paddingBottom: 56,
      paddingTop: 36,
      paddingLeft: 24,
      paddingRight: 24,
      userSelect: "none",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 760,
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: C.text1,
          letterSpacing: -0.4,
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Hello, {displayName}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 8,
          marginBottom: 0,
        }}
      >
        {[
          {
            icon: Shield,
            title: "POC to Lab",
            text: "Turn exploit references into focused practice quickly.",
          },
          {
            icon: Terminal,
            title: "Hands-on Output",
            text: "Build scenarios with practical attack and defense flow.",
          },
          {
            icon: Zap,
            title: "Fast Start",
            text: "Start with one prompt and iterate as you learn.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            style={{
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Icon style={{ width: 13, height: 13, color: C.accent, flexShrink: 0 }} />
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.text1,
                }}
              >
                {title}
              </p>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 10.5,
                lineHeight: 1.5,
                color: C.text3,
              }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Message bubble ─── */
const Message = ({ msg, jobMap }) => {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {!isUser && (
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: C.sectionBg,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SpinLogo size={18} />
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxWidth: "72%",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        {!isUser && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: C.accent,
              fontFamily: "'DM Sans', sans-serif",
              paddingLeft: 2,
            }}
          >
            Vuln AI
          </span>
        )}

        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.65,
            fontFamily: "'DM Sans', sans-serif",
            ...(isUser
              ? {
                  background: C.accent,
                  color: "#fff",
                }
              : {
                  background: C.cardBg,
                  color: C.text1,
                  border: `1px solid ${C.border}`,
                }),
          }}
        >
          {renderMessageContent(msg.text, isUser)}
        </div>

        {msg.jobId && jobMap[msg.jobId] && <JobCard job={jobMap[msg.jobId]} />}

        <span
          style={{
            fontSize: 9,
            color: C.text3,
            paddingLeft: 2,
            paddingRight: 2,
            fontFamily: "'DM Sans', sans-serif",
            opacity: 0.6,
          }}
        >
          {msg.ts}
        </span>
      </div>
    </div>
  );
};

/* ─── Typing indicator ─── */
const TypingIndicator = () => (
  <div
    style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        flexShrink: 0,
        background: C.sectionBg,
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SpinLogo spin size={18} />
    </div>
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        fontSize: 12,
        color: C.text3,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      Thinking...
    </div>
  </div>
);

const renderMessageContent = (text, isUser = false) => {
  const source = String(text || "");
  const fenceRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIdx = 0;
  let match;
  let key = 0;

  while ((match = fenceRegex.exec(source)) !== null) {
    const start = match.index;
    const full = match[0];
    const lang = (match[1] || "").trim();
    const code = (match[2] || "").replace(/\n$/, "");

    if (start > lastIdx) {
      parts.push({
        type: "text",
        content: source.slice(lastIdx, start),
        key: `t-${key++}`,
      });
    }

    parts.push({
      type: "code",
      content: code,
      lang,
      key: `c-${key++}`,
    });

    lastIdx = start + full.length;
  }

  if (lastIdx < source.length) {
    parts.push({
      type: "text",
      content: source.slice(lastIdx),
      key: `t-${key++}`,
    });
  }

  if (!parts.length) {
    parts.push({ type: "text", content: source, key: "t-empty" });
  }

  return parts.map((part) => {
    if (part.type === "code") {
      return (
        <div
          key={part.key}
          style={{
            marginTop: 8,
            marginBottom: 8,
            borderRadius: 10,
            overflow: "hidden",
            border: `1px solid ${isUser ? "rgba(255,255,255,0.35)" : C.border}`,
            background: isUser ? "rgba(255,255,255,0.12)" : C.sectionBg,
          }}
        >
          {part.lang && (
            <div
              style={{
                padding: "6px 10px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                color: isUser ? "rgba(255,255,255,0.9)" : C.text3,
                background: isUser ? "rgba(255,255,255,0.1)" : C.cardBg,
                borderBottom: `1px solid ${isUser ? "rgba(255,255,255,0.25)" : C.border}`,
              }}
            >
              {part.lang}
            </div>
          )}
          <pre
            style={{
              margin: 0,
              padding: "10px 12px",
              fontSize: 12,
              lineHeight: 1.55,
              color: "inherit",
              fontFamily: "Consolas, 'Courier New', monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <code>{part.content}</code>
          </pre>
        </div>
      );
    }

    return (
      <span
        key={part.key}
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {part.content}
      </span>
    );
  });
};

/* ─── Sidebar ─── */
const Sidebar = ({ sessions, activeId, onNew, onSelect, onDelete, collapsed, onToggle }) => (
  <div style={{
    width: collapsed ? 52 : 240, flexShrink: 0,
    background: "#ffffff", borderRight: `1px solid ${C.border}`,
    display: "flex", flexDirection: "column",
    transition: "width 0.2s ease", overflow: "hidden",
    height: "100%",
  }}>
    {/* Top bar */}
    {collapsed ? (
      /* Collapsed: expand button on top, New Chat icon below */
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 8px", gap: 8, borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onToggle} title="Expand sidebar" style={{
          width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", background: "none", border: `1px solid ${C.border}`,
          cursor: "pointer", color: C.text3,
        }}>
          <ChevronRight style={{ width: 13, height: 13 }} />
        </button>
        <button onClick={onNew} title="New chat" style={{
          width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", background: C.accent, border: "none",
          cursor: "pointer", color: "#fff",
        }}>
          <Plus style={{ width: 14, height: 14 }} />
        </button>
      </div>
    ) : (
      /* Expanded: collapse button on top row, New Chat full-width below */
      <div style={{ padding: "12px 10px 10px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button onClick={onToggle} title="Collapse sidebar" style={{
            width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center",
            justifyContent: "center", background: "none", border: `1px solid ${C.border}`,
            cursor: "pointer", color: C.text3,
          }}>
            <ChevronLeft style={{ width: 13, height: 13 }} />
          </button>
        </div>
        <button onClick={onNew} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 7,
          background: C.accent, border: "none",
          borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "#fff",
          fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
        }}>
          <Plus style={{ width: 14, height: 14, flexShrink: 0 }} /> New Chat
        </button>
      </div>
    )}

    {/* Session list */}
    {!collapsed && (
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 12px" }}>
            <MessageSquare style={{ width: 24, height: 24, color: C.border, margin: "0 auto 8px" }} />
            <p style={{ fontSize: 12, color: C.text3, fontFamily: "'DM Sans',sans-serif", margin: 0 }}>
              No chats yet.<br />Start a new chat!
            </p>
          </div>
        ) : (
          <>
            <p style={{
              fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: 0.8,
              padding: "4px 6px 6px", fontFamily: "'DM Sans',sans-serif", margin: 0,
            }}>
              RECENT
            </p>
            {sessions.map(s => (
              <div key={s.id}
                onClick={() => onSelect(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 8px", borderRadius: 8, cursor: "pointer",
                  background: s.id === activeId ? C.accentBg : "transparent",
                  border: `1px solid ${s.id === activeId ? C.accentBdr : "transparent"}`,
                  marginBottom: 2, transition: "background 0.12s",
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                <MessageSquare style={{ width: 13, height: 13, flexShrink: 0, color: s.id === activeId ? C.accent : C.text3 }} />
                <span style={{
                  flex: 1, fontSize: 12.5, color: s.id === activeId ? C.accent : C.text2,
                  fontWeight: s.id === activeId ? 700 : 400,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {s.title}
                </span>
                <button onClick={e => { e.stopPropagation(); onDelete(s.id); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 3,
                    color: C.text3, flexShrink: 0, borderRadius: 4,
                    display: "flex", alignItems: "center",
                  }}
                  title="Delete">
                  <Trash2 style={{ width: 11, height: 11 }} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    )}

    {/* Collapsed: just icon buttons */}
    {collapsed && (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 4, overflowY: "auto" }}>
        {sessions.slice(0, 12).map(s => (
          <button key={s.id}
            onClick={() => onSelect(s.id)}
            title={s.title}
            style={{
              width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
              background: s.id === activeId ? C.accentBg : "none",
              border: `1px solid ${s.id === activeId ? C.accentBdr : "transparent"}`,
            }}>
            <MessageSquare style={{ width: 13, height: 13, color: s.id === activeId ? C.accent : C.text3 }} />
          </button>
        ))}
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function LabChat() {
  const userId = localStorage.getItem("userId") || "";
  // sessionId is sent to the backend — must always be the real userId so that
  // generated_machines.user_id is set correctly (machine appears in Machines tab).
  const sessionId = useRef(userId);
  // chatId is a local-only identifier used for sidebar session management in localStorage.
  const chatId = useRef(newSessionId(userId));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobMap, setJobMap] = useState({});
  const pollingRef = useRef({});
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [promptWarning, setPromptWarning] = useState("");
  const [quotaBlock, setQuotaBlock] = useState(null);
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [reviewWouldPay, setReviewWouldPay] = useState(null);
  const [reviewWhy, setReviewWhy] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const reviewPollTimeoutsRef = useRef([]);
  // Sidebar — hidden on mobile, collapsed on desktop
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 640);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  React.useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [sessions, setSessions] = useState(() => loadSessions(userId));
  const userName =
    (
      localStorage.getItem("name") ||
      localStorage.getItem("username") ||
      "hacker"
    ).trim() || "hacker";

  // Save messages to session store whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      upsertSession(userId, chatId.current, messages);
      setSessions(loadSessions(userId));
    }
  }, [messages, userId]);

  // Auto-fill input from For You tab deep-link
  useEffect(() => {
    const suggestion = localStorage.getItem("vulnai_suggest");
    if (suggestion) {
      localStorage.removeItem("vulnai_suggest");
      setInput(suggestion);
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, []);

  const startNewChat = useCallback(() => {
    // Reset backend session (backend session = real userId, always the same)
    fetch(`${API_BASE}/api/lab/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      body: JSON.stringify({ session_id: sessionId.current }),
    }).catch(() => {});
    // Only the local chat ID rotates — backend sessionId stays as userId
    chatId.current = newSessionId(userId);
    setMessages([]);
    setInput("");
    setJobMap({});
    setQuotaBlock(null);
    setShowReviewBox(false);
    setReviewWouldPay(null);
    setReviewWhy("");
    Object.values(pollingRef.current).forEach(clearInterval);
    pollingRef.current = {};
  }, [userId]);

  const switchSession = useCallback((id) => {
    if (id === chatId.current) return;
    const all = loadSessions(userId);
    const s = all.find(x => x.id === id);
    if (!s) return;
    // Only switch the local chat context — backend sessionId stays as userId
    chatId.current = id;
    setMessages(s.messages || []);
    setJobMap({});
    setInput("");
    setQuotaBlock(null);
    setShowReviewBox(false);
  }, [userId]);

  const handleDeleteSession = useCallback((id) => {
    deleteSession(userId, id);
    setSessions(loadSessions(userId));
    if (id === chatId.current) startNewChat();
  }, [userId, startNewChat]);

  const hasUserMessage = messages.some((m) => m.role === "user");

  const isBuilding = Object.values(jobMap).some(
    (j) => j.status !== "done" && j.status !== "failed"
  );
  const sessionSpent = messages.some((m) => m.jobId != null);
  const inputLocked = !!quotaBlock || isBuilding || sessionSpent;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const checkQuota = async () => {
      try {
        const uid = sessionId.current;
        const res = await fetch(`${API_BASE}/api/lab/quota/${uid}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          // is_building is handled via jobMap state — don't conflate with quota
          if (!data.can_generate && data.reason && !data.is_building) {
            setQuotaBlock(data);
          }
        }
      } catch (_) {}
    };
    checkQuota();
  }, []);

  const refreshReviewStatus = useCallback(async () => {
    const uid = (
      localStorage.getItem("userId") ||
      sessionId.current ||
      ""
    ).trim();
    if (!uid) return;
    try {
      const res = await fetch(`${API_BASE}/api/lab/review/status/${uid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      setShowReviewBox(!!data.should_prompt);
      return data;
    } catch (_) {
      return null;
    }
  }, []);

  const scheduleReviewStatusRetries = useCallback(() => {
    reviewPollTimeoutsRef.current.forEach(clearTimeout);
    reviewPollTimeoutsRef.current = [];

    [1200, 3000, 7000, 12000, 18000].forEach((delayMs) => {
      const timeoutId = setTimeout(async () => {
        const data = await refreshReviewStatus();
        if (data?.should_prompt || data?.has_review) {
          reviewPollTimeoutsRef.current.forEach(clearTimeout);
          reviewPollTimeoutsRef.current = [];
        }
      }, delayMs);
      reviewPollTimeoutsRef.current.push(timeoutId);
    });
  }, [refreshReviewStatus]);

  useEffect(() => {
    refreshReviewStatus();
  }, [refreshReviewStatus]);

  const pollJob = useCallback(
    (jobId) => {
      if (pollingRef.current[jobId]) return;
      const tick = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/lab/status/${jobId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          });
          // Engine stores jobs in memory — if it restarted the job is gone (404).
          // Cross-check the machines list: if a machine with this job_id exists
          // and is ready, treat it as done so the card doesn't stay frozen.
          if (res.status === 404) {
            try {
              const mRes = await fetch(`${API_BASE}/api/machines`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
              });
              if (mRes.ok) {
                const machines = await mRes.json();
                const list = Array.isArray(machines) ? machines : (machines.machines || []);
                const found = list.find((m) =>
                  m.job_id === jobId || m.machine_id === jobId ||
                  (m.machine_id && jobId && m.machine_id.includes(jobId.replace("job_", "")))
                );
                if (found) {
                  setJobMap((prev) => ({ ...prev, [jobId]: { ...prev[jobId], id: jobId, status: "done" } }));
                  clearInterval(pollingRef.current[jobId]);
                  delete pollingRef.current[jobId];
                  refreshReviewStatus();
                  scheduleReviewStatusRetries();
                }
              }
            } catch (_) {}
            return;
          }
          if (!res.ok) return;
          const data = await res.json();
          let normalizedStatus = data.status?.toLowerCase() || "pending";
          if (
            ["ready", "completed", "success", "done"].includes(normalizedStatus)
          )
            normalizedStatus = "done";
          else if (["running", "generating"].includes(normalizedStatus))
            normalizedStatus = "generating";
          else if (["error", "cancelled", "failed"].includes(normalizedStatus))
            normalizedStatus = "failed";
          const jobData = {
            ...data,
            id: jobId,
            status: normalizedStatus,
            phase:
              data.phase || data.current_phase || data.step || data.stage || null,
            generation_tier:
              data.result?.generation_tier || data.generation_tier || null,
            target_software:
              data.result?.target_software || data.target_software || null,
          };
          setJobMap((prev) => ({ ...prev, [jobId]: jobData }));
          if (normalizedStatus === "done" || normalizedStatus === "failed") {
            clearInterval(pollingRef.current[jobId]);
            delete pollingRef.current[jobId];
            if (normalizedStatus === "done") {
              refreshReviewStatus();
              scheduleReviewStatusRetries();
            }
            if (normalizedStatus === "failed") {
              const note = `Oops — our lab blew up (not the fun kind). Give it another shot after sometime and we promise to behave.`;
              setMessages((prev) => {
                if (prev.some((m) => m.jobId === jobId && m.text === note))
                  return prev;
                return [
                  ...prev,
                  {
                    id: randomId(),
                    role: "assistant",
                    ts: TS(),
                    text: note,
                    jobId,
                  },
                ];
              });
            }
          }
        } catch (_) {}
      };
      tick();
      pollingRef.current[jobId] = setInterval(tick, POLL_INTERVAL_MS);
    },
    [refreshReviewStatus, scheduleReviewStatusRetries],
  );

  const submitReview = async () => {
    if (reviewWouldPay === null) {
      setReviewError("Please select Yes or No.");
      return;
    }
    const reason = reviewWhy.trim();
    if (!reason) {
      setReviewError("Please explain why.");
      return;
    }
    setReviewError("");
    setReviewSubmitting(true);
    try {
      const uid = (
        localStorage.getItem("userId") ||
        sessionId.current ||
        ""
      ).trim();
      const res = await fetch(`${API_BASE}/api/lab/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          user_id: uid,
          would_pay: !!reviewWouldPay,
          why: reason.slice(0, MAX_REVIEW_CHARS),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not save review.");
      }
      setShowReviewBox(false);
      reviewPollTimeoutsRef.current.forEach(clearTimeout);
      reviewPollTimeoutsRef.current = [];
      setReviewWouldPay(null);
      setReviewWhy("");
      setReviewError("");
    } catch (err) {
      setReviewError(err?.message || "Could not save review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const refs = pollingRef.current;
    return () => {
      Object.values(refs).forEach(clearInterval);
      reviewPollTimeoutsRef.current.forEach(clearTimeout);
      reviewPollTimeoutsRef.current = [];
    };
  }, []);

  const sendMessage = async (override) => {
    const text = (override !== undefined ? override : input).trim();
    if (!text || loading) return;
    if (countWords(text) > MAX_PROMPT_WORDS) {
      setPromptWarning(`Prompt limit is ${MAX_PROMPT_WORDS} words.`);
      return;
    }
    setMessages((prev) => [
      ...prev,
      { id: randomId(), role: "user", ts: TS(), text },
    ]);
    setInput("");
    setPromptWarning("");
    setLoading(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }
    try {
      const res = await fetch(`${API_BASE}/api/lab/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ message: text, session_id: sessionId.current }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: randomId(),
          role: "assistant",
          ts: TS(),
          text: data.response || "…",
          jobId: data.job_id || null,
        },
      ]);
      if (data.job_id) {
        setJobMap((prev) => {
          const existing = prev[data.job_id];
          if (
            existing &&
            (existing.status === "done" || existing.status === "failed")
          )
            return prev;
          return {
            ...prev,
            [data.job_id]: { id: data.job_id, status: "pending" },
          };
        });
        pollJob(data.job_id);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: randomId(),
          role: "assistant",
          ts: TS(),
          text: `⚠️ We're currently experiencing high demand. Please try again in a moment.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    const next = e.target.value;
    if (countWords(next) > MAX_PROMPT_WORDS) {
      setPromptWarning(`Maximum ${MAX_PROMPT_WORDS} words allowed per prompt.`);
      return;
    }
    setPromptWarning("");
    setInput(next);
  };

  return (
    <div style={{ display: "flex", height: "calc(100dvh - 73px)", fontFamily: "'DM Sans', sans-serif" }}>
      {!isMobileView && (
        <Sidebar
          sessions={sessions}
          activeId={chatId.current}
          onNew={startNewChat}
          onSelect={switchSession}
          onDelete={handleDeleteSession}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
        />
      )}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        background: C.pageBg,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes spin        { to { transform:rotate(360deg); } }
        @keyframes pulse       { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes slideUpFade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .lab-scroll::-webkit-scrollbar       { width: 4px; }
        .lab-scroll::-webkit-scrollbar-track { background: transparent; }
        .lab-scroll::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        .lab-input-textarea::-webkit-scrollbar { width: 0; height: 0; display: none; }
        .lab-input-textarea { scrollbar-width: none; }
      `}</style>

      {/* ── Messages / Welcome ── */}
      <div
        className="lab-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: `${C.border} transparent`,
        }}
      >
        {!hasUserMessage ? (
          <WelcomeScreen displayName={userName} />
        ) : (
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {messages.map((msg) => (
              <Message key={msg.id} msg={msg} jobMap={jobMap} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          background: C.cardBg,
          padding: "14px 24px 20px",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* ── Review card ── */}
          {showReviewBox && (
            <div
              style={{
                marginBottom: 14,
                borderRadius: 14,
                background: C.cardBg,
                border: `1.5px solid ${C.accentBdr}`,
                padding: "18px 20px 16px",
                boxShadow: `0 4px 24px ${C.shadow}`,
                animation: "slideUpFade 0.35s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              {/* header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text1, fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.2 }}>
                    Quick Feedback
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: C.text3, fontFamily: "'DM Sans', sans-serif" }}>
                    Would you like to pay for this service in future?
                  </p>
                </div>
                <button
                  onClick={() => { setShowReviewBox(false); reviewPollTimeoutsRef.current.forEach(clearTimeout); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.text3, fontSize: 16, lineHeight: 1, padding: "0 0 0 8px", flexShrink: 0 }}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>

              {/* Yes / No cards */}
              <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
                {[
                  { val: true,  label: "Yes, I would", icon: "✓" },
                  { val: false, label: "No",           icon: "✗" },
                ].map(({ val, label, icon }) => {
                  const selected = reviewWouldPay === val;
                  const accentColor = val ? "#16a34a" : "#dc2626";
                  return (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setReviewWouldPay((prev) => (prev === val ? null : val))}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "11px 14px",
                        borderRadius: 10,
                        border: selected ? `2px solid ${accentColor}` : `1.5px solid ${C.border}`,
                        background: selected ? (val ? "rgba(22,163,74,0.07)" : "rgba(220,38,38,0.06)") : C.sectionBg,
                        cursor: "pointer",
                        transition: "all 0.18s",
                        transform: selected ? "scale(1.02)" : "scale(1)",
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          border: selected ? `2px solid ${accentColor}` : `1.5px solid ${C.border}`,
                          background: selected ? accentColor : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.18s",
                          fontSize: 11,
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {selected ? icon : ""}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: selected ? 700 : 500, color: selected ? accentColor : C.text2, fontFamily: "'DM Sans', sans-serif", transition: "color 0.18s" }}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Why textarea — slides in after selection */}
              <div
                style={{
                  maxHeight: reviewWouldPay !== null ? 200 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <div style={{ paddingTop: 12 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 600, color: C.text2, fontFamily: "'DM Sans', sans-serif" }}>
                    Why? <span style={{ fontWeight: 400, color: C.text3 }}>(tell us more)</span>
                  </p>
                  <textarea
                    value={reviewWhy}
                    onChange={(e) => setReviewWhy(e.target.value.slice(0, MAX_REVIEW_CHARS))}
                    rows={3}
                    maxLength={MAX_REVIEW_CHARS}
                    placeholder="Share your thoughts…"
                    style={{
                      width: "100%",
                      borderRadius: 9,
                      border: `1.5px solid ${C.border}`,
                      padding: "9px 11px",
                      background: C.sectionBg,
                      color: C.text1,
                      fontSize: 12.5,
                      fontFamily: "'DM Sans', sans-serif",
                      resize: "none",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = C.accent; }}
                    onBlur={(e) => { e.target.style.borderColor = C.border; }}
                  />

                  {/* char progress bar */}
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 99, background: C.border, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 99,
                          background: reviewWhy.length > MAX_REVIEW_CHARS * 0.85 ? "#dc2626" : C.accent,
                          width: `${(reviewWhy.length / MAX_REVIEW_CHARS) * 100}%`,
                          transition: "width 0.1s, background 0.2s",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 10, color: C.text3, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                      {reviewWhy.length}/{MAX_REVIEW_CHARS}
                    </span>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  {!!reviewError && (
                    <p style={{ margin: 0, fontSize: 11.5, color: "#dc2626", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                      {reviewError}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={reviewSubmitting || reviewWouldPay === null || !reviewWhy.trim()}
                  style={{
                    border: "none",
                    borderRadius: 9,
                    padding: "9px 18px",
                    background: (reviewSubmitting || reviewWouldPay === null || !reviewWhy.trim()) ? C.border : C.accent,
                    color: (reviewSubmitting || reviewWouldPay === null || !reviewWhy.trim()) ? C.text3 : "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: (reviewSubmitting || reviewWouldPay === null || !reviewWhy.trim()) ? "not-allowed" : "pointer",
                    transition: "background 0.2s, color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {reviewSubmitting && (
                    <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                  )}
                  {reviewSubmitting ? "Saving…" : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* ── Lock banners ── */}
          {isBuilding && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 12px", borderRadius: 8, background: C.accentBg, border: `1px solid ${C.accentBdr}` }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, flexShrink: 0, animation: "pulse 1.4s ease-in-out infinite" }} />
              <span style={{ fontSize: 12, color: C.accent, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                Your lab is building — input is locked until it completes.
              </span>
            </div>
          )}
          {sessionSpent && !isBuilding && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)" }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 12, color: "#15803d", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                Lab built. Start a new session to generate another.
              </span>
            </div>
          )}
          {quotaBlock && !isBuilding && !sessionSpent && (
            <p style={{ fontSize: 12, color: C.text1, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
              Generation limit reached.{" "}
              <span style={{ color: C.text3 }}>
                {(() => {
                  const h = quotaBlock.cooldown_remaining_hours;
                  if (h > 0) {
                    const hrs = Math.floor(h);
                    const mins = Math.round((h - hrs) * 60);
                    return hrs > 0 ? `Resets in ${hrs}h ${mins}m.` : `Resets in ${mins}m.`;
                  }
                  if (quotaBlock.machine_count >= quotaBlock.max_machines)
                    return `You have ${quotaBlock.machine_count}/${quotaBlock.max_machines} machines. Delete one to continue.`;
                  return "Try again later.";
                })()}
              </span>
            </p>
          )}

          {/* ── Text input ── */}
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              background: C.sectionBg,
              border: `1px solid ${inputFocused && !inputLocked ? C.accent : C.border}`,
              borderRadius: 10,
              padding: "10px 14px",
              transition: "border-color 0.15s",
              opacity: inputLocked ? 0.5 : 1,
              pointerEvents: inputLocked ? "none" : "auto",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKey}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={
                isBuilding
                  ? "Your lab is building — input locked…"
                  : sessionSpent
                  ? "Start a new session to generate another lab."
                  : quotaBlock
                  ? "Generation limit reached"
                  : "Create a Lab with me..."
              }
              rows={1}
              disabled={inputLocked}
              className="lab-input-textarea"
              style={{
                flex: 1,
                resize: "none",
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                fontSize: 13,
                color: C.text1,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.45,
                maxHeight: 170,
                overflowY: "auto",
                opacity: inputLocked ? 0.5 : 1,
              }}
              onInput={(e) => {
                const maxHeight = 170;
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, maxHeight) + "px";
                e.target.style.overflowY =
                  e.target.scrollHeight > maxHeight ? "auto" : "hidden";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || inputLocked || !input.trim()}
              style={{
                flexShrink: 0,
                width: 34,
                height: 34,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: !loading && !inputLocked && input.trim() ? C.accent : C.border,
                border: "none",
                cursor: !loading && !inputLocked && input.trim() ? "pointer" : "not-allowed",
                opacity: !loading && !inputLocked && input.trim() ? 1 : 0.45,
                transition: "background 0.15s, opacity 0.15s",
              }}
            >
              {loading ? (
                <Loader2
                  style={{
                    width: 15,
                    height: 15,
                    color: "#fff",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <Send style={{ width: 15, height: 15, color: "#fff" }} />
              )}
            </button>
          </div>
          <p
            style={{
              fontSize: 10,
              color: C.text3,
              marginTop: 8,
              textAlign: "center",
              letterSpacing: 0.6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Enter to send · Shift+Enter for new line · Vuln AI can make
            mistakes. Check important info.
          </p>
          {!!promptWarning && (
            <p
              style={{
                fontSize: 11.5,
                color: "#dc2626",
                marginTop: 6,
                textAlign: "center",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {promptWarning}
            </p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
