import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle,
  X, Users, ArrowLeft, Eye, EyeOff, Copy, Loader,
} from "lucide-react";

const C = {
  pageBg: "#fbeae2", cardBg: "#ffffff", text1: "#181818",
  text2: "#3d3d3d", text3: "#797979", border: "#e8e2db",
  accent: "#f97316", accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
};

const StudentUpload = ({ onBack }) => {
  const [api, setApi] = useState(null);
  const [students, setStudents] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Upload state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [createdAccounts, setCreatedAccounts] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [copied, setCopied] = useState(null);

  const fileRef = useRef(null);

  useEffect(() => {
    import("../services/api").then((m) => setApi(m.default));
  }, []);

  const fetchData = useCallback(async () => {
    if (!api) return;
    try {
      const res = await api.getTeacherStudents();
      setStudents(res.students || []);
      setSettings({ csv_uploaded: res.csv_uploaded, max_students: res.max_students });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { if (api) fetchData(); }, [api, fetchData]);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    setCreatedAccounts(null);
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a .csv file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          setError("CSV must have a header row and at least one data row");
          return;
        }
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        if (!headers.includes("email")) {
          setError("CSV must have an 'email' column");
          return;
        }

        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
          if (row.email && row.email.includes("@")) rows.push(row);
        }

        if (rows.length > (settings.max_students || 30)) {
          setError(`CSV has ${rows.length} rows but your limit is ${settings.max_students || 30}`);
          return;
        }
        setFile(selectedFile);
        setPreview(rows);
      } catch {
        setError("Failed to parse CSV file");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !api) return;
    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      const result = await api.uploadStudentCSV(formData);
      setCreatedAccounts(result.accounts || []);
      setFile(null);
      setPreview([]);
      fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "email,first_name,last_name\nstudent1@university.edu,John,Doe\nstudent2@university.edu,Jane,Smith\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "students_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <Loader size={28} color={C.accent} style={{ animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6, color: C.text3,
          fontSize: 13, background: "none", border: "none", cursor: "pointer", marginBottom: 12,
        }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, margin: 0 }}>
          <Users size={22} style={{ verticalAlign: "middle", marginRight: 8, color: C.accent }} />
          Student Management
        </h1>
        <p style={{ fontSize: 12, color: C.text3, margin: "4px 0 0" }}>
          {settings.csv_uploaded
            ? `${students.length} students uploaded (limit: ${settings.max_students})`
            : `Upload a CSV to add up to ${settings.max_students || 30} students`
          }
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
          padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
        }}>
          <AlertCircle size={16} color="#ef4444" />
          <span style={{ fontSize: 13, color: "#dc2626", flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={14} color="#dc2626" />
          </button>
        </div>
      )}

      {/* Show created accounts (after upload) */}
      {createdAccounts && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16,
          padding: 20, marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <CheckCircle size={18} color="#16a34a" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#16a34a", margin: 0 }}>
              {createdAccounts.length} Accounts Created Successfully
            </h3>
          </div>
          <p style={{ fontSize: 12, color: "#15803d", marginBottom: 12 }}>
            ⚠️ Save these passwords now — they won't be shown again!
          </p>
          <div style={{ maxHeight: 300, overflowY: "auto", borderRadius: 10, border: "1px solid #bbf7d0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#dcfce7" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#166534" }}>Email</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#166534" }}>Username</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#166534" }}>Password</th>
                  <th style={{ padding: "8px 12px", width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {createdAccounts.map((a, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #bbf7d0" }}>
                    <td style={{ padding: "8px 12px", color: C.text2 }}>{a.email}</td>
                    <td style={{ padding: "8px 12px", color: C.text2, fontFamily: "monospace" }}>{a.username}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <code style={{ color: C.text1, fontSize: 11 }}>
                          {showPasswords[i] ? a.password : "••••••••"}
                        </code>
                        <button onClick={() => setShowPasswords((p) => ({ ...p, [i]: !p[i] }))}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                          {showPasswords[i] ? <EyeOff size={12} color={C.text3} /> : <Eye size={12} color={C.text3} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <button onClick={() => copyToClipboard(a.password, i)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                        {copied === i ? <CheckCircle size={12} color="#16a34a" /> : <Copy size={12} color={C.text3} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload or Student List */}
      {!settings.csv_uploaded && !createdAccounts ? (
        <div style={{
          background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
          overflow: "hidden",
        }}>
          {/* Download template */}
          <div style={{
            padding: "16px 22px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>Upload Student CSV</span>
            <button onClick={downloadTemplate} style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12,
              color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer",
            }}>
              <Download size={13} /> Download Template
            </button>
          </div>

          {/* Drop zone */}
          <div style={{ padding: 22 }}>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = C.border;
                handleFileSelect(e.dataTransfer.files[0]);
              }}
              style={{
                border: `2px dashed ${C.border}`, borderRadius: 14, padding: "40px 24px",
                textAlign: "center", cursor: "pointer", transition: "border-color 0.2s",
              }}
            >
              <Upload size={32} color={C.text3} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text2, margin: "0 0 4px" }}>
                {file ? file.name : "Drag & drop your CSV here"}
              </p>
              <p style={{ fontSize: 12, color: C.text3, margin: 0 }}>
                or click to browse · Format: email, first_name, last_name
              </p>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files[0])} />
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>
                    Preview ({preview.length} students)
                  </span>
                  <button onClick={() => { setFile(null); setPreview([]); }}
                    style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                    Clear
                  </button>
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto", borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#faf5f1" }}>
                        <th style={{ padding: "6px 12px", textAlign: "left", color: C.text3 }}>#</th>
                        <th style={{ padding: "6px 12px", textAlign: "left", color: C.text3 }}>Email</th>
                        <th style={{ padding: "6px 12px", textAlign: "left", color: C.text3 }}>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "6px 12px", color: C.text3 }}>{i + 1}</td>
                          <td style={{ padding: "6px 12px", color: C.text2 }}>{r.email}</td>
                          <td style={{ padding: "6px 12px", color: C.text2 }}>
                            {[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={handleUpload} disabled={uploading}
                  style={{
                    marginTop: 14, width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                    background: uploading ? C.border : "linear-gradient(135deg, #f97316, #fb923c)",
                    color: "#fff", fontSize: 14, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                  {uploading ? <><Loader size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Uploading...</>
                    : <><Upload size={14} /> Upload {preview.length} Students</>}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Student List */
        <div style={{
          background: C.cardBg, borderRadius: 16, border: `1px solid ${C.border}`,
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 22px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <FileSpreadsheet size={16} color={C.accent} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>
              Uploaded Students ({students.length})
            </span>
          </div>
          {students.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: C.text3 }}>No students found.</p>
            </div>
          ) : (
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#faf5f1" }}>
                    <th style={{ padding: "8px 16px", textAlign: "left", color: C.text3, fontWeight: 600 }}>#</th>
                    <th style={{ padding: "8px 16px", textAlign: "left", color: C.text3, fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "8px 16px", textAlign: "left", color: C.text3, fontWeight: 600 }}>Email</th>
                    <th style={{ padding: "8px 16px", textAlign: "left", color: C.text3, fontWeight: 600 }}>Username</th>
                    <th style={{ padding: "8px 16px", textAlign: "left", color: C.text3, fontWeight: 600 }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.user_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 16px", color: C.text3 }}>{i + 1}</td>
                      <td style={{ padding: "10px 16px", color: C.text1, fontWeight: 500 }}>
                        {s.full_name || "—"}
                      </td>
                      <td style={{ padding: "10px 16px", color: C.text2 }}>{s.email}</td>
                      <td style={{ padding: "10px 16px", color: C.text2, fontFamily: "monospace", fontSize: 11 }}>
                        {s.username}
                      </td>
                      <td style={{ padding: "10px 16px", color: C.accent, fontWeight: 600 }}>
                        {s.total_points || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentUpload;
