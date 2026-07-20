import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Server, Trophy, Bot, BookOpen, Users,
  User, LogOut, Zap, Radio,
  CreditCard, UserPlus, PanelLeftClose,
} from 'lucide-react';
import { T } from '../design/tokens';
import ctfLogo from '../assets/logo.png';

const NavItem = ({ to, icon: Icon, label, active }) => {
  const [hov, setHov] = useState(false);

  return (
    <Link
      to={to}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '10px 14px',
        borderRadius: 12,
        textDecoration: 'none',
        background: active ? T.accentBg : hov ? 'rgba(0,0,0,0.03)' : 'transparent',
        color: active ? T.accent : hov ? T.text1 : T.text3,
        fontFamily: T.font,
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        letterSpacing: -0.1,
        transition: 'all 0.15s ease',
        position: 'relative',
        marginBottom: 2,
      }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 3, borderRadius: 4, background: T.accent,
        }} />
      )}
      <Icon style={{
        width: 18, height: 18,
        color: active ? T.accent : hov ? T.text2 : T.text3,
        flexShrink: 0,
        transition: 'color 0.15s ease',
      }} />
      <span style={{ flex: 1 }}>{label}</span>
    </Link>
  );
};

const NavSection = ({ title, children }) => (
  <div style={{ marginBottom: 4 }}>
    {title && (
      <p style={{
        fontSize: 11, fontWeight: 700, color: T.text3,
        letterSpacing: 1, textTransform: 'uppercase',
        padding: '4px 14px 6px',
        fontFamily: T.font,
      }}>
        {title}
      </p>
    )}
    {children}
  </div>
);

const Sidebar = ({ onLogout, onToggle, isOpen, isMobile }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const role = localStorage.getItem('role') || 'individual';
  const username = localStorage.getItem('username') || 'Hacker';
  const userId = localStorage.getItem('userId') || '';
  const avatarBg = role.startsWith('enterprise_') ? '#3b82f6' : T.accent;
  const [profileAvatar, setProfileAvatar] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const cacheKey = `avatarUrl:${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setProfileAvatar(cached); return; }
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`/api/users/${encodeURIComponent(userId)}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const url = data?.user?.preferences?.avatar || null;
        if (url) {
          sessionStorage.setItem(cacheKey, url);
          setProfileAvatar(url);
        }
      })
      .catch(() => {});
  }, [userId]);

  const isAdmin = role === 'enterprise_admin';
  const isStaff = role === 'enterprise_staff';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mainNav = useMemo(() => {
    if (isAdmin) return [
      { to: '/enterprise/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/enterprise/admin/billing', icon: CreditCard, label: 'Billing' },
      { to: '/enterprise/admin/accounts', icon: UserPlus, label: 'Accounts' },
    ];
    if (isStaff) return [
      { to: '/enterprise/portal', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/machines', icon: Server, label: 'Machines' },
      { to: '/enterprise/teacher/students', icon: Users, label: 'Students' },
      { to: '/campaigns', icon: BookOpen, label: 'Campaigns' },
      { to: '/vuln-ai', icon: Bot, label: 'Vuln AI' },
    ];
    return [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/machines', icon: Server, label: 'Machines' },
      { to: '/campaigns', icon: BookOpen, label: 'Campaigns' },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { to: '/vuln-ai', icon: Bot, label: 'Vuln AI' },
      { to: '/recommendations', icon: Zap, label: 'For You' },
      { to: '/signal', icon: Radio, label: 'Signal' },
      { to: '/coop', icon: Users, label: 'Hack Together' },
    ];
  }, [isAdmin, isStaff]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside style={{
      width: isMobile ? '100%' : T.sidebarWidth,
      minWidth: isMobile ? '100%' : T.sidebarWidth,
      height: '100vh',
      position: isMobile ? 'relative' : 'sticky',
      top: 0,
      background: T.sidebarBg,
      borderRight: `1px solid ${T.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 50,
      flexShrink: 0,
    }}>
      {/* ── Logo + toggle ── */}
      <div style={{
        height: T.topNavHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px 0 20px',
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={ctfLogo} alt="hackforge" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <span style={{
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: -0.6,
            color: T.text1,
            fontFamily: T.font,
          }}>
            hackforge
          </span>
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 8,
              border: `1px solid ${T.border}`, background: 'transparent',
              cursor: 'pointer', color: T.text3, flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentBg; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text3; e.currentTarget.style.background = 'transparent'; }}
          >
            <PanelLeftClose size={14} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', scrollbarWidth: 'none' }}>
        <NavSection>
          {mainNav.map(item => (
            <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} active={isActive(item.to)} />
          ))}
        </NavSection>
      </nav>

      {/* ── Bottom ── */}
      <div style={{
        padding: '12px',
        borderTop: `1px solid ${T.border}`,
        flexShrink: 0,
      }}>
        <NavItem to="/profile" icon={User} label="Profile" active={isActive('/profile')} />
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            width: '100%',
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            color: T.text3,
            fontFamily: T.font,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            textAlign: 'left',
            marginTop: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EF4444';
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = T.text3;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
          Logout
        </button>

        {/* ── User pill ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 12,
          background: '#F9F9F9',
          border: `1px solid ${T.border}`,
          marginTop: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0, overflow: 'hidden',
          }}>
            {profileAvatar
              ? <img src={profileAvatar} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : username.slice(0, 1).toUpperCase()
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text1, fontFamily: T.font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {username.length > 14 ? username.slice(0, 14) + '…' : username}
            </p>
            <p style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>
              {isAdmin ? 'Enterprise Admin' : isStaff ? 'Enterprise Staff' : 'Individual'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
