// HabitDetailScreen – Seventh Sense
// Shows habit summary, streaks, 30-day history, and inline editing with notification rescheduling

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, TextInput, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';
import { getTodayKey, lastNDays } from '../utils/date';
import { cancelScheduled, scheduleDaily } from '../utils/notify';

function HabitDetailScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const { prefs } = useUser();

  const state = useHabitsStore();
  const habit = useMemo(() => (state.habits || []).find((h) => h.id === id), [state.habits, id]);

  const tz = prefs?.timezone || 'UTC';
  const todayKey = useMemo(() => getTodayKey(tz), [tz]);

  // Local UI state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(habit?.name || '');
  const [type, setType] = useState(habit?.type || 'custom');
  const [remindAt, setRemindAt] = useState(habit?.remindAt || '');
  const [errors, setErrors] = useState({});

  // Derived data
  const streak = useMemo(() => {
    try {
      return state.getStreak ? state.getStreak(id) : { current: 0, longest: 0 };
    } catch (e) {
      return { current: 0, longest: 0 };
    }
  }, [state, id]);

  const logs = useMemo(() => (state.getHabitLogs ? state.getHabitLogs(id) : []) || [], [state, id]);
  const days = useMemo(() => lastNDays(30, tz), [tz]); // newest → oldest
  const completedMap = useMemo(() => {
    const map = Object.create(null);
    for (const l of logs) {
      if (l?.date && l.completed) map[l.date] = true;
    }
    return map;
  }, [logs]);

  // Validation
  const isHHmm = (v) => /^\d{2}:\d{2}$/.test(String(v || ''));
  const validate = () => {
    const e = {};
    const nm = (name || '').trim();
    if (nm.length < 2 || nm.length > 60) e.name = 'Name should be 2–60 characters.';
    if (remindAt && !isHHmm(remindAt)) e.remindAt = 'Use HH:mm (24h).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Handlers
  const startEdit = useCallback(() => {
    setEditing(true);
    setName(habit?.name || '');
    setType(habit?.type || 'custom');
    setRemindAt(habit?.remindAt || '');
    setErrors({});
  }, [habit]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setErrors({});
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const trimmed = name.trim();
      const originalRemind = habit?.remindAt || '';
      const patch = { name: trimmed, type, remindAt: remindAt || undefined };
      await state.updateHabit(id, patch);

      // Reschedule if reminder changed
      if (remindAt !== originalRemind) {
        try {
          await cancelScheduled(id);
          if (remindAt) {
            await scheduleDaily(id, remindAt, tz);
          }
        } catch (e) {
          // non-blocking
        }
      }
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [id, name, type, remindAt, habit, tz, state, saving]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete habit', 'This will remove the habit and its logs. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await state.deleteHabit(id); // store cancels scheduled notif and cascades logs
            nav.goBack();
          } catch (e) {
            Alert.alert('Error', 'Could not delete. Please try again.');
          }
        },
      },
    ]);
  }, [id, state, nav]);

  // Theming
  const colors = {
    bg: theme.colors.background || (theme.dark ? '#0B0F14' : '#F7F7F8'),
    card: theme.colors.card || (theme.dark ? '#111827' : '#FFFFFF'),
    border: theme.colors.border || 'rgba(0,0,0,0.12)',
    text: theme.colors.text || (theme.dark ? '#F3F4F6' : '#111827'),
    muted: theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    primary: theme.colors.primary || '#4F46E5',
    danger: theme.colors.notification || '#DC2626',
  };

  // Missing habit guard
  useEffect(() => {
    if (!habit) {
      const t = setTimeout(() => nav.goBack(), 0);
      return () => clearTimeout(t);
    }
  }, [habit, nav]);
  if (!habit) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
<View style={styles.center}>
<ActivityIndicator />
<Text style={{ color: colors.muted }}>Loading…</Text>
</View>
</SafeAreaView>
    );
  }

  // Type segmented helper
  const TypeSegmented = ({ value, onChange }) => (
    <View style={styles.segmented}>
      {['health', 'mind', 'custom'].map((v) => {
        const label = v[0].toUpperCase() + v.slice(1);
        const active = value === v;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            style={[styles.segment, { borderColor: colors.border }, active && { backgroundColor: colors.primary, borderColor: 'transparent' }]}
            accessibilityRole="button"
            accessibilityLabel={`Select ${label}`}
          >
            <Text style={[styles.segmentText, { color: active ? '#fff' : colors.text }]} allowFontScaling>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  // History row
  const renderDay = ({ item: key }) => {
    const done = !!completedMap[key];
    // weekday short label via Intl with tz
    let weekday = '';
    try {
      weekday = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date(key));
    } catch {
      weekday = '';
    }
    return (
      <View style={[styles.historyRow, { borderColor: colors.border }]}>
<Text style={[styles.historyDate, { color: colors.muted }]} allowFontScaling>
{weekday ? `${weekday} · ${key}` : key}
</Text>
<Text
style={[styles.historyMark, { color: done ? colors.primary : colors.muted }]}
accessibilityLabel={`${key}: ${done ? 'completed' : 'missed'}`}
allowFontScaling
>
{done ? '✓' : '—'}
</Text>
</View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} accessibilityLabel="Habit detail screen">
      <View style={styles.container}>
        {/* Header actions */}
        <View style={styles.headerActions}>
          <Pressable onPress={startEdit} accessibilityRole="button" accessibilityLabel="Edit habit" style={styles.iconBtn}>
            <Feather name="edit-2" size={18} color={colors.text} />
            <Text style={[styles.iconBtnText, { color: colors.text }]} allowFontScaling>
              Edit
            </Text>
          </Pressable>
          <Pressable onPress={handleDelete} accessibilityRole="button" accessibilityLabel="Delete habit" style={styles.iconBtn}>
            <Feather name="trash-2" size={18} color={colors.danger} />
            <Text style={[styles.iconBtnText, { color: colors.danger }]} allowFontScaling>
              Delete
            </Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]} allowFontScaling numberOfLines={2}>
            {habit.name || 'Untitled Habit'}
          </Text>
          <View style={styles.row}>
            <View style={[styles.typePill, { borderColor: colors.border }]}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{habit.type || 'custom'}</Text>
            </View>
            {habit.remindAt ? (
              <Text style={{ color: colors.muted, fontSize: 12 }}>Remind at {habit.remindAt}</Text>
            ) : null}
          </View>
        </View>

        {/* Streaks */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.streakRow}>
            <View style={styles.streakBox}>
              <Text style={[styles.streakLabel, { color: colors.muted }]} allowFontScaling>
                Current streak
              </Text>
              <Text
                style={[styles.streakValue, { color: colors.text }]}
                accessibilityLabel={`Current streak: ${streak.current || 0} days`}
                allowFontScaling
              >
                {(streak.current || 0)} days
              </Text>
            </View>
            <View style={styles.streakBox}>
              <Text style={[styles.streakLabel, { color: colors.muted }]} allowFontScaling>
                Longest streak
              </Text>
              <Text
                style={[styles.streakValue, { color: colors.text }]}
                accessibilityLabel={`Longest streak: ${streak.longest || 0} days`}
                allowFontScaling
              >
                {(streak.longest || 0)} days
              </Text>
            </View>
          </View>
        </View>

        {/* History */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]} allowFontScaling>
            Last 30 days
          </Text>
          <FlatList
            data={days}
            keyExtractor={(k) => k}
            renderItem={renderDay}
            ItemSeparatorComponent={() => <View style={[styles.sep, { borderColor: colors.border }]} />}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 6 }}
          />
        </View>

        {/* Edit Mode */}
        {editing && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]} allowFontScaling>
              Edit Habit
            </Text>

            <Text style={[styles.label, { color: colors.muted }]} allowFontScaling>
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Habit name"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              maxLength={60}
              accessibilityLabel="Habit name"
            />
            {errors.name ? (
              <Text style={[styles.error, { color: colors.danger }]} allowFontScaling>
                {errors.name}
              </Text>
            ) : null}

            <Text style={[styles.label, { color: colors.muted, marginTop: 10 }]} allowFontScaling>
              Type
            </Text>
            <TypeSegmented value={type} onChange={setType} />

            <Text style={[styles.label, { color: colors.muted, marginTop: 10 }]} allowFontScaling>
              Reminder time (optional)
            </Text>
            <TextInput
              value={remindAt}
              onChangeText={setRemindAt}
              placeholder="HH:mm"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              accessibilityLabel="Reminder time HH:mm"
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
            />
            {errors.remindAt ? (
              <Text style={[styles.error, { color: colors.danger }]} allowFontScaling>
                {errors.remindAt}
              </Text>
            ) : null}

            <View style={styles.editActions}>
              <Pressable
                onPress={cancelEdit}
                style={[styles.btnOutline, { borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing"
              >
                <Text style={[styles.btnOutlineText, { color: colors.text }]} allowFontScaling>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={[styles.btnPrimary, { backgroundColor: colors.primary, opacity: saving ? 0.9 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Save changes"
              >
                <Text style={styles.btnPrimaryText} allowFontScaling>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default HabitDetailScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 8 },
  iconBtnText: { fontWeight: '600', fontSize: 14 },

  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typePill: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },

  streakRow: { flexDirection: 'row', gap: 12 },
  streakBox: { flex: 1 },
  streakLabel: { fontSize: 12 },
  streakValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  historyDate: { fontSize: 13 },
  historyMark: { fontSize: 16, fontWeight: '700' },
  sep: { borderBottomWidth: StyleSheet.hairlineWidth },

  label: { fontSize: 13, fontWeight: '600', opacity: 0.9 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },

  segmented: { flexDirection: 'row', gap: 8, marginTop: 6 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },

  editActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btnOutline: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnOutlineText: { fontWeight: '600' },
  btnPrimary: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});

