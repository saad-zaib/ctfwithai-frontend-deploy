// src/App.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Menu, Star } from 'lucide-react';

// Design system
import { T } from './design/tokens';

// Layout components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import NotificationDropdown from './components/NotificationDropdown';

// Page components
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

// ─── Navigation wrapper helpers ───────────────────────────────────────────────
const TeacherDashboardWrapper = () => {
  const nav = useNavigate();
  return <TeacherDashboard onNavigate={(path) => nav(path)} />;
};
const StudentUploadWrapper = () => {
  const nav = useNavigate();
  return <StudentUpload onBack={() => nav('/enterprise/portal')} />;
};

// ─── Role utilities ───────────────────────────────────────────────────────────
const getRoleHomePath = (role) => {
  if (role === 'enterprise_staff')  return '/enterprise/portal';
  if (role === 'enterprise_admin')  return '/enterprise/admin/dashboard';
  return '/';
};

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return children;
};

const Guarded = ({ roles, children }) => {
  const role = localStorage.getItem('role') || 'individual';
  if (!roles.includes(role)) return <Navigate to={getRoleHomePath(role)} replace />;
  return children;
};

// ─── App Shell — sidebar + top bar + page content ────────────────────────────
const AppShell = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);   // desktop collapse
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {/* ── Sidebar (desktop) — slides in/out ── */}
      <div
        className="sidebar-fixed"
        style={{
          display: 'flex',
          width: sidebarOpen ? T.sidebarWidth : 0,
          overflow: 'hidden',
          transition: 'width 0.25s ease',
          flexShrink: 0,
        }}
      >
        <Sidebar onLogout={onLogout} onToggle={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {mobileSidebarOpen && (
        <>
          {/* no overlay — sidebar is full screen */}
          <div className="sidebar-mobile-open">
            <Sidebar onLogout={onLogout} onToggle={() => setMobileSidebarOpen(false)} isOpen={true} isMobile={true} />
          </div>
        </>
      )}

      {/* ── Main area ── */}
      <div className="main-area">
        {/* ── Top bar ── */}
        <div style={{ zIndex: 40, flexShrink: 0 }}>
          <div style={{
            height: T.topNavHeight,
            background: T.cardBg,
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            gap: 12,
          }}>
            {/* Left: open button (only when sidebar closed) + page title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              {!sidebarOpen && (
                <button
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      setMobileSidebarOpen(true);
                    } else {
                      setSidebarOpen(true);
                    }
                  }}
                  title="Open sidebar"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 8,
                    border: `1px solid ${T.border}`, background: 'transparent',
                    cursor: 'pointer', color: T.text3, flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentBg; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text3; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Menu size={16} />
                </button>
              )}
              <TopBarContent location={location} />
            </div>

            {/* Right: notifications */}
            <TopBarRight />
          </div>
        </div>

        {/* ── Page routes ── */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={
              <Guarded roles={['individual', 'enterprise_staff', 'enterprise_admin']}>
                {(localStorage.getItem('role') || 'individual') === 'individual'
                  ? <Dashboard />
                  : <Navigate to={getRoleHomePath(localStorage.getItem('role') || 'individual')} replace />}
              </Guarded>
            } />
            <Route path="/machines" element={<Guarded roles={['individual', 'enterprise_staff']}><Machines /></Guarded>} />
            <Route path="/profile" element={<Guarded roles={['individual', 'enterprise_staff', 'enterprise_admin']}><Profile /></Guarded>} />
            <Route path="/recommendations" element={<Guarded roles={['individual', 'enterprise_staff', 'enterprise_admin']}><Recommendations /></Guarded>} />
            <Route path="/user/:username" element={<Guarded roles={['individual', 'enterprise_staff', 'enterprise_admin']}><PublicProfile /></Guarded>} />
            <Route path="/debug" element={<Guarded roles={['individual']}><ContainerDebug /></Guarded>} />
            <Route path="/leaderboard" element={<Guarded roles={['individual', 'enterprise_staff']}><Leaderboard /></Guarded>} />
            <Route path="/vuln-ai" element={<Guarded roles={['individual', 'enterprise_staff']}><LabChat /></Guarded>} />
            <Route path="/signal" element={<Guarded roles={['individual', 'enterprise_staff']}><Signal /></Guarded>} />
            <Route path="/campaigns" element={<Guarded roles={['enterprise_staff', 'individual']}><Campaigns /></Guarded>} />
            <Route path="/campaigns/:campaignId" element={<Guarded roles={['enterprise_staff', 'individual']}><CampaignDetail /></Guarded>} />
            <Route path="/coop" element={<Guarded roles={['individual', 'enterprise_staff']}><CoopLobby /></Guarded>} />
            <Route path="/coop/:sessionId" element={<Guarded roles={['individual', 'enterprise_staff']}><CoopSession /></Guarded>} />

            {/* Enterprise Admin */}
            <Route path="/enterprise/admin/dashboard" element={<Guarded roles={['enterprise_admin']}><EnterpriseDashboard /></Guarded>} />
            <Route path="/enterprise/admin/billing" element={<Guarded roles={['enterprise_admin']}><BillingAdmin /></Guarded>} />
            <Route path="/enterprise/admin/accounts" element={<Guarded roles={['enterprise_admin']}><CreatedAccounts /></Guarded>} />

            {/* Enterprise Staff */}
            <Route path="/enterprise/portal" element={<Guarded roles={['enterprise_staff']}><TeacherDashboardWrapper /></Guarded>} />
            <Route path="/enterprise/teacher/students" element={<Guarded roles={['enterprise_staff']}><StudentUploadWrapper /></Guarded>} />

            <Route path="*" element={<Navigate to={getRoleHomePath(localStorage.getItem('role') || 'individual')} replace />} />
          </Routes>
        </div>
      </div>

    </div>
  );
};

// ─── Inlined top bar content (avoids a second router context) ─────────────────
const PAGE_TITLES = {
  '/':                            { title: 'Dashboard',       sub: 'Overview of your activity' },
  '/machines':                    { title: 'Machines',        sub: 'Your lab environments' },
  '/campaigns':                   { title: 'Campaigns',       sub: 'Challenge campaigns' },
  '/leaderboard':                 { title: 'Leaderboard',     sub: 'Global rankings' },
  '/vuln-ai':                     { title: 'Vuln AI',         sub: 'AI-powered lab generator' },
  '/recommendations':             { title: 'For You',         sub: 'Personalized picks' },
  '/signal':                      { title: 'Signal',          sub: 'Real-time activity' },
  '/coop':                        { title: 'Hack Together',   sub: 'Collaborative sessions' },
  '/profile':                     { title: 'Profile',         sub: 'Account & settings' },
  '/enterprise/portal':           { title: 'Portal',          sub: 'Enterprise staff' },
  '/enterprise/admin/dashboard':  { title: 'Admin',           sub: 'Enterprise management' },
  '/enterprise/admin/billing':    { title: 'Billing',         sub: 'Subscription & invoices' },
  '/enterprise/admin/accounts':   { title: 'Accounts',        sub: 'Created accounts' },
};

const TopBarContent = ({ location }) => {
  const page = PAGE_TITLES[location.pathname] || { title: 'HackForge', sub: '' };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <h1 style={{
        fontSize: 16, fontWeight: 700,
        color: T.text1, fontFamily: T.font,
        letterSpacing: -0.3, lineHeight: 1.2,
      }}>
        {page.title}
      </h1>
      {page.sub && (
        <p style={{ fontSize: 12, color: T.text3, fontFamily: T.font, marginTop: 1 }}>
          {page.sub}
        </p>
      )}
    </div>
  );
};

const TopBarRight = () => {
  const userId = localStorage.getItem('userId') || '';
  const [points, setPoints] = React.useState(null);

  React.useEffect(() => {
    if (!userId) return;
    const API_BASE = process.env.REACT_APP_API_URL || '';
    fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/progress`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const p = data?.user?.total_points;
        if (p != null) setPoints(p);
      })
      .catch(() => {});
  }, [userId]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
      {points != null && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            paddingRight: 16,
          }}>
            <Star style={{ width: 14, height: 14, color: '#EAB308', flexShrink: 0 }} />
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: T.text1, fontFamily: T.font,
              fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3,
            }}>
              {points.toLocaleString()} pts
            </span>
          </div>
          <div style={{ width: 1, height: 20, background: T.border, marginRight: 16 }} />
        </>
      )}
      {userId && <NotificationDropdown />}
    </div>
  );
};

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
