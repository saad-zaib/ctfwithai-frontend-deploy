import React, { useState } from "react";
import {
  ArrowLeft, Share2, Search, AlertCircle, CheckCircle,
  UserPlus, X, Loader, Send,
} from "lucide-react";

const C = {
  pageBg: "#fbeae2", cardBg: "#ffffff", text1: "#181818",
  text2: "#3d3d3d", text3: "#797979", border: "#e8e2db",
  accent: "#f97316", accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
};

const CampaignShare = ({ campaignId, campaignName, maxShares = 10, currentShares = 0, onBack, onDone }) => {
  const [api, setApi] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const remaining = maxShares - currentShares;

  React.useEffect(() => {
    import("../services/api").then((m) => setApi(m.default));
  }, []);

  const handleSearch = async () => {
    if (!api || !searchQuery.trim()) return;
    try {
      setSearching(true);
      setError(null);
      const res = await api.searchUsers(searchQuery.trim());
      const users = (res.users || res || []).filter(
        (u) => u.user_id !== localStorage.getItem("userId")
      );
      setSearchResults(users);
      if (users.length === 0) setError("No users found");
    } catch (e) {
      setError(e.message || "Search failed");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addUser = (user) => {
    if (selectedUsers.find((u) => u.user_id === user.user_id)) return;
    if (selectedUsers.length >= remaining) {
      setError(`You can only share with ${remaining} more user(s)`);
      return;
    }
    setSelectedUsers([...selectedUsers, user]);
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.user_id !== userId));
  };

  const handleShare = async () => {
    if (!api || selectedUsers.length === 0) return;
    try {
      setSharing(true);
      setError(null);
      const userIds = selectedUsers.map((u) => u.user_id);
      await api.shareCampaign(campaignId, userIds);
      setSuccess(`Shared with ${userIds.length} friend(s)`);
      setSelectedUsers([]);
      setTimeout(() => onDone?.(), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "36px 24px 60px" }}>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, color: C.text3,
        fontSize: 13, background: "none", border: "none", cursor: "pointer", marginBottom: 12,
      }}>
        <ArrowLeft size={14} /> Back
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text1, margin: "0 0 4px" }}>
        <Share2 size={20} style={{ verticalAlign: "middle", marginRight: 8, color: C.accent }} />
        Share Campaign
      </h2>
      <p style={{ fontSize: 12, color: C.text3, margin: "0 0 6px" }}>
        {campaignName} · {remaining} share(s) remaining (max {maxShares})
      </p>
      <p style={{ fontSize: 11, color: C.text3, margin: "0 0 20px" }}>
        Friends will get this campaign with a fixed 30-minute timer.
      </p>

      {/* Messages */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
          padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#dc2626",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={14} /> <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={12} color="#dc2626" />
          </button>
        </div>
      )}
      {success && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10,
          padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#16a34a",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14,
        }}>
          {selectedUsers.map((u) => (
            <span key={u.user_id} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
              borderRadius: 8, background: C.accentBg, border: `1px solid ${C.accentBdr}`,
              fontSize: 12, color: C.accent, fontWeight: 600,
            }}>
              {u.username || u.email}
              <button onClick={() => removeUser(u.user_id)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={12} color={C.accent} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{
        background: C.cardBg, borderRadius: 14, border: `1px solid ${C.border}`,
        overflow: "hidden", marginBottom: 14,
      }}>
        <div style={{
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <Search size={14} color={C.text3} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by username or email..."
            style={{
              flex: 1, border: "none", outline: "none", fontSize: 13,
              background: "transparent", color: C.text1,
            }}
          />
          <button onClick={handleSearch} disabled={searching}
            style={{
              fontSize: 12, fontWeight: 600, color: C.accent, padding: "4px 10px",
              borderRadius: 6, background: C.accentBg, border: "none", cursor: "pointer",
            }}>
            {searching ? <Loader size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : "Search"}
          </button>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div style={{ maxHeight: 250, overflowY: "auto" }}>
            {searchResults.map((user) => {
              const alreadySelected = selectedUsers.find((u) => u.user_id === user.user_id);
              return (
                <div key={user.user_id} style={{
                  padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, margin: 0 }}>
                      {user.username}
                    </p>
                    <p style={{ fontSize: 11, color: C.text3, margin: 0 }}>{user.email}</p>
                  </div>
                  <button
                    onClick={() => addUser(user)}
                    disabled={!!alreadySelected}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6,
                      border: "none", cursor: alreadySelected ? "default" : "pointer",
                      background: alreadySelected ? "#10b98115" : C.accentBg,
                      color: alreadySelected ? "#10b981" : C.accent,
                    }}
                  >
                    {alreadySelected ? <><CheckCircle size={11} /> Added</> : <><UserPlus size={11} /> Add</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share button */}
      <button onClick={handleShare} disabled={selectedUsers.length === 0 || sharing}
        style={{
          width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
          background: selectedUsers.length === 0 || sharing
            ? C.border : "linear-gradient(135deg, #f97316, #fb923c)",
          color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: selectedUsers.length === 0 || sharing ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
        {sharing ? <><Loader size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Sharing...</>
          : <><Send size={14} /> Share with {selectedUsers.length} Friend{selectedUsers.length !== 1 ? "s" : ""}</>}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CampaignShare;
