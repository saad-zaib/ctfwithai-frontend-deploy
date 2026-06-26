import React, { useState, useEffect, useCallback } from "react";
import { User, Award, Target, Trophy, Loader, AlertCircle, Camera, Upload } from "lucide-react";
import api from "../services/api";

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
};

const getProfileDraftStorageKey = (userId) => `profileDraft:${userId || "anonymous"}`;
const getProfileAvatarStorageKey = (userId) => `profileAvatar:${userId || "anonymous"}`;

const Profile = () => {
  const [userId] = useState(() => localStorage.getItem("userId") || "");
  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [draft, setDraft] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
  });

  const fetchUserProgress = useCallback(async () => {
    if (!userId) {
      setError("You are not logged in.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getUserProgress(userId);
      setUserProgress(data || null);
    } catch (err) {
      setError(err?.message || "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  useEffect(() => {
    const key = getProfileDraftStorageKey(userId);
    const saved = localStorage.getItem(key);
    const avatarCache = localStorage.getItem(getProfileAvatarStorageKey(userId)) || "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved) || {};
        setDraft((prev) => ({ ...prev, ...parsed }));
        if (parsed.avatar || avatarCache) setAvatarFileName("Current profile photo");
      } catch {
        // Ignore invalid cached profile draft.
      }
    } else if (avatarCache) {
      setAvatarFileName("Current profile photo");
    }
    setIsDraftReady(true);
  }, [userId]);

  const user = userProgress?.user || {};

  useEffect(() => {
    if (!isDraftReady) return;
    const currentUsername = user.username || localStorage.getItem("username") || "User";
    const currentEmail = user.email || "";
    setDraft((prev) => ({
      ...prev,
      username: prev.username || currentUsername,
      email: prev.email || currentEmail,
    }));
  }, [isDraftReady, user.username, user.email]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 62px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          <p style={{ color: C.text3, fontSize: 13 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 62px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: "100%",
            background: C.cardBg,
            border: "1px solid rgba(220,38,38,.24)",
            borderRadius: 12,
            padding: "24px 22px",
            boxShadow: `0 6px 24px ${C.shadow}`,
            textAlign: "center",
          }}
        >
          <AlertCircle
            style={{
              width: 38,
              height: 38,
              color: "#dc2626",
              margin: "0 auto 10px",
            }}
          />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text1, marginBottom: 6 }}>
            Error Loading Profile
          </h2>
          <p style={{ color: C.text3, fontSize: 13, marginBottom: 16 }}>{error}</p>
          <button
            onClick={fetchUserProgress}
            style={{
              padding: "10px 18px",
              borderRadius: 30,
              border: "none",
              background: C.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const campaigns = userProgress?.campaigns || [];
  const submissions = userProgress?.recent_submissions || [];
  const username = user.username || localStorage.getItem("username") || "User";
  const role = user.role || localStorage.getItem("role") || "individual";
  const email = user.email || "";
  const effectiveUsername = draft.username?.trim() || username;
  const effectiveEmail = draft.email?.trim() || email;
  const effectiveAvatar =
    draft.avatar || localStorage.getItem(getProfileAvatarStorageKey(userId)) || "";
  const initial = effectiveUsername.slice(0, 1).toUpperCase();

  const stats = [
    { icon: Award, label: "Total Points", value: user.total_points || 0 },
    { icon: Target, label: "Machines Solved", value: user.machines_solved || 0 },
    { icon: Trophy, label: "Campaigns Completed", value: user.campaigns_completed || 0 },
    { icon: User, label: "Global Rank", value: user.rank ? `#${user.rank}` : "N/A" },
  ];

  const handleDraftChange = (field, value) => {
    setSaveMessage("");
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveMessage("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handleDraftChange("avatar", String(reader.result || ""));
      setAvatarFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const nextUsername = draft.username.trim();
    if (!nextUsername) {
      setSaveMessage("Username cannot be empty.");
      return;
    }

    if (nextUsername !== username) {
      const confirmed = window.confirm(
        `Change username from "${username}" to "${nextUsername}"?`,
      );
      if (!confirmed) return;
    }

    const payload = {
      username: nextUsername,
      email,
      bio: draft.bio.trim(),
      location: draft.location.trim(),
      website: draft.website.trim(),
      avatar: draft.avatar,
    };
    localStorage.setItem(getProfileDraftStorageKey(userId), JSON.stringify(payload));
    if (payload.username) localStorage.setItem("username", payload.username);
    if (payload.avatar) localStorage.setItem(getProfileAvatarStorageKey(userId), payload.avatar);
    else localStorage.removeItem(getProfileAvatarStorageKey(userId));
    setSaveMessage("Profile changes saved.");
  };

  const handleResetDraft = () => {
    setDraft({
      username,
      email,
      bio: "",
      location: "",
      website: "",
      avatar: "",
    });
    localStorage.removeItem(getProfileDraftStorageKey(userId));
    localStorage.removeItem(getProfileAvatarStorageKey(userId));
    setAvatarFileName("");
    setSaveMessage("Profile draft reset.");
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "34px 28px",
        color: C.text1,
        fontFamily: "'DM Sans','Inter',sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, marginBottom: 5 }}>
          Your Profile
        </h1>
        <p style={{ color: C.text3, fontSize: 13.5 }}>
          Track your progress, campaigns, and recent submissions.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "22px 18px",
            boxShadow: "none",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                margin: "0 auto 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.accent,
                color: "#fff",
                fontSize: 28,
                fontWeight: 800,
                overflow: "hidden",
              }}
            >
              {effectiveAvatar ? (
                <img
                  src={effectiveAvatar}
                  alt={effectiveUsername}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initial
              )}
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 2 }}>{effectiveUsername}</h2>
            <p style={{ color: C.text3, fontSize: 12.5, marginBottom: 10 }}>{effectiveEmail}</p>
            <span style={{ fontSize: 12, color: C.text3 }}>
              {role.replace("_", " ")}
            </span>
          </div>
        </div>

        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "18px",
            boxShadow: "none",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Statistics</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0,1fr))",
              gap: 10,
            }}
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  border: `1px solid ${C.border}`,
                  background: C.sectionBg,
                  borderRadius: 12,
                  padding: "12px 10px",
                  textAlign: "center",
                }}
              >
                <Icon style={{ width: 18, height: 18, color: C.accent, margin: "0 auto 6px" }} />
                <p style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.05, marginBottom: 4 }}>
                  {value}
                </p>
                <p style={{ fontSize: 11.5, color: C.text3 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "18px",
          boxShadow: "none",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Account Settings</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: 10,
          }}
        >
          <input
            value={draft.username}
            onChange={(e) => handleDraftChange("username", e.target.value)}
            placeholder="Username"
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
            }}
          />
          <input
            value={draft.email}
            placeholder="Email"
            readOnly
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
              background: "#f6f4f2",
              color: C.text3,
              cursor: "not-allowed",
            }}
          />
          <input
            value={draft.location}
            onChange={(e) => handleDraftChange("location", e.target.value)}
            placeholder="Location"
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
            }}
          />
          <input
            value={draft.website}
            onChange={(e) => handleDraftChange("website", e.target.value)}
            placeholder="Website"
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
            }}
          />
          <textarea
            value={draft.bio}
            onChange={(e) => handleDraftChange("bio", e.target.value)}
            placeholder="Short bio"
            rows={3}
            style={{
              gridColumn: "1 / -1",
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              id="profile-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor="profile-avatar-upload"
              style={{
                border: `1px dashed ${C.border}`,
                background: C.sectionBg,
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: C.accentBg,
                    border: `1px solid ${C.accentBdr}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.accent,
                  }}
                >
                  <Camera style={{ width: 16, height: 16 }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>
                    Upload profile photo
                  </p>
                  <p style={{ fontSize: 11.5, color: C.text3 }}>
                    PNG or JPG up to 5MB
                  </p>
                </div>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.accent,
                  border: `1px solid ${C.accentBdr}`,
                  background: C.accentBg,
                  borderRadius: 30,
                  padding: "6px 10px",
                }}
              >
                <Upload style={{ width: 12, height: 12 }} />
                Choose
              </span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <p style={{ fontSize: 12, color: C.text3 }}>
                {avatarFileName || (effectiveAvatar ? "Current profile photo" : "No file selected")}
              </p>
              {effectiveAvatar ? (
                <button
                  onClick={() => {
                    handleDraftChange("avatar", "");
                    setAvatarFileName("");
                  }}
                  style={{
                    border: `1px solid ${C.border}`,
                    background: C.sectionBg,
                    borderRadius: 10,
                    padding: "7px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <button
            onClick={handleSaveProfile}
            style={{
              border: "none",
              background: C.accent,
              color: "#fff",
              borderRadius: 30,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
          <button
            onClick={handleResetDraft}
            style={{
              border: `1px solid ${C.border}`,
              background: C.cardBg,
              color: C.text2,
              borderRadius: 30,
              padding: "9px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          {saveMessage ? <span style={{ fontSize: 12, color: C.text3 }}>{saveMessage}</span> : null}
        </div>
      </div>

      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "18px",
          boxShadow: "none",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Your Campaigns</h3>
        {campaigns.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {campaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  background: C.sectionBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {campaign.campaign_name || campaign.campaign_id || "Campaign"}
                  </p>
                  <p style={{ fontSize: 12, color: C.text3 }}>
                    Level {campaign.difficulty || "-"} · {campaign.machine_count || 0} machines
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 30,
                      padding: "4px 10px",
                      color: campaign.completed ? "#15803d" : C.accent,
                      background: campaign.completed
                        ? "rgba(21,128,61,0.08)"
                        : C.accentBg,
                      border: campaign.completed
                        ? "1px solid rgba(21,128,61,0.2)"
                        : `1px solid ${C.accentBdr}`,
                    }}
                  >
                    {campaign.completed ? "Completed" : "In Progress"}
                  </span>
                  <p style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>
                    {campaign.total_points || 0} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: C.text3 }}>
            No campaigns yet. Start your first campaign to see progress here.
          </p>
        )}
      </div>

      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "18px",
          boxShadow: "none",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Recent Submissions</h3>
        {submissions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {submissions.map((submission) => (
              <div
                key={submission.submission_id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  background: C.sectionBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: submission.correct ? "#16a34a" : "#dc2626",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>
                      {submission.machine_name || submission.machine_id || "Machine"}
                    </p>
                    <p style={{ fontSize: 11.5, color: C.text3 }}>
                      {submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleString()
                        : "Unknown time"}
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.accent, flexShrink: 0 }}>
                  +{submission.points_awarded || 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: C.text3 }}>
            No submissions yet. Solve a machine to see activity.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
