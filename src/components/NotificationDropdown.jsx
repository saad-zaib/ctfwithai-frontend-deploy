import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, UserPlus, UserCheck, UserMinus, Check } from "lucide-react";
import api from "../services/api";

const C = {
  cardBg: "#ffffff", text1: "#181818", text2: "#3d3d3d", text3: "#797979",
  border: "#e8e2db", accent: "#f97316", accentBg: "rgba(249,115,22,0.08)",
  green: "#16a34a", greenBg: "rgba(22,163,74,0.08)", greenBdr: "rgba(22,163,74,0.22)",
  red: "#dc2626", redBg: "rgba(220,38,38,0.08)",
};

const ICONS = {
  friend_request:  { Icon: UserPlus,  color: C.accent },
  friend_accepted: { Icon: UserCheck, color: C.green },
  friend_declined: { Icon: UserMinus, color: C.red },
};

const timeAgo = (isoStr) => {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationDropdown = () => {
  const userId = localStorage.getItem("userId") || "";
  const [open, setOpen]         = useState(false);
  const [notifs, setNotifs]     = useState([]);
  const [unread, setUnread]     = useState(0);
  const [loading, setLoading]   = useState(false);
  const ref = useRef(null);

  // Poll unread count every 30s
  const fetchCount = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.getUnreadCount(userId);
      setUnread(data.unread_count || 0);
    } catch (_) {}
  }, [userId]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openDropdown = async () => {
    setOpen(o => !o);
    if (!open && userId) {
      setLoading(true);
      try {
        const data = await api.getNotifications(userId, 20);
        setNotifs(data.notifications || []);
        setUnread(data.unread_count || 0);
      } catch (_) {}
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await api.markNotificationsRead(userId, null);
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch (_) {}
  };

  const handleAction = async (notif, action) => {
    try {
      if (action === "accept") await api.respondFriendRequest(parseInt(notif.ref_id), "accepted");
      if (action === "decline") await api.respondFriendRequest(parseInt(notif.ref_id), "declined");
      await api.markNotificationsRead(userId, [notif.notif_id]);
      setNotifs(prev => prev.map(n =>
        n.notif_id === notif.notif_id ? { ...n, read: true } : n
      ));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (e) { alert(e?.message || "Action failed"); }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={openDropdown}
        style={{
          position: "relative", background: "none", border: "none",
          cursor: "pointer", padding: "6px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        title="Notifications"
      >
        <Bell style={{ width: 20, height: 20, color: "#3d3d3d" }} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            width: 16, height: 16, borderRadius: "50%",
            background: C.red, color: "white",
            fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid white",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 340, maxHeight: 460, overflowY: "auto",
          background: C.cardBg, border: `1px solid ${C.border}`,
          borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 9999,
        }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px 10px", borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{
                fontSize: 11.5, color: C.accent, background: "none",
                border: "none", cursor: "pointer", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Check style={{ width: 12, height: 12 }} /> Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <p style={{ padding: "20px 16px", fontSize: 13, color: C.text3 }}>Loading...</p>
          ) : notifs.length === 0 ? (
            <p style={{ padding: "24px 16px", fontSize: 13, color: C.text3, textAlign: "center" }}>
              No notifications yet.
            </p>
          ) : (
            <div>
              {notifs.map(n => {
                const { Icon, color } = ICONS[n.notif_type] || { Icon: Bell, color: C.accent };
                const isPending = n.notif_type === "friend_request" && !n.read;
                return (
                  <div key={n.notif_id} style={{
                    padding: "12px 16px",
                    background: n.read ? "transparent" : C.accentBg,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex", gap: 12, alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: `${color}18`, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon style={{ width: 15, height: 15, color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: C.text1, margin: "0 0 3px", lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: 11, color: C.text3, margin: 0 }}>
                        {timeAgo(n.created_at)}
                      </p>
                      {isPending && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <button onClick={() => handleAction(n, "accept")} style={{
                            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                            color: C.green, background: C.greenBg, border: `1px solid ${C.greenBdr}`,
                            cursor: "pointer",
                          }}>Accept</button>
                          <button onClick={() => handleAction(n, "decline")} style={{
                            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            color: C.text3, background: "#f5f3f0", border: `1px solid ${C.border}`,
                            cursor: "pointer",
                          }}>Decline</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
