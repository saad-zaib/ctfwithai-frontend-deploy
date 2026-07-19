import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Heart, MessageCircle, Repeat2, Trash2, Image, X, Zap, ChevronLeft,
  ChevronDown, BarChart2, Smile, Link2,
  Bookmark, Share2, MoreHorizontal, ExternalLink,
} from "lucide-react";
import api from "../services/api";
import { T } from "../design/tokens";

const API_BASE = process.env.REACT_APP_API_URL || "";

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Avatar = ({ username, size = 40, src }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, #f97316, #7c3aed)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.4, fontWeight: 800, color: "#fff", overflow: "hidden",
  }}>
    {src
      ? <img src={src} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      : (username || "?")[0].toUpperCase()
    }
  </div>
);

const renderBody = (text) => {
  if (!text) return null;
  return text.split(/(#\w+)/g).map((part, i) =>
    part.startsWith("#")
      ? <span key={i} style={{ color: T.accent, fontWeight: 600 }}>{part}</span>
      : part
  );
};

/* ── Machine embed ── */
const MachineEmbed = ({ machine }) => (
  <div style={{
    border: `1px solid ${T.border}`, borderRadius: 12,
    overflow: "hidden", marginTop: 12, background: "#F9F9F9",
  }}>
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{
        width: 100, flexShrink: 0, background: T.accentBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, borderRight: `1px solid ${T.border}`, minHeight: 90,
      }}>
        {machine.icon || "💻"}
      </div>
      <div style={{ flex: 1, padding: "14px 16px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.text1, margin: "0 0 3px", fontFamily: T.font }}>
          {machine.name}
        </p>
        <p style={{ fontSize: 12, color: T.text3, margin: "0 0 10px", fontFamily: T.font }}>
          {machine.category} • {machine.difficulty}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: T.font }}>
            +{machine.points} pts
          </span>
          <button style={{
            display: "flex", alignItems: "center", gap: 5,
            background: T.accent, color: "#fff", border: "none",
            borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: T.font,
          }}>
            View Machine <ExternalLink size={11} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ── Badge embed ── */
const BadgeEmbed = ({ badge }) => (
  <div style={{
    border: `1px solid ${T.border}`, borderRadius: 12,
    padding: "16px 18px", marginTop: 12, background: "#F9F9F9",
  }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: T.accentBg, border: `1px solid ${T.accentBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>
        🏆
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.text1, margin: "0 0 3px", fontFamily: T.font }}>
          {badge.name}
        </p>
        <p style={{ fontSize: 12, color: T.text3, margin: 0, fontFamily: T.font }}>
          {badge.description}
        </p>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, color: T.text3, whiteSpace: "nowrap",
        background: T.border, borderRadius: 20, padding: "3px 10px", fontFamily: T.font,
      }}>
        Hacker Badge
      </span>
    </div>
  </div>
);

/* ── Campaign embed ── */
const CampaignEmbed = ({ campaign }) => {
  const pct = Math.min(100, Math.round(((campaign.completed || 0) / (campaign.total || 1)) * 100));
  return (
    <div style={{
      border: `1px solid ${T.border}`, borderRadius: 12,
      padding: "14px 16px", marginTop: 12, background: "#F9F9F9",
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: T.text1, margin: "0 0 10px", fontFamily: T.font }}>
        Campaign: {campaign.name}
      </p>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.text1, fontFamily: T.font }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: T.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: T.accent, borderRadius: 4 }} />
        </div>
      </div>
      <p style={{ fontSize: 12, color: T.accent, fontWeight: 700, margin: 0, fontFamily: T.font }}>
        XP Earned: +{campaign.xp}
      </p>
    </div>
  );
};

const EMOJIS = ["😀","😂","🔥","💀","🎯","🏆","🔑","💻","🛡","⚡","🚀","💪","👾","🕵","🐛","🔓","💥","🤖","😈","🎉","👀","🧠","🌐","📡","⚠️","✅","❌","🔒","🐚","💣"];

/* ── Compose Box ── */
const ComposeBox = ({ onPosted, replyTo = null, onCancelReply }) => {
  const [body, setBody]         = useState("");
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [posting, setPosting]   = useState(false);
  const [error, setError]       = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showLink, setShowLink]   = useState(false);
  const [linkVal, setLinkVal]     = useState("");
  const [showPoll, setShowPoll]   = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const fileRef    = useRef();
  const textareaRef = useRef();
  const myName     = localStorage.getItem("username") || "you";
  const myId       = localStorage.getItem("userId") || "";
  const myAvatar   = localStorage.getItem(`profileAvatar:${myId || "anonymous"}`) || "";
  const MAX = 280;

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null); setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const insertAtCursor = (text) => {
    const el = textareaRef.current;
    if (!el) { setBody(b => b + text); return; }
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const next  = body.slice(0, start) + text + body.slice(end);
    setBody(next);
    setTimeout(() => { el.selectionStart = el.selectionEnd = start + text.length; el.focus(); }, 0);
  };

  const insertLink = () => {
    if (!linkVal.trim()) return;
    insertAtCursor(" " + linkVal.trim());
    setLinkVal(""); setShowLink(false);
  };

  const submit = async () => {
    if (!body.trim() && !image) return;
    if (body.length > MAX) { setError(`Max ${MAX} chars`); return; }
    setPosting(true); setError("");
    try {
      const filledOptions = pollOptions.filter(o => o.trim());
      const pollPayload = showPoll && filledOptions.length >= 2 ? filledOptions : null;
      const ping = await api.createPing(body.trim(), image, replyTo?.ping_id || null, null, pollPayload);
      setBody(""); removeImage(); setShowPoll(false); setPollOptions(["", ""]);
      onPosted?.(ping);
    } catch (e) {
      if (e?.blocked && e?.reason) {
        setError(`${e.message} Reason: ${e.reason}`);
      } else {
        setError(e?.message || "Failed to post.");
      }
    } finally { setPosting(false); }
  };

  const toolbar = [
    { icon: <Image size={14} />,     label: "Image", action: () => { setShowEmoji(false); setShowLink(false); setShowPoll(false); fileRef.current?.click(); } },
    { icon: <BarChart2 size={14} />, label: "Poll",  action: () => { setShowPoll(p => !p); setShowEmoji(false); setShowLink(false); } },
    { icon: <Smile size={14} />,     label: "Emoji", action: () => { setShowEmoji(p => !p); setShowLink(false); setShowPoll(false); } },
    { icon: <Link2 size={14} />,     label: "Link",  action: () => { setShowLink(p => !p); setShowEmoji(false); setShowPoll(false); } },
  ];

  return (
    <div style={{
      background: T.cardBg, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: "16px 18px", marginBottom: 16,
    }}>
      {replyTo && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>
            Replying to <strong style={{ color: T.accent }}>@{replyTo.username}</strong>
          </span>
          <button onClick={onCancelReply} style={{ background: "none", border: "none", cursor: "pointer", color: T.text3 }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", height: 50 }}>
        <Avatar username={myName} size={38} src={myAvatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={replyTo ? "Write your pingback…" : "What's your signal?"}
            maxLength={MAX + 10}
            rows={1}
            style={{
              width: "100%", resize: "none", border: "none", outline: "none",
              fontSize: 14.5, color: T.text1, background: "transparent",
              fontFamily: T.font, lineHeight: 1.55, boxSizing: "border-box",
            }}
          />

          {preview && (
            <div style={{ position: "relative", marginBottom: 10, display: "inline-block" }}>
              <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 10, border: `1px solid ${T.border}` }} />
              <button onClick={removeImage} style={{
                position: "absolute", top: 6, right: 6, width: 22, height: 22,
                borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={11} />
              </button>
            </div>
          )}

          {error && (
            <div style={{
              marginBottom: 8, padding: "8px 12px", borderRadius: 8,
              background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)",
            }}>
              <p style={{ fontSize: 12, color: "#dc2626", margin: 0, fontWeight: 600, fontFamily: T.font }}>Ping blocked</p>
              <p style={{ fontSize: 11.5, color: "#b91c1c", margin: "2px 0 0", fontFamily: T.font }}>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{
          marginTop: 10, padding: "10px 12px", background: "#F9F9F9",
          border: `1px solid ${T.border}`, borderRadius: 10,
          display: "flex", flexWrap: "wrap", gap: 4,
        }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => { insertAtCursor(em); setShowEmoji(false); }} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 20, padding: "4px 6px", borderRadius: 6,
              transition: "background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.accentBg}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >{em}</button>
          ))}
        </div>
      )}

      {/* Link input */}
      {showLink && (
        <div style={{
          marginTop: 10, display: "flex", gap: 8, alignItems: "center",
          padding: "10px 12px", background: "#F9F9F9",
          border: `1px solid ${T.border}`, borderRadius: 10,
        }}>
          <Link2 size={14} style={{ color: T.text3, flexShrink: 0 }} />
          <input
            autoFocus
            value={linkVal}
            onChange={e => setLinkVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") insertLink(); if (e.key === "Escape") setShowLink(false); }}
            placeholder="Paste a URL…"
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 13.5, color: T.text1, fontFamily: T.font,
            }}
          />
          <button onClick={insertLink} style={{
            background: T.accent, color: "#fff", border: "none",
            borderRadius: 20, padding: "5px 14px", fontSize: 12,
            fontWeight: 700, cursor: "pointer", fontFamily: T.font,
          }}>Add</button>
          <button onClick={() => setShowLink(false)} style={{
            background: "none", border: "none", cursor: "pointer", color: T.text3,
          }}><X size={14} /></button>
        </div>
      )}

      {/* Poll builder */}
      {showPoll && (
        <div style={{
          marginTop: 10, padding: "12px 14px", background: "#F9F9F9",
          border: `1px solid ${T.border}`, borderRadius: 10,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.text2, margin: "0 0 8px", fontFamily: T.font }}>Poll options</p>
          {pollOptions.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <input
                value={opt}
                onChange={e => { const next = [...pollOptions]; next[i] = e.target.value; setPollOptions(next); }}
                placeholder={`Option ${i + 1}`}
                style={{
                  flex: 1, border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: "7px 10px", fontSize: 13, fontFamily: T.font,
                  outline: "none", background: T.cardBg,
                }}
              />
              {pollOptions.length > 2 && (
                <button onClick={() => setPollOptions(prev => prev.filter((_, j) => j !== i))} style={{
                  background: "none", border: "none", cursor: "pointer", color: T.text3,
                }}><X size={13} /></button>
              )}
            </div>
          ))}
          {pollOptions.length < 4 && (
            <button onClick={() => setPollOptions(prev => [...prev, ""])} style={{
              background: "none", border: `1px dashed ${T.border}`, borderRadius: 8,
              padding: "6px 12px", fontSize: 12, color: T.text3, cursor: "pointer",
              fontFamily: T.font, width: "100%", marginTop: 2,
            }}>+ Add option</button>
          )}
        </div>
      )}

      {/* Toolbar — full width, aligned with avatar left edge */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: `1px solid ${T.border}`, paddingTop: 10, marginTop: 8,
        flexWrap: "wrap", gap: 6,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          {toolbar.map(item => (
            <button key={item.label} onClick={item.action} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer",
              color: T.text3, fontSize: 12, fontWeight: 500,
              padding: "5px 9px", borderRadius: 8, fontFamily: T.font,
              transition: "color 0.12s, background 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentBg; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.text3; e.currentTarget.style.background = "none"; }}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: body.length > MAX ? "#dc2626" : T.text3, fontFamily: T.font }}>
            {body.length}/{MAX}
          </span>
          <button
            onClick={submit}
            disabled={posting || (!body.trim() && !image)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: posting || (!body.trim() && !image) ? "#e5e7eb" : T.accent,
              color: posting || (!body.trim() && !image) ? T.text3 : "#fff",
              border: "none", borderRadius: 30, padding: "8px 18px",
              fontSize: 13, fontWeight: 700, cursor: posting ? "wait" : "pointer",
              fontFamily: T.font,
            }}
              >
          🚀 {posting ? "Sending…" : "Ping"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Poll Widget ── */
const PollWidget = ({ poll, pingId, onVoted }) => {
  const [localPoll, setLocalPoll] = useState(poll);
  const [voting, setVoting] = useState(false);
  useEffect(() => { setLocalPoll(poll); }, [poll]);

  if (!localPoll || !localPoll.options || localPoll.options.length === 0) return null;

  const voted = localPoll.my_vote;
  const total = localPoll.total_votes || 0;

  const handleVote = async (e, optionId) => {
    e.stopPropagation();
    if (voting || voted) return;
    setVoting(true);
    try {
      const updated = await api.votePoll(pingId, optionId);
      setLocalPoll(updated);
      onVoted?.();
    } catch (_) {}
    finally { setVoting(false); }
  };

  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }} onClick={e => e.stopPropagation()}>
      {localPoll.options.map(opt => {
        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
        const isVoted = voted === opt.option_id;
        return (
          <button
            key={opt.option_id}
            onClick={e => handleVote(e, opt.option_id)}
            disabled={!!voted || voting}
            style={{
              position: "relative", width: "100%", textAlign: "left",
              border: `1px solid ${isVoted ? T.accent : T.border}`,
              borderRadius: 10, padding: "9px 14px", cursor: voted ? "default" : "pointer",
              background: T.cardBg, overflow: "hidden", fontFamily: T.font,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => { if (!voted) e.currentTarget.style.borderColor = T.accentBorder; }}
            onMouseLeave={e => { if (!voted) e.currentTarget.style.borderColor = T.border; }}
          >
            {/* progress fill */}
            {voted && (
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${pct}%`, background: isVoted ? T.accentBg : "#F3F4F6",
                transition: "width 0.4s ease", borderRadius: 10,
              }} />
            )}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13.5, fontWeight: isVoted ? 700 : 500, color: isVoted ? T.accent : T.text1 }}>
                {isVoted && "✓ "}{opt.label}
              </span>
              {voted && (
                <span style={{ fontSize: 12, fontWeight: 700, color: isVoted ? T.accent : T.text3 }}>
                  {pct}%
                </span>
              )}
            </div>
          </button>
        );
      })}
      <p style={{ fontSize: 11.5, color: T.text3, margin: 0, fontFamily: T.font }}>
        {total} vote{total !== 1 ? "s" : ""}{voted ? "" : " · tap to vote"}
      </p>
    </div>
  );
};

/* ── Ping Card ── */
const PingCard = ({ ping, myId, onReply, onBoost, onLikeToggle, onDelete, onOpenThread, compact = false }) => {
  const isOwn = ping.user_id === myId;
  const [liked, setLiked]   = useState(ping.liked_by_me);
  const [likes, setLikes]   = useState(ping.likes);
  const [busy, setBusy]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved]   = useState(false);
  const isBoost = !!ping.boost_of_id;

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

  const actionBtn = (active, activeColor) => ({
    display: "flex", alignItems: "center", gap: 5,
    padding: "7px 10px", background: "none", border: "none",
    cursor: "pointer", borderRadius: 20, color: active ? activeColor : T.text3,
    fontSize: 13, fontWeight: 600, fontFamily: T.font, minHeight: 36,
    transition: "color 0.12s",
  });

  return (
    <div
      style={{
        background: T.cardBg, border: `1px solid ${T.border}`,
        borderRadius: compact ? 10 : 14,
        padding: compact ? "14px 16px" : "18px 20px",
        cursor: compact ? "default" : "pointer",
        transition: "border-color 0.12s", position: "relative",
      }}
      onClick={compact ? undefined : () => onOpenThread?.(ping)}
      onMouseEnter={compact ? undefined : e => e.currentTarget.style.borderColor = T.accentBorder}
      onMouseLeave={compact ? undefined : e => e.currentTarget.style.borderColor = T.border}
    >
      {/* Boost label */}
      {isBoost && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Repeat2 size={12} style={{ color: "#16a34a" }} />
          <span style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 600, fontFamily: T.font }}>
            @{ping.username} boosted
          </span>
        </div>
      )}

      {/* Boosted original */}
      {isBoost && ping.original_ping ? (
        <div style={{
          border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "12px 14px", background: "#F9F9F9", marginBottom: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Avatar username={ping.original_ping.username} size={26} src={ping.original_ping.profile_picture || ping.original_ping.avatar_url || localStorage.getItem(`profileAvatar:${ping.original_ping.user_id}`) || ""} />
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: T.font }}>@{ping.original_ping.username}</span>
            <span style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>• {timeAgo(ping.original_ping.created_at)}</span>
          </div>
          {ping.original_ping.body && (
            <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.5, fontFamily: T.font }}>
              {renderBody(ping.original_ping.body)}
            </p>
          )}
          {ping.original_ping.image_url && (
            <img src={`${API_BASE}${ping.original_ping.image_url}`} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8 }} />
          )}
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <Avatar username={ping.username} size={40} src={ping.profile_picture || ping.avatar_url || localStorage.getItem(`profileAvatar:${ping.user_id}`) || ""} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.text1, fontFamily: T.font }}>
                  {ping.display_name || ping.username}
                </span>
                <span style={{ fontSize: 12.5, color: T.text3, fontFamily: T.font }}>
                  @{ping.username}
                </span>
                {ping.badge_label && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#7c3aed",
                    background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
                    borderRadius: 20, padding: "2px 8px", fontFamily: T.font,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    🛡 {ping.badge_label}
                  </span>
                )}
                {ping.rank_label && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#d97706",
                    background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)",
                    borderRadius: 20, padding: "2px 8px", fontFamily: T.font,
                  }}>
                    🏅 {ping.rank_label}
                  </span>
                )}
                <span style={{ fontSize: 12, color: T.text3, marginLeft: "auto", fontFamily: T.font, whiteSpace: "nowrap" }}>
                  • {timeAgo(ping.created_at)}
                </span>
              </div>
            </div>

            {/* ⋯ menu */}
            <div style={{ position: "relative", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: T.text3, padding: "4px 6px", borderRadius: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = T.text1; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.text3; }}
              >
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: 30, zIndex: 100,
                  background: T.cardBg, border: `1px solid ${T.border}`,
                  borderRadius: 10, minWidth: 140,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)", overflow: "hidden",
                }}>
                  {isOwn && (
                    <button
                      onClick={() => { setMenuOpen(false); onDelete?.(ping.ping_id); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%",
                        padding: "10px 14px", background: "none", border: "none",
                        cursor: "pointer", color: "#dc2626", fontSize: 13,
                        fontFamily: T.font, textAlign: "left",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <Trash2 size={13} /> Delete ping
                    </button>
                  )}
                  <button
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, width: "100%",
                      padding: "10px 14px", background: "none", border: "none",
                      cursor: "pointer", color: T.text2, fontSize: 13,
                      fontFamily: T.font, textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F9F9F9"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    🚩 Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          {ping.body && (
            <p style={{
              fontSize: 14.5, margin: "0 50px 10px", lineHeight: 1.6,
              whiteSpace: "pre-wrap", wordBreak: "break-word",
              color: T.text1, fontFamily: T.font,
            }}>
              {renderBody(ping.body)}
            </p>
          )}

          {/* Image */}
          {ping.image_url && (
            <img
              src={`${API_BASE}${ping.image_url}`}
              alt=""
              style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 10, border: `1px solid ${T.border}` }}
              onClick={e => e.stopPropagation()}
            />
          )}

          {/* Poll */}
          {ping.poll && (
            <PollWidget poll={ping.poll} pingId={ping.ping_id} onVoted={onLikeToggle} />
          )}

          {/* Embeds */}
          {ping.machine_embed && <MachineEmbed machine={ping.machine_embed} />}
          {ping.badge_embed    && <BadgeEmbed badge={ping.badge_embed} />}
          {ping.campaign_embed && <CampaignEmbed campaign={ping.campaign_embed} />}
        </>
      )}

      {/* Action bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2,
        marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.border}`,
        flexWrap: "wrap",
      }}>
        <button
          onClick={e => { e.stopPropagation(); onReply?.(ping); }}
          style={actionBtn(false, T.accent)}
          onMouseEnter={e => e.currentTarget.style.color = T.accent}
          onMouseLeave={e => e.currentTarget.style.color = T.text3}
        >
          <MessageCircle size={15} /> {ping.replies || 0}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onBoost?.(ping); }}
          style={actionBtn(false, "#16a34a")}
          onMouseEnter={e => e.currentTarget.style.color = "#16a34a"}
          onMouseLeave={e => e.currentTarget.style.color = T.text3}
        >
          <Repeat2 size={15} /> {ping.boosts || 0}
        </button>
        <button onClick={handleLike} style={actionBtn(liked, "#dc2626")}>
          <Heart size={15} style={{ fill: liked ? "#dc2626" : "none" }} /> {likes}
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          style={actionBtn(saved, T.accent)}
          onMouseEnter={e => { if (!saved) e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { if (!saved) e.currentTarget.style.color = T.text3; }}
        >
          <Bookmark size={15} style={{ fill: saved ? T.accent : "none" }} /> Save
        </button>
        <button
          onClick={e => e.stopPropagation()}
          style={actionBtn(false, T.accent)}
          onMouseEnter={e => e.currentTarget.style.color = T.accent}
          onMouseLeave={e => e.currentTarget.style.color = T.text3}
        >
          <Share2 size={15} /> Share
        </button>
      </div>
    </div>
  );
};

/* ── Thread View ── */
const ThreadView = ({ pingId, myId, onBack, onReply, onBoost, onLikeToggle, onDelete }) => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const d = await api.getPingThread(pingId);
      setData(d);
    } catch (_) {} finally { setLoading(false); }
  }, [pingId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p style={{ color: T.text3, padding: 24, fontSize: 13, fontFamily: T.font }}>Loading thread…</p>;
  if (!data?.ping) return <p style={{ color: T.text3, padding: 24, fontFamily: T.font }}>Ping not found.</p>;

  return (
    <div>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "none", cursor: "pointer",
        color: T.text2, fontWeight: 700, fontSize: 13.5,
        padding: "0 0 14px", fontFamily: T.font,
      }}>
        <ChevronLeft size={16} /> Back
      </button>
      <PingCard ping={data.ping} myId={myId} onReply={onReply} onBoost={onBoost}
        onLikeToggle={onLikeToggle} onDelete={onDelete} compact />
      {data.replies.length > 0 && (
        <div style={{
          marginTop: 12, paddingLeft: 20,
          borderLeft: `2px solid ${T.border}`,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {data.replies.map(r => (
            <PingCard key={r.ping_id} ping={r} myId={myId} onReply={onReply} onBoost={onBoost}
              onLikeToggle={onLikeToggle} onDelete={onDelete} compact />
          ))}
        </div>
      )}
      <div style={{ marginTop: 14 }}>
        <ComposeBox replyTo={data.ping} onPosted={() => load()} onCancelReply={() => {}} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SIGNAL PAGE
═══════════════════════════════════════════════════════════ */
export default function Signal() {
  const myId = localStorage.getItem("userId") || "";

  const [pings,         setPings]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [replyTo,       setReplyTo]       = useState(null);
  const [threadId,      setThreadId]      = useState(null);
  const [boostConfirm,  setBoostConfirm]  = useState(null);
  const [sortLabel,     setSortLabel]     = useState("Latest");
  const [sortOpen,      setSortOpen]      = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSignalFeed();
      setPings(data.pings || []);
    } catch (_) {} finally { setLoading(false); }
  }, [myId]);

  useEffect(() => { load(); }, [load]);

  const handlePosted = () => { setReplyTo(null); load(); };

  const handleDelete = async (pingId) => {
    if (!window.confirm("Delete this ping?")) return;
    try {
      await api.deletePing(pingId);
      setPings(prev => prev.filter(p => p.ping_id !== pingId));
    } catch (e) { alert(e?.message || "Failed to delete."); }
  };

  const handleBoost   = (ping) => setBoostConfirm(ping);
  const confirmBoost  = async () => {
    if (!boostConfirm) return;
    try {
      await api.createPing("", null, null, boostConfirm.ping_id);
      setBoostConfirm(null);
      load();
    } catch (e) { alert(e?.message || "Boost failed."); }
  };

  if (threadId) {
    return (
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "28px 20px", fontFamily: T.font }}>
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
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "28px 20px", fontFamily: T.font, color: T.text1 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap style={{ width: 20, height: 20, color: T.accent }} />
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, margin: 0, fontFamily: T.font }}>
            Signal
          </h1>
          <span style={{ fontSize: 12, color: T.text3, fontWeight: 500, fontFamily: T.font }}>
            ping the world
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Sort dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setSortOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: T.cardBg, border: `1px solid ${T.border}`,
                borderRadius: 20, padding: "7px 14px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", color: T.text1, fontFamily: T.font,
              }}
            >
              {sortLabel} <ChevronDown size={13} />
            </button>
            {sortOpen && (
              <div style={{
                position: "absolute", right: 0, top: 38, zIndex: 100,
                background: T.cardBg, border: `1px solid ${T.border}`,
                borderRadius: 10, minWidth: 130,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)", overflow: "hidden",
              }}>
                {["Latest", "Top", "Following"].map(opt => (
                  <button key={opt} onClick={() => { setSortLabel(opt); setSortOpen(false); }} style={{
                    display: "block", width: "100%", padding: "10px 14px",
                    background: sortLabel === opt ? T.accentBg : "none",
                    border: "none", cursor: "pointer",
                    color: sortLabel === opt ? T.accent : T.text2,
                    fontSize: 13, fontWeight: sortLabel === opt ? 700 : 500,
                    fontFamily: T.font, textAlign: "left",
                  }}
                    onMouseEnter={e => { if (sortLabel !== opt) e.currentTarget.style.background = "#F9F9F9"; }}
                    onMouseLeave={e => { if (sortLabel !== opt) e.currentTarget.style.background = "none"; }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Compose ── */}
      <ComposeBox onPosted={handlePosted} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />

      {/* ── Feed ── */}
      {loading ? (
        <p style={{ color: T.text3, fontSize: 13, textAlign: "center", padding: 32, fontFamily: T.font }}>
          Loading feed…
        </p>
      ) : pings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Zap style={{ width: 36, height: 36, color: T.border, margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: T.text3, fontSize: 14, fontFamily: T.font }}>
            nothing hackers
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

      {/* ── Boost confirm ── */}
      {boostConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }} onClick={() => setBoostConfirm(null)}>
          <div style={{
            background: T.cardBg, borderRadius: 16, padding: "24px 28px", maxWidth: 380,
            border: `1px solid ${T.border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px", fontFamily: T.font }}>Boost this ping?</h3>
            <p style={{ fontSize: 13, color: T.text3, margin: "0 0 18px", fontFamily: T.font }}>
              It'll show up in your followers' feeds as a boost.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirmBoost} style={{
                flex: 1, padding: "10px", borderRadius: 30, border: "none",
                background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: 13,
                cursor: "pointer", fontFamily: T.font,
              }}>
                <Repeat2 size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                Boost
              </button>
              <button onClick={() => setBoostConfirm(null)} style={{
                flex: 1, padding: "10px", borderRadius: 30,
                border: `1px solid ${T.border}`, background: "#fff",
                color: T.text2, fontWeight: 600, fontSize: 13,
                cursor: "pointer", fontFamily: T.font,
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
