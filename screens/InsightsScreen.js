// InsightsScreen – Seventh Sense
// Summary of 7/30-day completion + per-habit mini insights with accessible 7-day bar

import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';
import { lastNDays } from '../utils/date';
import ProgressRing from '../components/ProgressRing';

function InsightsScreen() {
  const theme = useTheme();
  const { prefs } = useUser();
  const tz = prefs?.timezone || 'UTC';

  const habits = useHabitsStore((s) => s.habits) || [];
  const getHabitLogs = useHabitsStore((s) => s.getHabitLogs);
  const getStreak = useHabitsStore((s) => s.getStreak);

  const [refreshing, setRefreshing] = useState(false);

  // Theme tokens
  const colors = {
    bg: theme.colors.background || (theme.dark ? '#0B0F14' : '#F7F7F8'),
    card: theme.colors.card || (theme.dark ? '#111827' : '#FFFFFF'),
    border: theme.colors.border || 'rgba(0,0,0,0.12)',
    text: theme.colors.text || (theme.dark ? '#F3F4F6' : '#111827'),
    muted: theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    primary: theme.colors.primary || '#4F46E5',
  };

  // Days windows
  const days7 = useMemo(() => {
    const arr = lastNDays(7, tz); // newest → oldest
    return arr.slice().reverse(); // oldest → newest for left→right bars
  }, [tz]);
  const days30 = useMemo(() => lastNDays(30, tz), [tz]); // newest → oldest (order irrelevant for counting)

  // Per-habit stats (memoized)
  const perHabit = useMemo(() => {
    const active = (habits || []).filter((h) => !h.archived);
    return active.map((h) => {
      const logs = getHabitLogs ? getHabitLogs(h.id) || [] : [];
      const set = new Set(logs.filter((l) => l.completed).map((l) => l.date));
      const done7 = days7.reduce((acc, d) => acc + (set.has(d) ? 1 : 0), 0);
      const done30 = days30.reduce((acc, d) => acc + (set.has(d) ? 1 : 0), 0);
      const percent7 = Math.round(((done7 || 0) / 7) * 100);
      const longest = getStreak ? (getStreak(h.id)?.longest || 0) : 0;
      return { habit: h, done7, done30, percent7, longest, set };
    });
  }, [habits, getHabitLogs, getStreak, days7, days30]);

  // Overall stats
  const overall = useMemo(() => {
    const nHabits = perHabit.length;
    if (!nHabits) return { p7: 0, p30: 0, n7: 0, n30: 0 };
    const n7 = perHabit.reduce((s, x) => s + x.done7, 0);
    const n30 = perHabit.reduce((s, x) => s + x.done30, 0);
    const p7 = Math.round((n7 / (7 * nHabits)) * 100);
    const p30 = Math.round((n30 / (30 * nHabits)) * 100);
    return { p7, p30, n7, n30 };
  }, [perHabit]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Local recompute only (derived via memo). Just a small UX delay.
    setTimeout(() => setRefreshing(false), 350);
  }, []);

  // Habit row renderer
  const renderHabitItem = useCallback(({ item }) => {
    const { habit, percent7, longest, set } = item;
    return (
      <View style={[styles.habitRow, { borderColor: colors.border }]}>\n        <View style={styles.habitLeft}>\n          <ProgressRing size={36} stroke={4} progress={Math.max(0, Math.min(1, percent7 / 100))} label={null} progressColor={colors.primary} trackColor={'rgba(0,0,0,0.1)'} />\n        </View>\n        <View style={styles.habitMid}>\n          <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1} allowFontScaling>\n            {habit.name || 'Untitled Habit'}\n          </Text>\n          <Text style={[styles.habitMeta, { color: colors.muted }]} allowFontScaling>\n            Longest streak: {longest} {longest === 1 ? 'day' : 'days'}\n          </Text>\n          <View style={styles.barRow}>\n            {days7.map((d, i) => {\n              const done = set.has(d);\n              return (\n                <View\n                  key={d}\n                  style={[\n                    styles.barCell,\n                    { borderColor: colors.border, backgroundColor: done ? colors.primary : 'transparent', opacity: done ? 1 : 0.6 },\n                  ]}\n                  accessibilityLabel={`Day ${i + 1} ${d}: ${done ? 'completed' : 'missed'}`}\n                />\n              );\n            })}\n          </View>\n        </View>\n        <View style={styles.habitRight}>\n          <Text style={[styles.habitPercent, { color: colors.text }]} allowFontScaling>\n            {percent7}%\n          </Text>\n        </View>\n      </View>
    );
  }, [colors.border, colors.primary, colors.text, colors.muted, days7]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} accessibilityLabel="Insights screen">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]} allowFontScaling>
            Insights
          </Text>
          <View style={styles.tiles}>
            <View
              style={[styles.tile, { borderColor: colors.border }]}
              accessibilityLabel={`Last 7 days ${overall.p7}% · ${overall.n7} of ${perHabit.length * 7} done`}
            >
              <Text style={[styles.tileValue, { color: colors.text }]} allowFontScaling>
                {overall.p7}%
              </Text>
              <Text style={[styles.tileLabel, { color: colors.muted }]} allowFontScaling>
                Last 7 days
              </Text>
            </View>
            <View
              style={[styles.tile, { borderColor: colors.border }]}
              accessibilityLabel={`Last 30 days ${overall.p30}% · ${overall.n30} of ${perHabit.length * 30} done`}
            >
              <Text style={[styles.tileValue, { color: colors.text }]} allowFontScaling>
                {overall.p30}%
              </Text>
              <Text style={[styles.tileLabel, { color: colors.muted }]} allowFontScaling>
                Last 30 days
              </Text>
            </View>
          </View>
          <Text style={[styles.tileSub, { color: colors.muted }]} allowFontScaling>
            {perHabit.length
              ? `${overall.n7} of ${perHabit.length * 7} done (7d) · ${overall.n30} of ${perHabit.length * 30} done (30d)`
              : 'Add a habit to see insights.'}
          </Text>
        </View>

        {/* Habits list */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: 6 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]} allowFontScaling>
            By Habit (7 days)
          </Text>
          {perHabit.length === 0 ? (
            <Text style={{ color: colors.muted }} allowFontScaling>
              No habits yet. Add one from Home.
            </Text>
          ) : (
            <FlatList
              data={perHabit}
              keyExtractor={(x) => String(x.habit.id)}
              renderItem={renderHabitItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={[styles.sep, { borderColor: colors.border }]} />}
              contentContainerStyle={{ paddingTop: 6 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default InsightsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },

  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },

  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10 },
  tileValue: { fontSize: 24, fontWeight: '800' },
  tileLabel: { fontSize: 12, marginTop: 4 },
  tileSub: { fontSize: 12, marginTop: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },

  habitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  habitLeft: { width: 44, alignItems: 'center' },
  habitMid: { flex: 1, paddingHorizontal: 8 },
  habitRight: { width: 48, alignItems: 'flex-end' },

  habitName: { fontSize: 15, fontWeight: '600' },
  habitMeta: { fontSize: 12, marginTop: 2 },
  habitPercent: { fontSize: 16, fontWeight: '700' },

  barRow: { flexDirection: 'row', gap: 4, marginTop: 8 },
  barCell: { width: 16, height: 8, borderWidth: StyleSheet.hairlineWidth, borderRadius: 3 },

  sep: { borderBottomWidth: StyleSheet.hairlineWidth },
});

