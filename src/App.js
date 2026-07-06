// src/App.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, Server, Trophy, LogOut, Bot, Building2, Users, BookOpen } from 'lucide-react';
import ctfLogo from './assets/logo.png';

// Import components
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns';
import CampaignDetail from './components/CampaignDetail';
import Machines from './components/Machines';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Recommendations from './components/Recommendations';
import PublicProfile from './components/PublicProfile';
import NotificationDropdown from './components/NotificationDropdown';
import ContainerDebug from './components/ContainerDebug';
import LabChat from './components/LabChat';
import EnterpriseDashboard from './components/EnterpriseDashboard';
import CreatedAccounts from './components/CreatedAccounts';
import LandingPage from './components/LandingPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentUpload from './components/StudentUpload';
import CampaignAssign from './components/CampaignAssign';
import CampaignGrading from './components/CampaignGrading';
import CampaignShare from './components/CampaignShare';
import Walkthrough from './components/Walkthrough';
import TermsAndConditions from './components/TermsAndConditions';
import BillingAdmin from './components/BillingAdmin';
import PrivacyPolicy from './components/PrivacyPolicy';
import RefundPolicy from './components/RefundPolicy';
import PricingPage from './components/PricingPage';
import CoopSession from './components/CoopSession';
import CoopLobby from './components/CoopLobby';
import Signal from './components/Signal';

// ─── Navigation wrapper for TeacherDashboard ─────────────────────────────────
const TeacherDashboardWrapper = () => {
  const nav = require('react-router-dom').useNavigate();
  return <TeacherDashboard onNavigate={(path) => nav(path)} />;
};
const StudentUploadWrapper = () => {
  const nav = require('react-router-dom').useNavigate();
  return <StudentUpload onBack={() => nav('/enterprise/portal')} />;
};

// ─── Protected Route wrapper ─────────────────────────────────────────────────
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return children;
};

const getRoleHomePath = (role) => {
  if (role === "enterprise_staff") return "/enterprise/portal";
  if (role === "enterprise_admin") return "/enterprise/admin/dashboard";
  return "/";
};

// ─── Navigation (Aurius Theme) ───────────────────────────────────────────────
const C = {
  pageBg: "#fbeae2",
  sectionBg: "#fbeae2",
  cardBg: "#ffffff",
  navGlass: "rgba(251,234,226,0.88)",
  navGlassScrolled: "rgba(252,238,231,0.96)",
  navPattern: "rgba(24,24,24,0.012)",
  text1: "#181818",
  text2: "#3d3d3d",
  text3: "#797979",
  border: "#e8e2db",
  accent: "#f97316",
  accentBg: "rgba(249,115,22,0.08)",
  accentBdr: "rgba(249,115,22,0.22)",
  shadow: "rgba(0,0,0,0.06)",
  shadowMd: "rgba(0,0,0,0.10)",
};
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Navigation = ({ onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 900);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [planCode, setPlanCode] = useState("free");
  const [upgradeBusy, setUpgradeBusy] = useState("");
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
  const upgradeMenuRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    const handleResize = () => {
      setIsCompact(window.innerWidth < 900);
      setIsMobile(window.innerWidth < 640);
    };
    const handleDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("touchstart", handleDocClick);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("touchstart", handleDocClick);
    };
  }, []);

  const isActive = (path) => location.pathname === path;
  const username = localStorage.getItem("username") || "User";
  const currentUserId = localStorage.getItem("userId") || "";
  const profileAvatar = localStorage.getItem(`profileAvatar:${currentUserId || "anonymous"}`);
  const role = localStorage.getItem("role") || "individual";
  const homePath = getRoleHomePath(role);

  const navItems = useMemo(() => {
    if (role === "enterprise_admin") {
      return [
        { path: "/enterprise/admin/dashboard", label: "Admin Dashboard" },
        { path: "/enterprise/admin/billing", label: "Billing" },
        { path: "/enterprise/admin/accounts", label: "Created Accounts" },
        { path: "/profile", label: "Profile" },
      ];
    }
    if (role === "enterprise_staff") {
      return [
        { path: "/enterprise/portal", label: "Dashboard" },
        { path: "/machines", label: "Machines" },
        { path: "/enterprise/teacher/students", label: "Students" },
        { path: "/campaigns", label: "Campaigns" },
        { path: "/vuln-ai", label: "Vuln AI" },
        // { path: "/leaderboard", label: "Leaderboard" },
        { path: "/profile", label: "Profile" },
      ];
    }
    return [
      { path: "/", label: "Dashboard" },
      { path: "/machines", label: "Machines" },
      { path: "/campaigns", label: "Campaigns" },
      // { path: "/leaderboard", label: "Leaderboard" },
      { path: "/vuln-ai", label: "Vuln AI" },
      { path: "/recommendations", label: "For You" },
      { path: "/signal", label: "Signal" },
      { path: "/coop", label: "Hack Together" },
      { path: "/profile", label: "Profile" },
    ];
  }, [role]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      setPlanCode("free");
      return;
    }
    const loadPlan = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/billing/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const plan = String(
          data?.quota?.plan_code || data?.subscription?.plan_code || "free",
        ).toLowerCase();
        setPlanCode(plan);
      } catch (_) {}
    };
    loadPlan();
  }, [currentUserId]);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (!upgradeMenuRef.current) return;
      if (!upgradeMenuRef.current.contains(e.target)) {
        setShowUpgradeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  const upgradeOptions = useMemo(() => {
    if (planCode === "free") {
      return [
        { code: "pro", label: "Upgrade to Pro" },
        { code: "pro_plus", label: "Upgrade to Pro Plus" },
      ];
    }
    if (planCode === "pro") {
      return [{ code: "pro_plus", label: "Upgrade to Pro Plus" }];
    }
    return [];
  }, [planCode]);

  const startUpgradeCheckout = async (targetPlan) => {
    const token = localStorage.getItem("token") || "";
    if (!token || !targetPlan) return;
    setUpgradeBusy(targetPlan);
    try {
      const res = await fetch(`${API_BASE}/api/billing/payment-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_code: targetPlan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      const requestId = data?.payment_request?.request_id;
      if (!requestId) {
        throw new Error("Payment request was not created.");
      }
      window.location.href = `/pricing?request_id=${encodeURIComponent(requestId)}`;
    } catch (e) {
      window.alert(e?.message || "Failed to start payment request.");
    } finally {
      setUpgradeBusy("");
      setShowUpgradeMenu(false);
    }
  };

  const isEnterprise = role.startsWith("enterprise_");
  const avatarBg = isEnterprise ? "#3b82f6" : C.accent;

  const roleLabel =
    role === "enterprise_admin"
      ? "Enterprise Admin"
      : role === "enterprise_staff"
      ? "Enterprise Staff"
      : "Individual";

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: isCompact ? "0 10px" : "0 28px",
        height: 62,
        background: scrolled
          ? `linear-gradient(180deg, ${C.navGlassScrolled} 0%, rgba(251,234,226,0.93) 100%)`
          : `linear-gradient(180deg, ${C.navGlass} 0%, rgba(251,234,226,0.84) 100%)`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: `1px solid ${scrolled ? "rgba(232,226,219,0.88)" : "rgba(232,226,219,0.65)"}`,
        boxShadow: scrolled
          ? "0 2px 8px rgba(24,24,24,0.035)"
          : "0 1px 4px rgba(24,24,24,0.02)",
        transition: "all 0.32s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <Link
        to={homePath}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          minWidth: isCompact ? "auto" : 205,
          flexShrink: 0,
        }}
      >
        <img
          src={ctfLogo}
          alt="hackforge"
          style={{ width: 36, height: 36, objectFit: "contain" }}
        />
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: isCompact ? 15 : 16,
              letterSpacing: -0.5,
              color: C.text1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            hackforge
          </div>
        </div>
      </Link>

          {/* Desktop nav links — hidden on mobile */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: isCompact ? 4 : 16, flexShrink: 1, minWidth: 0, overflowX: "auto", scrollbarWidth: "none" }}>
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="nav-link-aurius"
                    style={{
                      position: "relative",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: isCompact ? 13 : 14,
                      fontWeight: 700,
                      color: active ? C.text1 : C.text3,
                      textDecoration: "none",
                      padding: isCompact ? "10px 10px" : "10px 12px",
                      borderRadius: 30,
                      border: "1px solid transparent",
                      background: "transparent",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                      minHeight: 44,
                    }}
                  >
                    {item.label}
                    {active && (
                      <span style={{
                        position: "absolute", bottom: 4, left: "50%",
                        transform: "translateX(-50%)", width: 14, height: 3,
                        background: C.accent, borderRadius: 3,
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side: notifications + avatar + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {currentUserId && <NotificationDropdown />}

            {/* Avatar / profile — click-based on all screens */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px 6px 6px", borderRadius: 30,
                  border: `1px solid ${profileOpen ? "rgba(232,226,219,0.78)" : "transparent"}`,
                  background: profileOpen ? "rgba(255,255,255,0.58)" : "transparent",
                  cursor: "pointer", minHeight: 44, transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", background: avatarBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 800, flexShrink: 0, overflow: "hidden",
                }}>
                  {profileAvatar
                    ? <img src={profileAvatar} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : username.slice(0, 1).toUpperCase()
                  }
                </div>
                {!isMobile && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text1, whiteSpace: "nowrap" }}>
                    {username.length > 12 ? username.slice(0, 12) + "…" : username}
                  </span>
                )}
              </button>

              {/* Profile dropdown — click-triggered, works on touch */}
              {profileOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)",
                  width: 220, background: C.cardBg,
                  border: `1px solid ${C.border}`, borderRadius: 16,
                  boxShadow: `0 14px 40px ${C.shadowMd}`, padding: 8, zIndex: 200,
                }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, marginBottom: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 2 }}>
                      {username.length > 14 ? username.slice(0, 14) + "…" : username}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.text3 }}>{roleLabel}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", border: "none", background: "transparent",
                      borderRadius: 10, color: "#dc2626", fontSize: 14, fontWeight: 700,
                      cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                      minHeight: 44,
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(v => !v)}
                style={{
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  alignItems: "center", gap: 5, width: 44, height: 44,
                  background: "none", border: "none", cursor: "pointer", borderRadius: 10,
                  padding: 10,
                }}
                aria-label="Menu"
              >
                <span style={{ width: 20, height: 2, background: C.text1, borderRadius: 2, display: "block", transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
                <span style={{ width: 20, height: 2, background: C.text1, borderRadius: 2, display: "block", opacity: menuOpen ? 0 : 1, transition: "all 0.2s" }} />
                <span style={{ width: 20, height: 2, background: C.text1, borderRadius: 2, display: "block", transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
              </button>
            )}
          </div>

          {/* Mobile slide-down menu */}
          {isMobile && menuOpen && (
            <div style={{
              position: "fixed", top: 62, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", zIndex: 150,
            }} onClick={() => setMenuOpen(false)}>
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: C.navGlass, backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderBottom: `1px solid ${C.border}`,
                  padding: "8px 0 16px",
                }}
              >
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex", alignItems: "center",
                        padding: "14px 24px", textDecoration: "none",
                        fontSize: 15, fontWeight: 700,
                        color: active ? C.accent : C.text2,
                        background: active ? C.accentBg : "transparent",
                        borderLeft: active ? `3px solid ${C.accent}` : "3px solid transparent",
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .nav-link-aurius:hover { color: ${C.text1} !important; }
      `}</style>
    </nav>
  );
};

// ─── Role-guarded route helper ────────────────────────────────────────────────
const Guarded = ({ roles, children }) => {
  const role = localStorage.getItem('role') || 'individual';
  if (!roles.includes(role)) return <Navigate to={getRoleHomePath(role)} replace />;
  return children;
};

// ─── App shell ────────────────────────────────────────────────────────────────
const AppShell = ({ onLogout }) => (
  <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#fbeae2" }}>

    {/* Dynamic Background Creativity */}
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <div
      style={{
        position: "absolute",
        top: "-20%",
        left: "-10%",
        width: "60vw",
        height: "60vw",
        background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, rgba(251,234,226,0) 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0,
        animation: "floatSlow 16s ease-in-out infinite alternate"
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: "-10%",
        right: "-20%",
        width: "70vw",
        height: "70vw",
        background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(251,234,226,0) 70%)",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0,
        animation: "floatSlow 22s ease-in-out infinite alternate-reverse"
      }}
    />

    </div>

    <style>{`
      @keyframes floatSlow {
        0% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(30px, 40px) scale(1.05); }
        100% { transform: translate(-20px, 20px) scale(0.95); }
      }
    `}</style>

    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <Navigation onLogout={onLogout} />
      <Routes>
      <Route path="/" element={<Guarded roles={['individual', 'enterprise_staff', 'enterprise_admin']}>{(localStorage.getItem('role') || 'individual') === 'individual' ? <Dashboard /> : <Navigate to={getRoleHomePath(localStorage.getItem('role') || 'individual')} replace />}</Guarded>} />
      <Route path="/machines" element={<Guarded roles={['individual', 'enterprise_staff']}><Machines /></Guarded>} />
      <Route path="/profile" element={<Guarded roles={['individual', 'enterprise_staff', 'enterprise_admin']}><Profile /></Guarded>} />
      <Route path="/recommendations" element={<Guarded roles={['individual', 'enterprise_staff', 'enterprise_admin']}><Recommendations /></Guarded>} />
      <Route path="/user/:username" element={<Guarded roles={['individual', 'enterprise_staff', 'enterprise_admin']}><PublicProfile /></Guarded>} />
      <Route path="/debug" element={<Guarded roles={['individual']}><ContainerDebug /></Guarded>} />
      <Route path="/leaderboard" element={<Guarded roles={['individual', 'enterprise_staff']}><Leaderboard /></Guarded>} />
      <Route path="/vuln-ai" element={<Guarded roles={['individual', 'enterprise_staff']}><LabChat /></Guarded>} />
      <Route path="/signal" element={<Guarded roles={['individual', 'enterprise_staff']}><Signal /></Guarded>} />
      {/* Campaigns — accessible to both staff and individual */}
      <Route path="/campaigns" element={<Guarded roles={['enterprise_staff', 'individual']}><Campaigns /></Guarded>} />
      <Route path="/campaigns/:campaignId" element={<Guarded roles={['enterprise_staff', 'individual']}><CampaignDetail /></Guarded>} />
      <Route path="/coop" element={<Guarded roles={['individual', 'enterprise_staff']}><CoopLobby /></Guarded>} />
      <Route path="/coop/:sessionId" element={<Guarded roles={['individual', 'enterprise_staff']}><CoopSession /></Guarded>} />

      {/* Enterprise Admin */}
      <Route path="/enterprise/admin/dashboard" element={<Guarded roles={['enterprise_admin']}><EnterpriseDashboard /></Guarded>} />
      <Route path="/enterprise/admin/billing" element={<Guarded roles={['enterprise_admin']}><BillingAdmin /></Guarded>} />
      <Route path="/enterprise/admin/accounts" element={<Guarded roles={['enterprise_admin']}><CreatedAccounts /></Guarded>} />

      {/* Enterprise Staff (Teacher) */}
      <Route path="/enterprise/portal" element={<Guarded roles={['enterprise_staff']}><TeacherDashboardWrapper /></Guarded>} />
      <Route path="/enterprise/teacher/students" element={<Guarded roles={['enterprise_staff']}><StudentUploadWrapper /></Guarded>} />

      <Route path="*" element={<Navigate to={getRoleHomePath(localStorage.getItem('role') || 'individual')} replace />} />
      </Routes>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!(localStorage.getItem('token') && localStorage.getItem('userId'));
  });

  const handleLoginSuccess = (data) => {
    if (data?.token)    localStorage.setItem('token', data.token);
    if (data?.userId)   localStorage.setItem('userId', data.userId);
    if (data?.username) localStorage.setItem('username', data.username);
    if (data?.role)     localStorage.setItem('role', data.role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('account_type');
    setIsLoggedIn(false);
  };

return (
  <Router>
    <Routes>
      <Route path="/walkthrough/:machineId" element={isLoggedIn ? <Walkthrough /> : <Navigate to="/" replace />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/Register" element={isLoggedIn ? <Navigate to="/" replace /> : <Register onRegisterSuccess={handleLoginSuccess} />} />
      <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/" replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={isLoggedIn ? <Navigate to="/" replace /> : <ResetPassword />} />
      <Route path="/*" element={
        isLoggedIn
          ? <AppShell onLogout={handleLogout} />
          : <LandingPage />
      } />
    </Routes>
  </Router>
);

}

export default App;
