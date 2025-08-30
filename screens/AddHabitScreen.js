// AddHabitScreen – Seventh Sense
// Simple, accessible Add Habit form with validation and reminder scheduling

import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';
import { setupPermissions, scheduleDaily } from '../utils/notify';

function AddHabitScreen() {
  const nav = useNavigation();
  const theme = useTheme();
  const { prefs } = useUser();
  const addHabit = useHabitsStore((s) => s.addHabit);

  const [name, setName] = useState('');
  const [type, setType] = useState('health');
  const [frequency, setFrequency] = useState('daily');
  const [targetPerWeek, setTargetPerWeek] = useState('');
  const [remindAt, setRemindAt] = useState(prefs?.defaultReminder || '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Theme tokens
  const colors = useMemo(
    () => ({
      bg: theme.colors.background || (theme.dark ? '#0B0F14' : '#F7F7F8'),
      card: theme.colors.card || (theme.dark ? '#111827' : '#FFFFFF'),
      border: theme.colors.border || 'rgba(0,0,0,0.12)',
      text: theme.colors.text || (theme.dark ? '#F3F4F6' : '#111827'),
      muted: theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
      primary: theme.colors.primary || '#4F46E5',
      danger: theme.colors.notification || '#DC2626',
    }),
    [theme]
  );

  // Segmented control
  function Segmented({ value, onChange, options }) {
    return (
      <View style={styles.segmented}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.segment, { borderColor: colors.border }, active && { backgroundColor: colors.primary, borderColor: 'transparent' }]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${opt.label}`}
            >
              <Text style={[styles.segmentText, { color: active ? '#fff' : colors.text }]} allowFontScaling>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Validation
  const isHHmm = (v) => /^\d{2}:\d{2}$/.test(String(v || ''));
  function validate() {
    const e = {};
    const nm = (name || '').trim();
    if (nm.length < 2 || nm.length > 60) e.name = 'Name should be 2–60 characters.';
    if (frequency !== 'daily') {
      const n = parseInt(targetPerWeek, 10);
      if (!Number.isInteger(n) || n < 1 || n > 14) e.targetPerWeek = 'Choose 1–14 per week.';
    }
    if (remindAt && !isHHmm(remindAt)) e.remindAt = 'Use HH:mm (24h).';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Save handler
  async function handleSave() {
    if (saving) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const nm = name.trim();
      const payload = {
        name: nm,
        type,
        freq: frequency,
        targetPerWeek: frequency === 'daily' ? undefined : parseInt(targetPerWeek || '0', 10),
        remindAt: remindAt || undefined,
        createdAt: Date.now(),
      };
      const created = addHabit(payload);

      if (remindAt) {
        const granted = await setupPermissions();
        if (granted) {
          try { await scheduleDaily(created.id, remindAt, prefs?.timezone || 'UTC'); } catch {}
        }
      }
      nav.goBack();
    } catch (e) {
      setErrors((prev) => ({ ...prev, form: 'Could not save. Please try again.' }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]} allowFontScaling>
            Add Habit
          </Text>

          {/* Name */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]} allowFontScaling>
              Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Drink Water 2L"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              maxLength={60}
              accessibilityLabel="Habit name"
              autoCapitalize="sentences"
              returnKeyType="done"
            />
            {errors.name ? (
              <Text style={[styles.error, { color: colors.danger }]} allowFontScaling>
                {errors.name}
              </Text>
            ) : null}
          </View>

          {/* Type */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]} allowFontScaling>
              Type
            </Text>
            <Segmented
              value={type}
              onChange={setType}
              options={[
                { label: 'Health', value: 'health' },
                { label: 'Mind', value: 'mind' },
                { label: 'Custom', value: 'custom' },
              ]}
            />
          </View>

          {/* Frequency & Target */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]} allowFontScaling>
              Frequency
            </Text>
            <Segmented
              value={frequency}
              onChange={setFrequency}
              options={[
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Custom', value: 'custom' },
              ]}
            />
            {(frequency === 'weekly' || frequency === 'custom') && (
              <>
                <Text style={[styles.label2, { color: colors.muted }]} allowFontScaling>
                  Target per week
                </Text>
                <TextInput
                  value={targetPerWeek}
                  onChangeText={setTargetPerWeek}
                  placeholder="e.g., 3"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  maxLength={2}
                  accessibilityLabel="Target per week"
                />
                {errors.targetPerWeek ? (
                  <Text style={[styles.error, { color: colors.danger }]} allowFontScaling>
                    {errors.targetPerWeek}
                  </Text>
                ) : null}
              </>
            )}
          </View>

          {/* Reminder */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]} allowFontScaling>
              Reminder time (optional)
            </Text>
            <TextInput
              value={remindAt}
              onChangeText={setRemindAt}
              placeholder="HH:mm (24h)"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              accessibilityLabel="Reminder time HH:mm"
            />
            {errors.remindAt ? (
              <Text style={[styles.error, { color: colors.danger }]} allowFontScaling>
                {errors.remindAt}
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {prefs?.defaultReminder ? (
                <Pressable
                  onPress={() => setRemindAt(prefs.defaultReminder)}
                  style={[styles.smallBtn, { borderColor: colors.border }]}
                  accessibilityRole="button"
                  accessibilityLabel="Use default reminder time"
                >
                  <Text style={[styles.smallBtnText, { color: colors.text }]} allowFontScaling>
                    Use Default ({prefs.defaultReminder})
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => {
                  const now = new Date();
                  const hh = String(now.getHours()).padStart(2, '0');
                  const mm = String(now.getMinutes()).padStart(2, '0');
                  setRemindAt(`${hh}:${mm}`);
                }}
                style={[styles.smallBtn, { borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Use current time"
              >
                <Text style={[styles.smallBtnText, { color: colors.text }]} allowFontScaling>
                  Use Current Time
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Errors */}
          {errors.form ? (
            <Text style={[styles.error, { color: colors.danger, textAlign: 'center' }]} allowFontScaling>
              {errors.form}
            </Text>
          ) : null}

          {/* Footer actions */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => nav.goBack()}
              style={[styles.btnOutline, { borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={[styles.btnOutlineText, { color: colors.text }]} allowFontScaling>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [styles.btnPrimary, { backgroundColor: colors.primary, opacity: pressed || saving ? 0.9 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Save habit"
            >
              <Text style={styles.btnPrimaryText} allowFontScaling>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddHabitScreen;

// Styles
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, gap: 8 },
  label: { fontSize: 13, fontWeight: '600', opacity: 0.8 },
  label2: { fontSize: 12, marginTop: 8, opacity: 0.8 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  segmented: { flexDirection: 'row', gap: 8, marginTop: 6 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 12, marginTop: 4 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnOutline: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnOutlineText: { fontWeight: '600' },
  btnPrimary: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  smallBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  smallBtnText: { fontSize: 12, fontWeight: '600' },
});
