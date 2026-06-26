import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  Building2,
  Skull,
} from "lucide-react";
import logoImg from "../assets/logo.png";

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
  shadowMd: "rgba(0,0,0,0.10)",
};

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [portal, setPortal] = useState("individual");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, portal }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.message || "Invalid credentials");
      }
      const data = await response.json();
      if (data.token) localStorage.setItem("token", data.token);
      if (data.userId) localStorage.setItem("userId", data.userId);
      if (data.username) localStorage.setItem("username", data.username);
      if (data.role) localStorage.setItem("role", data.role);
      const redirectUrl = data.redirect_url || "/dashboard";
      if (onLoginSuccess) {
        onLoginSuccess(data);
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
      } else {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchPortal = (type) => {
    setPortal(type);
    setError(null);
  };
  const isEnterprise = portal === "enterprise";

  // ── Google Sign-In handler ──────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.message || "Google sign-in failed");
      }
      const data = await response.json();
      if (data.token) localStorage.setItem("token", data.token);
      if (data.userId) localStorage.setItem("userId", data.userId);
      if (data.username) localStorage.setItem("username", data.username);
      if (data.role) localStorage.setItem("role", data.role);
      const redirectUrl = data.redirect_url || "/dashboard";
      if (onLoginSuccess) {
        onLoginSuccess(data);
        setTimeout(() => { window.location.href = redirectUrl; }, 100);
      } else {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes float1    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-16px) rotate(6deg)} }
        @keyframes float2    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-11px) rotate(-5deg)} }
        @keyframes float3    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(8deg)} }
        @keyframes blobPulse { 0%,100%{opacity:0.18;transform:scale(1)} 50%{opacity:0.30;transform:scale(1.07)} }
        @keyframes spinSlow  { to{transform:rotate(360deg)} }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes ringPulse { 0%,100%{opacity:0.3;transform:translate(-50%,-50%) scale(1)} 50%{opacity:0.55;transform:translate(-50%,-50%) scale(1.05)} }

        .lu-f0{animation:fadeUp .5s ease 0s both}
        .lu-f1{animation:fadeUp .5s ease .07s both}
        .lu-f2{animation:fadeUp .5s ease .14s both}
        .lu-f3{animation:fadeUp .5s ease .21s both}
        .lu-f4{animation:fadeUp .5s ease .28s both}
        *{box-sizing:border-box;margin:0;padding:0}

        .lu-input{
          width:100%; padding:11px 15px 11px 40px;
          background:${C.sectionBg}; border:1px solid ${C.border};
          border-radius:10px; color:${C.text1}; font-size:14px;
          font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s;
        }
        .lu-input::placeholder{color:#c9c2bb}
        .lu-input:focus{border-color:${C.accent}}

        .lu-tab{
          flex:1; padding:9px 10px; font-size:12px; font-weight:700;
          font-family:'DM Sans',sans-serif; letter-spacing:.3px;
          border:1px solid ${C.border}; border-radius:30px; cursor:pointer;
          transition:all .22s ease; display:flex; align-items:center;
          justify-content:center; background:transparent; color:${C.text3};
        }
        .lu-tab:hover{color:${C.text1};border-color:${C.accent};background:${C.accentBg}}
        .lu-tab.active{background:${C.accentBg};color:${C.accent};border-color:${C.accentBdr}}

        .lu-btn{
          width:100%; padding:12px; background:${C.accent}; border:none;
          border-radius:30px; color:#fff; font-size:14px; font-weight:700;
          font-family:'DM Sans',sans-serif; letter-spacing:.3px; cursor:pointer;
          transition:all .22s ease; display:flex; align-items:center;
          justify-content:center; gap:8px;
          box-shadow:0 4px 18px rgba(249,115,22,.28);
        }
        .lu-btn:hover:not(:disabled){background:#e8660a;transform:translateY(-2px);box-shadow:0 8px 28px rgba(249,115,22,.38)}
        .lu-btn:active:not(:disabled){transform:scale(.98)}
        .lu-btn:disabled{background:rgba(249,115,22,.4);cursor:not-allowed;box-shadow:none}

        .lu-link{font-size:12.5px;color:${C.text3};text-decoration:none;font-family:'DM Sans',sans-serif;transition:color .2s}
        .lu-link:hover{color:${C.accent}}

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
          minHeight: "100vh",
          background: `linear-gradient(148deg,#fbeae2 0%,#f2d9cc 100%)`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 40px",
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
        {/* extra small square top-left */}
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

        {/* floating badge top-right */}
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

        {/* floating badge bottom-left */}
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

        {/* centre content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          {/* pulsing rings */}
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

          <img
            src={logoImg}
            alt="ctfWithAi"
            style={{
              width: 82,
              height: 82,
              objectFit: "contain",
              position: "relative",
              zIndex: 2,
              animation: "logoFloat 5s ease-in-out infinite",
              filter: `drop-shadow(0 8px 28px rgba(249,115,22,.28))`,
              marginBottom: 30,
            }}
          />

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
            Cybersecurity Training
          </div>

          <h2
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: C.text1,
              letterSpacing: -1.1,
              lineHeight: 1.14,
              fontFamily: "'DM Sans',sans-serif",
              marginBottom: 100,
            }}
          >
            Train on
            <br />
            <span style={{ color: C.accent }}>Real Attack</span>
            <br />
            Surfaces.
          </h2>
        </div>
      </div>

      {/* ══════ RIGHT PANEL ══════ */}
      <div
        className="right-panel"
        style={{
          width: "54%",
          minHeight: "100vh",
          background: C.cardBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          position: "relative",
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
          {/* heading */}
          <div className="lu-f0" style={{ marginBottom: 28 }}>
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
              Welcome back
            </h1>
            <p
              style={{
                color: C.text3,
                fontSize: 13.5,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Sign in to your ctfWithAi account
            </p>
          </div>

          {/* tabs */}
          <div
            className="lu-f1"
            style={{ display: "flex", gap: 10, marginBottom: 24 }}
          >
            <button
              type="button"
              onClick={() => switchPortal("individual")}
              className={`lu-tab${portal === "individual" ? " active" : ""}`}
            >
              Join as Hacker
            </button>
            <button
              type="button"
              onClick={() => switchPortal("enterprise")}
              className={`lu-tab${portal === "enterprise" ? " active" : ""}`}
            >
              ctfWithAi for Business
            </button>
          </div>

          {/* error */}
          {error && (
            <div
              className="lu-f0"
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
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div className="lu-f2">
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
                  placeholder={
                    isEnterprise ? "admin@company.com" : "you@example.com"
                  }
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="lu-input"
                />
              </div>
            </div>

            <div className="lu-f3">
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
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
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
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="lu-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: C.text3,
                    display: "flex",
                    padding: 0,
                    transition: "color .2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
                >
                  {showPwd ? (
                    <EyeOff style={{ width: 15, height: 15 }} />
                  ) : (
                    <Eye style={{ width: 15, height: 15 }} />
                  )}
                </button>
              </div>
            </div>

            <div className="lu-f4" style={{ paddingTop: 4 }}>
              <button type="submit" disabled={loading} className="lu-btn">
                {loading ? (
                  <>
                    <Loader
                      style={{
                        width: 15,
                        height: 15,
                        animation: "spin 1s linear infinite",
                      }}
                    />{" "}
                    Signing in…
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
            </div>
          </form>

          {/* ── Google Sign-In (individual portal only) ── */}
          {!isEnterprise && (
            <div className="lu-f4" style={{ marginTop: 18 }}>
              {/* Divider */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                marginBottom: 18,
              }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{
                  fontSize: 11, fontWeight: 600, color: C.text3,
                  fontFamily: "'DM Sans',sans-serif", letterSpacing: 0.5,
                  textTransform: "uppercase", whiteSpace: "nowrap",
                }}>or</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* Google Sign-In Button */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                borderRadius: 30,
                overflow: "hidden",
              }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google sign-in failed. Please try again.")}
                  size="large"
                  shape="pill"
                  theme="outline"
                  text="continue_with"
                  width="380"
                  logo_alignment="center"
                />
              </div>

              {/* Loading overlay for Google auth */}
              {googleLoading && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, marginTop: 12,
                  color: C.text3, fontSize: 12.5,
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                  <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                  Authenticating with Google…
                </div>
              )}
            </div>
          )}

          {/* footer */}
          <div className="lu-f4" style={{ textAlign: "center", marginTop: 24 }}>
            {portal === "individual" ? (
              <>
                <a href="/forgot-password" className="lu-link">
                  Forgot password?
                </a>
                <span style={{ color: C.border, margin: "0 10px" }}>·</span>
                <a href="/register" className="lu-link">
                  Create account
                </a>
                <span style={{ color: C.border, margin: "0 10px" }}>·</span>
                <a href="/terms" className="lu-link">
                  Terms
                </a>
                <span style={{ color: C.border, margin: "0 10px" }}>·</span>
                <a href="/privacy-policy" className="lu-link">
                  Privacy
                </a>
                <span style={{ color: C.border, margin: "0 10px" }}>·</span>
                <a href="/refund-policy" className="lu-link">
                  Refunds
                </a>
              </>
            ) : (
              <div
                style={{
                  padding: "12px 18px",
                  background: C.sectionBg,
                  border: `1px solid ${C.accentBdr}`,
                  borderRadius: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 12.5,
                    color: C.text3,
                    lineHeight: 1.75,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  <span style={{ color: C.accent, fontWeight: 700 }}>
                    Enterprise user?
                  </span>{" "}
                  Please contact your organization administrator for credentials
                  or password resets.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
