// Seventh Sense Theme – Colors
// Indigo / Midnight / Violet palette with semantic tokens and React Navigation compatibility

/**
 * Helper: convert a hex color to rgba() string with alpha.
 * Accepts #RRGGBB or #RGB; returns `rgba(r,g,b,a)`.
 * @param {string} hex
 * @param {number} alpha 0..1
 */
export function withAlpha(hex, alpha = 1) {
  const h = String(hex).replace('#', '').trim();
  const isShort = h.length === 3;
  const r = parseInt(isShort ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(isShort ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(isShort ? h[2] + h[2] : h.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, Number(alpha)));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ------------------------------------------------------------
// Base palette (cool, calm, high-contrast friendly)
// ------------------------------------------------------------

export const palette = {
  indigo: {
    50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
    400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
    800: '#3730A3', 900: '#312E81',
  },
  violet: {
    50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE', 300: '#C4B5FD',
    400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9',
    800: '#5B21B6', 900: '#4C1D95',
  },
  midnight: {
    100: '#111827', 200: '#0F172A', 300: '#0B1220', 400: '#09101B',
    500: '#070E18', 600: '#060C14', 700: '#040A11', 800: '#03080E', 900: '#02060B',
  },
  neutral: {
    50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8',
    500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1F2937', 900: '#0F172A',
  },
  // Support ramps (minimal)
  green: { 200: '#BBF7D0', 400: '#4ADE80', 600: '#16A34A', 800: '#065F46' },
  red:   { 200: '#FECACA', 400: '#F87171', 600: '#DC2626', 800: '#7F1D1D' },
  yellow:{ 200: '#FEF08A', 400: '#F59E0B', 600: '#D97706', 800: '#92400E' },
  blue:  { 200: '#BFDBFE', 400: '#60A5FA', 600: '#2563EB', 800: '#1E3A8A' },
};

/**
 * @typedef {Object} ThemeColors
 * @property {boolean} dark
 * @property {string} primary
 * @property {string} background
 * @property {string} card
 * @property {string} text
 * @property {string} border
 * @property {string} notification
 * @property {{ indigo:string, violet:string, midnight:string }} accents
 * @property {{ base:string, subdued:string, raised:string }} surface
 * @property {{ primary:string, secondary:string, muted:string, inverted:string }} textTones
 * @property {{ success:string, danger:string, warning:string, info:string }} states
 * @property {{ track:string, progress:string }} rings
 * @property {{ color:string, opacity:number }} shadows
 */

// ------------------------------------------------------------
// Semantic tokens – light
// ------------------------------------------------------------

/** @type {ThemeColors} */
export const lightThemeColors = {
  // React Navigation basics
  dark: false,
  primary: palette.indigo[600],
  background: palette.neutral[50],
  card: '#FFFFFF',
  text: palette.neutral[900],
  border: withAlpha(palette.neutral[900], 0.12),
  notification: palette.red[600],

  // Extended
  accents: {
    indigo: palette.indigo[600],
    violet: palette.violet[500],
    midnight: palette.midnight[300],
  },
  surface: {
    base: '#FFFFFF',
    subdued: palette.neutral[100],
    raised: '#FFFFFF',
  },
  textTones: {
    primary: palette.neutral[900],
    secondary: palette.neutral[700],
    muted: withAlpha(palette.neutral[900], 0.6),
    inverted: palette.neutral[50],
  },
  states: {
    success: palette.green[600],
    danger: palette.red[600],
    warning: palette.yellow[600],
    info: palette.blue[600],
  },
  rings: {
    track: withAlpha(palette.neutral[900], 0.1),
    progress: palette.indigo[600],
  },
  shadows: {
    color: withAlpha(palette.neutral[900], 0.2),
    opacity: 0.2,
  },
};

// ------------------------------------------------------------
// Semantic tokens – dark
// ------------------------------------------------------------

/** @type {ThemeColors} */
export const darkThemeColors = {
  // React Navigation basics
  dark: true,
  primary: palette.indigo[500],
  background: palette.midnight[200],
  card: palette.midnight[300],
  text: palette.neutral[50],
  border: withAlpha(palette.neutral[50], 0.15),
  notification: palette.red[400],

  // Extended
  accents: {
    indigo: palette.indigo[500],
    violet: palette.violet[400],
    midnight: palette.midnight[500],
  },
  surface: {
    base: palette.midnight[300],
    subdued: palette.midnight[400],
    raised: palette.midnight[300],
  },
  textTones: {
    primary: palette.neutral[50],
    secondary: withAlpha(palette.neutral[50], 0.85),
    muted: withAlpha(palette.neutral[50], 0.7),
    inverted: palette.neutral[900],
  },
  states: {
    success: palette.green[400],
    danger: palette.red[400],
    warning: palette.yellow[400],
    info: palette.blue[400],
  },
  rings: {
    track: withAlpha(palette.neutral[50], 0.15),
    progress: palette.indigo[500],
  },
  shadows: {
    color: withAlpha(palette.neutral[50], 0.2),
    opacity: 0.2,
  },
};

/**
 * Get theme colors for a selected mode.
 * @param {'light'|'dark'|'system'} mode
 * @param {boolean} [isSystemDark]
 * @returns {ThemeColors}
 */
export function getThemeColors(mode = 'system', isSystemDark = false) {
  if (mode === 'dark') return darkThemeColors;
  if (mode === 'light') return lightThemeColors;
  return isSystemDark ? darkThemeColors : lightThemeColors;
}

// Default export bundle
export default {
  palette,
  lightThemeColors,
  darkThemeColors,
  getThemeColors,
  withAlpha,
};

// Usage Example:
// import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
// import { getThemeColors } from '../theme/colors';
// const colors = getThemeColors('system', /* isSystemDark */ false);
// <NavigationContainer theme={{ ...DefaultTheme, colors }} />

