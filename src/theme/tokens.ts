// ─── Opal Mobile — Design Tokens ───────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '300' as const, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '500' as const, letterSpacing: 0 },
  subhead: { fontSize: 16, fontWeight: '500' as const, letterSpacing: 0 },
  body: { fontSize: 14, fontWeight: '400' as const, letterSpacing: 0 },
  caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0 },
  eyebrow: { fontSize: 10, fontWeight: '500' as const, letterSpacing: 3 },
  tabLabel: { fontSize: 10, fontWeight: '500' as const, letterSpacing: 0.5 },
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  pill: 25,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const avatarSizes = {
  compact: 28,
  list: 36,
  card: 44,
  profile: 56,
} as const;
