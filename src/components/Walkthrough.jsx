import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, AlertCircle } from "lucide-react";
import api from "../services/api";
import { T } from "../design/tokens";

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
          background: T.accentBg, border: `1px solid ${T.accentBorder}`,
          borderRadius: 5, padding: "2px 6px", fontSize: "0.88em",
          fontFamily: T.fontMono, color: T.text1,
        }}>
          {raw.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <strong key={idx++} style={{ fontWeight: 700, color: T.text1 }}>
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

    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} style={{
          background: "#F9FAFB", border: `1px solid ${T.border}`,
          borderRadius: T.cardRadius - 8, padding: "14px 18px", fontSize: 13,
          fontFamily: T.fontMono, overflowX: "auto", margin: "12px 0",
          color: T.text1, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all",
        }}>
          {codeLines.join("\n")}
        </pre>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} style={{
          fontSize: 24, fontWeight: 800, color: T.text1,
          margin: "0 0 20px", fontFamily: T.font,
          letterSpacing: -0.5, lineHeight: 1.2,
        }}>
          {line.slice(2)}
        </h1>
      );
      i++; continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontSize: 17, fontWeight: 700, color: T.text1,
          margin: "28px 0 10px", fontFamily: T.font,
          borderBottom: `2px solid ${T.accentBorder}`, paddingBottom: 6,
          letterSpacing: -0.2,
        }}>
          {line.slice(3)}
        </h2>
      );
      i++; continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{
          fontSize: 14, fontWeight: 700, color: T.text2,
          margin: "20px 0 6px", fontFamily: T.font,
        }}>
          {line.slice(4)}
        </h3>
      );
      i++; continue;
    }

    if (line.match(/^[-*] /)) {
      elements.push(
        <div key={i} style={{
          display: "flex", gap: 10, margin: "5px 0",
          fontFamily: T.font, lineHeight: 1.65,
        }}>
          <span style={{ color: T.accent, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>·</span>
          <span style={{ fontSize: 14, color: T.text2 }}>{inlineFormat(line.slice(2))}</span>
        </div>
      );
      i++; continue;
    }

    if (line.match(/^\d+\. /)) {
      const numMatch = line.match(/^(\d+)\. (.*)/);
      elements.push(
        <div key={i} style={{
          display: "flex", gap: 12, margin: "5px 0",
          fontFamily: T.font, lineHeight: 1.65, alignItems: "flex-start",
        }}>
          <span style={{
            color: T.accent, flexShrink: 0, fontWeight: 700,
            fontSize: 13, minWidth: 20, textAlign: "right",
          }}>
            {numMatch[1]}.
          </span>
          <span style={{ fontSize: 14, color: T.text2 }}>{inlineFormat(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    if (line.match(/^---+$/)) {
      elements.push(
        <hr key={i} style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "20px 0" }} />
      );
      i++; continue;
    }

    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 8 }} />);
      i++; continue;
    }

    elements.push(
      <p key={i} style={{
        fontSize: 14, color: T.text2, margin: "4px 0",
        lineHeight: 1.75, fontFamily: T.font,
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
        if (!machine) { setError("Machine not found."); return; }
        if (!machine.writeup_md) { setError("No walkthrough available for this machine yet."); return; }
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
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: T.pageBg,
      fontFamily: T.font,
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        .wt-scroll::-webkit-scrollbar { width: 6px; }
        .wt-scroll::-webkit-scrollbar-track { background: transparent; }
        .wt-scroll::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        flexShrink: 0,
        height: T.topNavHeight,
        background: T.cardBg,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: T.shadowCard,
      }}>
        <button
          onClick={() => window.close()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: `1px solid ${T.border}`,
            borderRadius: T.btnRadius, color: T.text3,
            fontSize: 13, fontWeight: 600,
            cursor: "pointer", padding: "6px 14px",
            fontFamily: T.font, transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = T.text1;
            e.currentTarget.style.borderColor = T.accentBorder;
            e.currentTarget.style.background = T.accentBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = T.text3;
            e.currentTarget.style.borderColor = T.border;
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ArrowLeft style={{ width: 13, height: 13 }} />
          Close
        </button>

        <div style={{ width: 1, height: 22, background: T.border }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: T.accentBg, border: `1px solid ${T.accentBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen style={{ width: 14, height: 14, color: T.accent }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font, letterSpacing: -0.3 }}>
            Walkthrough
          </span>
          {machineName && (
            <span style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}>
              — {machineName}
            </span>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div
        className="wt-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "40px 24px 60px",
        }}
      >
        <div style={{
          maxWidth: 760,
          margin: "0 auto",
          animation: "fadeUp 0.3s ease-out both",
        }}>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.text3, padding: "40px 0" }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                border: `2px solid ${T.border}`, borderTopColor: T.accent,
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: 13, fontWeight: 500, fontFamily: T.font }}>Loading walkthrough...</span>
            </div>
          )}

          {!loading && error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "16px 20px", borderRadius: T.cardRadius - 8,
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.18)",
            }}>
              <AlertCircle style={{ width: 18, height: 18, color: T.error, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 14, color: T.error, fontWeight: 500, fontFamily: T.font }}>{error}</span>
            </div>
          )}

          {!loading && writeupMd && (
            <div style={{
              background: T.cardBg,
              borderRadius: T.cardRadius,
              border: `1px solid ${T.border}`,
              padding: "36px 40px",
              boxShadow: T.shadowCard,
            }}>
              {renderMarkdown(writeupMd)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Walkthrough;
