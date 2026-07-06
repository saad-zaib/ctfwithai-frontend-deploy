import React, { useState, useEffect, useCallback, useRef } from "react";
import { Heart, MessageCircle, Repeat2, Trash2, Image, X, Send, Zap, ChevronLeft } from "lucide-react";
import api from "../services/api";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

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
  red:       "#dc2626",
  redBg:     "rgba(220,38,38,0.08)",
  green:     "#16a34a",
  greenBg:   "rgba(22,163,74,0.08)",
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const Avatar = ({ username, size = 40 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `linear-gradient(135deg, #f97316, #7c3aed)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.4, fontWeight: 800, color: "#fff",
  }}>
    {(username || "?")[0].toUpperCase()}
  </div>
);

/* ── Compose Box ────────────────────────────────────────────── */
const ComposeBox = ({ onPosted, replyTo = null, onCancelReply }) => {
  const [body, setBody]         = useState("");
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [posting, setPosting]   = useState(false);
  const [error, setError]       = useState("");
  const fileRef                 = useRef();
  const myName                  = localStorage.getItem("username") || "you";
  const MAX = 280;

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => { setImage(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; };

  const submit = async () => {
    if (!body.trim() && !image) return;
    if (body.length > MAX) { setError(`Max ${MAX} chars`); return; }
    setPosting(true); setError("");
    try {
      const ping = await api.createPing(body.trim(), image, replyTo?.ping_id || null);
      setBody(""); removeImage();
      onPosted?.(ping);
    } catch (e) {
      if (e?.blocked && e?.reason) {
        setError(`${e.message} Reason: ${e.reason}`);
      } else {
        setError(e?.message || "Failed to post.");
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
      {replyTo && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: C.text3 }}>
            Replying to <strong style={{ color: C.accent }}>@{replyTo.username}</strong>
          </span>
          <button onClick={onCancelReply} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Avatar username={myName} size={38} />
        <div style={{ flex: 1 }}>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={replyTo ? "Write your pingback…" : "What's your signal?"}
            maxLength={MAX + 10}
            rows={3}
            style={{
              width: "100%", resize: "none", border: "none", outline: "none",
              fontSize: 14.5, color: C.text1, background: "transparent",
              fontFamily: "'DM Sans','Inter',sans-serif", lineHeight: 1.5,
              boxSizing: "border-box",
            }}
          />
          {preview && (
            <div style={{ position: "relative", marginTop: 8, display: "inline-block" }}>
              <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 10, border: `1px solid ${C.border}` }} />
              <button onClick={removeImage} style={{
                position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%",
                background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>
          )}
          {error && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 8,
              background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)",
            }}>
              <p style={{ fontSize: 12, color: C.red, margin: 0, fontWeight: 600 }}>
                Ping blocked
              </p>
              <p style={{ fontSize: 11.5, color: "#b91c1c", margin: "2px 0 0" }}>{error}</p>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => fileRef.current?.click()} style={{
                background: "none", border: "none", cursor: "pointer", color: C.text3,
                display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 8,
              }} title="Attach image">
                <Image style={{ width: 17, height: 17 }} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: body.length > MAX ? C.red : C.text3 }}>{body.length}/{MAX}</span>
              <button onClick={submit} disabled={posting || (!body.trim() && !image)} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: posting || (!body.trim() && !image) ? "#e5e7eb" : C.accent,
                color: posting || (!body.trim() && !image) ? C.text3 : "#fff",
                border: "none", borderRadius: 30, padding: "8px 18px",
                fontSize: 13, fontWeight: 700, cursor: posting ? "wait" : "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}>
                <Send style={{ width: 13, height: 13 }} /> {posting ? "Sending…" : "Ping"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Single Ping card ───────────────────────────────────────── */
const PingCard = ({ ping, myId, onReply, onBoost, onLikeToggle, onDelete, onOpenThread, compact = false }) => {
  const isOwn = ping.user_id === myId;
  const [liked, setLiked]   = useState(ping.liked_by_me);
  const [likes, setLikes]   = useState(ping.likes);
  const [busy, setBusy]     = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (liked) {
        const r = await api.unlikePing(ping.ping_id);
        setLiked(false); setLikes(r.likes ?? likes - 1);
      } else {
        const r = await api.likePing(ping.ping_id);
        setLiked(true); setLikes(r.likes ?? likes + 1);
      }
      onLikeToggle?.();
    } catch (_) {} finally { setBusy(false); }
  };

  const isBoost = !!ping.boost_of_id;

  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: compact ? 10 : 14, padding: compact ? "12px 14px" : "16px 18px",
      cursor: compact ? "default" : "pointer",
      transition: "border-color 0.12s",
    }}
      onClick={compact ? undefined : () => onOpenThread?.(ping)}
      onMouseEnter={compact ? undefined : e => e.currentTarget.style.borderColor = C.accentBdr}
      onMouseLeave={compact ? undefined : e => e.currentTarget.style.borderColor = C.border}
    >
      {isBoost && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
          <Repeat2 style={{ width: 12, height: 12, color: C.green }} />
          <span style={{ fontSize: 11.5, color: C.green, fontWeight: 600 }}>
            @{ping.username} boosted
          </span>
        </div>
      )}

      {/* Render original ping body for boosts */}
      {isBoost && ping.original_ping ? (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", background: C.pageBg, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Avatar username={ping.original_ping.username} size={28} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>@{ping.original_ping.username}</span>
            <span style={{ fontSize: 11, color: C.text3 }}>{timeAgo(ping.original_ping.created_at)}</span>
          </div>
          {ping.original_ping.body && <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>{ping.original_ping.body}</p>}
          {ping.original_ping.image_url && (
            <img src={`${API_BASE}${ping.original_ping.image_url}`} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8 }} />
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Avatar username={ping.username} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.text1 }}>@{ping.username}</span>
              <span style={{ fontSize: 11.5, color: C.text3 }}>{ping.player_tag}</span>
              <span style={{ fontSize: 11.5, color: C.text3, marginLeft: "auto" }}>{timeAgo(ping.created_at)}</span>
            </div>
            {ping.body && (
              <p style={{ fontSize: 14, margin: "0 0 8px", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {ping.body}
              </p>
            )}
            {ping.image_url && (
              <img
                src={`${API_BASE}${ping.image_url}`}
                alt=""
                style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 8, border: `1px solid ${C.border}` }}
                onClick={e => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: isBoost ? 0 : 4, paddingLeft: isBoost ? 0 : 46 }}>
        {/* Pingback */}
        <button onClick={e => { e.stopPropagation(); onReply?.(ping); }} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "10px 12px",
          background: "none", border: "none", cursor: "pointer", borderRadius: 20,
          color: C.text3, fontSize: 13, fontWeight: 600, minHeight: 44,
        }}>
          <MessageCircle style={{ width: 16, height: 16 }} /> {ping.replies || 0}
        </button>

        {/* Boost */}
        <button onClick={e => { e.stopPropagation(); onBoost?.(ping); }} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "10px 12px",
          background: "none", border: "none", cursor: "pointer", borderRadius: 20,
          color: C.green, fontSize: 13, fontWeight: 600, minHeight: 44,
        }}>
          <Repeat2 style={{ width: 16, height: 16 }} /> {ping.boosts || 0}
        </button>

        {/* Like */}
        <button onClick={handleLike} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "10px 12px",
          background: "none", border: "none", cursor: "pointer", borderRadius: 20,
          color: liked ? C.red : C.text3, fontSize: 13, fontWeight: 600, minHeight: 44,
        }}>
          <Heart style={{ width: 16, height: 16, fill: liked ? C.red : "none" }} /> {likes}
        </button>

        {/* Delete (own only) */}
        {isOwn && (
          <button onClick={e => { e.stopPropagation(); onDelete?.(ping.ping_id); }} style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
            color: C.text3, padding: "10px 10px", borderRadius: 20, fontSize: 13,
            minHeight: 44,
          }}>
            <Trash2 style={{ width: 15, height: 15 }} />
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Thread view ────────────────────────────────────────────── */
const ThreadView = ({ pingId, myId, onBack, onReply, onBoost, onLikeToggle, onDelete }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const d = await api.getPingThread(pingId);
      setData(d);
    } catch (_) {} finally { setLoading(false); }
  }, [pingId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p style={{ color: C.text3, padding: 24, fontSize: 13 }}>Loading thread…</p>;
  if (!data?.ping) return <p style={{ color: C.text3, padding: 24 }}>Ping not found.</p>;

  return (
    <div>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, background: "none",
        border: "none", cursor: "pointer", color: C.text2, fontWeight: 700,
        fontSize: 13.5, padding: "0 0 14px", fontFamily: "'DM Sans',sans-serif",
      }}>
        <ChevronLeft style={{ width: 16, height: 16 }} /> Back
      </button>
      <PingCard ping={data.ping} myId={myId} onReply={onReply} onBoost={onBoost}
        onLikeToggle={onLikeToggle} onDelete={onDelete} compact />
      {data.replies.length > 0 && (
        <div style={{ marginTop: 12, paddingLeft: 20, borderLeft: `2px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
          {data.replies.map(r => (
            <PingCard key={r.ping_id} ping={r} myId={myId} onReply={onReply} onBoost={onBoost}
              onLikeToggle={onLikeToggle} onDelete={onDelete} compact />
          ))}
        </div>
      )}
      <div style={{ marginTop: 14 }}>
        <ComposeBox replyTo={data.ping} onPosted={() => { load(); }} onCancelReply={() => {}} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SIGNAL PAGE
═══════════════════════════════════════════════════════════ */
export default function Signal() {
  const myId = localStorage.getItem("userId") || "";

  const [pings,      setPings]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [replyTo,    setReplyTo]    = useState(null);
  const [threadId,   setThreadId]   = useState(null);
  const [boostConfirm, setBoostConfirm] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSignalFeed();
      setPings(data.pings || []);
    } catch (_) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePosted = (ping) => {
    setReplyTo(null);
    load();
  };

  const handleDelete = async (pingId) => {
    if (!window.confirm("Delete this ping?")) return;
    try {
      await api.deletePing(pingId);
      setPings(prev => prev.filter(p => p.ping_id !== pingId));
    } catch (e) { alert(e?.message || "Failed to delete."); }
  };

  const handleBoost = (ping) => setBoostConfirm(ping);

  const confirmBoost = async () => {
    if (!boostConfirm) return;
    try {
      await api.createPing("", null, null, boostConfirm.ping_id);
      setBoostConfirm(null);
      load();
    } catch (e) { alert(e?.message || "Boost failed."); }
  };

  if (threadId) {
    return (
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 20px", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <ThreadView
          pingId={threadId} myId={myId}
          onBack={() => setThreadId(null)}
          onReply={p => setReplyTo(p)}
          onBoost={handleBoost}
          onLikeToggle={load}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 620, margin: "0 auto", padding: "28px 20px",
      fontFamily: "'DM Sans','Inter',sans-serif", color: C.text1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Zap style={{ width: 22, height: 22, color: C.accent }} />
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Signal</h1>
        <span style={{ fontSize: 12, color: C.text3, fontWeight: 600, marginLeft: 2 }}>
          ping the world
        </span>
      </div>

      {/* Compose */}
      <ComposeBox
        onPosted={handlePosted}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      {/* Feed */}
      {loading ? (
        <p style={{ color: C.text3, fontSize: 13, textAlign: "center", padding: 32 }}>Loading feed…</p>
      ) : pings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Zap style={{ width: 36, height: 36, color: C.border, margin: "0 auto 12px" }} />
          <p style={{ color: C.text3, fontSize: 14 }}>No pings yet. Be the first to send a signal.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pings.map(ping => (
            <PingCard
              key={ping.ping_id}
              ping={ping}
              myId={myId}
              onReply={p => { setReplyTo(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              onBoost={handleBoost}
              onLikeToggle={load}
              onDelete={handleDelete}
              onOpenThread={p => setThreadId(p.ping_id)}
            />
          ))}
        </div>
      )}

      {/* Boost confirm dialog */}
      {boostConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }} onClick={() => setBoostConfirm(null)}>
          <div style={{
            background: C.cardBg, borderRadius: 16, padding: "24px 28px", maxWidth: 380,
            border: `1px solid ${C.border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>Boost this ping?</h3>
            <p style={{ fontSize: 13, color: C.text3, margin: "0 0 18px" }}>
              It'll show up in your followers' feeds as a boost.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirmBoost} style={{
                flex: 1, padding: "10px", borderRadius: 30, border: "none",
                background: C.green, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>
                <Repeat2 style={{ width: 14, height: 14, display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                Boost
              </button>
              <button onClick={() => setBoostConfirm(null)} style={{
                flex: 1, padding: "10px", borderRadius: 30,
                border: `1px solid ${C.border}`, background: "#fff",
                color: C.text2, fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
