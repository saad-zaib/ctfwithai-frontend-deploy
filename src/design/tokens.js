// Shared design tokens — HackForge premium theme
export const T = {
  // ── Backgrounds ────────────────────────────────────────────
  pageBg:      '#FCFAF8',
  cardBg:      '#FFFFFF',
  sidebarBg:   '#FFFFFF',

  // ── Text ───────────────────────────────────────────────────
  text1: '#111827',
  text2: '#374151',
  text3: '#6B7280',

  // ── Brand / Accent ─────────────────────────────────────────
  accent:        '#F97316',
  accentHover:   '#EA580C',
  accentBg:      'rgba(249,115,22,0.07)',
  accentBorder:  'rgba(249,115,22,0.18)',

  // ── Borders ────────────────────────────────────────────────
  border: '#ECECEC',

  // ── Semantic ───────────────────────────────────────────────
  success:       '#22C55E',
  successBg:     'rgba(34,197,94,0.08)',
  successBorder: 'rgba(34,197,94,0.18)',
  warning:       '#F59E0B',
  warningBg:     'rgba(245,158,11,0.08)',
  error:         '#EF4444',
  errorBg:       'rgba(239,68,68,0.08)',

  // ── Layout ─────────────────────────────────────────────────
  sidebarWidth:    240,
  topNavHeight:    64,
  contentMaxWidth: 1600,
  gap:             24,
  cardPad:         24,

  // ── Radii ──────────────────────────────────────────────────
  cardRadius: 20,
  btnRadius:  22,

  // ── Shadows ────────────────────────────────────────────────
  shadowCard:     '0 1px 3px rgba(0,0,0,0.04)',
  shadowCardHover: '0 8px 28px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
  shadowDropdown: '0 16px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',

  // ── Typography ─────────────────────────────────────────────
  font:     "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontMono: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
};

// Drop-in replacement for the old `C` object used throughout existing components
export const C = {
  pageBg:    T.pageBg,
  sectionBg: T.pageBg,
  cardBg:    T.cardBg,
  text1:     T.text1,
  text2:     T.text2,
  text3:     T.text3,
  border:    T.border,
  accent:    T.accent,
  accentBg:  T.accentBg,
  accentBdr: T.accentBorder,
  shadow:    T.shadowCard,
  shadowMd:  '0 4px 16px rgba(0,0,0,0.08)',
};
