// HabitCard – Seventh Sense
// Reusable list item with icon, text, and ProgressRing

import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ProgressRing from './ProgressRing';

/**
 * @typedef {Object} HabitCardProps
 * @property {{id:string,name?:string,remindAt?:string,icon?:string}} habit
 * @property {boolean} completedToday
 * @property {() => void} onToggle
 * @property {() => void} onPress
 * @property {import('react-native').ViewStyle} [style]
 */

function HabitCard({ habit, completedToday, onToggle, onPress, style }) {
  const theme = useTheme();
  const name = habit?.name || 'Untitled Habit';
  const remindAt = habit?.remindAt;
  const primary = theme?.colors?.primary || '#4F46E5';
  const textColor = theme?.colors?.text || '#0f172a';
  const muted = (typeof textColor === 'string' && textColor.startsWith('#'))
    ? `${textColor}99` // ~60% opacity
    : 'rgba(0,0,0,0.6)';

  const iconName = completedToday ? 'check-circle' : 'circle';
  const iconColor = completedToday ? primary : muted;

  const computedA11y = `${name}, ${completedToday ? 'completed' : 'not completed'}${remindAt ? `, reminder at ${remindAt}` : ''}`;

  const handleToggle = (e) => {
    e?.stopPropagation?.();
    if (typeof onToggle === 'function') onToggle();
  };

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={computedA11y}
    >
      {/* Left icon (press to toggle) */}
      <Pressable
        onPress={handleToggle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Toggle ${name}`}
        style={styles.left}
      >
        <Feather name={iconName} size={24} color={iconColor} />
      </Pressable>

      {/* Middle text */}
      <View style={styles.middle}>
        <Text style={[styles.name, { color: textColor, opacity: completedToday ? 0.8 : 1 }]} numberOfLines={1}>
          {name}
        </Text>
        {remindAt ? (
          <Text style={[styles.remindAt, { color: muted }]} numberOfLines={1}>
            Remind at {remindAt}
          </Text>
        ) : null}
      </View>

      {/* Right progress ring (read-only) */}
      <ProgressRing
        size={36}
        stroke={4}
        progress={completedToday ? 1 : 0}
        label={null}
        progressColor={primary}
        trackColor={'rgba(0,0,0,0.1)'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  left: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    marginHorizontal: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  remindAt: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default HabitCard;
