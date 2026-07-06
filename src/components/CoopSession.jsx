import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const C = {
  pageBg: "#fbeae2",
  cardBg: "#ffffff",
  text1: "#181818",
  text2: "#3d3d3d",
  text3: "#797979",
  border: "#e8e2db",
  accent: "#f97316",
  accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
  green: "#16a34a",
  greenBg: "rgba(22,163,74,0.08)",
  greenBdr: "rgba(22,163,74,0.22)",
  purple: "#7c3aed",
};

const s = {
  page: {
    minHeight: "100vh",
    background: C.pageBg,
    padding: "32px 24px",
    fontFamily: "'DM Sans', sans-serif",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
  },
  leftCol: { flex: 1, display: "flex", flexDirection: "column", gap: 20 },
  rightCol: {
    width: 320,
    position: "sticky",
    top: 80,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    background: C.cardBg,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  },
  badge: (color, bg, bdr) => ({
    display: "inline-block",
    padding: "3px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    color,
    background: bg,
    border: `1px solid ${bdr}`,
    marginRight: 8,
  }),
  label: { fontSize: 12, fontWeight: 600, color: C.text3, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 600, color: C.text1 },
  btn: (variant = "primary") => ({
    padding: "10px 22px",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    ...(variant === "primary"
      ? { background: C.accent, color: "#fff" }
      : variant === "danger"
      ? { background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }
      : variant === "green"
      ? { background: C.green, color: "#fff" }
      : { background: C.accentBg, color: C.accent, border: `1px solid ${C.accentBdr}` }),
  }),
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: "#faf9f7",
    color: C.text1,
    boxSizing: "border-box",
  },
};

const statusBadge = (status) => {
  const map = {
    pending:   [C.accent, C.accentBg, C.accentBdr],
    active:    [C.green, C.greenBg, C.greenBdr],
    completed: [C.purple, "rgba(124,58,237,0.08)", "rgba(124,58,237,0.22)"],
    cancelled: [C.text3, "#f1f0ee", C.border],
  };
  const [color, bg, bdr] = map[status] || map['pending'];
  return <span style={s.badge(color, bg, bdr)}>{status}</span>;
};

const modeBadge = (mode) => {
  if (mode === 'coop')
    return <span style={s.badge(C.green, C.greenBg, C.greenBdr)}>Co-op</span>;
  return (
    <span style={s.badge(C.purple, "rgba(124,58,237,0.08)", "rgba(124,58,237,0.22)")}>
      Race
    </span>
  );
};

export default function CoopSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId') || '';

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Flag submission
  const [flagInput, setFlagInput] = useState('');
  const [flagResult, setFlagResult] = useState(null);  // { correct, points_awarded }
  const [flagBusy, setFlagBusy] = useState(false);
  const [solved, setSolved] = useState(false);

  // Chat
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const chatEndRef = useRef(null);
  const chatPollRef = useRef(null);

  // Session poll
  const sessionPollRef = useRef(null);

  const fetchSession = useCallback(async () => {
    try {
      const data = await apiService.getCoopSession(sessionId);
      setSession(data);
      if (data.chat) setMessages(data.chat);
    } catch (e) {
      setError(e.message || 'Failed to load session.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchChat = useCallback(async () => {
    try {
      const data = await apiService.getChatMessages(sessionId);
      setMessages(data.messages || []);
    } catch (_) {}
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    // Poll session every 5s for status changes
    sessionPollRef.current = setInterval(fetchSession, 5000);
    return () => clearInterval(sessionPollRef.current);
  }, [fetchSession]);

  useEffect(() => {
    if (!session) return;
    if (session.status === 'active' || session.status === 'completed') {
      chatPollRef.current = setInterval(fetchChat, 3000);
    }
    return () => clearInterval(chatPollRef.current);
  }, [session?.status, fetchChat]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRespond = async (action) => {
    try {
      await apiService.respondToSession(sessionId, action);
      fetchSession();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await apiService.cancelCoopSession(sessionId);
      navigate('/coop');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleFlagSubmit = async () => {
    if (!flagInput.trim() || flagBusy || solved) return;
    setFlagBusy(true);
    setFlagResult(null);
    try {
      const res = await apiService.submitCoopFlag(sessionId, flagInput.trim());
      setFlagResult(res);
      if (res.correct) {
        setSolved(true);
        fetchSession();
      }
    } catch (e) {
      setFlagResult({ correct: false, error: e.message });
    } finally {
      setFlagBusy(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatBusy) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatBusy(true);
    try {
      await apiService.sendChatMessage(sessionId, msg);
      fetchChat();
    } catch (e) {
      // put text back on failure
      setChatInput(msg);
    } finally {
      setChatBusy(false);
    }
  };

  const handleChatKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', color: C.text3, marginTop: 80 }}>Loading session...</div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', color: '#dc2626', marginTop: 80 }}>{error}</div>
      </div>
    );
  }

  if (!session) return null;

  const isOwner   = session.owner_id === currentUserId;
  const isPartner = session.partner_id === currentUserId;
  const isActive  = session.status === 'active';

  // Fetch owner/partner usernames from session if enriched, else fallback to IDs
  const ownerUsername   = session.owner_username   || session.owner_id;
  const partnerUsername = session.partner_username || session.partner_id || 'Waiting...';

  return (
    <div style={s.page}>
      <div style={{ maxWidth: 1100, margin: '0 auto 20px' }}>
        <button onClick={() => navigate('/coop')} style={{ ...s.btn('ghost'), fontSize: 13 }}>
          &larr; Back to Lobby
        </button>
      </div>

      <div style={s.inner}>
        {/* ── Left column ── */}
        <div style={s.leftCol}>

          {/* Session info card */}
          <div style={s.card}>
            <div style={{ marginBottom: 16 }}>
              {modeBadge(session.mode)}
              {statusBadge(session.status)}
            </div>

            <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: C.text1 }}>
              {session.mode === 'coop' ? 'Co-op Session' : 'Race Session'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={s.label}>Owner</div>
                <div style={s.value}>{ownerUsername} {isOwner ? '(you)' : ''}</div>
              </div>
              <div>
                <div style={s.label}>Partner</div>
                <div style={s.value}>
                  {session.status === 'pending' && !session.partner_id
                    ? 'Waiting for partner...'
                    : `${partnerUsername} ${isPartner ? '(you)' : ''}`}
                </div>
              </div>
              <div>
                <div style={s.label}>Machine</div>
                <div style={{ ...s.value, fontSize: 13, wordBreak: 'break-all' }}>{session.machine_id}</div>
              </div>
              {session.started_at && (
                <div>
                  <div style={s.label}>Started</div>
                  <div style={s.value}>{new Date(session.started_at).toLocaleTimeString()}</div>
                </div>
              )}
            </div>

            {/* Partner actions */}
            {session.status === 'pending' && isPartner && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={s.btn('green')} onClick={() => handleRespond('accept')}>
                  Accept
                </button>
                <button style={s.btn('danger')} onClick={() => handleRespond('decline')}>
                  Decline
                </button>
              </div>
            )}

            {/* Owner waiting */}
            {session.status === 'pending' && isOwner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: C.text3, fontSize: 14 }}>Waiting for friend to accept...</span>
                <button style={s.btn('danger')} onClick={handleCancel}>Cancel</button>
              </div>
            )}

            {error && (
              <div style={{ marginTop: 12, color: '#dc2626', fontSize: 13 }}>{error}</div>
            )}
          </div>

          {/* Flag submission */}
          {isActive && (
            <div style={s.card}>
              <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800, color: C.text1 }}>
                Submit Flag
              </h3>

              {solved || (flagResult?.correct) ? (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  background: C.greenBg,
                  border: `1px solid ${C.greenBdr}`,
                  color: C.green,
                  fontWeight: 700,
                  fontSize: 15,
                }}>
                  Correct! +{flagResult?.points_awarded} points
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="text"
                      placeholder="Enter flag..."
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFlagSubmit()}
                      disabled={flagBusy}
                      style={s.input}
                    />
                    <button
                      style={{ ...s.btn('primary'), whiteSpace: 'nowrap' }}
                      onClick={handleFlagSubmit}
                      disabled={flagBusy}
                    >
                      {flagBusy ? '...' : 'Submit'}
                    </button>
                  </div>

                  {flagResult && !flagResult.correct && (
                    <div style={{
                      marginTop: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: "rgba(220,38,38,0.06)",
                      border: "1px solid rgba(220,38,38,0.18)",
                      color: "#dc2626",
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      {flagResult.error || 'Incorrect flag. Try again!'}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Completed state */}
          {session.status === 'completed' && (
            <div style={{
              ...s.card,
              background: C.greenBg,
              border: `1px solid ${C.greenBdr}`,
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: C.green }}>
                Session Complete!
              </h3>
              {session.mode === 'race' && session.winner_id && (
                <p style={{ margin: 0, color: C.text2, fontSize: 14 }}>
                  Winner: <strong>
                    {session.winner_id === currentUserId ? 'You' :
                      (session.winner_id === session.owner_id ? ownerUsername : partnerUsername)}
                  </strong>
                </p>
              )}
            </div>
          )}

        </div>

        {/* ── Right column: Chat ── */}
        {(isActive || session.status === 'completed') && (
          <div style={s.rightCol}>
            <div style={{ ...s.card, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${C.border}`,
                fontWeight: 800,
                fontSize: 15,
                color: C.text1,
              }}>
                Chat
              </div>

              {/* Message list */}
              <div style={{
                height: 400,
                overflowY: 'auto',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                {messages.length === 0 ? (
                  <div style={{ color: C.text3, fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                    No messages yet.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.user_id === currentUserId;
                    const isSystem = msg.user_id === 'system';
                    if (isSystem) {
                      return (
                        <div key={msg.id} style={{ textAlign: 'center', fontSize: 12, color: C.text3, padding: '4px 0' }}>
                          {msg.message}
                        </div>
                      );
                    }
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontSize: 11, color: C.text3, marginBottom: 2, fontWeight: 600 }}>
                          {msg.username}
                        </span>
                        <div style={{
                          maxWidth: '80%',
                          padding: '7px 12px',
                          borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          background: isMe ? C.accent : '#f1f0ee',
                          color: isMe ? '#fff' : C.text1,
                          fontSize: 13,
                          fontWeight: 500,
                          wordBreak: 'break-word',
                        }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              {isActive && (
                <div style={{
                  padding: '10px 14px',
                  borderTop: `1px solid ${C.border}`,
                  display: 'flex',
                  gap: 8,
                }}>
                  <input
                    type="text"
                    placeholder="Message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKey}
                    disabled={chatBusy}
                    style={{ ...s.input, flex: 1, padding: '8px 12px', fontSize: 13 }}
                  />
                  <button
                    style={{ ...s.btn('primary'), padding: '8px 14px', fontSize: 13 }}
                    onClick={handleSendChat}
                    disabled={chatBusy || !chatInput.trim()}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
