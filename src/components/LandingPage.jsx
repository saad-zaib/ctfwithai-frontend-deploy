import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import saadImg from "../assets/saad.jpg";
import mohsinImg from "../assets/mohsin.jpeg";
import salarImg from "../assets/salar.jpeg";
import logoImg from "../assets/logo.png";
import imgChollima from "../assets/pimg1.avif";
import imgOperator from "../assets/pimg2.png";
import roboman from "../assets/roboman.webp";
import awsImg from "../assets/aws.png";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

/* ─────────────────────────────────────────────
   Aurius Design Tokens
   Palette extracted directly from Aurius.html
   Only orange swapped: #ff5101 → #f97316
───────────────────────────────────────────── */
const C = {
  pageBg: "#fbeae2ff",
  sectionBg: "transparent",
  cardBg: "rgba(255, 255, 255, 0.45)",
  glassBorder: "rgba(255, 255, 255, 0.6)",
  text1: "#181818",
  text2: "#3d3d3d",
  text3: "#666666",
  border: "rgba(232, 226, 219, 0.5)",
  accent: "#f97316",
  accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
  shadow: "rgba(0,0,0,0.03)",
  shadowMd: "rgba(0,0,0,0.08)",
};

/* ── useInView ── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
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

/* ── FadeSection ── */
function FadeSection({ children, delay = 0, direction = "up", style = {} }) {
  const [ref, inView] = useInView(0.08);
  const from =
    direction === "left"
      ? "translateX(-22px)"
      : direction === "right"
        ? "translateX(22px)"
        : "translateY(20px)";
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : from,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Typewriter ── */
function Typewriter({ texts, speed = 68, pause = 2200 }) {
  const [display, setDisplay] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[textIdx];
    let t;
    if (!deleting && charIdx < current.length)
      t = setTimeout(() => setCharIdx((c) => c + 1), speed);
    else if (!deleting && charIdx === current.length)
      t = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0)
      t = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx((i) => (i + 1) % texts.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(t);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);
  return (
    <span style={{ color: C.accent }}>
      {display}
      <span
        style={{
          borderRight: `2.5px solid ${C.accent}`,
          marginLeft: 2,
          animation: "tw-blink 1s step-end infinite",
        }}
      >
        &nbsp;
      </span>
    </span>
  );
}

/* ── PillTag ── */
function PillTag({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 14px",
        borderRadius: 30,
        background: C.accentBg,
        border: `1px solid ${C.accentBdr}`,
        color: C.accent,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        fontFamily: "'Inter', sans-serif",
        marginBottom: 18,
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: C.accent,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
}

/* ── GlowLine ── */
function GlowLine() {
  return (
    <div
      style={{
        width: 44,
        height: 2,
        borderRadius: 2,
        background: C.accent,
        margin: "0 auto 20px",
      }}
    />
  );
}

/* ── FeatureCard ── */
function FeatureCard({ iconChar, title, desc, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeSection delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          height: "100%",
          background: C.cardBg,
          border: `1px solid ${hov ? C.accentBdr : C.glassBorder}`,
          borderRadius: 20,
          padding: "32px 28px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: hov ? "translateY(-6px) scale(1.01)" : "none",
          boxShadow: hov
            ? `0 24px 48px rgba(249,115,22,0.08), 0 4px 12px ${C.shadowMd}, inset 0 1px 0 rgba(255,255,255,0.8)`
            : `0 4px 12px ${C.shadow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
          cursor: "default",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: C.accentBg,
            border: `1px solid ${C.accentBdr}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: C.accent,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {iconChar}
          </span>
        </div>
        <h3
          style={{
            color: C.text1,
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 10,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: -0.2,
          }}
        >
          {title}
        </h3>
        <p style={{ color: C.text3, fontSize: 13.5, lineHeight: 1.8 }}>
          {desc}
        </p>
      </div>
    </FadeSection>
  );
}

/* ── TeamCard ── */
function TeamCard({ initials, name, role, badge, delay, bio, img }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeSection delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: C.cardBg,
          border: `1px solid ${hov ? C.accentBdr : C.glassBorder}`,
          borderRadius: 24,
          padding: "36px 28px",
          textAlign: "center",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: hov ? "translateY(-8px) scale(1.02)" : "none",
          boxShadow: hov
            ? `0 30px 60px rgba(249,115,22,0.12), 0 8px 16px ${C.shadowMd}, inset 0 1px 0 rgba(255,255,255,0.8)`
            : `0 8px 20px ${C.shadow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
        }}
      >
        {img ? (
          <img
            src={img}
            alt={name}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 16px",
              display: "block",
              border: `3px solid ${hov ? C.accent : C.border}`,
              transition: "border-color 0.26s ease",
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: C.accentBg,
              border: `2px solid ${C.accentBdr}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 22,
              fontWeight: 800,
              color: C.accent,
            }}
          >
            {initials}
          </div>
        )}
        <span
          style={{
            display: "inline-block",
            padding: "3px 12px",
            borderRadius: 30,
            background: C.accentBg,
            border: `1px solid ${C.accentBdr}`,
            color: C.accent,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.3,
            textTransform: "uppercase",
            marginBottom: 12,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {badge}
        </span>
        <h3
          style={{
            color: C.text1,
            fontWeight: 800,
            fontSize: 17,
            marginBottom: 4,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {name}
        </h3>
        <p
          style={{
            color: C.accent,
            fontWeight: 600,
            fontSize: 12.5,
            marginBottom: 10,
          }}
        >
          {role}
        </p>
        <p style={{ color: C.text3, fontSize: 13, lineHeight: 1.75 }}>{bio}</p>
      </div>
    </FadeSection>
  );
}

/* ── ThreatCard ── */
function ThreatCard({ img, tag, title, sub, delay, imgHeight = 160 }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeSection delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 20,
          overflow: "hidden",
          background: C.cardBg,
          border: `1px solid ${hov ? C.accentBdr : C.glassBorder}`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: hov ? "translateY(-8px) scale(1.015)" : "none",
          boxShadow: hov
            ? `0 24px 48px rgba(249,115,22,0.12), 0 8px 16px ${C.shadowMd}, inset 0 1px 0 rgba(255,255,255,0.8)`
            : `0 8px 20px ${C.shadow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
          cursor: "default",
        }}
      >
        <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
          <img
            src={img}
            alt={title}
            style={{
              width: "100%",
              height: "250%",
              objectFit: "cover",
              filter: hov ? "brightness(1)" : "brightness(0.9) saturate(0.85)",
              transition: "all 0.45s ease",
              transform: hov ? "scale(1.04)" : "scale(1)",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: C.accent,
              color: "#fff",
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {tag}
          </span>
        </div>
        <div style={{ padding: "18px 20px 22px" }}>
          <h4
            style={{
              color: C.text1,
              fontWeight: 700,
              fontSize: 14.5,
              marginBottom: 7,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {title}
          </h4>
          <p style={{ color: C.text3, fontSize: 12.5, lineHeight: 1.75 }}>
            {sub}
          </p>
        </div>
      </div>
    </FadeSection>
  );
}

/* ── DiffItem ── */
function DiffItem({ iconChar, title, desc, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeSection delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          gap: 16,
          background: C.cardBg,
          border: `1px solid ${hov ? C.accentBdr : C.glassBorder}`,
          borderRadius: 20,
          padding: "24px 28px",
          alignItems: "flex-start",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: hov ? "translateX(6px)" : "none",
          boxShadow: hov
            ? `0 12px 32px rgba(249,115,22,0.08), 0 4px 12px ${C.shadowMd}, inset 0 1px 0 rgba(255,255,255,0.8)`
            : `0 4px 12px ${C.shadow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
          cursor: "default",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            flexShrink: 0,
            background: C.accentBg,
            border: `1px solid ${C.accentBdr}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            color: C.accent,
            fontWeight: 900,
          }}
        >
          {iconChar}
        </div>
        <div>
          <div
            style={{
              color: C.text1,
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 6,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {title}
          </div>
          <div style={{ color: C.text3, fontSize: 13, lineHeight: 1.75 }}>
            {desc}
          </div>
        </div>
      </div>
    </FadeSection>
  );
}

/* ── PricingCard ── */
function PricingCard({
  name,
  price,
  period = "/month",
  tokens,
  description,
  ctaText = "Choose Plan",
  ctaTo = "/pricing",
  ctaGhost = false,
  tags = [],
  highlight = false,
  delay = 0,
}) {
  const [hov, setHov] = useState(false);
  return (
    <FadeSection delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: "relative",
          height: "100%",
          background: highlight
            ? "linear-gradient(165deg, rgba(249,115,22,0.14), rgba(255,255,255,0.7))"
            : C.cardBg,
          border: `1px solid ${highlight ? C.accent : hov ? C.accentBdr : C.glassBorder}`,
          borderRadius: 22,
          padding: "30px 24px 26px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: hov || highlight ? "translateY(-8px)" : "none",
          boxShadow: highlight
            ? "0 22px 50px rgba(249,115,22,0.18), 0 8px 20px rgba(0,0,0,0.08)"
            : hov
              ? `0 16px 36px rgba(249,115,22,0.09), 0 6px 14px ${C.shadowMd}`
              : `0 4px 12px ${C.shadow}`,
        }}
      >
        {tags.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              maxWidth: "75%",
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: C.accent,
                  color: "#fff",
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  padding: "4px 8px",
                  borderRadius: 999,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3
          style={{
            color: C.text1,
            fontWeight: 800,
            fontSize: 22,
            marginBottom: 8,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {name}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              color: highlight ? "#dc5e08" : C.text1,
              fontWeight: 900,
              fontSize: "clamp(28px, 4vw, 36px)",
              letterSpacing: -1.3,
              lineHeight: 1,
            }}
          >
            {price}
          </span>
          {period && (
            <span
              style={{
                color: C.text3,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {period}
            </span>
          )}
        </div>

        <div
          style={{
            marginBottom: 12,
            color: C.text1,
            fontWeight: 700,
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {tokens}
        </div>
        <p style={{ color: C.text3, fontSize: 13.5, lineHeight: 1.8 }}>
          {description}
        </p>
        <Link
          to={ctaTo}
          style={{
            marginTop: 16,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            borderRadius: 999,
            padding: "10px 12px",
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: 13,
            background: ctaGhost ? "transparent" : C.accent,
            border: ctaGhost ? `1px solid ${C.border}` : "none",
            color: ctaGhost ? C.text2 : "#fff",
            transition: "all 0.2s ease",
          }}
        >
          {ctaText}
        </Link>
      </div>
    </FadeSection>
  );
}

/* ── GmailIcon ── */
function GmailIcon({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="12" fill={C.sectionBg} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18.2V34.5C10 35.88 11.12 37 12.5 37H18V25.5l8 5.5 8-5.5V37h7.5C40.88 37 42 35.88 42 34.5V18.2L26 28 10 18.2z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ── LinkedInIcon ── */
function LinkedInIcon({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="12" fill="#0A66C2" />
      <path
        d="M18 22h-4v13h4V22zm-2-6.5a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5zm6.5 6.5H26v1.8h.06c.6-1.1 2.06-2.3 4.24-2.3 4.53 0 5.7 3 5.7 6.8V35h-4v-6c0-1.43-.03-3.28-2-3.28-2.01 0-2.32 1.57-2.32 3.18V35h-4V22z"
        fill="#fff"
      />
    </svg>
  );
}

/* ── ContactModal ── */
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
    } catch {
      setSending(false);
      setError("Failed to send. Please try again.");
    }
  };

  const inputBase = {
    width: "100%",
    padding: "11px 15px",
    background: C.sectionBg,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text1,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
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
        background: "rgba(24,24,24,0.45)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "modalBgIn 0.15s ease both",
        padding: 24,
      }}
    >
      <div
        className="mobile-contact-modal"
        style={{
          background: C.cardBg,
          borderRadius: 22,
          padding: "40px 44px 36px",
          width: "100%",
          maxWidth: 510,
          position: "relative",
          boxShadow: `0 40px 100px rgba(0,0,0,0.16), 0 2px 8px ${C.shadowMd}`,
          border: `1px solid ${C.border}`,
          animation: "modalSlideIn 0.22s cubic-bezier(0.34,1.45,0.64,1) both",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 30,
            height: 30,
            borderRadius: 8,
            background: C.sectionBg,
            border: `1px solid ${C.border}`,
            color: C.text3,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
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
          ✕
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 26,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: C.accentBg,
              border: `1px solid ${C.accentBdr}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect
                x="2"
                y="4"
                width="16"
                height="12"
                rx="2"
                stroke={C.accent}
                strokeWidth="1.5"
              />
              <path
                d="M2 6l8 6 8-6"
                stroke={C.accent}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h2
              style={{
                color: C.text1,
                fontWeight: 800,
                fontSize: 19,
                letterSpacing: -0.4,
                lineHeight: 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Contact The Forge
            </h2>
            <p style={{ color: C.text3, fontSize: 12, marginTop: 3 }}>
              We'll respond within 24 hours.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            {
              label: "Your Gmail Address",
              key: "from",
              type: "email",
              placeholder: "you@gmail.com",
            },
            {
              label: "Subject / Title",
              key: "subject",
              type: "text",
              placeholder: "What's this about?",
            },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label
                style={{
                  display: "block",
                  color: C.text2,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 7,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = C.accent)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </div>
          ))}
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
                fontFamily: "'DM Sans', sans-serif",
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
              style={{ ...inputBase, resize: "vertical", minHeight: 120 }}
              onFocus={(e) => (e.target.style.borderColor = C.accent)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>
        </div>

        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: 13,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={sending || sent}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "13px",
            background: sent ? "#16a34a" : C.accent,
            border: "none",
            borderRadius: 12,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: sending || sent ? "default" : "pointer",
            transition: "all 0.25s ease",
            letterSpacing: 0.3,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: `0 4px 16px rgba(249,115,22,0.25)`,
          }}
          onMouseEnter={(e) => {
            if (!sending && !sent) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 10px 28px rgba(249,115,22,0.35)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(249,115,22,0.25)";
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

const LANDING_FALLBACK_PLANS = {
  free: { display_name: "Free Tier", price_label: "$0/month", monthly_token_limit: 10000 },
  pro: { display_name: "Pro", price_label: "$19/month", monthly_token_limit: 30000 },
  pro_plus: { display_name: "Pro Plus", price_label: "$79/month", monthly_token_limit: 300000 },
  enterprise: { display_name: "Enterprise", price_label: "Contact us", monthly_token_limit: 0 },
};

function splitPriceLabel(label) {
  const text = String(label || "").trim();
  if (!text) return { price: "Contact us", period: "" };
  if (text.includes("/")) {
    const [price, period] = text.split("/", 2);
    return { price: price.trim(), period: `/${String(period || "").trim()}` };
  }
  return { price: text, period: "" };
}

/* ═════════════════════════════════════════════
   MAIN
═════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gmailPulse, setGmailPulse] = useState(false);
  const [landingPlans, setLandingPlans] = useState(LANDING_FALLBACK_PLANS);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadBillingPlans = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/billing/plans`);
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data?.plans) || !data.plans.length || cancelled) return;
        const mapped = { ...LANDING_FALLBACK_PLANS };
        for (const plan of data.plans) {
          const code = plan?.plan_code;
          if (!code) continue;
          mapped[code] = {
            display_name: plan.display_name || mapped[code]?.display_name || code,
            price_label: plan.price_label || mapped[code]?.price_label || "Contact us",
            monthly_token_limit: Number(plan.monthly_token_limit ?? mapped[code]?.monthly_token_limit ?? 0),
          };
        }
        setLandingPlans(mapped);
      } catch (_) {}
    };
    loadBillingPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGmailClick = () => {
    if (showModal) return;
    setGmailPulse(true);
    setTimeout(() => {
      setGmailPulse(false);
      setShowModal(true);
    }, 180);
  };

  const H2 = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 800,
    letterSpacing: -1.5,
    color: C.text1,
    fontSize: "clamp(26px, 4.5vw, 48px)",
    marginBottom: 16,
    lineHeight: 1.1,
  };

  const freePrice = splitPriceLabel(landingPlans.free?.price_label);
  const proPrice = splitPriceLabel(landingPlans.pro?.price_label);
  const proPlusPrice = splitPriceLabel(landingPlans.pro_plus?.price_label);
  const enterprisePrice = splitPriceLabel(landingPlans.enterprise?.price_label);

  return (
    <div
      style={{
        background: "transparent",
        color: C.text1,
        fontFamily: "'Inter', sans-serif",
        minHeight: "100vh",
        position: "relative",
        zIndex: 0,
        overflowX: "hidden",
      }}
    >
      {/* Animated Mesh Gradient */}
      <div className="mesh-bg" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        @keyframes tw-blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes heroFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:none} }
        @keyframes slideRight  { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:none} }
        @keyframes badgePulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes modalBgIn   { from{opacity:0} to{opacity:1} }
        @keyframes modalSlideIn{ from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes gmailPulse  { 0%{transform:scale(1)} 50%{transform:scale(0.93)} 100%{transform:scale(1)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#f9f4f0; }
        ::-webkit-scrollbar-thumb { background:#f97316; border-radius:2px; }

        .btn-primary {
          display:inline-flex; align-items:center; gap:8px; white-space:nowrap;
          padding:11px 24px; border-radius:30px; background:#f97316; color:#fff;
          font-family:'DM Sans',sans-serif; font-weight:700; font-size:14px;
          border:none; cursor:pointer; text-decoration:none;
          box-shadow:0 4px 18px rgba(249,115,22,0.28);
          transition:all 0.24s ease;
        }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(249,115,22,0.38); background:#e8660a; }

        .btn-ghost {
          display:inline-flex; align-items:center; gap:8px; white-space:nowrap;
          padding:10px 22px; border-radius:30px;
          background:transparent; color:#181818; text-decoration:none;
          font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px;
          border:1.5px solid #e8e2db; transition:all 0.24s ease;
        }
        .btn-ghost:hover { border-color:#f97316; color:#f97316; background:rgba(249,115,22,0.05); transform:translateY(-1px); }

        .nav-link {
          color:#5e5e5e; font-size:13.5px; font-weight:500; text-decoration:none;
          padding:6px 13px; border-radius:8px; font-family:'DM Sans',sans-serif;
          transition:color 0.2s, background 0.2s;
        }
        .nav-link:hover { color:#181818; background:rgba(0,0,0,0.05); }

        .contact-btn {
          display:flex; flex-direction:column; align-items:center; gap:10px;
          padding:22px 28px; border-radius:16px; background:#fff;
          border:1px solid #e8e2db; cursor:pointer; text-decoration:none;
          box-shadow:0 1px 4px rgba(0,0,0,0.06);
          transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.24s;
        }
        .contact-btn:hover {
          transform:translateY(-5px) scale(1.06);
          box-shadow:0 16px 40px rgba(249,115,22,0.12), 0 2px 8px rgba(0,0,0,0.08);
          border-color:rgba(249,115,22,0.35);
        }
        .contact-label {
          color:#797979ff; font-size:11px; font-weight:700; letter-spacing:1.1px;
          text-transform:uppercase; font-family:'DM Sans',sans-serif; transition:color 0.24s;
        }
        .contact-btn:hover .contact-label { color:#f97316; }
        input::placeholder, textarea::placeholder { color:#c9c2bb; }

        @media (max-width: 768px) {
          .mobile-nav { padding: 0 20px !important; }
          .mobile-hide { display: none !important; }
          .mobile-section { padding: 50px 20px !important; }
          .mobile-hero { padding: 100px 20px 50px !important; }
          .mobile-grid-1 { grid-template-columns: 1fr !important; gap: 32px !important; }
          .mobile-flex-col { flex-direction: column !important; }
          .mobile-footer { padding: 32px 20px !important; }
          .mobile-footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 24px !important; }
          .mobile-footer-links { flex-wrap: wrap !important; justify-content: flex-start !important; }
          .mobile-contact-modal { padding: 32px 20px 24px !important; }
          .mobile-h1 { font-size: clamp(32px, 8vw, 42px) !important; letter-spacing: -1px !important; }
          .mobile-nav .btn-ghost { padding: 6px 12px !important; font-size: 13px !important; }
          .mobile-nav .btn-primary { padding: 6px 16px !important; font-size: 13px !important; margin-left: 2px !important; }
        }
      `}</style>

      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      {/* ═══ NAVBAR ═══ */}
      <nav
        className="mobile-nav"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 48px",
          height: 62,
          background: scrolled ? "rgba(255,253,252,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.border}` : "none",
          transition: "all 0.32s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={logoImg}
            alt="ctfWithAi"
            style={{ width: 36, height: 36, objectFit: "contain" }}
          />
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: -0.5,
                color: C.text1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ctfWithAi
            </div>
            <div
              style={{
                fontSize: 8.5,
                color: C.text3,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cybersecurity Training Platform
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div
            className="mobile-hide"
            style={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            {/* Pricing link hidden for now */}
            {/* {["Features", "Pricing", "Vision"].map((item) => ( */}
            {["Features", "Vision"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="nav-link"
              >
                {item}
              </a>
            ))}
            <div
              style={{
                width: 1,
                height: 18,
                background: C.border,
                margin: "0 10px",
              }}
            />
          </div>
          <Link
            to="/login"
            className="btn-ghost"
            style={{ padding: "7px 18px", fontSize: 13 }}
          >
            Sign In
          </Link>
          <Link
            to="/Register"
            className="btn-primary"
            style={{ padding: "8px 20px", fontSize: 13, marginLeft: 4 }}
          >
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section
        className="mobile-hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "120px 48px 80px",
          background: `linear-gradient(155deg, ${C.pageBg} 0%, ${C.sectionBg} 100%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 580,
            height: 580,
            borderRadius: "50%",
            top: "8%",
            right: "-10%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            bottom: "8%",
            left: "-6%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 840,
          }}
        >
          <div
            style={{
              animation: "badgePulse 3s ease-in-out infinite",
              display: "inline-block",
            }}
          >
            <PillTag>Build it. Hack it. Learn it.</PillTag>
          </div>
          <h1
            className="mobile-h1"
            style={{
              fontSize: "clamp(40px, 7vw, 84px)",
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 26,
              letterSpacing: -2.5,
              fontFamily: "'Inter', sans-serif",
              animation: "slideRight 0.7s ease forwards",
            }}
          >
            <span style={{ color: C.text1 }}>Hack Smarter.</span>
            <br />
            <Typewriter
              texts={[
                "Train Harder",
                "Learn Faster",
                "Strike Harder",
                "Rise Higher",
                "Defend Faster",
              ]}
            />
          </h1>
          <p
            style={{
              fontSize: 15.5,
              color: C.text2,
              lineHeight: 1.85,
              maxWidth: 520,
              margin: "0 auto 46px",
              animation: "fadeUp 0.8s ease 0.25s both",
            }}
          >
            Build real hacking labs from a single prompt just pure hacking
            exploitation and learning.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              animation: "fadeUp 0.8s ease 0.5s both",
            }}
          >
            <Link to="/Register" className="btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn-ghost">
              Sign In →
            </Link>
          </div>
          <p
            style={{
              color: C.text3,
              fontSize: 12.5,
              marginTop: 24,
              animation: "fadeUp 0.8s ease 0.75s both",
            }}
          >
            No credit card required &nbsp;·&nbsp; Instant lab provisioning
            &nbsp;·&nbsp; Real CVE-based infrastructure
          </p>
        </div>

        <div
          className="mobile-hide"
          style={{
            position: "absolute",
            right: "6%",
            top: "50%",
            transform: "translateY(-50%)",
            width: 220,
            height: 220,
            animation: "heroFloat 6s ease-in-out infinite",
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
              border: `1.5px solid ${C.accentBdr}`,
            }}
          />
          <img
            src={logoImg}
            alt="ctfWithAi"
            style={{
              width: 130,
              height: 130,
              objectFit: "contain",
              filter: `drop-shadow(0 6px 24px rgba(249,115,22,0.25))`,
            }}
          />
        </div>
      </section>

      {/* ═══ THREAT INTEL ═══ */}
      <section
        className="mobile-section"
        style={{ padding: "88px 48px", background: C.pageBg }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <FadeSection>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <PillTag>Powered by Vuln AI</PillTag>
              <h2 style={H2}>
                Train on{" "}
                <span style={{ color: C.accent }}>
                  AI-Generated Attack Surfaces
                </span>
              </h2>
              <p
                style={{
                  color: C.text3,
                  fontSize: 14,
                  maxWidth: 480,
                  margin: "0 auto",
                  lineHeight: 1.8,
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
              gap: 22,
            }}
          >
            <ThreatCard
              delay={0}
              img={imgChollima}
              tag="ATTACK"
              title="Red Teams"
              sub="Describe a scenario, drop a CVE or PoC URL - our AI spins up a real vulnerable app in seconds. no traditional recycled labs. Every challenge is built fresh from threats that exist in the wild, so you're always training on what actually matters."
            />
            <ThreatCard
              delay={80}
              img={imgOperator}
              tag="DEFEND"
              title="Blue Teams"
              sub="Train your team on real threats, not legacy stack. Pick the software your company uses, tell our AI what to attack, and it builds the lab. You practice the defense of your stack. You name it, AI builds it. Whether it's a web app, an OS, or a library if you use it you should secure it."
            />
            <ThreatCard
              delay={160}
              img={roboman}
              tag="TRAIN"
              title="Students"
              sub="Pick any vulnerability, describe what you want to learn whether it's part of a roadmap or your college syllabus, we build it. Start your cybersecurity career with real challenges that companies face today, not outdated puzzles. Learn how to break it, to secure it"
            />
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section
        id="features"
        className="mobile-section"
        style={{ padding: "88px 48px", background: C.sectionBg }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <FadeSection>
              <PillTag>Platform Features</PillTag>
              <h2 style={H2}>
                Built for{" "}
                <span style={{ color: C.accent }}>Security Practitioners</span>
              </h2>
              <GlowLine />
              <p
                style={{
                  color: C.text3,
                  fontSize: 14,
                  maxWidth: 500,
                  margin: "0 auto",
                  lineHeight: 1.8,
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
              desc="Describe any CVE,POC, URL or attack scenario Vuln AI builds a real vulnerable application from scratch and deploys it in an isolated sandbox instantly. No pre-built machines. Every lab is unique."
            />
            <FeatureCard
              delay={100}
              title="Sandbox Infrastructure"
              desc="Every lab runs in a fully isolated sandbox no shared resources, no cross-contamination. Users can generate and hack simultaneously without interference."
            />
            <FeatureCard
              delay={200}
              title="Competitive Leaderboard"
              desc="Rise through leaderboards by exploiting AI-generated targets. Earn points across tactics categories your rank reflects real attack proficiency, not course completions."
            />
            <FeatureCard
              delay={300}
              title="Campaign Mode"
              desc="Deploy AI-generated training campaigns across your entire security team or share it with your friends. Assign custom lab scenarios by role, track exploitation progress per analyst, and surface skill gaps from a single dashboard."
            />
            <FeatureCard
              delay={400}
              title="Infinite Attack Scenarios"
              desc="Never run out of challenges. Vuln AI generates unlimited unique vulnerable applications — SQL injection, RCE, privilege escalation, SSRF, and beyond. Every session is a new target."
            />
            <FeatureCard
              delay={500}
              title="Role-Based Access Control"
              desc="Dedicated environments for individual practitioners, enterprise security teams, and platform administrators  each with precisely scoped tooling, permissions, and lab access."
            />
          </div>
        </div>
      </section>

      {/* ═══ PRICING (hidden for now) ═══ */}
      {/*
      <section
        id="pricing"
        className="mobile-section"
        style={{
          padding: "88px 48px",
          background: C.pageBg,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <FadeSection>
              <PillTag>Monthly Pricing</PillTag>
              <h2 style={H2}>
                Pick a Plan Built for{" "}
                <span style={{ color: C.accent }}>How Fast You Learn</span>
              </h2>
              <GlowLine />
              <p
                style={{
                  color: C.text3,
                  fontSize: 14,
                  maxWidth: 560,
                  margin: "0 auto",
                  lineHeight: 1.85,
                }}
              >
                Start free, scale your token capacity as your labs grow, and
                move to enterprise when you need custom infrastructure.
              </p>
            </FadeSection>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            <PricingCard
              delay={0}
              name={landingPlans.free?.display_name || "Free Tier"}
              price={freePrice.price}
              period={freePrice.period}
              tokens="Limited monthly usage"
              description="For early exploration and basic testing only."
              ctaText="Start Free"
              ctaTo="/Register"
            />
            <PricingCard
              delay={80}
              name={landingPlans.pro?.display_name || "Pro"}
              price={proPrice.price}
              period={proPrice.period}
              tokens="Expanded monthly usage"
              description="For consistent solo practice with more room to run labs."
              ctaText="Choose Pro"
              ctaTo="/pricing"
            />
            <PricingCard
              delay={160}
              name={landingPlans.pro_plus?.display_name || "Pro Plus"}
              price={proPlusPrice.price}
              period={proPlusPrice.period}
              tokens="High monthly usage"
              description="Best for power users, heavy practice, and frequent campaign creation."
              tags={["Most Popular", "Recommended"]}
              ctaText="Choose Pro Plus"
              ctaTo="/pricing"
              highlight
            />
            <PricingCard
              delay={240}
              name={landingPlans.enterprise?.display_name || "Enterprise"}
              price={enterprisePrice.price}
              period={enterprisePrice.period}
              tokens="Custom usage and controls"
              description="Volume pricing, custom limits, advanced controls, and team-level support."
              ctaText="Contact Sales"
              ctaTo="/pricing"
              ctaGhost
            />
          </div>
        </div>
      </section>
      */}

      {/* ═══ WHY DIFFERENT ═══ */}
      <section
        id="get-in-touch"
        className="mobile-section"
        style={{
          padding: "120px 48px",
          background: "transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: "50%",
            transform: "translateY(-50%)",
            width: 440,
            height: 440,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="mobile-grid-1"
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
            <PillTag>Why CTFWITHAI?</PillTag>
            <h2 style={H2}>
              We're not like{" "}
              <span style={{ color: C.accent }}>other Platforms.</span>
            </h2>
            <p
              style={{
                color: C.text2,
                fontSize: 14.5,
                lineHeight: 1.9,
                marginBottom: 20,
              }}
            >
              Every security professional from beginner to advanced hits a wall{" "}
              <strong style={{ color: C.text1 }}>
                same old labs, predictable challenges, no resemblance to the
                real world.
              </strong>{" "}
              We built ctfWithAi to tear that wall down. Practice on your
              favorite vulnerability categories, create the challenges you
              actually want to solve, and build anything you can imagine{" "}
              <strong style={{ color: C.text1 }}>
                no restrictions, your way.
              </strong>
            </p>
            <p style={{ color: C.text2, fontSize: 14.5, lineHeight: 1.9 }}>
              Our AI doesn't give you hints it builds you a real target from
              scratch. Describe what you want to exploit, paste a CVE,POC or a
              URL, or name a vulnerability —{" "}
              <strong style={{ color: C.text1 }}>
                it spins up a real vulnerable app, sandboxed and live in
                seconds.
              </strong>{" "}
              No recycled machines, no templates, no limits. Just you and a
              fresh attack surface, every single time.
            </p>
          </FadeSection>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <DiffItem
              delay={0}
              title="No Pre-Built Labs. Ever."
              desc="Every lab is built from scratch by our AI, just for you, just for that session. No repeated challenges, not the same labs. Every time you log in, you get something new  built specifically around what you want to learn"
            />
            <DiffItem
              delay={100}
              title="AI That Builds, Not Just Hints"
              desc="Our AI does not just give you hints when you are stuck. It builds the entire application from scratch. The target, the misconfiguration, the exploit path. Everything is generated for you, ready to hack."
            />
            <DiffItem
              delay={200}
              title="AI Does the Research"
              desc="Paste a URL and our AI scrapes it, researches the vulnerability, asks you the right questions, and builds a lab that actually resembles what you want to exploit."
            />
            <DiffItem
              delay={300}
              title="AI Pentests Every Lab"
              desc="We don't just build it and ship it. Our AI pentests every lab before you touch it making sure the vulnerability is real and exploitable."
            />
          </div>
        </div>
      </section>

      {/* ═══ VISION ═══ */}
      <section
        id="vision"
        className="mobile-section"
        style={{ padding: "88px 48px", background: C.sectionBg }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 58 }}>
            <FadeSection>
              <PillTag>Our Vision</PillTag>
              <h2 style={H2}>
                Building The Future of{" "}
                <span style={{ color: C.accent }}>Cybersecurity Training</span>
              </h2>
              <GlowLine />
              <p
                style={{
                  color: C.text3,
                  fontSize: 14,
                  maxWidth: 520,
                  margin: "0 auto",
                  lineHeight: 1.85,
                }}
              >
                New vulnerabilities emerge every day and the skills gap widens
                with it. We're building a platform where everyone stays current
                and updated bridging the skill gap with AI-generated labs built
                around the latest threats.
              </p>
            </FadeSection>
          </div>

          <div
            className="mobile-grid-1"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {[
              {
                title: "The Practitioners ",
                body: "New CVEs drop daily. Vuln AI generates labs around the latest vulnerabilities and real-world challanges so practitioners are always training on what actually matters right now.",
              },
              {
                title: "The College and University",
                body: "Most universities teach cybersecurity theory but skip the practical part. With ctfWithAi, teachers can generate labs straight according to their syllabus, and students learn by actually practically doing it, not just reading about it. Real skills, not just a degree",
              },
              {
                title: "The Bug Bounty Hunters",
                body: "SWhen a new vulnerability drops, bug hunters can replicate it instantly with ctfWithAi practice on a real lab, understand it deeply, and find it in the wild before any threat actor does.",
              },
              {
                title: "The Enterprises",
                body: "From individual learners to full security teams, ctfWithAi scales with you. Custom campaigns, team analytics, and AI-generated labs tailored to your organization's threat landscape.",
              },
            ].map((g, i) => (
              <FadeSection key={i} delay={i * 100}>
                <div
                  style={{
                    padding: "24px 22px",
                    background: C.cardBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    boxShadow: `0 1px 4px ${C.shadow}`,
                  }}
                >
                  <h4
                    style={{
                      color: C.text1,
                      fontWeight: 700,
                      fontSize: 14.5,
                      marginBottom: 9,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {g.title}
                  </h4>
                  <p style={{ color: C.text3, fontSize: 13, lineHeight: 1.8 }}>
                    {g.body}
                  </p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AWS PARTNERSHIP ═══ */}
      <section
        className="mobile-section"
        style={{
          padding: "40px 48px",
          background: C.pageBg,
          textAlign: "center",
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <FadeSection>
            <PillTag>Infrastructure Partner</PillTag>
            <h2 style={{ ...H2, marginBottom: 24 }}>
              ctfWithAi × <span style={{ color: C.accent }}>AWS Activate</span>:
              Building the Future of AI in Education
            </h2>
            <p
              style={{
                color: C.text2,
                fontSize: 15,
                lineHeight: 1.85,
                marginBottom: 40,
                maxWidth: 600,
                margin: "0 auto",
              }}
            >
              Backed by AWS Activate program, we’re accelerating our mission for
              Learners.
            </p>
            <div
              style={{
                display: "inline-block",
                padding: "32px 48px",
                background: C.cardBg,
                borderRadius: 20,
                border: `1px solid ${C.border}`,
                boxShadow: `0 4px 20px ${C.shadow}`,
                cursor: "default",
              }}
            >
              <img
                src={awsImg}
                alt="Supported by AWS Activate"
                style={{
                  height: 60,
                  objectFit: "contain",
                  filter: "brightness(0.95) contrast(1.1)",
                }}
              />
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section
        className="mobile-section"
        style={{
          padding: "60px 48px 88px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: C.sectionBg,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 62%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <FadeSection>
            <PillTag>Get In Touch</PillTag>
            <h2
              style={{
                ...H2,
                fontSize: "clamp(28px,4.5vw,52px)",
                letterSpacing: -2,
              }}
            >
              Want to Get In <span style={{ color: C.accent }}>Touch?</span>
            </h2>
            <p
              style={{
                color: C.text2,
                fontSize: 15,
                lineHeight: 1.85,
                maxWidth: 480,
                margin: "0 auto 48px",
              }}
            >
              Whether you're a student, security practitioner, or enterprise
              team lead, we'd love to hear from you. Reach out through your
              preferred channel below.
            </p>
            <div
              className="mobile-flex-col"
              style={{
                display: "flex",
                gap: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <button
                className="contact-btn"
                onClick={handleGmailClick}
                title="Send us an email"
                style={{
                  fontFamily: "inherit",
                  animation: gmailPulse ? "gmailPulse 0.2s ease" : "none",
                }}
              >
                <GmailIcon size={48} />
                <span className="contact-label">Email Us</span>
              </button>
              <a
                href="https://www.linkedin.com/company/vulnforge/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn"
                title="Follow us on LinkedIn"
              >
                <LinkedInIcon size={48} />
                <span className="contact-label">LinkedIn</span>
              </a>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer
        className="mobile-footer"
        style={{
          padding: "32px 48px",
          borderTop: `1px solid ${C.border}`,
          background: C.pageBg,
        }}
      >
        <div
          className="mobile-footer-inner"
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={logoImg}
              alt="ctfwithai"
              style={{ width: 26, height: 26, objectFit: "contain" }}
            />
            <div>
              <div
                style={{
                  fontWeight: 800,
                  color: C.text1,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ctfwithAi
              </div>
              <div style={{ color: C.text3, fontSize: 10.5, marginTop: 1 }}>
                © 2026 ctfWithAi. All rights reserved.
              </div>
            </div>
          </div>
          <div
            className="mobile-footer-links"
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Pricing link hidden for now */}
            {/* {["Features", "Pricing", "Vision"].map((item) => ( */}
            {["Features", "Vision"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  color: C.text3,
                  fontSize: 13,
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => (e.target.style.color = C.accent)}
                onMouseLeave={(e) => (e.target.style.color = C.text3)}
              >
                {item}
              </a>
            ))}
            <div style={{ width: 1, height: 14, background: C.border }} />
            <Link
              to="/privacy-policy"
              style={{
                color: C.text3,
                fontSize: 13,
                textDecoration: "none",
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => (e.target.style.color = C.accent)}
              onMouseLeave={(e) => (e.target.style.color = C.text3)}
            >
              Privacy Policy
            </Link>
            <Link
              to="/refund-policy"
              style={{
                color: C.text3,
                fontSize: 13,
                textDecoration: "none",
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => (e.target.style.color = C.accent)}
              onMouseLeave={(e) => (e.target.style.color = C.text3)}
            >
              Refund Policy
            </Link>
            <Link
              to="/login"
              style={{
                color: C.text2,
                fontSize: 13,
                textDecoration: "none",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => (e.target.style.color = C.accent)}
              onMouseLeave={(e) => (e.target.style.color = C.text2)}
            >
              Sign In
            </Link>
            <Link
              to="/Register"
              style={{
                color: C.accent,
                fontSize: 13,
                textDecoration: "none",
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
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
