import React, { useState, useEffect, useCallback } from "react";
import {
  Users, BookOpen, Upload, PlusCircle, BarChart3,
  ChevronRight, Clock, Target, Trophy, AlertCircle,
  GraduationCap, FileSpreadsheet, Server,
} from "lucide-react";

const C = {
  pageBg: "#fbeae2", cardBg: "#ffffff", text1: "#181818",
  text2: "#3d3d3d", text3: "#797979", border: "#e8e2db",
  accent: "#f97316", accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div style={{
    background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
    padding: "20px 22px", minWidth: 0,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: `${color}15`, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={17} color={color} />
      </div>
      <span style={{ fontSize: 12, color: C.text3, fontWeight: 600 }}>{label}</span>
    </div>
    <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, margin: 0 }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: C.text3, margin: "2px 0 0" }}>{sub}</p>}
  </div>
);

const TeacherDashboard = ({ onNavigate }) => {
  const [students, setStudents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState(null);

  useEffect(() => {
    import("../services/api").then((m) => setApi(m.default));
  }, []);

  const fetchData = useCallback(async () => {
    if (!api) return;
    try {
      setLoading(true);
      const [studentsRes, campaignsRes] = await Promise.all([
        api.getTeacherStudents().catch(() => ({ students: [], csv_uploaded: false, max_students: 30 })),
        api.getUserCampaigns().catch(() => ({ campaigns: [] })),
      ]);
      setStudents(studentsRes.students || []);
      setSettings({ csv_uploaded: studentsRes.csv_uploaded, max_students: studentsRes.max_students });
      setCampaigns(campaignsRes.campaigns || []);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { if (api) fetchData(); }, [api, fetchData]);

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const completedCampaigns = campaigns.filter((c) => c.status === "completed");

  if (loading) {
    return (
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "60px 24px",
        display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${C.border}`,
            borderTopColor: C.accent, borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          <p style={{ color: C.text3, fontSize: 13 }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #f97316, #fb923c)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, margin: 0 }}>
              Teacher Dashboard
            </h1>
            <p style={{ fontSize: 12, color: C.text3, margin: 0 }}>
              Manage students, campaigns, and grades
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 14, marginBottom: 28,
      }}>
        <StatCard icon={Users} label="Students" value={students.length}
          sub={`Max: ${settings.max_students || 30}`} color="#3b82f6" />
        <StatCard icon={BookOpen} label="Active Campaigns" value={activeCampaigns.length}
          sub={`${completedCampaigns.length} completed`} color="#f97316" />
        <StatCard icon={Target} label="Total Campaigns" value={campaigns.length}
          sub="All time" color="#10b981" />
        <StatCard icon={Trophy} label="CSV Status"
          value={settings.csv_uploaded ? "Uploaded" : "Pending"}
          sub={settings.csv_uploaded ? `${students.length} students` : "Upload required"}
          color={settings.csv_uploaded ? "#10b981" : "#f59e0b"} />
      </div>

      {/* Quick Actions */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 14, marginBottom: 32,
      }}>
        {/* Upload Students */}
        <button
          onClick={() => onNavigate?.("/enterprise/teacher/students")}
          style={{
            background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
            padding: "22px 24px", cursor: "pointer", textAlign: "left",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.accentBdr;
            e.currentTarget.style.boxShadow = `0 8px 24px rgba(249,115,22,0.08)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: settings.csv_uploaded ? "#10b98115" : "#3b82f615",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {settings.csv_uploaded
              ? <FileSpreadsheet size={20} color="#10b981" />
              : <Upload size={20} color="#3b82f6" />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, margin: 0 }}>
              {settings.csv_uploaded ? "View Students" : "Upload Students"}
            </p>
            <p style={{ fontSize: 12, color: C.text3, margin: "2px 0 0" }}>
              {settings.csv_uploaded
                ? `${students.length} students uploaded`
                : `Upload CSV (max ${settings.max_students || 30})`
              }
            </p>
          </div>
          <ChevronRight size={16} color={C.text3} />
        </button>

        {/* Create Campaign */}
        <button
          onClick={() => onNavigate?.("/campaigns")}
          style={{
            background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
            padding: "22px 24px", cursor: "pointer", textAlign: "left",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.accentBdr;
            e.currentTarget.style.boxShadow = `0 8px 24px rgba(249,115,22,0.08)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: C.accentBg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PlusCircle size={20} color={C.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, margin: 0 }}>
              Campaigns
            </p>
            <p style={{ fontSize: 12, color: C.text3, margin: "2px 0 0" }}>
              Create and manage campaigns
            </p>
          </div>
          <ChevronRight size={16} color={C.text3} />
        </button>

        {/* VulnAI */}
        <button
          onClick={() => onNavigate?.("/vuln-ai")}
          style={{
            background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
            padding: "22px 24px", cursor: "pointer", textAlign: "left",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.accentBdr;
            e.currentTarget.style.boxShadow = `0 8px 24px rgba(249,115,22,0.08)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "#8b5cf615",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BarChart3 size={20} color="#8b5cf6" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, margin: 0 }}>
              VulnAI Lab
            </p>
            <p style={{ fontSize: 12, color: C.text3, margin: "2px 0 0" }}>
              Generate machines with AI
            </p>
          </div>
          <ChevronRight size={16} color={C.text3} />
        </button>

        {/* Machines */}
        <button
          onClick={() => onNavigate?.("/machines")}
          style={{
            background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
            padding: "22px 24px", cursor: "pointer", textAlign: "left",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.accentBdr;
            e.currentTarget.style.boxShadow = `0 8px 24px rgba(249,115,22,0.08)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "#0ea5e915",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Server size={20} color="#0ea5e9" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, margin: 0 }}>
              Machines
            </p>
            <p style={{ fontSize: 12, color: C.text3, margin: "2px 0 0" }}>
              Load machines and use them in campaigns
            </p>
          </div>
          <ChevronRight size={16} color={C.text3} />
        </button>
      </div>

      {/* Recent Campaigns */}
      <div style={{
        background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BookOpen size={16} color={C.accent} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text1, margin: 0 }}>
              Recent Campaigns
            </h3>
          </div>
          <button
            onClick={() => onNavigate?.("/campaigns")}
            style={{
              fontSize: 12, color: C.accent, fontWeight: 600,
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            View All →
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center" }}>
            <AlertCircle size={28} color={C.text3} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
            <p style={{ fontSize: 13, color: C.text3, margin: 0 }}>
              No campaigns yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div>
            {campaigns.slice(0, 5).map((c) => (
              <div
                key={c.campaign_id}
                onClick={() => onNavigate?.(`/campaigns/${c.campaign_id}`)}
                style={{
                  padding: "14px 22px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#faf5f1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: c.status === "active" ? "#10b98115" : "#6b728015",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Target size={16} color={c.status === "active" ? "#10b981" : "#6b7280"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: C.text1, margin: 0,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {c.campaign_name}
                  </p>
                  <p style={{ fontSize: 11, color: C.text3, margin: "2px 0 0" }}>
                    {c.machine_count} machines · Difficulty {c.difficulty}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11, color: C.text3,
                  }}>
                    <Clock size={12} />
                    {c.time_limit_minutes || 30}m
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                    background: c.status === "active" ? "#10b98115" : "#6b728015",
                    color: c.status === "active" ? "#10b981" : "#6b7280",
                    textTransform: "uppercase",
                  }}>
                    {c.status}
                  </span>
                  <ChevronRight size={14} color={C.text3} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
