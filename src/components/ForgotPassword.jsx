import React, { useState } from "react";
import {
  Shield,
  Mail,
  Loader,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

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
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (response.status >= 500)
          throw new Error(
            body.detail ||
              body.message ||
              "Something went wrong. Please try again.",
          );
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily: "'DM Sans','Inter',sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        html,body{margin:0;padding:0;overflow:hidden;height:100%}

        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes float1    { 0%,100%{transform:translateY(0) rotate(0deg)}  50%{transform:translateY(-16px) rotate(6deg)} }
        @keyframes float2    { 0%,100%{transform:translateY(0) rotate(0deg)}  50%{transform:translateY(-11px) rotate(-5deg)} }
        @keyframes float3    { 0%,100%{transform:translateY(0) rotate(0deg)}  50%{transform:translateY(-20px) rotate(8deg)} }
        @keyframes blobPulse { 0%,100%{opacity:.18;transform:scale(1)}        50%{opacity:.30;transform:scale(1.07)} }
        @keyframes spinSlow  { to{transform:rotate(360deg)} }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)}               50%{transform:translateY(-10px)} }
        @keyframes ringPulse { 0%,100%{opacity:.3;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.55;transform:translate(-50%,-50%) scale(1.05)} }

        .fp-f0{animation:fadeUp .5s ease 0s both}
        .fp-f1{animation:fadeUp .5s ease .07s both}
        .fp-f2{animation:fadeUp .5s ease .14s both}
        .fp-f3{animation:fadeUp .5s ease .21s both}
        *{box-sizing:border-box;margin:0;padding:0}

        .fp-input{
          width:100%; padding:10px 15px 10px 40px;
          background:${C.sectionBg}; border:1px solid ${C.border};
          border-radius:10px; color:${C.text1}; font-size:14px;
          font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s;
        }
        .fp-input::placeholder{color:#c9c2bb}
        .fp-input:focus{border-color:${C.accent}}

        .fp-btn{
          width:100%; padding:12px; background:${C.accent}; border:none;
          border-radius:30px; color:#fff; font-size:14px; font-weight:700;
          font-family:'DM Sans',sans-serif; letter-spacing:.3px; cursor:pointer;
          transition:all .22s ease; display:flex; align-items:center;
          justify-content:center; gap:8px;
          box-shadow:0 4px 18px rgba(249,115,22,.28);
        }
        .fp-btn:hover:not(:disabled){background:#e8660a;transform:translateY(-2px);box-shadow:0 8px 28px rgba(249,115,22,.38)}
        .fp-btn:active:not(:disabled){transform:scale(.98)}
        .fp-btn:disabled{background:rgba(249,115,22,.4);cursor:not-allowed;box-shadow:none}

        .fp-link{font-size:12.5px;color:${C.text3};text-decoration:none;font-family:'DM Sans',sans-serif;transition:color .2s;background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:5px;}
        .fp-link:hover{color:${C.accent}}

        .badge-card{
          position:absolute; background:${C.cardBg};
          border:1px solid ${C.accentBdr}; border-radius:14px;
          padding:10px 16px; display:flex; align-items:center; gap:10px;
          box-shadow:0 4px 20px ${C.shadow};
        }

        @media(max-width:768px){
          .left-panel{display:none!important}
          .right-panel{width:100%!important}
        }
      `}</style>

      {/* ══════ LEFT PANEL ══════ */}
      <div
        className="left-panel"
        style={{
          width: "46%",
          height: "100vh",
          background: "linear-gradient(148deg,#fbeae2 0%,#f2d9cc 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        {/* bg blobs */}
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: "50%",
            top: "-18%",
            left: "-22%",
            background:
              "radial-gradient(circle,rgba(249,115,22,.10) 0%,transparent 70%)",
            animation: "blobPulse 8s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            bottom: "-12%",
            right: "-16%",
            background:
              "radial-gradient(circle,rgba(249,115,22,.08) 0%,transparent 70%)",
            animation: "blobPulse 10s ease-in-out infinite 1.5s",
            pointerEvents: "none",
          }}
        />

        {/* floating shapes */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "10%",
            width: 52,
            height: 52,
            borderRadius: 14,
            background: C.accentBg,
            border: `1.5px solid ${C.accentBdr}`,
            animation: "float1 5.5s ease-in-out infinite",
            transform: "rotate(18deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "36%",
            left: "5%",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: C.accentBg,
            border: `1.5px solid ${C.accentBdr}`,
            animation: "float2 6.5s ease-in-out infinite .8s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "8%",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: C.accentBg,
            border: `1.5px solid ${C.accentBdr}`,
            animation: "float3 7s ease-in-out infinite 1.4s",
            transform: "rotate(-14deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "16%",
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `2px dashed ${C.accentBdr}`,
            animation: "spinSlow 20s linear infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "26%",
            right: "7%",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: C.accent,
            opacity: 0.2,
            animation: "float1 4.8s ease-in-out infinite .5s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "52%",
            right: "5%",
            width: 28,
            height: 28,
            borderRadius: 8,
            background: C.accentBg,
            border: `1.5px solid ${C.accentBdr}`,
            animation: "float2 5.8s ease-in-out infinite 2s",
            transform: "rotate(30deg)",
          }}
        />

        {/* badge top-right */}
        <div
          className="badge-card"
          style={{
            top: "11%",
            right: "4%",
            animation: "float2 6s ease-in-out infinite .3s",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: C.accentBg,
              border: `1px solid ${C.accentBdr}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle
                cx="6.5"
                cy="6.5"
                r="5.5"
                stroke={C.accent}
                strokeWidth="1.4"
              />
              <path
                d="M6.5 4v3l1.5 1.5"
                stroke={C.accent}
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.text1,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Live Labs
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Instant provisioning
            </div>
          </div>
        </div>

        {/* badge bottom-left */}
        <div
          className="badge-card"
          style={{
            bottom: "16%",
            left: "2%",
            animation: "float3 7s ease-in-out infinite 1s",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: C.accentBg,
              border: `1px solid ${C.accentBdr}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M2 10L6.5 3L11 10H2Z"
                stroke={C.accent}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.text1,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              AI-Generated
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Unique every session
            </div>
          </div>
        </div>

        {/* centre: logo + copy */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 128,
              height: 128,
              borderRadius: "50%",
              border: `1.5px solid ${C.accentBdr}`,
              animation: "ringPulse 3.5s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 162,
              height: 162,
              borderRadius: "50%",
              border: `1px solid ${C.accentBdr}`,
              animation: "ringPulse 3.5s ease-in-out infinite .7s",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />

          {/* shield icon as centrepiece */}
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: "50%",
              background: C.accentBg,
              border: `1.5px solid ${C.accentBdr}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              position: "relative",
              zIndex: 2,
              animation: "logoFloat 5s ease-in-out infinite",
              boxShadow: `0 8px 28px rgba(249,115,22,.18)`,
              marginBottom: 30,
            }}
          >
            <Shield style={{ width: 36, height: 36, color: C.accent }} />
          </div>

          <div
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
              fontFamily: "'DM Sans',sans-serif",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: C.accent,
                display: "inline-block",
              }}
            />
            Account Recovery
          </div>

          <h2
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: C.text1,
              letterSpacing: -1.1,
              lineHeight: 1.14,
              fontFamily: "'DM Sans',sans-serif",
              marginBottom: 14,
            }}
          >
            Locked out?
            <br />
            <span style={{ color: C.accent }}>We've got</span>
            <br />
            you covered.
          </h2>
        </div>
      </div>

      {/* ══════ RIGHT PANEL ══════ */}
      <div
        className="right-panel"
        style={{
          width: "54%",
          height: "100vh",
          background: C.cardBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            top: "-8%",
            right: "-6%",
            background:
              "radial-gradient(circle,rgba(249,115,22,.04) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* ── SUCCESS STATE ── */}
          {submitted ? (
            <>
              <div className="fp-f0" style={{ marginBottom: 32 }}>
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: C.text1,
                    letterSpacing: -0.8,
                    fontFamily: "'DM Sans',sans-serif",
                    marginBottom: 4,
                  }}
                >
                  Check your inbox
                </h1>
                <p
                  style={{
                    color: C.text3,
                    fontSize: 13.5,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Reset link on its way
                </p>
              </div>

              <div
                className="fp-f1"
                style={{
                  background: C.sectionBg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: "36px 28px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(22,163,74,.08)",
                    border: "1px solid rgba(22,163,74,.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle
                    style={{ width: 30, height: 30, color: "#16a34a" }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      color: C.text1,
                      fontWeight: 700,
                      fontSize: 15,
                      fontFamily: "'DM Sans',sans-serif",
                      marginBottom: 8,
                    }}
                  >
                    Email sent!
                  </p>
                  <p
                    style={{
                      color: C.text3,
                      fontSize: 13,
                      lineHeight: 1.8,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    If{" "}
                    <span style={{ color: C.accent, fontWeight: 700 }}>
                      {email}
                    </span>{" "}
                    is linked to an account, you'll receive a reset link
                    shortly. Check your spam folder too.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setError(null);
                  }}
                  className="fp-link"
                >
                  Didn't receive it? Send again
                </button>
              </div>

              <div
                className="fp-f2"
                style={{ textAlign: "center", marginTop: 24 }}
              >
                <a href="/login" className="fp-link">
                  <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Sign
                  In
                </a>
              </div>
            </>
          ) : (
            /* ── FORM STATE ── */
            <>
              <div className="fp-f0" style={{ marginBottom: 28 }}>
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: C.text1,
                    letterSpacing: -0.8,
                    fontFamily: "'DM Sans',sans-serif",
                    marginBottom: 4,
                  }}
                >
                  Reset password
                </h1>
                <p
                  style={{
                    color: C.text3,
                    fontSize: 13.5,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  We'll send a reset link to your email
                </p>
              </div>

              {/* helper text */}
              <p
                className="fp-f1"
                style={{
                  color: C.text3,
                  fontSize: 13,
                  lineHeight: 1.8,
                  fontFamily: "'DM Sans',sans-serif",
                  marginBottom: 22,
                }}
              >
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>

              {/* error */}
              {error && (
                <div
                  className="fp-f0"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    marginBottom: 16,
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

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className="fp-f2">
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
                    Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 15,
                        height: 15,
                        color: C.text3,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      autoFocus
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      className="fp-input"
                    />
                  </div>
                </div>

                <div className="fp-f3" style={{ paddingTop: 4 }}>
                  <button type="submit" disabled={loading} className="fp-btn">
                    {loading ? (
                      <>
                        <Loader
                          style={{
                            width: 15,
                            height: 15,
                            animation: "spin 1s linear infinite",
                          }}
                        />{" "}
                        Sending link…
                      </>
                    ) : (
                      "Send Reset Link →"
                    )}
                  </button>
                </div>
              </form>

              <div
                className="fp-f3"
                style={{ textAlign: "center", marginTop: 24 }}
              >
                <a href="/login" className="fp-link">
                  <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Sign
                  In
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
