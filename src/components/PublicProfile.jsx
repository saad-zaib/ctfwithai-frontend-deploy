import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserCheck, UserPlus, UserMinus, Clock, Lock, Shield, Star, Zap, Trophy } from "lucide-react";
import api from "../services/api";

const C = {
  pageBg: "#fbeae2", cardBg: "#ffffff", text1: "#181818", text2: "#3d3d3d",
  text3: "#797979", border: "#e8e2db", accent: "#f97316",
  accentBg: "rgba(249,115,22,0.08)", accentBdr: "rgba(249,115,22,0.22)",
  green: "#16a34a", greenBg: "rgba(22,163,74,0.08)", greenBdr: "rgba(22,163,74,0.22)",
  purple: "#7c3aed", purpleBg: "rgba(124,58,237,0.08)", purpleBdr: "rgba(124,58,237,0.22)",
  red: "#dc2626", redBg: "rgba(220,38,38,0.08)",
};

const SkillBar = ({ category, score }) => {
  const color = score >= 70 ? C.green : score >= 40 ? C.accent : C.purple;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{category}</span>
        <span style={{ fontSize: 12, color: C.text3 }}>{score}/100</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${score}%`, background: color, transition: "width 0.7s ease",
        }} />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    flex: 1, minWidth: 90, textAlign: "center", padding: "14px 8px",
    background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12,
  }}>
    <Icon style={{ width: 18, height: 18, color: color || C.accent, margin: "0 auto 6px" }} />
    <div style={{ fontSize: 22, fontWeight: 800, color: C.text1 }}>{value}</div>
    <div style={{ fontSize: 11, color: C.text3 }}>{label}</div>
  </div>
);

const FriendButton = ({ status, friendshipId, targetId, onAction }) => {
  const [busy, setBusy] = useState(false);

  const handle = async (action) => {
    setBusy(true);
    try {
      if (action === "send") await api.sendFriendRequest(targetId);
      else if (action === "accept") await api.respondFriendRequest(friendshipId, "accepted");
      else if (action === "decline") await api.respondFriendRequest(friendshipId, "declined");
      else if (action === "remove") await api.removeFriend(targetId);
      onAction();
    } catch (e) {
      alert(e?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  if (status === "friends") return (
    <button onClick={() => handle("remove")} disabled={busy} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "9px 16px", borderRadius: 30, border: `1px solid ${C.greenBdr}`,
      background: C.greenBg, color: C.green, fontWeight: 700, fontSize: 13, cursor: "pointer",
    }}>
      <UserCheck style={{ width: 15, height: 15 }} /> Friends
    </button>
  );

  if (status === "request_sent") return (
    <button disabled style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "9px 16px", borderRadius: 30, border: `1px solid ${C.border}`,
      background: "#f5f3f0", color: C.text3, fontWeight: 600, fontSize: 13,
    }}>
      <Clock style={{ width: 15, height: 15 }} /> Request Sent
    </button>
  );

  if (status === "request_received") return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => handle("accept")} disabled={busy} style={{
        padding: "9px 14px", borderRadius: 30, border: `1px solid ${C.greenBdr}`,
        background: C.greenBg, color: C.green, fontWeight: 700, fontSize: 13, cursor: "pointer",
      }}>Accept</button>
      <button onClick={() => handle("decline")} disabled={busy} style={{
        padding: "9px 14px", borderRadius: 30, border: `1px solid ${C.border}`,
        background: "#f5f3f0", color: C.text3, fontWeight: 600, fontSize: 13, cursor: "pointer",
      }}>Decline</button>
    </div>
  );

  return (
    <button onClick={() => handle("send")} disabled={busy} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "9px 16px", borderRadius: 30, border: `1px solid ${C.accentBdr}`,
      background: C.accentBg, color: C.accent, fontWeight: 700, fontSize: 13, cursor: "pointer",
    }}>
      <UserPlus style={{ width: 15, height: 15 }} /> Add Friend
    </button>
  );
};

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const myId = localStorage.getItem("userId") || "";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await api.getPublicProfile(username);
      setProfile(data);
    } catch (e) {
      setError(e?.message || "User not found.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: C.text3 }}>Loading profile...</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
      <p style={{ color: C.red, fontSize: 14 }}>{error}</p>
      <button onClick={() => navigate(-1)} style={{
        marginTop: 16, padding: "8px 20px", borderRadius: 30,
        border: `1px solid ${C.border}`, background: C.cardBg, cursor: "pointer",
      }}>Go Back</button>
    </div>
  );

  const isOwn = profile.user_id === myId;
  const skills = profile.skills || {};
  const recentSolves = profile.recent_solves || [];

  return (
    <div style={{
      maxWidth: 820, margin: "0 auto", padding: "34px 24px",
      fontFamily: "'DM Sans','Inter',sans-serif", color: C.text1,
    }}>
      {/* Header */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: "24px 28px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 800, color: "white", flexShrink: 0,
        }}>
          {(profile.username || "?")[0].toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{profile.username}</h1>
            {profile.is_private && (
              <span style={{
                fontSize: 11, display: "flex", alignItems: "center", gap: 4,
                color: C.text3, background: "#f5f3f0", borderRadius: 20,
                padding: "3px 9px", border: `1px solid ${C.border}`,
              }}>
                <Lock style={{ width: 10, height: 10 }} /> Private
              </span>
            )}
          </div>
          {profile.full_name && (
            <p style={{ fontSize: 13.5, color: C.text3, marginTop: 3 }}>{profile.full_name}</p>
          )}
          {profile.bio && (
            <p style={{ fontSize: 13, color: C.text2, marginTop: 5, lineHeight: 1.5 }}>{profile.bio}</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
            <p style={{ fontSize: 12.5, color: C.text3, margin: 0 }}>
              Rank #{profile.rank || "—"}
            </p>
            {profile.location && (
              <span style={{ fontSize: 12.5, color: C.text3 }}>📍 {profile.location}</span>
            )}
            {profile.website && (
              <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank" rel="noreferrer"
                style={{ fontSize: 12.5, color: C.accent, textDecoration: "none" }}>
                🔗 {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {!isOwn && (
          <FriendButton
            status={profile.friendship_status}
            friendshipId={null}
            targetId={profile.user_id}
            onAction={load}
          />
        )}
      </div>

      {/* Private locked state */}
      {profile.is_private && profile.friendship_status !== 'friends' && !isOwn ? (
        <div style={{
          background: C.cardBg, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "48px 28px", textAlign: "center",
        }}>
          <Shield style={{ width: 40, height: 40, color: C.text3, margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>This profile is private</h3>
          <p style={{ color: C.text3, fontSize: 13.5 }}>
            Send a friend request to see {profile.username}'s stats and progress.
          </p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <StatCard icon={Trophy}  label="Points"       value={profile.total_points || 0}     color={C.accent} />
            <StatCard icon={Zap}     label="Solved"       value={profile.machines_solved || 0}  color={C.green} />
            <StatCard icon={Star}    label="Streak"       value={`${profile.current_streak || 0}d`} color={C.purple} />
            <StatCard icon={Shield}  label="Best Streak"  value={`${profile.longest_streak || 0}d`} color={C.accent} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
            {/* Skills */}
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: 20,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Skill Profile</h3>
              {Object.keys(skills).length > 0
                ? Object.entries(skills).map(([cat, score]) => (
                    <SkillBar key={cat} category={cat} score={score} />
                  ))
                : <p style={{ fontSize: 13, color: C.text3 }}>No solves yet.</p>
              }
            </div>

            {/* Recent Solves */}
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: 20,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Recent Solves</h3>
              {recentSolves.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentSolves.map((s, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", borderRadius: 10,
                      background: "#f9f7f5", border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        {(s.machine_id || "Challenge").slice(0, 16)}
                      </span>
                      <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>✓ Solved</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: C.text3 }}>No solves yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PublicProfile;
