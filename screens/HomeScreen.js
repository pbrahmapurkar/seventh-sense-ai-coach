// HomeScreen – Seventh Sense
// Today’s habits list, 1-tap toggles, AIMessage, and FAB

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';
import HabitCard from '../components/HabitCard';
import AIMessage from '../components/AIMessage';
import { getTodayKey } from '../utils/date';
import { scheduleEveningRecapIfNeeded } from '../utils/notify';

function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { prefs } = useUser();

  // Theme mapping
  const bg = theme.colors.background || (theme.dark ? '#0B0F14' : '#F7F7F8');
  const card = theme.colors.card || (theme.dark ? '#111827' : '#FFFFFF');
  const border = theme.colors.border || 'rgba(0,0,0,0.12)';
  const text = theme.colors.text || (theme.dark ? '#F3F4F6' : '#111827');
  const muted = theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const primary = theme.colors.primary || '#4F46E5';

  // Store hydration flag
  const _hydrated = useHabitsStore((s) => s._hydrated);

  // Date key for today
  const todayKey = useMemo(() => getTodayKey(prefs?.timezone || 'UTC'), [prefs?.timezone]);

  // Today’s habits (non-archived)
  const todayHabits = useHabitsStore((s) => (s.getTodayHabits ? s.getTodayHabits(todayKey) : []));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [aiCtx, setAiCtx] = useState(null);

  // Helper: completion check for today using logs
  const isCompletedToday = useCallback(
    (habitId) => {
      const logs = useHabitsStore.getState().getHabitLogs(habitId) || [];
      return logs.some((l) => l.date === todayKey && l.completed === true);
    },
    [todayKey]
  );

  // Derived counts
  const completed = useMemo(() => todayHabits.filter((h) => isCompletedToday(h.id)).length, [todayHabits, isCompletedToday]);
  const pending = todayHabits.length - completed;

  // AI context builder
  const computeAIContext = useCallback(() => {
    if (!todayHabits || todayHabits.length === 0) {
      return { habitName: undefined, aiTone: prefs?.aiTone, name: prefs?.name, tz: prefs?.timezone };
    }
    const firstIncomplete = todayHabits.find((h) => !isCompletedToday(h.id));
    const target = firstIncomplete || todayHabits[0];

    const logs = useHabitsStore.getState().getHabitLogs(target.id) || [];
    const last = logs.slice(-3).reverse().map((l) => (l.completed ? 'done' : 'miss'));

    let streak = 0;
    try {
      streak = useHabitsStore.getState().getStreak(target.id)?.current || 0;
    } catch (e) {
      streak = 0;
    }

    return {
      name: prefs?.name,
      habitName: target?.name || 'your habit',
      streak,
      last3: last,
      tz: prefs?.timezone,
      aiTone: prefs?.aiTone,
    };
  }, [todayHabits, prefs?.name, prefs?.timezone, prefs?.aiTone, isCompletedToday]);

  // Build AI context initially and whenever dependencies change
  useEffect(() => {
    setAiCtx(computeAIContext());
  }, [computeAIContext]);

  // Schedule evening recap on focus when there are pending habits
  useFocusEffect(
    useCallback(() => {
      try {
        if (todayHabits.length && pending > 0) {
          scheduleEveningRecapIfNeeded(prefs?.timezone || 'UTC', '20:30');
        }
      } catch (e) {
        // best-effort: swallow errors
      }
    }, [todayHabits.length, pending, prefs?.timezone])
  );

  // Handlers
  const handleToggle = useCallback(
    (habitId) => {
      useHabitsStore.getState().toggleCompletion(habitId, todayKey);
      // Refresh AI context (target may change)
      setAiCtx(computeAIContext());
    },
    [todayKey, computeAIContext]
  );

  const handleOpenDetail = useCallback(
    (habitId) => {
      navigation.navigate('HabitDetail', { id: habitId });
    },
    [navigation]
  );

  const handleAddHabit = useCallback(() => {
    navigation.navigate('AddHabit');
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      // local-only refresh: rebuild AI context
      setAiCtx(computeAIContext());
    } finally {
      setTimeout(() => setRefreshing(false), 350);
    }
  }, [computeAIContext]);

  // Loading state when store not hydrated
  if (!_hydrated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
<View style={styles.center}>
<ActivityIndicator />
<Text style={[styles.muted, { color: muted }]}>Loading…</Text>
</View>
</SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} accessibilityLabel="Home screen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: text }]}>Today</Text>
          <Text style={[styles.subtitle, { color: muted }]}>
            {todayKey} · {completed}/{todayHabits.length} done
          </Text>
        </View>

        {/* AIMessage card */}
        <AIMessage ctx={aiCtx} autoLoad style={[styles.card, { backgroundColor: card, borderColor: border }]} />

        {/* Today’s habits list */}
        <FlatList
          data={todayHabits}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              completedToday={isCompletedToday(item.id)}
              onToggle={() => handleToggle(item.id)}
              onPress={() => handleOpenDetail(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={[styles.sep, { borderColor: border }]} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: text }]}>No habits yet</Text>
              <Text style={[styles.muted, { color: muted, textAlign: 'center' }]}>Add your first habit to get started.</Text>
              <Pressable
                onPress={handleAddHabit}
                style={[styles.primaryBtn, { backgroundColor: primary }]}
                accessibilityRole="button"
                accessibilityLabel="Add your first habit"
              >
                <Text style={styles.primaryBtnText}>Add Habit</Text>
              </Pressable>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 96 }}
        />
      </View>

      {/* FAB */}
      <Pressable
        onPress={handleAddHabit}
        style={({ pressed }) => [styles.fab, { backgroundColor: primary, opacity: pressed ? 0.9 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel="Add habit"
      >
        <Feather name="plus" size={22} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  header: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, marginBottom: 12 },
  sep: { borderBottomWidth: StyleSheet.hairlineWidth },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  muted: { fontSize: 12, opacity: 0.8 },
  primaryBtn: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
});

export default HomeScreen;

