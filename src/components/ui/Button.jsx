import React, { useState } from 'react';
import { T } from '../../design/tokens';

/**
 * variant: 'primary' | 'secondary' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  icon: Icon,
  iconRight,
  style,
  onClick,
  ...rest
}) => {
  const [hov, setHov] = useState(false);

  const heights = { sm: 36, md: 44, lg: 50 };
  const fontSizes = { sm: 13, md: 14, lg: 15 };
  const paddings = { sm: '0 14px', md: '0 20px', lg: '0 26px' };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: heights[size],
    padding: paddings[size],
    borderRadius: T.btnRadius,
    fontSize: fontSizes[size],
    fontWeight: 600,
    fontFamily: T.font,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    letterSpacing: -0.1,
  };

  const variants = {
    primary: {
      background: hov && !disabled ? T.accentHover : T.accent,
      color: '#fff',
      boxShadow: hov && !disabled ? '0 6px 20px rgba(249,115,22,0.32)' : '0 2px 8px rgba(249,115,22,0.18)',
    },
    secondary: {
      background: T.cardBg,
      color: T.text1,
      border: `1px solid ${hov && !disabled ? T.accentBorder : T.border}`,
      boxShadow: T.shadowCard,
    },
    ghost: {
      background: hov && !disabled ? T.accentBg : 'transparent',
      color: hov && !disabled ? T.accent : T.text2,
      border: `1px solid transparent`,
    },
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      {...rest}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {Icon && !iconRight && <Icon style={{ width: 16, height: 16 }} />}
      {children}
      {Icon && iconRight && <Icon style={{ width: 16, height: 16 }} />}
    </button>
  );
};

export default Button;
