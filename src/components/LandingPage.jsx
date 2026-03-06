import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import saadImg from "../assets/saad.jpg";
import mohsinImg from "../assets/mohsin.jpeg";
import salarImg from "../assets/salar.jpeg";
import logoImg from "../assets/logo.png";
import imgChollima from "../assets/pimg1.avif";
import imgOperator from "../assets/pimg2.png";
import imgPunkSpider from "../assets/bimg.avif";
import imgCrowdstrike from "../assets/bimg3.avif";
import imgIdentity from "../assets/bimg4.avif";
import roboman from "../assets/roboman.jpg";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      alpha: Math.random() * 0.45 + 0.08,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,115,0,${p.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x,
            dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,115,0,${0.055 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

function Typewriter({ texts, speed = 70, pause = 2200 }) {
  const [display, setDisplay] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[textIdx];
    let timeout;
    if (!deleting && charIdx < current.length)
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    else if (!deleting && charIdx === current.length)
      timeout = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0)
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx((i) => (i + 1) % texts.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);
  return (
    <span style={{ color: "#ff7300" }}>
      {display}
      <span
        style={{
          borderRight: "3px solid #ff7300",
          marginLeft: 3,
          animation: "blink 1s step-end infinite",
        }}
      >
        &nbsp;
      </span>
    </span>
  );
}

function FadeSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}) {
  const [ref, inView] = useInView(0.1);
  const from =
    direction === "left"
      ? "translateX(-40px)"
      : direction === "right"
        ? "translateX(40px)"
        : "translateY(36px)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : from,
        transition: `opacity 0.85s ease ${delay}ms, transform 0.85s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FeatureCard({ iconChar, title, desc, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeSection delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          height: "100%",
          background: hov
            ? "linear-gradient(135deg, rgba(255,115,0,0.1), rgba(255,40,0,0.04))"
            : "rgba(255,255,255,0.028)",
          border: hov
            ? "1px solid rgba(255,115,0,0.48)"
            : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: "26px 22px",
          transition: "all 0.4s ease",
          transform: hov ? "translateY(-6px) scale(1.015)" : "none",
          boxShadow: hov ? "0 20px 60px rgba(255,115,0,0.1)" : "none",
          cursor: "default",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "linear-gradient(135deg, #ff7300, #c94000)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0 6px 24px rgba(255,115,0,0.35)",
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: "#fff",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {iconChar}
          </span>
        </div>
        <h3
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 8,
          }}
        >
          {title}
        </h3>
        <p style={{ color: "#9ca3af", fontSize: 12.5, lineHeight: 1.75 }}>
          {desc}
        </p>
      </div>
    </FadeSection>
  );
}

function TeamCard({ initials, name, role, badge, delay, bio, img }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeSection delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov
            ? "linear-gradient(145deg, rgba(255,115,0,0.09), rgba(0,0,0,0.55))"
            : "rgba(255,255,255,0.028)",
          border: hov
            ? "1px solid rgba(255,115,0,0.42)"
            : "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          padding: 30,
          textAlign: "center",
          transition: "all 0.4s ease",
          transform: hov ? "translateY(-8px)" : "none",
          boxShadow: hov
            ? "0 28px 80px rgba(255,115,0,0.14)"
            : "0 4px 20px rgba(0,0,0,0.28)",
        }}
      >
        {img ? (
          <img
            src={img}
            alt={name}
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 16px",
              display: "block",
              boxShadow: hov
                ? "0 0 0 4px rgba(255,115,0,0.32), 0 12px 40px rgba(255,115,0,0.35)"
                : "0 0 0 4px rgba(255,115,0,0.14)",
              transition: "all 0.4s ease",
            }}
          />
        ) : (
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff7300, #7a2000)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: hov
                ? "0 0 0 4px rgba(255,115,0,0.32), 0 12px 40px rgba(255,115,0,0.35)"
                : "0 0 0 4px rgba(255,115,0,0.14)",
              transition: "all 0.4s ease",
              fontSize: 26,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: -1,
            }}
          >
            {initials}
          </div>
        )}
        <span
          style={{
            display: "inline-block",
            padding: "3px 12px",
            borderRadius: 999,
            background: "rgba(255,115,0,0.14)",
            border: "1px solid rgba(255,115,0,0.38)",
            color: "#ff7300",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {badge}
        </span>
        <h3
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
            marginBottom: 4,
          }}
        >
          {name}
        </h3>
        <p style={{ color: "#ff7300", fontWeight: 600, fontSize: 12 }}>
          {role}
        </p>
        <p
          style={{
            color: "#9ca3af",
            fontSize: 12,
            lineHeight: 1.7,
            marginTop: 10,
          }}
        >
          {bio}
        </p>
      </div>
    </FadeSection>
  );
}

function ThreatCard({ img, tag, title, sub, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeSection delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: hov
            ? "1px solid rgba(255,115,0,0.45)"
            : "1px solid rgba(255,255,255,0.07)",
          transition: "all 0.4s ease",
          transform: hov ? "translateY(-5px)" : "none",
          boxShadow: hov
            ? "0 20px 60px rgba(0,0,0,0.6)"
            : "0 4px 20px rgba(0,0,0,0.3)",
          cursor: "default",
          background: "#0c0c0e",
        }}
      >
        <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
          <img
            src={img}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: hov
                ? "brightness(0.85)"
                : "brightness(0.62) saturate(0.8)",
              transition: "all 0.5s ease",
              transform: hov ? "scale(1.05)" : "scale(1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, #0c0c0e 0%, transparent 60%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(255,115,0,0.9)",
              color: "#fff",
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              padding: "3px 9px",
              borderRadius: 6,
            }}
          >
            {tag}
          </span>
        </div>
        <div style={{ padding: "14px 18px 18px" }}>
          <h4
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 13.5,
              marginBottom: 5,
            }}
          >
            {title}
          </h4>
          <p style={{ color: "#6b7280", fontSize: 11.5, lineHeight: 1.65 }}>
            {sub}
          </p>
        </div>
      </div>
    </FadeSection>
  );
}

function DiffItem({ iconChar, title, desc, delay }) {
  return (
    <FadeSection delay={delay}>
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "18px 20px",
          background: "rgba(255,255,255,0.028)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            flexShrink: 0,
            background: "linear-gradient(135deg, #ff7300, #c94000)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 900,
            color: "#fff",
            boxShadow: "0 4px 18px rgba(255,115,0,0.3)",
          }}
        >
          {iconChar}
        </div>
        <div>
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          <div style={{ color: "#6b7280", fontSize: 12.5, lineHeight: 1.7 }}>
            {desc}
          </div>
        </div>
      </div>
    </FadeSection>
  );
}

/* ─────────────────────────────────────────────
   Gmail SVG Icon
───────────────────────────────────────────── */
function GmailIcon({ size = 52 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="52" height="52" rx="12" fill="rgba(255,255,255,0.05)" />
      <path
        d="M10 17.5C10 16.12 11.12 15 12.5 15h27C40.88 15 42 16.12 42 17.5v17C42 35.88 40.88 37 39.5 37h-27C11.12 37 10 35.88 10 34.5V17.5z"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.8"
      />
      <path d="M10 18l16 11 16-11" stroke="none" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18.2V34.5C10 35.88 11.12 37 12.5 37H18V25.5l8 5.5 8-5.5V37h7.5C40.88 37 42 35.88 42 34.5V18.2L26 28 10 18.2z"
        fill="#EA4335"
        fillOpacity="0.92"
      />
      <path
        d="M10 18.2L26 28l16-9.8"
        stroke="#fff"
        strokeWidth="0.6"
        strokeOpacity="0.25"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   LinkedIn SVG Icon
───────────────────────────────────────────── */
function LinkedInIcon({ size = 52 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="52" height="52" rx="12" fill="#0A66C2" fillOpacity="0.92" />
      <path
        d="M18 22h-4v13h4V22zm-2-6.5a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5zm6.5 6.5H26v1.8h.06c.6-1.1 2.06-2.3 4.24-2.3 4.53 0 5.7 3 5.7 6.8V35h-4v-6c0-1.43-.03-3.28-2-3.28-2.01 0-2.32 1.57-2.32 3.18V35h-4V22z"
        fill="#fff"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Contact Modal
───────────────────────────────────────────── */
function ContactModal({ onClose }) {
  const [form, setForm] = useState({ from: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.from || !form.subject || !form.message) return;
    setSending(true);
    setError("");
    try {
      await emailjs.send(
        "service_tezuaxq",
        "template_tw22rri",
        {
          name: form.from,
          email: form.from,
          title: form.subject,
          message: form.message,
        },
        "FK6L0suZ8l5fvQqeT",
      );
      setSending(false);
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
      }, 2200);
    } catch (err) {
      setSending(false);
      setError("Failed to send. Please try again.");
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "modalBackdropIn 0.15s ease both",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "linear-gradient(160deg, #0e0e12 0%, #111117 100%)",
          border: "1px solid rgba(255,115,0,0.25)",
          borderRadius: 26,
          padding: "42px 46px 38px",
          width: "100%",
          maxWidth: 530,
          boxShadow:
            "0 48px 140px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.03), 0 0 80px rgba(255,115,0,0.06)",
          animation: "modalSlideIn 0.22s cubic-bezier(0.34,1.45,0.64,1) both",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#6b7280",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,115,0,0.14)";
            e.currentTarget.style.color = "#ff7300";
            e.currentTarget.style.borderColor = "rgba(255,115,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          ✕
        </button>

        {/* Modal header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "linear-gradient(135deg,#ff7300,#c94000)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 18px rgba(255,115,0,0.42)",
                flexShrink: 0,
              }}
            >
              {/* mini envelope */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="16"
                  height="12"
                  rx="2"
                  stroke="#fff"
                  strokeWidth="1.4"
                />
                <path
                  d="M2 6l8 6 8-6"
                  stroke="#fff"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h2
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 19,
                  letterSpacing: -0.4,
                  lineHeight: 1,
                }}
              >
                Contact The Forge
              </h2>
              <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
                We'll respond within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Gmail field */}
          <div>
            <label
              style={{
                display: "block",
                color: "#9ca3af",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Your Gmail Address
            </label>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={form.from}
              onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(255,115,0,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.09)")
              }
            />
          </div>

          {/* Subject field */}
          <div>
            <label
              style={{
                display: "block",
                color: "#9ca3af",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Subject / Title
            </label>
            <input
              type="text"
              placeholder="What's this about?"
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(255,115,0,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.09)")
              }
            />
          </div>

          {/* Message textarea */}
          <div>
            <label
              style={{
                display: "block",
                color: "#9ca3af",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Message
            </label>
            <textarea
              placeholder="Describe your inquiry, partnership opportunity, or feedback..."
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              rows={5}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                resize: "vertical",
                minHeight: 130,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(255,115,0,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.09)")
              }
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p
            style={{
              color: "#ef4444",
              fontSize: 13,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={sending || sent}
          style={{
            marginTop: 22,
            width: "100%",
            padding: "14px",
            background: sent
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : "linear-gradient(135deg,#ff7300,#c94000)",
            border: "none",
            borderRadius: 13,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: sending || sent ? "default" : "pointer",
            boxShadow: sent
              ? "0 8px 24px rgba(34,197,94,0.35)"
              : "0 8px 28px rgba(255,115,0,0.38)",
            transition: "all 0.3s ease",
            letterSpacing: 0.3,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (!sending && !sent) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 14px 40px rgba(255,115,0,0.52)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,115,0,0.38)";
          }}
        >
          {sent
            ? "✓ Message Sent Successfully!"
            : sending
              ? "Sending..."
              : "Send Message →"}
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   MAIN LANDING PAGE
═════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gmailPulse, setGmailPulse] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleGmailClick = () => {
    if (showModal) return;
    setGmailPulse(true);
    setTimeout(() => {
      setGmailPulse(false);
      setShowModal(true);
    }, 200);
  };

  return (
    <div
      style={{
        background: "#000",
        minHeight: "100vh",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes blink     { 0%,100%{opacity:1;} 50%{opacity:0;} }
        @keyframes heroFloat { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-20px) rotate(2deg);} }
        @keyframes slideInL  { from{opacity:0;transform:translateX(-60px);} to{opacity:1;transform:translateX(0);} }
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(40px);} to{opacity:1;transform:translateY(0);} }
        @keyframes badgePing { 0%,100%{transform:scale(1);} 50%{transform:scale(1.07);} }
        @keyframes modalBackdropIn { from{opacity:0;} to{opacity:1;} }
        @keyframes modalSlideIn { from{opacity:0;transform:translateY(18px) scale(0.97);} to{opacity:1;transform:none;} }
        @keyframes gmailPulse { 0%{transform:scale(1);} 50%{transform:scale(0.92);} 100%{transform:scale(1);} }
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#070707; }
        ::-webkit-scrollbar-thumb { background:#ff7300; border-radius:3px; }
        .lp-btn-primary {
          display:inline-flex; align-items:center; gap:10px;
          padding:13px 30px; border-radius:13px; font-weight:700; font-size:14px;
          background:linear-gradient(135deg,#ff7300,#c94000);
          color:#fff; border:none; cursor:pointer; text-decoration:none;
          box-shadow:0 8px 28px rgba(255,115,0,0.42); transition:all 0.3s ease; letter-spacing:0.3px;
        }
        .lp-btn-primary:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 16px 48px rgba(255,115,0,0.58); }
        .lp-btn-ghost {
          display:inline-flex; align-items:center; gap:10px;
          padding:12px 28px; border-radius:13px; font-weight:600; font-size:14px;
          background:transparent; color:#fff; text-decoration:none;
          border:1.5px solid rgba(255,255,255,0.18); transition:all 0.3s ease;
        }
        .lp-btn-ghost:hover { border-color:rgba(255,115,0,0.55); background:rgba(255,115,0,0.07); transform:translateY(-2px); }
        .sec-tag {
          display:inline-flex; align-items:center; gap:8px; padding:4px 15px; border-radius:999px;
          background:rgba(255,115,0,0.11); border:1px solid rgba(255,115,0,0.28);
          color:#ff9a45; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:16px;
        }
        .glow-line { width:60px; height:3px; border-radius:2px; background:linear-gradient(90deg,#ff7300,#c94000); margin:0 auto 20px; box-shadow:0 0 18px #ff730055; }
        /* Contact icon buttons */
        .cta-icon-btn {
          display:flex; flex-direction:column; align-items:center; gap:12px;
          padding:22px 32px; border-radius:18px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.09);
          cursor:pointer; text-decoration:none;
          transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.3s ease, background 0.3s ease;
        }
        .cta-icon-btn:hover {
          transform:scale(1.16) translateY(-5px);
          box-shadow:0 24px 60px rgba(255,115,0,0.2);
          border-color:rgba(255,115,0,0.42);
          background:rgba(255,115,0,0.07);
        }
        .cta-icon-label {
          color:#6b7280; font-size:11.5px; font-weight:600; letter-spacing:1px; text-transform:uppercase; transition:color 0.3s;
        }
        .cta-icon-btn:hover .cta-icon-label { color:#ff7300; }

        input::placeholder, textarea::placeholder { color:#374151; }
      `}</style>

      {/* ── Contact Modal ── */}
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      {/* ════════════ NAVBAR ════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 48px",
          background: scrolled ? "rgba(0,0,0,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(22px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,115,0,0.12)" : "none",
          transition: "all 0.4s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={logoImg}
            alt="ctfWithAiLogo"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 19,
                letterSpacing: -0.5,
                background: "linear-gradient(135deg,#fff,#d1d5db)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ctfWithAi
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#6b7280",
                letterSpacing: 1.6,
                textTransform: "uppercase",
              }}
            >
              Cybersecurity Training Platform
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* ── "Team" removed, "About Us" added ── */}
          {["Features", "Vision", "About Us"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                color: "#9ca3af",
                fontSize: 13,
                fontWeight: 500,
                padding: "7px 13px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#ff7300")}
              onMouseLeave={(e) => (e.target.style.color = "#9ca3af")}
            >
              {item}
            </a>
          ))}
          <Link
            to="/login"
            className="lp-btn-ghost"
            style={{ marginLeft: 10, padding: "7px 18px", fontSize: 13 }}
          >
            Sign In
          </Link>
          <Link
            to="/Register"
            className="lp-btn-primary"
            style={{ padding: "7px 18px", fontSize: 13 }}
          >
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "120px 48px 80px",
        }}
      >
        <ParticleCanvas />
        <div
          style={{
            position: "absolute",
            width: 750,
            height: 750,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,115,0,0.11) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          <div style={{ animation: "badgePing 3.5s ease-in-out infinite" }}>
            <span className="sec-tag">Generate. Exploit. Learn.</span>
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 5.5vw, 62px)",
              fontWeight: 900,
              lineHeight: 1.07,
              marginBottom: 24,
              letterSpacing: -2,
              animation: "slideInL 5s ease forwards",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #fff 25%, #c8cdd6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Artificial Intelligence
            </span>
            <br />
            <Typewriter
              texts={[
                "For Red Teams.",
                "For Blue Teams.",
                "For Students.",
                "For Enterprises.",
                "For Institutes.",
              ]}
            />
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#9ca3af",
              lineHeight: 1.8,
              maxWidth: 520,
              margin: "0 auto 44px",
              animation: "fadeInUp 1s ease 0.3s both",
            }}
          >
            ctfWithAi uses AI to generate real vulnerable applications on demand
            describe a CVE or attack scenario, and we build, sandbox, and deploy
            a live target for you to exploit. No pre-built labs. No templates.
            Uniquely generated, isolated sandbox environments, spun up.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              animation: "fadeInUp 1s ease 0.6s both",
            }}
          >
            <Link to="/Register" className="lp-btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="lp-btn-ghost">
              Sign In →
            </Link>
          </div>
          <p
            style={{
              color: "#374151",
              fontSize: 12,
              marginTop: 24,
              animation: "fadeInUp 1s ease 0.9s both",
            }}
          >
            No credit card required &nbsp;·&nbsp; Instant lab provisioning
            &nbsp;·&nbsp; Real CVE-based infrastructure
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            right: "6%",
            top: "50%",
            transform: "translateY(-50%)",
            width: 250,
            height: 250,
            animation: "heroFloat 7s ease-in-out infinite",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(255,115,0,0.18)",
              boxShadow:
                "0 0 80px rgba(255,115,0,0.12), inset 0 0 40px rgba(255,115,0,0.06)",
            }}
          />
          <img
            src={logoImg}
            alt="ctfWithAi"
            style={{
              width: 150,
              height: 150,
              objectFit: "contain",
              filter: "drop-shadow(0 0 30px rgba(255,115,0,0.55))",
            }}
          />
        </div>
      </section>

      {/* ════════════ THREAT INTEL ════════════ */}
      <section
        style={{
          padding: "70px 48px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <FadeSection>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <span className="sec-tag">Powered by Vuln AI</span>
              <h2
                style={{
                  fontSize: "clamp(20px,3.2vw,34px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: -1,
                  marginBottom: 12,
                }}
              >
                Train on{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#ff7300,#c94000)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI-Generated Attack Surfaces
                </span>
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  maxWidth: 480,
                  margin: "0 auto",
                }}
              >
                Our AI builds a real vulnerable application from scratch and
                deploys it instantly. Ready for an AI-powered CTF
              </p>
            </div>
          </FadeSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            <ThreatCard
              delay={0}
              img={imgChollima}
              tag="ATTACK"
              title="Red Teams"
              sub="Describe your target environment misconfigured services, unpatched kernels, exposed attack surfaces and our AI generates a custom vulnerable application that mirrors real production infrastructure. Run adversary simulation campaigns against AI-built targets, on demand."
            />
            <ThreatCard
              delay={80}
              img={imgOperator}
              tag="DEFEND"
              title="Blue Teams"
              sub="Generate real attack scenarios on demand and deploy them against your detection stack. Train analysts against AI-built threats, measure response fidelity under pressure, and expose capability gaps before your adversary does. Every scenario is uniquely generated, no predictable patterns."
            />
            <ThreatCard
              delay={160}
              img={roboman}
              tag="TRAIN"
              title="Students"
              sub="
Describe any vulnerability you want to learn our AI generates a real vulnerable application and deploys it in a sandboxed environment instantly. Get hands-on exploitation experience against AI-built targets, understand root cause, and practice remediation. No sanitized puzzles."
            />
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" style={{ padding: "90px 48px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <FadeSection>
              <span className="sec-tag">Platform Features</span>
              <h2
                style={{
                  fontSize: "clamp(24px,4vw,42px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: -1.2,
                  marginBottom: 16,
                }}
              >
                Built for{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#ff7300,#c94000)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Security Practitioners
                </span>
              </h2>
              <div className="glow-line" />
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  maxWidth: 500,
                  margin: "0 auto",
                }}
              >
                Every feature is built around one goal — let AI generate the
                attack surface, so you focus on the exploit.
              </p>
            </FadeSection>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            <FeatureCard
              delay={0}
              title="AI-Generated Vulnerable Labs"
              desc="Describe any CVE or attack scenario Vuln AI builds a real vulnerable application from scratch and deploys it in an isolated sandbox instantly. No pre-built machines. No templates. Every lab is unique."
            />
            <FeatureCard
              delay={100}
              title="Sandbox Infrastructure"
              desc="Every lab runs in a fully isolated sandbox no shared resources, no cross-contamination. Hundreds of users can generate and exploit simultaneously without interference."
            />
            <FeatureCard
              delay={200}
              title="Competitive Leaderboard"
              desc="Rise through global rankings by exploiting AI-generated targets. Earn points across MITRE ATT&CK tactic categories your rank reflects real attack proficiency, not course completions."
            />
            <FeatureCard
              delay={300}
              title="Enterprise Campaign Mode"
              desc="Deploy AI-generated training campaigns across your entire security team. Assign custom lab scenarios by role, track exploitation progress per analyst, and surface skill gaps from a single dashboard."
            />
            <FeatureCard
              delay={400}
              title="Infinite Attack Scenarios"
              desc="Never run out of challenges. Vuln AI generates unlimited unique vulnerable applications  SQL injection, RCE, privilege escalation, SSRF, and beyond. Every session is a new target."
            />
            <FeatureCard
              delay={500}
              title="Role-Based Access Control"
              desc="Dedicated environments for individual practitioners, enterprise security teams, and platform administrators each with precisely scoped tooling, permissions, and AI-generated lab access."
            />
          </div>
        </div>
      </section>

      {/* ════════════ WHY DIFFERENT ════════════ */}
      <section
        style={{
          padding: "90px 48px",
          background: "linear-gradient(180deg,#000,#040409,#000)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -180,
            top: "50%",
            transform: "translateY(-50%)",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,115,0,0.065) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 72,
            alignItems: "center",
          }}
        >
          <FadeSection direction="left">
            <span className="sec-tag">Why CTFWITHAI?</span>
            <h2
              style={{
                fontSize: "clamp(20px,3vw,36px)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: -1.2,
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              We're not like{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#ff7300,#c94000)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                other CTF Platforms.
              </span>
            </h2>
            <p
              style={{
                color: "#9ca3af",
                fontSize: 13.5,
                lineHeight: 1.85,
                marginBottom: 22,
              }}
            >
              Every security professional hits a wall —{" "}
              <strong style={{ color: "#fff" }}>
                recycled labs, predictable challenges, sanitized environments
              </strong>{" "}
              that bear no resemblance to the real world. We built ctfWithAi to
              tear that wall down.
            </p>
            <p style={{ color: "#9ca3af", fontSize: 13.5, lineHeight: 1.85 }}>
              Vuln AI doesn't assist you — it{" "}
              <strong style={{ color: "#fff" }}>builds your battlefield</strong>
              . Describe what you want to exploit, and it generates a real
              vulnerable application from scratch, sandboxed and live in
              seconds. No other platform does this.
            </p>
          </FadeSection>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <DiffItem
              delay={0}
              title="No Pre-Built Labs. Ever."
              desc="Every lab is uniquely generated by Vuln AI on demand no recycled machines, no shared templates. Every session is a fresh attack surface built specifically for you."
            />
            <DiffItem
              delay={110}
              title="AI That Builds, Not Just Hints"
              desc="Vuln AI doesn't surface tips after you're stuck. It generates the entire vulnerable application from scratch  the target, the misconfiguration, the exploit path. All of it."
            />
            <DiffItem
              delay={220}
              title="Scalable Sandbox Infrastructure"
              desc="Hundreds of users can generate and exploit simultaneously. Every sandbox is fully isolated  no shared state, no cross-contamination, provisioned and torn down in seconds."
            />
            <DiffItem
              delay={330}
              title="Measurable Skill Progression"
              desc="Track your proficiency across OWASP Top 10, MITRE ATT&CK tactics, and 200+ vulnerability classes. Know exactly where your capability ceiling is before your adversary finds it."
            />
          </div>
        </div>
      </section>

      {/* ════════════ VISION ════════════ */}
      <section id="vision" style={{ padding: "90px 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <FadeSection>
              <span className="sec-tag">Our Vision</span>
              <h2
                style={{
                  fontSize: "clamp(22px,4vw,40px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: -1.2,
                  marginBottom: 14,
                }}
              >
                What We're{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#ff7300,#c94000)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Building Towards
                </span>
              </h2>
              <div className="glow-line" />
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  maxWidth: 520,
                  margin: "0 auto",
                  lineHeight: 1.8,
                }}
              >
                New vulnerabilities emerge every day and the skills gap widens
                with it. We're building a platform where every student and
                security practitioner stays current with AI-generated labs built
                around the latest threats, CVEs and real-world exploits.
              </p>
            </FadeSection>
          </div>
          <FadeSection>
            <div
              style={{
                padding: "36px 46px",
                borderRadius: 24,
                marginBottom: 50,
                background:
                  "linear-gradient(135deg, rgba(255,115,0,0.09), rgba(255,40,0,0.03))",
                border: "1px solid rgba(255,115,0,0.22)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  margin: "0 auto 18px",
                  background: "linear-gradient(135deg, #ff7300, #c94000)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(255,115,0,0.4)",
                }}
              >
                SZ
              </div>
              <p
                style={{
                  color: "#e5e7eb",
                  fontSize: 15,
                  lineHeight: 1.88,
                  fontStyle: "italic",
                  marginBottom: 12,
                }}
              >
                "In this AI era every day a new vulnerability drops and every
                day a new system gets compromised. We're building the platform
                that keeps red and blue teamers always up to date and one step
                ahead."
              </p>
              <p style={{ color: "#ff7300", fontSize: 13, fontWeight: 600 }}>
                Saad Zaib, Founder
              </p>
            </div>
          </FadeSection>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            {[
              {
                title: "Always Current",
                body: "New CVEs drop daily. Vuln AI generates labs around the latest vulnerabilities and real-world exploits so practitioners are always training on what actually matters right now.",
              },
              {
                title: "No Two Labs Are The Same",
                body: "Every session generates a completely unique vulnerable application. Same CVE, different implementation, different attack surface. Infinite variety means infinite practice.",
              },
              {
                title: "Accessible to Everyone",
                body: "Security training should not be locked behind expensive courses or certifications. We are building a platform where any student or practitioner can train on real attack surfaces from anywhere in the world.",
              },
              {
                title: "Built for Teams and Enterprises",
                body: "From individual learners to full security teams, ctfWithAi scales with you. Custom campaigns, team analytics, and AI-generated labs tailored to your organization's threat landscape.",
              },
            ].map((g, i) => (
              <FadeSection key={i} delay={i * 110}>
                <div
                  style={{
                    padding: "24px 22px",
                    background: "rgba(255,255,255,0.028)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 11,
                      marginBottom: 14,
                      background: "linear-gradient(135deg,#ff7300,#c94000)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 900,
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(255,115,0,0.32)",
                    }}
                  >
                    {g.icon}
                  </div>
                  <h4
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14.5,
                      marginBottom: 8,
                    }}
                  >
                    {g.title}
                  </h4>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: 12.5,
                      lineHeight: 1.75,
                    }}
                  >
                    {g.body}
                  </p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TEAM ════════════ */}
      <section
        id="about-us"
        style={{
          padding: "90px 48px",
          background: "linear-gradient(180deg,#000,#04040b,#000)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <FadeSection>
              <span className="sec-tag">About Us</span>
              <h2
                style={{
                  fontSize: "clamp(22px,4vw,40px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: -1.2,
                  marginBottom: 14,
                }}
              >
                The People Behind{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#ff7300,#c94000)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  The Platform
                </span>
              </h2>
              <div className="glow-line" />
            </FadeSection>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            <TeamCard
              delay={0}
              initials="SK"
              badge="Co-Founder"
              name="Salar Khan"
              role="Software Engineer"
              img={salarImg}
              bio="Builds and maintains the full ctfWithAi platform, from backend infrastructure to frontend experience."
            />
            <TeamCard
              delay={150}
              initials="SZ"
              badge="Founder"
              name="Saad Zaib"
              role="Security Engineer"
              img={saadImg}
              bio="Drives the architecture of the platform, bridging offensive security expertise with AI-powered lab generation."
            />
            <TeamCard
              delay={300}
              initials="MK"
              badge="Co-Founder"
              name="Mohsin Khan"
              role="AI Engineer"
              img={mohsinImg}
              bio="Builds and trains Vuln AI, the engine responsible for generating real vulnerable applications on demand."
            />
          </div>
        </div>
      </section>

      {/* ════════════ CTA — UPDATED ════════════ */}
      <section
        style={{
          padding: "90px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(255,115,0,0.09) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 640,
            margin: "0 auto",
          }}
        >
          <FadeSection>
            {/* ── Updated heading ── */}
            <h2
              style={{
                fontSize: "clamp(26px,4.5vw,50px)",
                fontWeight: 900,
                letterSpacing: -2,
                marginBottom: 18,
                lineHeight: 1.05,
              }}
            >
              <span style={{ color: "#fff" }}>Want to Get In</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#ff7300,#c94000)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Touch?
              </span>
            </h2>

            <p
              style={{
                color: "#9ca3af",
                fontSize: 14,
                lineHeight: 1.8,
                marginBottom: 50,
              }}
            >
              Whether you're a student, security practitioner, or enterprise
              team lead, we'd love to hear from you. Reach out through your
              preferred channel below.
            </p>

            {/* ── Gmail + LinkedIn icons replacing the old buttons ── */}
            <div
              style={{
                display: "flex",
                gap: 28,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Gmail */}
              <button
                className="cta-icon-btn"
                onClick={handleGmailClick}
                title="Send us an email"
                style={{
                  fontFamily: "inherit",
                  animation: gmailPulse ? "gmailPulse 0.2s ease" : "none",
                }}
              >
                <GmailIcon size={52} />
                <span className="cta-icon-label">Email Us</span>
              </button>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/vulnforge/"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-icon-btn"
                title="Follow us on LinkedIn"
              >
                <LinkedInIcon size={52} />
                <span className="cta-icon-label">LinkedIn</span>
              </a>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer
        style={{
          padding: "38px 48px",
          borderTop: "1px solid rgba(255,255,255,0.055)",
          background: "#000",
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={logoImg}
              alt="ctfwithai"
              style={{
                width: 30,
                height: 30,
                objectFit: "contain",
                filter: "drop-shadow(0 0 8px rgba(255,115,0,0.4))",
              }}
            />
            <div>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>
                ctfwithAi
              </div>
              <div style={{ color: "#374151", fontSize: 10.5, marginTop: 1 }}>
                © 2025 ctfWithAi. All rights reserved.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <Link
              to="/login"
              style={{
                color: "#6b7280",
                fontSize: 12.5,
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.target.style.color = "#ff7300")}
              onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
            >
              Sign In
            </Link>
            <Link
              to="/Register"
              style={{
                color: "#ff7300",
                fontSize: 12.5,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Get Started →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
