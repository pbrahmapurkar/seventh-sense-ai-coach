// ProgressRing component for Seventh Sense
// Pure SVG circular progress ring (no heavy libs)

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';

/**
 * @typedef {Object} ProgressRingProps
 * @property {number} size - Diameter in pixels
 * @property {number} stroke - Stroke width
 * @property {number} progress - Normalized progress 0..1 (clamped)
 * @property {string|number|null} [label] - Center text. null hides label
 * @property {string} [trackColor] - Background ring color
 * @property {string} [progressColor] - Foreground ring color
 * @property {string} [bgColor] - Inner fill color
 * @property {string} [accessibilityLabel] - Custom a11y label
 * @property {import('react-native').ViewStyle} [style] - Container style
 * @property {import('react-native').TextStyle} [textStyle] - Label text style
 *
 * Legacy aliases (kept for compatibility): color -> progressColor, backgroundColor -> trackColor
 */

/**
 * Clamp a number to [0,1]
 * @param {number} x
 */
function clamp01(x) {
  const n = Number.isFinite(x) ? x : 0;
  return Math.min(1, Math.max(0, n));
}

/**
 * ProgressRing
 * @param {ProgressRingProps & {color?:string, backgroundColor?:string}} props
 */
function ProgressRing(props) {
  const theme = (() => {
    try { return useTheme?.(); } catch { return undefined; }
  })();

  const size = Number(props.size) || 64;
  const stroke = Number(props.stroke) || 6;
  const clamped = clamp01(props.progress);
  const percent = Math.round(clamped * 100);

  const progressColor = props.progressColor || props.color || (theme?.colors?.primary ?? '#4F46E5');
  const trackColor = props.trackColor || props.backgroundColor || 'rgba(0,0,0,0.1)';
  const bgColor = props.bgColor ?? 'transparent';

  const { center, radius, circumference } = useMemo(() => {
    const r = Math.max(1, (size - stroke) / 2);
    return {
      center: size / 2,
      radius: r,
      circumference: 2 * Math.PI * r,
    };
  }, [size, stroke]);

  const dashOffset = useMemo(() => {
    return circumference * (1 - clamped);
  }, [circumference, clamped]);

  const labelText = props.label !== undefined ? String(props.label) : `${percent}%`;
  const showLabel = props.label === null ? false : true;
  const computedA11yLabel = props.accessibilityLabel || `Progress ${percent}%`;

  return (
    <View
      style={[{ width: size, height: size }, props.style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={computedA11yLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <Svg width={size} height={size}>
        {/* Optional inner background fill */}
        {bgColor !== 'transparent' && (
          <Circle cx={center} cy={center} r={radius} fill={bgColor} stroke="none" />
        )}

        {/* Track circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* Progress arc (rotated -90deg to start at 12 o'clock) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {showLabel && (
        <View pointerEvents="none" style={styles.labelContainer}>
          <Text
            allowFontScaling
            numberOfLines={1}
            style={[
              styles.label,
              { color: theme?.colors?.text ?? '#0f172a', fontSize: Math.max(10, size * 0.28) },
              props.textStyle,
            ]}
          >
            {labelText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProgressRing;
