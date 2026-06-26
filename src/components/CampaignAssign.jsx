import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Search, Check, X, AlertCircle, ArrowLeft, Send,
  UserPlus, Loader,
} from "lucide-react";

const C = {
  pageBg: "#fbeae2", cardBg: "#ffffff", text1: "#181818",
  text2: "#3d3d3d", text3: "#797979", border: "#e8e2db",
  accent: "#f97316", accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
};

const CampaignAssign = ({ campaignId, campaignName, onBack, onDone }) => {
  const [api, setApi] = useState(null);
  const [students, setStudents] = useState([]);
  const [existing, setExisting] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    import("../services/api").then((m) => setApi(m.default));
  }, []);

  const fetchData = useCallback(async () => {
    if (!api) return;
    try {
      setLoading(true);
      const [studentsRes, assignmentsRes] = await Promise.all([
        api.getTeacherStudents().catch(() => ({ students: [] })),
        api.getCampaignAssignments(campaignId).catch(() => ({ assignments: [] })),
      ]);
      setStudents(studentsRes.students || []);
      setExisting(assignmentsRes.assignments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api, campaignId]);

  useEffect(() => { if (api) fetchData(); }, [api, fetchData]);

  const existingIds = new Set(existing.map((a) => a.user_id));

  const filteredStudents = students.filter((s) => {
    if (existingIds.has(s.user_id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q)
    );
  });

  const toggleStudent = (userId) => {
    const next = new Set(selected);
    next.has(userId) ? next.delete(userId) : next.add(userId);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filteredStudents.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredStudents.map((s) => s.user_id)));
    }
  };

  const handleAssign = async () => {
    if (!api || selected.size === 0) return;
    try {
      setAssigning(true);
      setError(null);
      await api.assignCampaign(campaignId, [...selected]);
      setSuccess(`Successfully assigned ${selected.size} student(s)`);
      setSelected(new Set());
      fetchData();
      setTimeout(() => onDone?.(), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <Loader size={28} color={C.accent} style={{ animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px 60px" }}>
      {/* Header */}
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, color: C.text3,
        fontSize: 13, background: "none", border: "none", cursor: "pointer", marginBottom: 12,
      }}>
        <ArrowLeft size={14} /> Back
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text1, margin: "0 0 4px" }}>
        <UserPlus size={20} style={{ verticalAlign: "middle", marginRight: 8, color: C.accent }} />
        Assign Campaign
      </h2>
      <p style={{ fontSize: 12, color: C.text3, margin: "0 0 20px" }}>
        {campaignName || "Campaign"} · Select students to assign
      </p>

      {/* Messages */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
          padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, color: "#dc2626",
        }}>
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}>
            <X size={12} color="#dc2626" />
          </button>
        </div>
      )}

      {success && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12,
          padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, color: "#16a34a",
        }}>
          <Check size={14} /> {success}
        </div>
      )}

      {/* Already assigned */}
      {existing.length > 0 && (
        <div style={{
          background: C.cardBg, borderRadius: 12, border: `1px solid ${C.border}`,
          padding: "14px 18px", marginBottom: 16,
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text3, margin: "0 0 8px" }}>
            Already Assigned ({existing.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {existing.map((a) => (
              <span key={a.user_id} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 6,
                background: "#10b98115", color: "#10b981", fontWeight: 600,
              }}>
                {a.username || a.email}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Select Students */}
      <div style={{
        background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}>
        {/* Search + Select All */}
        <div style={{
          padding: "12px 18px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Search size={14} color={C.text3} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            style={{
              flex: 1, border: "none", outline: "none", fontSize: 13,
              background: "transparent", color: C.text1,
            }}
          />
          <button onClick={selectAll} style={{
            fontSize: 11, color: C.accent, fontWeight: 600,
            background: "none", border: "none", cursor: "pointer",
          }}>
            {selected.size === filteredStudents.length && filteredStudents.length > 0 ? "Deselect All" : "Select All"}
          </button>
        </div>

        {/* Student list */}
        <div style={{ maxHeight: 350, overflowY: "auto" }}>
          {filteredStudents.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: C.text3 }}>
                {students.length === 0 ? "No students uploaded yet" : "All students already assigned"}
              </p>
            </div>
          ) : (
            filteredStudents.map((s) => {
              const isSelected = selected.has(s.user_id);
              return (
                <div
                  key={s.user_id}
                  onClick={() => toggleStudent(s.user_id)}
                  style={{
                    padding: "12px 18px", borderBottom: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    background: isSelected ? C.accentBg : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: isSelected ? "none" : `2px solid ${C.border}`,
                    background: isSelected ? C.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isSelected && <Check size={12} color="#fff" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, margin: 0 }}>
                      {s.full_name || s.username}
                    </p>
                    <p style={{ fontSize: 11, color: C.text3, margin: 0 }}>{s.email}</p>
                  </div>
                  <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>
                    {s.total_points || 0} pts
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Assign button */}
        {filteredStudents.length > 0 && (
          <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.border}` }}>
            <button onClick={handleAssign} disabled={selected.size === 0 || assigning}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                background: selected.size === 0 || assigning
                  ? C.border : "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: selected.size === 0 || assigning ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              {assigning ? <><Loader size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Assigning...</>
                : <><Send size={14} /> Assign {selected.size} Student{selected.size !== 1 ? "s" : ""}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignAssign;
