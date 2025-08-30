// SettingsScreen – Seventh Sense
// Profile, personalization, evening recap toggle, and data import/export (merge)

import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Switch, Pressable, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
let DocumentPicker;
try { DocumentPicker = require('expo-document-picker'); } catch (e) { DocumentPicker = null; }

function SettingsScreen() {
  const theme = useTheme();
  const colors = {
    bg: theme.colors.background || (theme.dark ? '#0B0F14' : '#F7F7F8'),
    card: theme.colors.card || (theme.dark ? '#111827' : '#FFFFFF'),
    border: theme.colors.border || 'rgba(0,0,0,0.12)',
    text: theme.colors.text || (theme.dark ? '#F3F4F6' : '#111827'),
    muted: theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    primary: theme.colors.primary || '#4F46E5',
    danger: theme.colors.notification || '#DC2626',
    success: '#22C55E',
  };

  const { prefs, setName, setTheme, setAiTone, setDefaultReminder, toggleEveningRecap } = useUser();
  const store = useHabitsStore();

  const [name, setNameLocal] = useState(prefs?.name || '');
  const [themeSel, setThemeSel] = useState(prefs?.theme || 'system');
  const [tone, setTone] = useState(prefs?.aiTone || 'coach');
  const [remind, setRemind] = useState(prefs?.defaultReminder || '');
  const [recap, setRecap] = useState(Boolean(prefs?.eveningRecap));
  const [busy, setBusy] = useState(false);
  const [importResult, setImportResult] = useState('');
  const [errorText, setErrorText] = useState('');

  const isHHmm = (v) => /^\d{2}:\d{2}$/.test(v);
  function validateProfile() {
    const nm = (name || '').trim();
    if (nm && (nm.length < 2 || nm.length > 40)) {
      setErrorText('Name should be 2–40 characters.');
      return false;
    }
    if (remind && !isHHmm(remind)) {
      setErrorText('Default reminder must be HH:mm (24h).');
      return false;
    }
    setErrorText('');
    return true;
  }

  function handleSaveProfile() {
    if (!validateProfile()) return;
    const nm = (name || '').trim();
    setName(nm || undefined);
    setTheme(themeSel);
    setAiTone(tone);
    setDefaultReminder(remind || undefined);
    if (Boolean(prefs?.eveningRecap) !== recap) {
      // toggleEveningRecap accepts optional boolean to set value directly
      toggleEveningRecap(recap);
    }
    Alert.alert('Saved', 'Your preferences have been updated.');
  }

  async function handleExport() {
    if (busy) return;
    setBusy(true);
    try {
      const payload = {
        version: 1,
        exportedAt: Date.now(),
        prefs: {
          name: prefs?.name,
          aiTone: prefs?.aiTone,
          theme: prefs?.theme,
          defaultReminder: prefs?.defaultReminder,
          timezone: prefs?.timezone,
          eveningRecap: prefs?.eveningRecap,
        },
        habits: store.habits || [],
        logs: store.logs || [],
      };
      const json = JSON.stringify(payload, null, 2);
      const fname = `seventh-sense-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const uri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + fname;
      await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Export Seventh Sense data' });
      } else {
        Alert.alert('Saved', `File saved: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Export failed', 'Could not export data. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    if (busy) return;
    setBusy(true);
    try {
      let jsonStr = null;
      if (DocumentPicker?.getDocumentAsync) {
        const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', multiple: false, copyToCacheDirectory: true });
        if (res.canceled) { setBusy(false); return; }
        const file = res.assets?.[0];
        if (!file?.uri) throw new Error('No file');
        jsonStr = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
      } else {
        Alert.alert('Document Picker unavailable', 'Please install expo-document-picker to import, or use another device.');
        setBusy(false);
        return;
      }

      const parsed = JSON.parse(jsonStr);
      const incHabits = Array.isArray(parsed?.habits) ? parsed.habits : [];
      const incLogs = Array.isArray(parsed?.logs) ? parsed.logs : [];

      const existingHabits = store.habits || [];
      const existingLogs = store.logs || [];

      const habitIds = new Set(existingHabits.map((h) => h.id));
      const logIds = new Set(existingLogs.map((l) => l.id));

      const newHabits = [];
      let skippedHabits = 0;
      for (const h of incHabits) {
        if (!h?.id) { skippedHabits++; continue; }
        if (habitIds.has(h.id)) { skippedHabits++; continue; }
        habitIds.add(h.id);
        newHabits.push(h);
      }

      const finalHabitIds = habitIds;
      const newLogs = [];
      let skippedLogs = 0;
      for (const l of incLogs) {
        if (!l?.id) { skippedLogs++; continue; }
        if (logIds.has(l.id)) { skippedLogs++; continue; }
        if (!l?.habitId || !finalHabitIds.has(l.habitId)) { skippedLogs++; continue; }
        logIds.add(l.id);
        newLogs.push(l);
      }

      useHabitsStore.setState((s) => ({
        habits: newHabits.length ? [...(s.habits || []), ...newHabits] : (s.habits || []),
        logs: newLogs.length ? [...(s.logs || []), ...newLogs] : (s.logs || []),
      }));
      try { useHabitsStore.getState()._saveNow?.(); } catch {}

      setImportResult(`Imported ${newHabits.length} habits, ${newLogs.length} logs. Skipped ${skippedHabits} habit(s), ${skippedLogs} log(s).`);
      Alert.alert('Import complete', 'Your data has been merged.');
    } catch (e) {
      Alert.alert('Import failed', 'Invalid file or format.');
    } finally {
      setBusy(false);
    }
  }

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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} accessibilityLabel="Settings screen">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Profile & Personalization */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
<Text style={[styles.title, { color: colors.text }]} allowFontScaling>Settings</Text>

<Text style={[styles.label, { color: colors.muted }]} allowFontScaling>Name</Text>
<TextInput
value={name}
onChangeText={setNameLocal}
placeholder="Your name"
placeholderTextColor={colors.muted}
style={[styles.input, { color: colors.text, borderColor: colors.border }]}
maxLength={40}
accessibilityLabel="Your name"
/>

<Text style={[styles.label, { color: colors.muted }]} allowFontScaling>Theme</Text>
<Segmented
value={themeSel}
onChange={setThemeSel}
options={[
{ label: 'System', value: 'system' },
{ label: 'Light', value: 'light' },
{ label: 'Dark', value: 'dark' },
]}
/>

<Text style={[styles.label, { color: colors.muted }]} allowFontScaling>AI Tone</Text>
<Segmented
value={tone}
onChange={setTone}
options={[
{ label: 'Coach', value: 'coach' },
{ label: 'Friend', value: 'friend' },
{ label: 'Zen', value: 'zen' },
]}
/>

<Text style={[styles.label, { color: colors.muted }]} allowFontScaling>Default Reminder Time (optional)</Text>
<TextInput
value={remind}
onChangeText={setRemind}
placeholder="HH:mm (24h)"
placeholderTextColor={colors.muted}
style={[styles.input, { color: colors.text, borderColor: colors.border }]}
keyboardType="numbers-and-punctuation"
autoCapitalize="none"
accessibilityLabel="Default reminder time HH:mm"
/>

<View style={styles.row}>
<Text style={{ color: colors.text }} allowFontScaling>Evening Recap Notifications</Text>
<Switch
value={recap}
onValueChange={() => setRecap((v) => !v)}
accessibilityLabel="Toggle evening recap notifications"
/>
</View>

{errorText ? <Text style={[styles.error, { color: colors.danger }]} allowFontScaling>{errorText}</Text> : null}

<View style={styles.actionsRow}>
<Pressable
onPress={handleSaveProfile}
disabled={busy}
style={[styles.btnPrimary, { backgroundColor: colors.primary, opacity: busy ? 0.9 : 1 }]}
accessibilityRole="button"
accessibilityLabel="Save settings"
>
<Text style={styles.btnPrimaryText} allowFontScaling>{busy ? 'Working…' : 'Save'}</Text>
</Pressable>
</View>
</View>

        {/* Data */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.subtitle, { color: colors.text }]} allowFontScaling>
            Data
          </Text>

          <Pressable
            onPress={handleExport}
            disabled={busy}
            style={[styles.btnRow, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Export data"
          >
            <Text style={[styles.btnRowText, { color: colors.text }]} allowFontScaling>
              Export data (JSON)
            </Text>
          </Pressable>

          <Pressable
            onPress={handleImport}
            disabled={busy}
            style={[styles.btnRow, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Import data"
          >
            <Text style={[styles.btnRowText, { color: colors.text }]} allowFontScaling>
              Import data (merge)
            </Text>
          </Pressable>

          {importResult ? (
            <Text style={[styles.small, { color: colors.muted, marginTop: 6 }]} allowFontScaling>
              {importResult}
            </Text>
          ) : null}

          <Text style={[styles.footnote, { color: colors.muted }]} allowFontScaling>
            Import merges by ID. Existing habits/logs are kept; duplicates are skipped.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', opacity: 0.85, marginTop: 8 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginTop: 6 },
  row: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionsRow: { marginTop: 12, flexDirection: 'row', gap: 12 },
  btnPrimary: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnRow: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 12, marginTop: 8 },
  btnRowText: { fontWeight: '600' },
  segmented: { flexDirection: 'row', gap: 8, marginTop: 6 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 12, marginTop: 6 },
  small: { fontSize: 12 },
  footnote: { fontSize: 12, marginTop: 8 },
});

