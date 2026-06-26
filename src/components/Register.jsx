import React, { useState, useRef, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  User,
  CheckCircle,
  Phone,
  ChevronDown,
  Search,
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
};

/* ─── OTP Input ─── */
const OTPInput = ({ value, onChange, disabled }) => {
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const digits = (value + "    ").slice(0, 4).split("");

  const handleChange = (index, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits.map((d) => d.trim())];
    newDigits[index] = char;
    onChange(newDigits.join(""));
    if (char && index < 3) inputRefs[index + 1].current?.focus();
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index].trim() && index > 0)
      inputRefs[index - 1].current?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    onChange(pasted.padEnd(4, " ").slice(0, 4).trimEnd());
    inputRefs[Math.min(pasted.length, 3)].current?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={inputRefs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: 56,
            height: 64,
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 800,
            background: C.sectionBg,
            border: `2px solid ${digits[i].trim() ? C.accent : C.border}`,
            borderRadius: 12,
            color: C.text1,
            outline: "none",
            transition: "border-color .2s",
            caretColor: C.accent,
            fontFamily: "'DM Sans',sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e) =>
            (e.target.style.borderColor = digits[i].trim()
              ? C.accent
              : C.border)
          }
        />
      ))}
    </div>
  );
};

const COUNTRIES = [
  { name: "United States", code: "+1", short: "US" },
  { name: "Canada", code: "+1", short: "CA" },
  { name: "United Kingdom", code: "+44", short: "GB" },
  { name: "India", code: "+91", short: "IN" },
  { name: "Australia", code: "+61", short: "AU" },
  { name: "Pakistan", code: "+92", short: "PK" },
  { name: "Bangladesh", code: "+880", short: "BD" },
  { name: "Germany", code: "+49", short: "DE" },
  { name: "France", code: "+33", short: "FR" },
  { name: "Japan", code: "+81", short: "JP" },
  { name: "Brazil", code: "+55", short: "BR" },
  { name: "Mexico", code: "+52", short: "MX" },
  { name: "China", code: "+86", short: "CN" },
  { name: "Spain", code: "+34", short: "ES" },
  { name: "Italy", code: "+39", short: "IT" },
  { name: "South Africa", code: "+27", short: "ZA" },
  { name: "Saudi Arabia", code: "+966", short: "SA" },
  { name: "UAE", code: "+971", short: "AE" },
  { name: "Russia", code: "+7", short: "RU" },
  { name: "South Korea", code: "+82", short: "KR" },
  { name: "Indonesia", code: "+62", short: "ID" },
  { name: "Turkey", code: "+90", short: "TR" },
  { name: "Nigeria", code: "+234", short: "NG" },
  { name: "Egypt", code: "+20", short: "EG" },
  { name: "Vietnam", code: "+84", short: "VN" },
  { name: "Philippines", code: "+63", short: "PH" },
  { name: "Iran", code: "+98", short: "IR" },
  { name: "Thailand", code: "+66", short: "TH" },
  { name: "Argentina", code: "+54", short: "AR" },
  { name: "Colombia", code: "+57", short: "CO" },
  { name: "Ukraine", code: "+380", short: "UA" },
  { name: "Poland", code: "+48", short: "PL" },
  { name: "Morocco", code: "+212", short: "MA" },
  { name: "Malaysia", code: "+60", short: "MY" },
  { name: "Peru", code: "+51", short: "PE" },
  { name: "Venezuela", code: "+58", short: "VE" },
  { name: "Ghana", code: "+233", short: "GH" },
  { name: "Nepal", code: "+977", short: "NP" },
  { name: "Afghanistan", code: "+93", short: "AF" },
  { name: "Taiwan", code: "+886", short: "TW" },
  { name: "Hong Kong", code: "+852", short: "HK" },
  { name: "Singapore", code: "+65", short: "SG" },
  { name: "New Zealand", code: "+64", short: "NZ" },
  { name: "Ireland", code: "+353", short: "IE" },
  { name: "Netherlands", code: "+31", short: "NL" },
  { name: "Belgium", code: "+32", short: "BE" },
  { name: "Sweden", code: "+46", short: "SE" },
  { name: "Switzerland", code: "+41", short: "CH" },
  { name: "Austria", code: "+43", short: "AT" },
  { name: "Denmark", code: "+45", short: "DK" },
  { name: "Norway", code: "+47", short: "NO" },
  { name: "Finland", code: "+358", short: "FI" },
  { name: "Greece", code: "+30", short: "GR" },
  { name: "Portugal", code: "+351", short: "PT" },
  { name: "Israel", code: "+972", short: "IL" },
  { name: "Chile", code: "+56", short: "CL" },
  { name: "Romania", code: "+40", short: "RO" },
  { name: "Kenya", code: "+254", short: "KE" },
  { name: "Uganda", code: "+256", short: "UG" },
  { name: "Tanzania", code: "+255", short: "TZ" },
  { name: "Senegal", code: "+221", short: "SN" },
  { name: "Qatar", code: "+974", short: "QA" },
  { name: "Kuwait", code: "+965", short: "KW" },
  { name: "Oman", code: "+968", short: "OM" },
  { name: "Bahrain", code: "+973", short: "BH" },
  { name: "Lebanon", code: "+961", short: "LB" },
  { name: "Jordan", code: "+962", short: "JO" },
  { name: "Iraq", code: "+964", short: "IQ" },
  { name: "Syria", code: "+963", short: "SY" },
  { name: "Sri Lanka", code: "+94", short: "LK" },
  { name: "Myanmar", code: "+95", short: "MM" },
  { name: "Algeria", code: "+213", short: "DZ" },
  { name: "Sudan", code: "+249", short: "SD" },
  { name: "Angola", code: "+244", short: "AO" },
  { name: "Bolivia", code: "+591", short: "BO" },
  { name: "Ecuador", code: "+593", short: "EC" },
  { name: "Uruguay", code: "+598", short: "UY" },
  { name: "Paraguay", code: "+595", short: "PY" },
  { name: "Iceland", code: "+354", short: "IS" },
  { name: "Cameroon", code: "+237", short: "CM" },
];

const CountryCodePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];
  const filtered = COUNTRIES.filter((c) =>
    (c.name + c.short + c.code).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      ref={ref}
      style={{ position: "relative", width: "120px", flexShrink: 0 }}
    >
      <div
        className="rg-input"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          paddingLeft: "14px",
          paddingRight: "10px",
          userSelect: "none",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "0.5px",
            color: C.text2,
          }}
        >
          {selected.short} {selected.code}
        </span>
        <ChevronDown size={14} color={C.text3} />
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            boxShadow: `0 8px 16px ${C.shadow}`,
            zIndex: 50,
            maxHeight: "250px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Search size={14} color={C.text3} />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
                background: "transparent",
                color: C.text1,
              }}
            />
          </div>
          <div style={{ overflowY: "auto" }}>
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <div
                  key={c.code}
                  onClick={() => {
                    onChange(c.code);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: value === c.code ? C.accentBg : "transparent",
                    color: value === c.code ? C.accent : C.text2,
                  }}
                  onMouseOver={(e) => {
                    if (value !== c.code)
                      e.currentTarget.style.background = C.sectionBg;
                  }}
                  onMouseOut={(e) => {
                    if (value !== c.code)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontWeight: "600", letterSpacing: "0.5px" }}>
                    {c.short}
                  </span>
                  <span style={{ color: C.text3 }}>{c.code}</span>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: C.text3,
                }}
              >
                No matches
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Register Page ─── */
const Register = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(300);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (
      !username.trim() ||
      !fullName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (!termsAccepted) {
      setError("You must accept the Terms and Conditions.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() ? `${countryCode} ${phone.trim()}` : null,
          password,
          role: "individual",
          terms_accepted: termsAccepted,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail || b.message || "Registration failed");
      }
      const data = await res.json();
      if (data.verified && data.token) {
        setStep("success");
        setTimeout(() => {
          if (onRegisterSuccess) onRegisterSuccess(data);
          else window.location.href = "/login";
        }, 1500);
        return;
      }
      setStep("otp");
      setOtp("");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.replace(/\s/g, "");
    if (cleanOtp.length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/auth/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: cleanOtp }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail || b.message || "Verification failed");
      }
      const data = await res.json();
      setStep("success");
      clearInterval(timerRef.current);
      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess(data);
        else window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setError(null);
      setOtp("");
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() ? `${countryCode} ${phone.trim()}` : null,
          password,
          role: "individual",
          terms_accepted: termsAccepted,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail || "Could not resend OTP.");
      }
      setStep("form");
      setTimeout(() => setStep("otp"), 50);
    } catch (err) {
      setError(err.message || "Could not resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        throw new Error(body.detail || body.message || "Google sign-up failed");
      }
      const data = await response.json();
      if (data.token) localStorage.setItem("token", data.token);
      if (data.userId) localStorage.setItem("userId", data.userId);
      if (data.username) localStorage.setItem("username", data.username);
      if (data.role) localStorage.setItem("role", data.role);
      
      const redirectUrl = data.redirect_url || "/dashboard";
      if (onRegisterSuccess) {
        onRegisterSuccess(data);
        setTimeout(() => { window.location.href = redirectUrl; }, 100);
      } else {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setError(err.message || "Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const labelStyle = {
    display: "block",
    color: C.text2,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 5,
    fontFamily: "'DM Sans',sans-serif",
  };
  const iconStyle = {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    width: 15,
    height: 15,
    color: C.text3,
    pointerEvents: "none",
  };

  /* subtitle changes per step */
  const stepSub = {
    form: "Create your account",
    otp: "Verify your email",
    success: "Account created!",
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

        .rg-f0{animation:fadeUp .5s ease 0s both}
        .rg-f1{animation:fadeUp .5s ease .06s both}
        .rg-f2{animation:fadeUp .5s ease .12s both}
        .rg-f3{animation:fadeUp .5s ease .18s both}
        .rg-f4{animation:fadeUp .5s ease .24s both}
        .rg-f5{animation:fadeUp .5s ease .30s both}
        .rg-f6{animation:fadeUp .5s ease .36s both}
        *{box-sizing:border-box;margin:0;padding:0}

        .rg-input{
          width:100%; padding:8px 15px 8px 38px;
          background:${C.sectionBg}; border:1px solid ${C.border};
          border-radius:10px; color:${C.text1}; font-size:13px;
          font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s;
        }
        .rg-input::placeholder{color:#c9c2bb}
        .rg-input:focus{border-color:${C.accent}}

        .rg-btn{
          width:100%; padding:10px; background:${C.accent}; border:none;
          border-radius:30px; color:#fff; font-size:14px; font-weight:700;
          font-family:'DM Sans',sans-serif; letter-spacing:.3px; cursor:pointer;
          transition:all .22s ease; display:flex; align-items:center;
          justify-content:center; gap:8px;
          box-shadow:0 4px 18px rgba(249,115,22,.28);
        }
        .rg-btn:hover:not(:disabled){background:#e8660a;transform:translateY(-2px);box-shadow:0 8px 28px rgba(249,115,22,.38)}
        .rg-btn:active:not(:disabled){transform:scale(.98)}
        .rg-btn:disabled{background:rgba(249,115,22,.4);cursor:not-allowed;box-shadow:none}

        .rg-link{font-size:12.5px;color:${C.text3};text-decoration:none;font-family:'DM Sans',sans-serif;transition:color .2s;background:none;border:none;cursor:pointer;}
        .rg-link:hover{color:${C.accent}}

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
          padding: "40px 40px",
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
            Join The Forge
          </div>

          <h2
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: C.text1,
              letterSpacing: -1.1,
              lineHeight: 1.14,
              fontFamily: "'DM Sans',sans-serif",
              marginBottom: 50,
            }}
          >
            Generate.
            <br />
            <span style={{ color: C.accent }}>Exploit.</span>
            <br />
            Learn.
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
          padding: "32px 32px",
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
          {/* heading */}
          <div className="rg-f0" style={{ marginBottom: 16 }}>
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
              {step === "form"
                ? "Create account"
                : step === "otp"
                  ? "Verify your email"
                  : "You're in!"}
            </h1>
            <p
              style={{
                color: C.text3,
                fontSize: 13.5,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {stepSub[step]}
            </p>
          </div>

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div
              className="rg-f0"
              style={{
                background: C.sectionBg,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "40px 28px",
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
                    fontSize: 16,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Email verified!
                </p>
                <p
                  style={{
                    color: C.text3,
                    fontSize: 13,
                    marginTop: 8,
                    lineHeight: 1.75,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Your account has been created successfully.
                  <br />
                  Redirecting you to sign in…
                </p>
              </div>
            </div>
          )}

          {/* ── OTP SCREEN ── */}
          {step === "otp" && (
            <div
              className="rg-f0"
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <p
                style={{
                  color: C.text3,
                  fontSize: 13,
                  lineHeight: 1.75,
                  fontFamily: "'DM Sans',sans-serif",
                  textAlign: "center",
                }}
              >
                We sent a 4-digit code to
                <br />
                <span style={{ color: C.accent, fontWeight: 700 }}>
                  {email}
                </span>
              </p>

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
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
                onSubmit={handleOTPSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <OTPInput
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    setError(null);
                  }}
                  disabled={loading}
                />

                <p
                  style={{
                    textAlign: "center",
                    fontSize: 12.5,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {countdown > 0 ? (
                    <>
                      Code expires in{" "}
                      <span style={{ color: C.accent, fontWeight: 700 }}>
                        {fmt(countdown)}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: "#dc2626" }}>
                      Code expired — please resend
                    </span>
                  )}
                </p>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.replace(/\s/g, "").length !== 4 ||
                    countdown === 0
                  }
                  className="rg-btn"
                >
                  {loading ? (
                    <>
                      <Loader
                        style={{
                          width: 15,
                          height: 15,
                          animation: "spin 1s linear infinite",
                        }}
                      />{" "}
                      Verifying…
                    </>
                  ) : (
                    "Verify & Create Account →"
                  )}
                </button>
              </form>

              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="rg-link"
                    style={{ color: C.accent }}
                  >
                    Resend code
                  </button>
                ) : (
                  <p
                    style={{
                      fontSize: 12.5,
                      color: C.text3,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Didn't receive it? Wait for the timer to resend.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setError(null);
                    setOtp("");
                  }}
                  className="rg-link"
                >
                  ← Change details
                </button>
              </div>
            </div>
          )}

          {/* ── SIGNUP FORM ── */}
          {step === "form" && (
            <>
              {error && (
                <div
                  className="rg-f0"
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
                onSubmit={handleFormSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div className="rg-f1">
                  <label style={labelStyle}>Username</label>
                  <div style={{ position: "relative" }}>
                    <User style={iconStyle} />
                    <input
                      type="text"
                      autoComplete="username"
                      placeholder="hackerman42"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(null);
                      }}
                      className="rg-input"
                    />
                  </div>
                </div>

                <div className="rg-f2">
                  <label style={labelStyle}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <User style={iconStyle} />
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setError(null);
                      }}
                      className="rg-input"
                    />
                  </div>
                </div>

                <div className="rg-f3">
                  <label style={labelStyle}>Email</label>
                  <div style={{ position: "relative" }}>
                    <Mail style={iconStyle} />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      className="rg-input"
                    />
                  </div>
                </div>

                <div
                  className="rg-f3"
                  style={{ position: "relative", zIndex: 50 }}
                >
                  <label style={labelStyle}>
                    Phone
                    <span
                      style={{
                        textTransform: "none",
                        fontWeight: "normal",
                        color: C.text3,
                        marginLeft: 6,
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <CountryCodePicker
                      value={countryCode}
                      onChange={setCountryCode}
                    />
                    <div style={{ position: "relative", flex: 1 }}>
                      <Phone style={iconStyle} />
                      <input
                        type="tel"
                        autoComplete="tel"
                        placeholder="234 567 8900"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setError(null);
                        }}
                        className="rg-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="rg-f4">
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock style={iconStyle} />
                    <input
                      type={showPwd ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      className="rg-input"
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
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = C.accent)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = C.text3)
                      }
                    >
                      {showPwd ? (
                        <EyeOff style={{ width: 15, height: 15 }} />
                      ) : (
                        <Eye style={{ width: 15, height: 15 }} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rg-f5" style={{ paddingTop: 2 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 10,
                      color: C.text3,
                      fontSize: 12.5,
                      lineHeight: 1.7,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        setError(null);
                      }}
                      style={{ marginTop: 2 }}
                    />
                    <span>
                      I agree to the{" "}
                      <a href="/terms" className="rg-link" style={{ color: C.accent }}>
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="/privacy-policy" className="rg-link" style={{ color: C.accent }}>
                        Privacy Policy
                      </a>.
                    </span>
                  </label>
                  <button type="submit" disabled={loading} className="rg-btn">
                    {loading ? (
                      <>
                        <Loader
                          style={{
                            width: 15,
                            height: 15,
                            animation: "spin 1s linear infinite",
                          }}
                        />{" "}
                        Sending code…
                      </>
                    ) : (
                      "Sign Up →"
                    )}
                  </button>
                </div>
              </form>

              {/* ── Google Sign-In ── */}
              <div className="rg-f6" style={{ marginTop: 18 }}>
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
                    onError={() => setError("Google sign-up failed. Please try again.")}
                    size="large"
                    shape="pill"
                    theme="outline"
                    text="signup_with"
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

              <div
                className="rg-f6"
                style={{ textAlign: "center", marginTop: 12 }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Already have an account?
                </span>
                <span style={{ color: C.border, margin: "0 10px" }}>·</span>
                <a href="/login" className="rg-link">
                  Sign in
                </a>
                <span style={{ color: C.border, margin: "0 10px" }}>·</span>
                <a href="/terms" className="rg-link">
                  Terms
                </a>
                <span style={{ color: C.border, margin: "0 10px" }}>·</span>
                <a href="/privacy-policy" className="rg-link">
                  Privacy
                </a>
                <span style={{ color: C.border, margin: "0 10px" }}>·</span>
                <a href="/refund-policy" className="rg-link">
                  Refunds
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
