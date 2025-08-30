// Seventh Sense Theme – Typography
// Compact, legible type scale for mobile UI with role presets

import { Platform } from 'react-native';

/**
 * Weights map for quick reference.
 */
export const weights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

/**
 * Font size scale (px).
 */
export const scale = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
};

/**
 * Line heights tuned for readability on mobile (px).
 */
export const leading = {
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 26,
  '2xl': 30,
  '3xl': 34,
};

/**
 * @typedef {Object} TextStylePreset
 * @property {number} fontSize
 * @property {number} lineHeight
 * @property {string} [fontWeight]
 * @property {string} [fontFamily]
 */

/**
 * Role presets for quick application on Text components.
 * Spread these into style props: <Text style={[type.title, { color: theme.colors.text }]} />
 */
export const type = {
  /** @type {TextStylePreset} */
  title: { fontSize: scale['2xl'], lineHeight: leading['2xl'], fontWeight: weights.bold },
  /** @type {TextStylePreset} */
  subtitle: { fontSize: scale.xl, lineHeight: leading.xl, fontWeight: weights.semibold },
  /** @type {TextStylePreset} */
  section: { fontSize: scale.lg, lineHeight: leading.lg, fontWeight: weights.semibold },
  /** @type {TextStylePreset} */
  body: { fontSize: scale.md, lineHeight: leading.md, fontWeight: weights.regular },
  /** @type {TextStylePreset} */
  bodyStrong: { fontSize: scale.md, lineHeight: leading.md, fontWeight: weights.semibold },
  /** @type {TextStylePreset} */
  caption: { fontSize: scale.sm, lineHeight: leading.sm, fontWeight: weights.regular },
  /** @type {TextStylePreset} */
  button: { fontSize: scale.md, lineHeight: leading.lg, fontWeight: weights.semibold },
  /** @type {TextStylePreset} */
  code: {
    fontSize: scale.sm,
    lineHeight: leading.md,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
};

/**
 * Utility: Scale a base font size by a modular factor and compute a generous line height.
 * @param {number} base
 * @param {number} [factor=1.125]
 * @returns {{ size:number, lineHeight:number }}
 */
export function scaleFont(base, factor = 1.125) {
  const size = Math.round((Number(base) || 0) * factor);
  // Keep line-height roughly +6 px over size for headings
  const lineHeight = Math.round(size + 6);
  return { size, lineHeight };
}

export const fonts = {
  system: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
};

export default { weights, scale, leading, type, scaleFont, fonts };

// Example:
// <Text style={[type.title, { color: theme.colors.text }]}>Insights</Text>

