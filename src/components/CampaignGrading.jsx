import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, CheckCircle, AlertCircle, Loader, Save,
  Trophy, Clock, Target, Star, MessageSquare,
} from "lucide-react";

const C = {
  pageBg: "#fbeae2", cardBg: "#ffffff", text1: "#181818",
  text2: "#3d3d3d", text3: "#797979", border: "#e8e2db",
  accent: "#f97316", accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
};

const GRADE_OPTIONS = ["A", "B", "C", "D", "F"];
const GRADE_COLORS = { A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" };

const CampaignGrading = ({ campaignId, campaignName, onBack }) => {
  const [api, setApi] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Editable grades per student: { [user_id]: { grade, score, feedback } }
  const [grades, setGrades] = useState({});

  useEffect(() => {
    import("../services/api").then((m) => setApi(m.default));
  }, []);

  const fetchData = useCallback(async () => {
    if (!api) return;
    try {
      setLoading(true);
      const res = await api.getCampaignAllProgress(campaignId);
      const items = res.progress || [];
      setProgress(items);
      const init = {};
      items.forEach((s) => {
        init[s.user_id] = {
          grade: s.grade || "",
          score: s.score != null ? s.score : "",
          feedback: s.feedback || "",
        };
      });
      setGrades(init);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, campaignId]);

  useEffect(() => { if (api) fetchData(); }, [api, fetchData]);

  const updateGrade = (userId, field, value) => {
    setGrades((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!api) return;
    try {
      setSaving(true);
      setError(null);
      const gradesList = progress
        .filter((s) => grades[s.user_id]?.grade || grades[s.user_id]?.score !== "")
        .map((s) => ({
          student_id: s.user_id,
          grade: grades[s.user_id]?.grade || null,
          score: grades[s.user_id]?.score !== "" ? parseInt(grades[s.user_id]?.score) : null,
          feedback: grades[s.user_id]?.feedback || null,
        }));
      if (gradesList.length === 0) {
        setError("No grades to save");
        return;
      }
      await api.submitGrades(campaignId, gradesList);
      setSuccess(`Saved grades for ${gradesList.length} student(s)`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <Loader size={28} color={C.accent} style={{ animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 60px" }}>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, color: C.text3,
        fontSize: 13, background: "none", border: "none", cursor: "pointer", marginBottom: 12,
      }}>
        <ArrowLeft size={14} /> Back
      </button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text1, margin: 0 }}>
            <Star size={20} style={{ verticalAlign: "middle", marginRight: 8, color: C.accent }} />
            Grade Students
          </h2>
          <p style={{ fontSize: 12, color: C.text3, margin: "4px 0 0" }}>
            {campaignName} - {progress.length} student(s)
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: saving ? C.border : "linear-gradient(135deg, #f97316, #fb923c)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          {saving ? <Loader size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Save size={14} />}
          {saving ? "Saving..." : "Save Grades"}
        </button>
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
          padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#dc2626",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={14} /> {error}
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

      {progress.length === 0 ? (
        <div style={{
          background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
          padding: 40, textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: C.text3 }}>No students assigned yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {progress.map((s) => {
            const g = grades[s.user_id] || {};
            const pct = s.completion_pct || 0;
            return (
              <div key={s.user_id} style={{
                background: C.cardBg, borderRadius: 14, border: `1px solid ${C.border}`,
                overflow: "hidden",
              }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: pct >= 100 ? "#10b98115" : C.accentBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800,
                    color: pct >= 100 ? "#10b981" : C.accent,
                  }}>
                    {pct >= 100 ? <Trophy size={18} /> : `${pct}%`}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, margin: 0 }}>
                      {s.full_name || s.username}
                    </p>
                    <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: C.text3, display: "flex", alignItems: "center", gap: 4 }}>
                        <Target size={10} /> {s.machines_solved}/{s.total_machines} solved
                      </span>
                      <span style={{ fontSize: 11, color: C.text3, display: "flex", alignItems: "center", gap: 4 }}>
                        <Trophy size={10} /> {s.total_points} pts
                      </span>
                      <span style={{ fontSize: 11, color: C.text3, display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} /> {s.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ width: 80, flexShrink: 0 }}>
                    <div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 3,
                        background: pct >= 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : C.accent,
                        transition: "width 0.3s",
                      }} />
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: "12px 20px", borderTop: `1px solid ${C.border}`,
                  background: "#faf8f6", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: C.text3, fontWeight: 600, width: 40 }}>Grade</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {GRADE_OPTIONS.map((opt) => (
                        <button key={opt} onClick={() => updateGrade(s.user_id, "grade", g.grade === opt ? "" : opt)}
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700,
                            cursor: "pointer",
                            background: g.grade === opt ? (GRADE_COLORS[opt] || C.accent) : "#e5e7eb",
                            color: g.grade === opt ? "#fff" : C.text3,
                            transition: "all 0.15s",
                          }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: C.text3, fontWeight: 600 }}>Score</span>
                    <input type="number" min="0" max="100" value={g.score}
                      onChange={(e) => updateGrade(s.user_id, "score", e.target.value)}
                      placeholder="0-100"
                      style={{
                        width: 70, padding: "5px 8px", borderRadius: 6,
                        border: `1px solid ${C.border}`, fontSize: 12,
                        background: C.cardBg, color: C.text1, outline: "none",
                      }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 6 }}>
                    <MessageSquare size={12} color={C.text3} />
                    <input value={g.feedback}
                      onChange={(e) => updateGrade(s.user_id, "feedback", e.target.value)}
                      placeholder="Optional feedback..."
                      style={{
                        flex: 1, padding: "5px 8px", borderRadius: 6,
                        border: `1px solid ${C.border}`, fontSize: 12,
                        background: C.cardBg, color: C.text1, outline: "none",
                      }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignGrading;
