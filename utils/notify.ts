// Seventh Sense - Notification utilities (Expo Notifications, TypeScript)
// Notes on timezone: Expo scheduled triggers run in the device's local timezone.
// The `tz` parameter is advisory; we compute target times in that IANA timezone,
// then schedule using the device's local clock best-effort.

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PermissionState = 'granted' | 'denied' | 'undetermined';
export type HabitNotifMap = Record<string, string>; // habitId -> notifId

const SS_NOTIF_PERMISSION_V1 = 'SS_NOTIF_PERMISSION_V1';
const SS_NOTIF_MAP_V1 = 'SS_NOTIF_MAP_V1';
const SS_RECAP_STATE_V1 = 'SS_RECAP_STATE_V1';
const SS_RECAP_ENABLED_V1 = 'SS_RECAP_ENABLED_V1'; // used by UserContext extras

type RecapState = { dateKey: string; notifId?: string };

// Set a default handler once; safe to call multiple times (last one wins)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ---------------- Helpers ----------------
export function parseHHmm(hhmm: string): { hour: number; minute: number } | null {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(':').map((v) => Number(v));
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { hour: h, minute: m };
}

export function inQuietHours(hour: number, minute: number): boolean {
  // Quiet window: 22:00..23:59 and 00:00..06:59
  if (hour >= 22) return true;
  if (hour < 7) return true;
  return false;
}

function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }

function getTodayKey(tz: string): string {
  const zone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(new Date()); // en-CA gives YYYY-MM-DD
}

// Build a Date intended to represent the tz wall-clock time as an absolute instant.
// We construct a UTC time using the intended Y/M/D HH:mm, which is a reasonable best-effort.
export function toDeviceDateFromTZ(tz: string, y: number, m: number, d: number, hh: number, mm: number): Date {
  // We cannot coerce device scheduling to a foreign tz; using UTC avoids local DST drift here.
  return new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));
}

async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('[notify] loadJSON failed', key, e);
    return fallback;
  }
}

async function saveJSON(key: string, value: any): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[notify] saveJSON failed', key, e);
  }
}

async function getStoredPermission(): Promise<PermissionState> {
  const stored = await AsyncStorage.getItem(SS_NOTIF_PERMISSION_V1);
  return (stored as PermissionState) || 'undetermined';
}

// ---------------- Public API ----------------

/**
 * Request notification permissions once and persist result.
 */
export async function setupPermissions(): Promise<boolean> {
  try {
    const cached = await getStoredPermission();
    if (cached === 'granted') return true;

    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    const normalized: PermissionState = status === 'granted' ? 'granted' : 'denied';
    await AsyncStorage.setItem(SS_NOTIF_PERMISSION_V1, normalized);
    return normalized === 'granted';
  } catch (e) {
    console.warn('[notify] setupPermissions error', e);
    await AsyncStorage.setItem(SS_NOTIF_PERMISSION_V1, 'denied');
    return false;
  }
}

/**
 * Schedule a daily repeating notification for a habit at timeHHmm (HH:mm).
 * Applies quiet hours: 22:00–06:59 → schedule 07:05 instead.
 * Note: Expo triggers use device local tz; `tz` is advisory for computing intent.
 */
export async function scheduleDaily(habitId: string, timeHHmm: string, tz: string): Promise<string> {
  try {
    const ok = await setupPermissions();
    if (!ok) return '';

    const parsed = parseHHmm(timeHHmm);
    if (!parsed) return '';
    let { hour, minute } = parsed;

    // Enforce quiet hours
    if (inQuietHours(hour, minute)) {
      hour = 7; minute = 5;
    }

    // Cancel existing if any
    await cancelScheduled(habitId);

    const trigger = { hour, minute, repeats: true } as Notifications.CalendarTriggerInput;
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Seventh Sense',
        body: 'Time for your habit. Open to check off today.',
        data: { habitId, type: 'habit-daily' },
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger,
    });

    const map = await loadJSON<HabitNotifMap>(SS_NOTIF_MAP_V1, {});
    map[habitId] = notifId;
    await saveJSON(SS_NOTIF_MAP_V1, map);
    return notifId;
  } catch (e) {
    console.warn('[notify] scheduleDaily error', e);
    return '';
  }
}

/**
 * Cancel any scheduled daily notification for a habit and remove mapping.
 */
export async function cancelScheduled(habitId: string): Promise<void> {
  try {
    const map = await loadJSON<HabitNotifMap>(SS_NOTIF_MAP_V1, {});
    const existing = map[habitId];
    if (existing) {
      try { await Notifications.cancelScheduledNotificationAsync(existing); } catch {}
      delete map[habitId];
      await saveJSON(SS_NOTIF_MAP_V1, map);
    }
  } catch (e) {
    console.warn('[notify] cancelScheduled error', e);
  }
}

/**
 * Idempotently schedule one recap notification for today at `time` (HH:mm).
 * If already scheduled for today or time has passed, returns null.
 * Applies quiet hours: if inside 22:00–06:59, shifts to 07:05 next day.
 */
export async function scheduleEveningRecapIfNeeded(tz: string, time: string = '20:30'): Promise<string | null> {
  try {
    const ok = await setupPermissions();
    if (!ok) return null;

    const todayKey = getTodayKey(tz);
    const state = await loadJSON<RecapState | null>(SS_RECAP_STATE_V1, null);
    if (state && state.dateKey === todayKey && state.notifId) {
      return null; // already scheduled for today
    }

    const parsed = parseHHmm(time);
    if (!parsed) return null;
    let { hour, minute } = parsed;

    // Build target in tz for today
    const [y, m, d] = todayKey.split('-').map((x) => Number(x));
    let targetY = y, targetM = m, targetD = d, targetH = hour, targetMin = minute;

    // Current time in tz
    const nowFmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = nowFmt.formatToParts(new Date());
    const nowH = Number(parts.find((p) => p.type === 'hour')?.value || '0');
    const nowMin = Number(parts.find((p) => p.type === 'minute')?.value || '0');
    const nowTotal = nowH * 60 + nowMin;
    const targetTotal = hour * 60 + minute;

    if (nowTotal >= targetTotal) {
      // too late today
      return null;
    }

    // Quiet hours: shift to 07:05 next day
    if (inQuietHours(hour, minute)) {
      // move to next day 07:05 in tz
      // Increment d safely by constructing a Date and adding 1 day
      const base = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
      const next = new Date(base.getTime() + 24 * 60 * 60 * 1000);
      targetY = next.getUTCFullYear();
      targetM = next.getUTCMonth() + 1;
      targetD = next.getUTCDate();
      targetH = 7;
      targetMin = 5;
    }

    // Build absolute date for device schedule
    const targetDate = toDeviceDateFromTZ(tz, targetY, targetM, targetD, targetH, targetMin);

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Evening recap',
        body: 'Wrap your day: check any remaining habits.',
        data: { type: 'recap' },
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: { date: targetDate } as any, // one-off date
    });

    await saveJSON(SS_RECAP_STATE_V1, { dateKey: todayKey, notifId });
    return notifId;
  } catch (e) {
    console.warn('[notify] scheduleEveningRecapIfNeeded error', e);
    return null;
  }
}

// ---------------- Optional extras for current app usage ----------------

export async function setEveningRecapEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SS_RECAP_ENABLED_V1, JSON.stringify(enabled));
    if (!enabled) {
      // best-effort: clear any previously scheduled recap for today
      const s = await loadJSON<RecapState | null>(SS_RECAP_STATE_V1, null);
      if (s?.notifId) { try { await Notifications.cancelScheduledNotificationAsync(s.notifId); } catch {} }
      await saveJSON(SS_RECAP_STATE_V1, { dateKey: '' });
    }
  } catch (e) {
    console.warn('[notify] setEveningRecapEnabled error', e);
  }
}

export async function isEveningRecapEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SS_RECAP_ENABLED_V1);
    if (raw == null) return true; // default on
    return raw === 'true' || raw === '"true"';
  } catch {
    return true;
  }
}
