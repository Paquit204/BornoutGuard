 // constants/theme.ts

export const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  primary: '#9FE870',
  primaryDark: '#163300',
  secondary: '#A3E635',
  background: '#E6F4EA',
  card: '#FFFFFF',
  cardDark: '#131313',
  cardBorder: 'rgba(0, 0, 0, 0.04)',
  border: '#D1E7DD',
  textPrimary: '#131313',
  textSecondary: '#616161',
  textMuted: '#9E9E9E',
  success: '#198754',
  warning: '#F59E0B',
  danger: '#DC3545',
  // ✅ Stronger lime glow for borders
  limeGlow: 'rgba(159, 232, 112, 0.35)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 9999,
};

export const Typography = {
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  small: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
};

export const Shadows = {
  // ✅ Dark shadow – much stronger depth
  card: {
    shadowColor: '#0a1a00',        // dark green-black
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,           // increased for more depth
    shadowRadius: 16,              // softer spread
    elevation: 8,                  // higher elevation for Android
  },
  premium: {
    shadowColor: '#0a1a00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  button: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
};

export const Gradients = {
  primary: ['#9FE870', '#7BCF5E'] as [string, string],
  mintBackground: [Colors.background, '#F4F9F5'] as [string, string],
  darkCard: ['#1A1A1A', '#111111'] as [string, string],
  limeGlow: ['rgba(159, 232, 112, 0.12)', 'rgba(159, 232, 112, 0.03)'] as [string, string],
};