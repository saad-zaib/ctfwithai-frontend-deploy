import React from 'react';
import { T } from '../../design/tokens';

const DIFF_COLORS = {
  Easy:   { bg: T.successBg,     border: T.successBorder,     color: T.success },
  Medium: { bg: T.warningBg,     border: 'rgba(245,158,11,0.20)', color: T.warning },
  Hard:   { bg: T.accentBg,      border: T.accentBorder,      color: T.accent },
  Insane: { bg: T.errorBg,       border: 'rgba(239,68,68,0.20)', color: T.error },
  Expert: { bg: T.errorBg,       border: 'rgba(239,68,68,0.20)', color: T.error },
};

/**
 * variant: 'difficulty' | 'status' | 'default'
 * Accepts custom color/bg/border via style prop too.
 */
export const DiffBadge = ({ level }) => {
  const c = DIFF_COLORS[level] || { bg: T.accentBg, border: T.accentBorder, color: T.accent };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.4,
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.border}`,
      fontFamily: T.font,
      whiteSpace: 'nowrap',
    }}>
      {level}
    </span>
  );
};

/** Orange pill tag with leading dot — used as eyebrow / section tag */
export const PillTag = ({ children }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 13px',
    borderRadius: 30,
    background: T.accentBg,
    border: `1px solid ${T.accentBorder}`,
    color: T.accent,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: T.font,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
    {children}
  </span>
);

/** Live indicator with pulsing dot */
export const LiveBadge = () => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: T.success,
    fontFamily: T.font,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: '50%',
      background: T.success, display: 'inline-block',
      animation: 'livePulse 1.8s ease-in-out infinite',
    }} />
    Live
  </span>
);

export default DiffBadge;
