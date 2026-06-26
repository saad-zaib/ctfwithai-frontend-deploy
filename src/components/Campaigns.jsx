import React, { useState, useEffect, useCallback } from "react";
import {
  Zap,
  Plus,
  Target,
  AlertCircle,
  CheckCircle,
  Loader,
  ChevronRight,
  Layers,
  BookOpen,
  Clock,
  ArrowUpRight,
  X,
  Search,
  Share2,
  UserPlus,
} from "lucide-react";
import CampaignShare from "./CampaignShare";
import CampaignAssign from "./CampaignAssign";

const CAT_META = {
  injection: { color: "#3b82f6", label: "Injection", emoji: "💉" },
  authentication: { color: "#10b981", label: "Authentication", emoji: "🔐" },
  authorization: { color: "#f59e0b", label: "Authorization", emoji: "🛡️" },
  cryptography: { color: "#f97316", label: "Cryptography", emoji: "🔒" },
  web: { color: "#ec4899", label: "Web", emoji: "🌐" },
  default: { color: "#6b7280", label: "Other", emoji: "📦" },
};


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

/* ── Progress Ring ── */
const ProgressRing = ({ pct, size = 44, stroke = 4, color = C.accent }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={C.border}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
};

/* ── Campaigns Page ── */
const Campaigns = () => {
  const [userId] = useState(() => localStorage.getItem("userId") || "");
  const [isCreating, setIsCreating] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [createdCampaign, setCreatedCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [timeLimit, setTimeLimit] = useState(30);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [assignedCampaigns, setAssignedCampaigns] = useState([]);
  const [assignmentsByCampaign, setAssignmentsByCampaign] = useState({});
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sharingCampaign, setSharingCampaign] = useState(null);
  const role = localStorage.getItem("role") || "individual";
  const [api, setApi] = useState(null);

  const fetchMyCampaigns = useCallback(async () => {
    if (!api) return;
    try {
      setLoadingCampaigns(true);
      const normalizeAssigned = (items) =>
        (items || []).map((item) => {
          if (item?.campaign && typeof item.campaign === "object") {
            const { campaign, ...assignment } = item;
            return { ...campaign, assignment };
          }
          return item;
        });

      const [res, assignedRes] = await Promise.all([
        api.getUserCampaigns(),
        api.getAssignedCampaigns().catch(() => ({ campaigns: [] })),
      ]);

      const owned = res?.campaigns || [];
      const assigned = normalizeAssigned(
        assignedRes?.campaigns || assignedRes?.assignments || [],
      );

      setMyCampaigns(owned);
      setAssignedCampaigns(assigned);

      if (role === "enterprise_staff" && owned.length > 0) {
        const assignmentPairs = await Promise.all(
          owned.map(async (campaign) => {
            const resp = await api
              .getCampaignAssignments(campaign.campaign_id)
              .catch(() => ({ assignments: [] }));
            return [campaign.campaign_id, resp.assignments || []];
          }),
        );
        setAssignmentsByCampaign(Object.fromEntries(assignmentPairs));
      } else {
        setAssignmentsByCampaign({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [api, role]);

  useEffect(() => {
    import("../services/api").then((m) => setApi(m.default));
  }, []);
  useEffect(() => {
    if (api) fetchMyCampaigns();
  }, [api, fetchMyCampaigns]);
  useEffect(() => {
    if (!userId) window.location.href = "/login";
  }, [userId]);

  const fetchMachines = async () => {
    if (!api) return;
    try {
      setLoadingMachines(true);
      const res = await api.getMachines();
      const machines = res.machines || res || [];
      setAvailableMachines(machines.filter((m) => !m.deleted_at)); // Expose all non-deleted machines
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMachines(false);
    }
  };

  const filteredCampaigns = myCampaigns.filter((c) =>
    (c.campaign_name || "")
      .toLowerCase()
      .includes(campaignSearch.toLowerCase()),
  );
  const filteredAssignedCampaigns = assignedCampaigns.filter((c) =>
    (c.campaign_name || "")
      .toLowerCase()
      .includes(campaignSearch.toLowerCase()),
  );

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      setError("Please enter a campaign name");
      return;
    }
    if (selectedMachines.length === 0) {
      setError("Please select at least one machine");
      return;
    }
    try {
      setIsCreating(true);
      setError(null);
      const campaign = await api.createCampaign(
        campaignName,
        selectedMachines,
        role === "individual" ? 30 : timeLimit,
      );
      setCreatedCampaign(campaign);
      setCampaignName("");
      setSelectedMachines([]);
      fetchMyCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const navigateToCampaign = (id) => {
    window.location.href = `/campaigns/${id}`;
  };

  if (!api)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader
          style={{
            width: 36,
            height: 36,
            color: C.accent,
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.pageBg,
        fontFamily: "'DM Sans','Inter',sans-serif",
        color: C.text1,
        position: "relative",
      }}
    >

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .anim-row { animation: fadeUp 0.4s ease both; }

        .cp-input {
          width:100%; padding:10px 15px;
          background:${C.sectionBg}; border:1px solid ${C.border};
          border-radius:10px; color:${C.text1}; font-size:13.5px;
          font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s;
        }
        .cp-input::placeholder { color:#c9c2bb; }
        .cp-input:focus { border-color:${C.accent}; }

        .cp-search {
          padding:8px 14px 8px 34px;
          background:${C.cardBg}; border:1px solid ${C.border};
          border-radius:30px; color:${C.text1}; font-size:12.5px;
          font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s; width:200px;
        }
        .cp-search::placeholder { color:#c9c2bb; }
        .cp-search:focus { border-color:${C.accent}; }

        .cp-btn-primary {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 20px; border-radius:30px; background:${C.accent}; color:#fff;
          font-family:'DM Sans',sans-serif; font-weight:700; font-size:13.5px;
          border:none; cursor:pointer; text-decoration:none;
          box-shadow:0 4px 18px rgba(249,115,22,0.28);
          transition:all .22s ease;
        }
        .cp-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(249,115,22,0.38); background:#e8660a; }
        .cp-btn-primary:active { transform:scale(.98); }
        .cp-btn-primary:disabled { background:rgba(249,115,22,.4); cursor:not-allowed; box-shadow:none; transform:none; }

        .cp-row:hover { background:rgba(249,115,22,0.04); }
        .cp-row { transition:background .2s; cursor:pointer; }
        .cp-row:hover .row-arrow { color:${C.accent}; }
        .row-arrow { color:${C.border}; transition:color .2s; }

        .machine-row:hover { background:${C.accentBg}; }
        .machine-row { transition:background .2s; cursor:pointer; }

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
              campaignId={sharingCampaign.id}
              campaignName={sharingCampaign.name}
              onBack={() => setSharingCampaign(null)}
              onDone={() => setSharingCampaign(null)}
            />
          ) : (
            <CampaignShare
              campaignId={sharingCampaign.id}
              campaignName={sharingCampaign.name}
              onBack={() => setSharingCampaign(null)}
              onDone={() => setSharingCampaign(null)}
            />
          )
        ) : (
          <>
            {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 28,
            animation: "fadeUp .35s ease both",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
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
                }}
              >
                <Target style={{ width: 17, height: 17, color: C.accent }} />
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
                Campaign Manager
              </h1>
            </div>
            <p
              style={{
                color: C.text3,
                fontSize: 13.5,
                marginLeft: 44,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Create, manage, and track your cybersecurity campaigns
            </p>
          </div>
          <button
            className="cp-btn-primary"
            onClick={() => {
              setShowCreateForm(true);
              setCreatedCampaign(null);
              setError(null);
              fetchMachines();
            }}
          >
            <Plus style={{ width: 15, height: 15 }} /> New Campaign
          </button>
        </div>

        {/* ── Stats row ── */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 28,
            animation: "fadeUp .4s ease .06s both",
          }}
        >
          {[
            {
              icon: Layers,
              label: "Total Campaigns",
              value: myCampaigns.length,
              color: C.accent,
            },
            {
              icon: BookOpen,
              label: "Assigned To Me",
              value: assignedCampaigns.length,
              color: C.accent,
            },
            {
              icon: CheckCircle,
              label: "Completed",
              value: myCampaigns.filter(
                (c) => (c.progress_percentage || 0) >= 100,
              ).length,
              color: C.accent,
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: 220,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.icon style={{ width: 18, height: 18, color: s.color }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.text1,
                    fontFamily: "'DM Sans',sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: C.text3,
                    marginTop: 3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Assigned Campaigns (student/friend view) ── */}
        {!loadingCampaigns && filteredAssignedCampaigns.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.text1,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Assigned Campaigns
              </h3>
              <span
                style={{
                  fontSize: 11,
                  color: C.accent,
                  fontWeight: 700,
                }}
              >
                {filteredAssignedCampaigns.length}
              </span>
            </div>
            <div
              style={{
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {filteredAssignedCampaigns.map((campaign, idx) => {
                const assignment = campaign.assignment || {};
                return (
                  <div
                    key={`assigned-${campaign.campaign_id}`}
                    className="anim-row cp-row"
                    style={{
                      animationDelay: `${idx * 0.04}s`,
                      borderBottom:
                        idx < filteredAssignedCampaigns.length - 1
                          ? `1px solid ${C.border}`
                          : "none",
                    }}
                    onClick={() => navigateToCampaign(campaign.campaign_id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "14px 20px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.text1,
                            fontFamily: "'DM Sans',sans-serif",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {campaign.campaign_name || "Assigned Campaign"}
                        </p>
                        <p
                          style={{
                            marginTop: 2,
                            fontSize: 11,
                            color: C.text3,
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          {campaign.machine_count || 0} machines · {campaign.time_limit_minutes || 30} min · {(assignment.status || "pending").toUpperCase()}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="row-arrow"
                        style={{ width: 16, height: 16, flexShrink: 0 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Campaign List ── */}
        <div style={{ animation: "fadeUp .4s ease .12s both" }}>
          {/* search + count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  width: 13,
                  height: 13,
                  color: C.text3,
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                placeholder="Search campaigns…"
                className="cp-search"
              />
            </div>
            <span
              style={{
                fontSize: 12,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {filteredCampaigns.length} campaign
              {filteredCampaigns.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingCampaigns ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 0",
              }}
            >
              <Loader
                style={{
                  width: 28,
                  height: 28,
                  color: C.accent,
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div
              style={{
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "64px 24px",
                textAlign: "center",
              }}
            >
              <Target
                style={{
                  width: 44,
                  height: 44,
                  color: C.border,
                  margin: "0 auto 12px",
                }}
              />
              <p
                style={{
                  color: C.text3,
                  fontSize: 13.5,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                No campaigns yet — click{" "}
                <span style={{ color: C.accent, fontWeight: 700 }}>
                  New Campaign
                </span>{" "}
                to get started
              </p>
            </div>
          ) : (
            <div
              style={{
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {filteredCampaigns.map((campaign, idx) => {
                const pct = Math.round(campaign.progress_percentage || 0);
                const isComplete = pct >= 100;
                const assignedStudents = assignmentsByCampaign[campaign.campaign_id] || [];
                return (
                  <div
                    key={campaign.campaign_id}
                    className="anim-row cp-row"
                    style={{
                      animationDelay: `${idx * 0.04}s`,
                      borderBottom:
                        idx < filteredCampaigns.length - 1
                          ? `1px solid ${C.border}`
                          : "none",
                    }}
                    onClick={() => navigateToCampaign(campaign.campaign_id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "16px 20px",
                      }}
                    >
                      {/* ring */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <ProgressRing
                          pct={pct}
                          color={isComplete ? "#16a34a" : C.accent}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isComplete ? (
                            <CheckCircle
                              style={{
                                width: 18,
                                height: 18,
                                color: "#16a34a",
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                color: C.text1,
                                fontFamily: "'DM Sans',sans-serif",
                              }}
                            >
                              {pct}%
                            </span>
                          )}
                        </div>
                      </div>
                      {/* info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 3,
                          }}
                        >
                          <h3
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: isComplete ? "#16a34a" : C.text1,
                              fontFamily: "'DM Sans',sans-serif",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {campaign.campaign_name || "Unnamed Campaign"}
                          </h3>
                          {isComplete && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "#16a34a",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              ✓ Complete
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 8,
                            fontSize: 12,
                            color: C.text3,
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          <span>{campaign.machine_count} machines</span>
                          <span>·</span>
                          <span>{campaign.machines_solved || 0} solved</span>
                          {campaign.created_at && (
                            <>
                              <span>·</span>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Clock style={{ width: 11, height: 11 }} />
                                {new Date(
                                  campaign.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </>
                          )}
                          {role === "enterprise_staff" && (
                            <>
                              <span>·</span>
                              <span style={{ color: C.accent, fontWeight: 600 }}>
                                assigned: {assignedStudents.length}
                              </span>
                              {assignedStudents.length > 0 && (
                                <span style={{ color: C.text3 }}>
                                  ({assignedStudents.slice(0, 3).map((s) => s.full_name || s.username || s.email).join(", ")}{assignedStudents.length > 3 ? ", ..." : ""})
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {campaign.user_id === userId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSharingCampaign({
                                id: campaign.campaign_id,
                                name: campaign.campaign_name,
                              });
                            }}
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "none",
                              background: "transparent",
                              color: C.accent,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = C.accentBg)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            {role === "enterprise_staff" ? (
                              <UserPlus style={{ width: 16, height: 16 }} />
                            ) : (
                              <Share2 style={{ width: 16, height: 16 }} />
                            )}
                          </button>
                        )}
                        <ArrowUpRight
                          className="row-arrow"
                          style={{ width: 16, height: 16, flexShrink: 0 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </>
        )}
      </div>

      {/* ══════ CREATE CAMPAIGN MODAL ══════ */}
      {showCreateForm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateForm(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(24,24,24,0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "48px 24px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 22,
              width: "100%",
              maxWidth: 580,
              animation: "fadeUp .3s ease both",
            }}
          >
            {/* modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 28px 18px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: C.accentBg,
                    border: `1px solid ${C.accentBdr}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus style={{ width: 16, height: 16, color: C.accent }} />
                </div>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: C.text1,
                    letterSpacing: -0.3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Create New Campaign
                </h2>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
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
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.accentBg;
                  e.currentTarget.style.color = C.accent;
                  e.currentTarget.style.borderColor = C.accentBdr;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.sectionBg;
                  e.currentTarget.style.color = C.text3;
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Campaign Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: C.text2,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 7,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Web Security Training"
                  className="cp-input"
                />
              </div>

              {/* Select Machines */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: C.text2,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Select Machines *
                </label>
                {availableMachines.length === 0 && !loadingMachines ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      background: C.sectionBg,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: C.text3,
                        marginBottom: 8,
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      No machines available.
                    </p>
                    <button
                      onClick={fetchMachines}
                      style={{
                        fontSize: 12,
                        color: C.accent,
                        fontWeight: 700,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Load Machines
                    </button>
                  </div>
                ) : loadingMachines ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Loader
                      style={{
                        width: 18,
                        height: 18,
                        color: C.accent,
                        animation: "spin 1s linear infinite",
                        margin: "0 auto",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: 200,
                      overflowY: "auto",
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      scrollbarWidth: "thin",
                      scrollbarColor: `${C.accentBdr} transparent`,
                    }}
                  >
                    {availableMachines.map((m) => {
                      const isSelected = selectedMachines.includes(
                        m.machine_id,
                      );
                      return (
                        <label
                          key={m.machine_id}
                          className="machine-row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            borderBottom: `1px solid ${C.border}`,
                            cursor: "pointer",
                            background: isSelected ? C.accentBg : "transparent",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked)
                                setSelectedMachines([
                                  ...selectedMachines,
                                  m.machine_id,
                                ]);
                              else
                                setSelectedMachines(
                                  selectedMachines.filter(
                                    (id) => id !== m.machine_id,
                                  ),
                                );
                            }}
                            style={{
                              accentColor: C.accent,
                              width: 14,
                              height: 14,
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: C.text1,
                                fontFamily: "'DM Sans',sans-serif",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {m.variant || m.machine_id}
                            </p>
                            <p
                              style={{
                                fontSize: 11.5,
                                color: C.text3,
                                fontFamily: "'DM Sans',sans-serif",
                              }}
                            >
                              {m.variant || "custom"}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                <p
                  style={{
                    fontSize: 12,
                    color: C.text3,
                    marginTop: 6,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {selectedMachines.length} machine
                  {selectedMachines.length !== 1 ? "s" : ""} selected
                </p>
              </div>

              {/* Time Limit */}
              {role === "enterprise_staff" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      color: C.text2,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginBottom: 8,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Time Limit (minutes)
                  </label>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={timeLimit}
                      onChange={(e) =>
                        setTimeLimit(
                          Math.max(
                            5,
                            Math.min(480, parseInt(e.target.value) || 30),
                          ),
                        )
                      }
                      className="cp-input"
                      style={{ width: 96 }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        color: C.text3,
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Default: 30 min · Max: 480 min
                    </p>
                  </div>
                </div>
              )}
              {role === "individual" && (
                <p
                  style={{
                    fontSize: 12.5,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clock style={{ width: 13, height: 13 }} /> Fixed 30-minute
                  timer for friend campaigns
                </p>
              )}

              {/* Error */}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "rgba(220,38,38,.06)",
                    border: "1px solid rgba(220,38,38,.2)",
                    borderRadius: 10,
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
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                className="cp-btn-primary"
                onClick={handleCreateCampaign}
                disabled={isCreating || selectedMachines.length === 0}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  borderRadius: 30,
                  padding: "12px",
                }}
              >
                {isCreating ? (
                  <>
                    <Loader
                      style={{
                        width: 15,
                        height: 15,
                        animation: "spin 1s linear infinite",
                      }}
                    />{" "}
                    Creating…
                  </>
                ) : (
                  <>
                    <Zap style={{ width: 15, height: 15 }} /> Create Campaign (
                    {selectedMachines.length} machines)
                  </>
                )}
              </button>
            </div>

            {/* Created success */}
            {createdCampaign && (
              <div
                style={{
                  borderTop: `1px solid ${C.border}`,
                  padding: "20px 28px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "rgba(22,163,74,.06)",
                    border: "1px solid rgba(22,163,74,.2)",
                    borderRadius: 10,
                    marginBottom: 14,
                  }}
                >
                  <CheckCircle
                    style={{
                      width: 15,
                      height: 15,
                      color: "#16a34a",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#16a34a",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Campaign Created!
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: C.text3,
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      {createdCampaign.campaign_name} ·{" "}
                      {createdCampaign.machines?.length} machines
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    maxHeight: 176,
                    overflowY: "auto",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    marginBottom: 14,
                    scrollbarWidth: "thin",
                  }}
                >
                  {createdCampaign.machines?.map((m, i) => (
                    <div
                      key={m.machine_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: C.sectionBg,
                          border: `1px solid ${C.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.text3,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.text1,
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          {m.variant}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="cp-btn-primary"
                  onClick={() =>
                    navigateToCampaign(createdCampaign.campaign_id)
                  }
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    borderRadius: 30,
                    padding: "11px",
                    background: C.accent,
                    boxShadow: "none",
                  }}
                >
                  View Campaign{" "}
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
