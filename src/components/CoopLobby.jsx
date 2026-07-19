import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { T } from '../design/tokens';

const C = {
  pageBg:   T.pageBg,
  cardBg:   T.cardBg,
  text1:    T.text1,
  text2:    T.text2,
  text3:    T.text3,
  border:   T.border,
  accent:   T.accent,
  accentBg: T.accentBg,
  accentBdr: T.accentBorder,
  green:    T.success,
  greenBg:  T.successBg,
  greenBdr: T.successBorder,
  purple:   '#7c3aed',
};

const badge = (text, color, bg, bdr) => (
  <span style={{
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color,
    background: bg,
    border: `1px solid ${bdr}`,
    marginRight: 6,
  }}>
    {text}
  </span>
);

const modeBadge = (mode) => {
  if (mode === 'coop')
    return badge('Co-op', C.green, C.greenBg, C.greenBdr);
  return badge('Race', C.purple, 'rgba(124,58,237,0.08)', 'rgba(124,58,237,0.22)');
};

const statusBadge = (status) => {
  const map = {
    pending:   [C.accent, C.accentBg, C.accentBdr, 'Pending'],
    active:    [C.green, C.greenBg, C.greenBdr, 'Active'],
    completed: [C.purple, 'rgba(124,58,237,0.08)', 'rgba(124,58,237,0.22)', 'Completed'],
    cancelled: [C.text3, '#f1f0ee', C.border, 'Cancelled'],
  };
  const [color, bg, bdr, label] = map[status] || map['pending'];
  return badge(label, color, bg, bdr);
};

export default function CoopLobby() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserId = localStorage.getItem('userId') || '';

  const fetchSessions = useCallback(async () => {
    try {
      const data = await apiService.getCoopSessions();
      setSessions(data.sessions || []);
    } catch (e) {
      setError(e.message || 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.pageBg,
      padding: "40px 24px",
      fontFamily: T.font,
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: C.text1 }}>
          Hack Together
        </h1>
        <p style={{ margin: "0 0 32px", color: C.text3, fontSize: 15 }}>
          Co-op and race sessions with your friends.
        </p>

        {error && (
          <div style={{
            padding: "12px 16px",
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.18)",
            borderRadius: 10,
            color: "#dc2626",
            marginBottom: 20,
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            padding: "16px 24px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: C.text1 }}>
              Active Sessions
            </span>
            <button
              onClick={fetchSessions}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                background: "transparent",
                color: C.text2,
                cursor: "pointer",
                fontFamily: T.font,
              }}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: C.text3 }}>
              Loading...
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text1, marginBottom: 6 }}>
                No active sessions
              </div>
              <div style={{ fontSize: 14, color: C.text3 }}>
                Invite a friend from a machine page to start hacking together.
              </div>
            </div>
          ) : (
            sessions.map((sess) => {
              const isOwner = sess.owner_id === currentUserId;
              const partnerLabel = isOwner
                ? (sess.partner_username || sess.partner_id || 'Invited')
                : (sess.owner_username || sess.owner_id || 'Owner');
              const roleLabel = isOwner ? 'Invited' : 'Invited by';

              return (
                <div
                  key={sess.session_id}
                  style={{
                    padding: "16px 24px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: 6 }}>
                      {modeBadge(sess.mode)}
                      {statusBadge(sess.status)}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 2 }}>
                      {roleLabel}: <span style={{ color: C.accent }}>{partnerLabel}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.text3 }}>
                      Machine: {sess.machine_id}
                    </div>
                  </div>

                  <Link
                    to={`/coop/${sess.session_id}`}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 10,
                      background: C.accent,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      fontFamily: T.font,
                    }}
                  >
                    Open
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
