import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, AlertCircle, Loader } from "lucide-react";
import api from "../services/api";

const C = {
  pageBg: "#fbeae2",
  cardBg: "#ffffff",
  text1: "#181818",
  text2: "#3d3d3d",
  text3: "#797979",
  border: "#e8e2db",
  accent: "#f97316",
  accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
  codeBg: "#f4f4f0",
};

/* ── Inline markdown → React elements ── */
const inlineFormat = (text) => {
  const parts = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0, match, idx = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last)
      parts.push(<span key={idx++}>{text.slice(last, match.index)}</span>);
    const raw = match[0];
    if (raw.startsWith("`")) {
      parts.push(
        <code key={idx++} style={{
          background: C.codeBg, border: `1px solid ${C.border}`,
          borderRadius: 4, padding: "2px 6px", fontSize: "0.9em",
          fontFamily: "monospace", color: C.text1,
        }}>
          {raw.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <strong key={idx++} style={{ fontWeight: 700, color: C.text1 }}>
          {raw.slice(2, -2)}
        </strong>
      );
    }
    last = match.index + raw.length;
  }
  if (last < text.length)
    parts.push(<span key={idx++}>{text.slice(last)}</span>);
  return parts.length > 0 ? parts : text;
};

const renderMarkdown = (md) => {
  if (!md) return null;
  const lines = md.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} style={{
          background: C.codeBg, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "14px 18px", fontSize: 13,
          fontFamily: "'Fira Mono', 'Courier New', monospace",
          overflowX: "auto", margin: "12px 0", color: C.text1,
          lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all",
        }}>
          {codeLines.join("\n")}
        </pre>
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} style={{
          fontSize: 24, fontWeight: 800, color: C.text1,
          margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif",
          letterSpacing: -0.5, lineHeight: 1.2,
        }}>
          {line.slice(2)}
        </h1>
      );
      i++; continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontSize: 17, fontWeight: 700, color: C.text1,
          margin: "28px 0 10px", fontFamily: "'DM Sans', sans-serif",
          borderBottom: `2px solid ${C.accentBdr}`, paddingBottom: 6,
          letterSpacing: -0.2,
        }}>
          {line.slice(3)}
        </h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{
          fontSize: 14, fontWeight: 700, color: C.text2,
          margin: "20px 0 6px", fontFamily: "'DM Sans', sans-serif",
        }}>
          {line.slice(4)}
        </h3>
      );
      i++; continue;
    }

    // Bullet
    if (line.match(/^[-*] /)) {
      elements.push(
        <div key={i} style={{
          display: "flex", gap: 10, margin: "5px 0",
          fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65,
        }}>
          <span style={{ color: C.accent, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>·</span>
          <span style={{ fontSize: 14, color: C.text2 }}>{inlineFormat(line.slice(2))}</span>
        </div>
      );
      i++; continue;
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const numMatch = line.match(/^(\d+)\. (.*)/);
      elements.push(
        <div key={i} style={{
          display: "flex", gap: 12, margin: "5px 0",
          fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, alignItems: "flex-start",
        }}>
          <span style={{
            color: C.accent, flexShrink: 0, fontWeight: 700,
            fontSize: 13, minWidth: 20, textAlign: "right",
          }}>
            {numMatch[1]}.
          </span>
          <span style={{ fontSize: 14, color: C.text2 }}>{inlineFormat(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(
        <hr key={i} style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "20px 0" }} />
      );
      i++; continue;
    }

    // Blank line
    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 8 }} />);
      i++; continue;
    }

    // Paragraph
    elements.push(
      <p key={i} style={{
        fontSize: 14, color: C.text2, margin: "4px 0",
        lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif",
      }}>
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
};

const Walkthrough = () => {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [writeupMd, setWriteupMd] = useState(null);
  const [machineName, setMachineName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const machines = await api.getMachines({ forceRefresh: true });
        const machine = (Array.isArray(machines) ? machines : [])
          .find((m) => m.machine_id === machineId);
        if (!machine) {
          setError("Machine not found.");
          return;
        }
        if (!machine.writeup_md) {
          setError("No walkthrough available for this machine yet.");
          return;
        }
        setMachineName(machine.variant || machineId);
        setWriteupMd(machine.writeup_md);
      } catch (e) {
        setError(e.message || "Failed to load walkthrough.");
      } finally {
        setLoading(false);
      }
    })();
  }, [machineId]);

  return (
    <div style={{
      minHeight: "100vh", background: C.pageBg,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(251,234,226,0.92)", backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0 24px", height: 54,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <button
          onClick={() => window.close()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none",
            color: C.text3, fontSize: 13, fontWeight: 600,
            cursor: "pointer", padding: "6px 0",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = C.text1}
          onMouseLeave={(e) => e.currentTarget.style.color = C.text3}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Close
        </button>

        <div style={{ width: 1, height: 20, background: C.border }} />

        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <BookOpen style={{ width: 14, height: 14, color: C.accent }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>
            Walkthrough
          </span>
          {machineName && (
            <span style={{ fontSize: 12, color: C.text3, fontWeight: 500 }}>
              — {machineName}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px",
        animation: "fadeUp 0.35s ease-out both",
      }}>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.text3 }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: "2px solid transparent", borderTopColor: C.accent,
              animation: "spin 0.8s linear infinite",
            }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Loading walkthrough...</span>
          </div>
        )}

        {!loading && error && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "16px 20px", borderRadius: 10,
            background: "rgba(220,38,38,0.05)",
            border: "1px solid rgba(220,38,38,0.18)",
          }}>
            <AlertCircle style={{ width: 18, height: 18, color: "#dc2626", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 14, color: "#dc2626", fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {!loading && writeupMd && (
          <div style={{
            background: C.cardBg, borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: "36px 40px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}>
            {renderMarkdown(writeupMd)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Walkthrough;
