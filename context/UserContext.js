// Seventh Sense - User Context
// Provides user preferences with hydration + debounced persistence

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setEveningRecapEnabled } from '../utils/notify';

// Optional expo-localization; code must work without it
let Localization;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Localization = require('expo-localization');
} catch (e) {
  Localization = null;
}

export const UserContext = createContext(null);

const STORAGE_KEY = 'SS_USER_PREFS_V1';
const LEGACY_STORAGE_KEY = 'user_preferences';
const LATEST_VERSION = 1;

// Debounce utility with flush support
function debounce(fn, delay = 400) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      // @ts-ignore
      fn.apply(lastThis, lastArgs);
    }, delay);
  };
  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      // @ts-ignore
      fn.apply(lastThis, lastArgs);
    }
  };
  return debounced;
}

function getDeviceTimezone() {
  try {
    const tz = Localization?.getCalendars?.()?.[0]?.timeZone;
    if (typeof tz === 'string' && tz.length > 0) return tz;
  } catch {}
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof tz === 'string' && tz.length > 0) return tz;
  } catch {}
  return 'UTC';
}

function defaultPrefs(tz) {
  return {
    name: undefined,
    theme: 'system', // 'system' | 'light' | 'dark'
    aiTone: 'coach', // 'coach' | 'friend' | 'zen'
    defaultReminder: undefined, // HH:mm
    defaultReminderTime: undefined, // legacy alias
    eveningRecap: true,
    eveningRecapEnabled: true, // legacy alias
    timezone: tz || getDeviceTimezone(),
    version: LATEST_VERSION,
  };
}

function migratePrefs(obj) {
  const tz = getDeviceTimezone();
  let migrated = obj || {};
  // Handle legacy field names
  if (migrated.defaultReminderTime && !migrated.defaultReminder) {
    migrated.defaultReminder = migrated.defaultReminderTime;
  }
  if (typeof migrated.eveningRecapEnabled === 'boolean' && migrated.eveningRecap === undefined) {
    migrated.eveningRecap = migrated.eveningRecapEnabled;
  }

  // Coerce allowed values
  const theme = ['system', 'light', 'dark'].includes(migrated.theme)
    ? migrated.theme
    : 'system';
  const aiTone = ['coach', 'friend', 'zen'].includes(migrated.aiTone)
    ? migrated.aiTone
    : 'coach';

  const base = defaultPrefs(tz);
  const merged = {
    ...base,
    ...migrated,
    theme,
    aiTone,
    timezone: typeof migrated.timezone === 'string' && migrated.timezone.length > 0 ? migrated.timezone : tz,
    version: LATEST_VERSION,
  };

  // Validate defaultReminder format
  if (
    merged.defaultReminder !== undefined &&
    !/^\d{2}:\d{2}$/.test(String(merged.defaultReminder))
  ) {
    merged.defaultReminder = undefined;
  }
  // Keep legacy aliases in sync
  merged.defaultReminderTime = merged.defaultReminder;
  merged.eveningRecapEnabled = !!merged.eveningRecap;
  return merged;
}

export function UserProvider({ children }) {
  const [prefs, setPrefs] = useState(() => defaultPrefs(getDeviceTimezone()));
  const [isHydrated, setIsHydrated] = useState(false);

  // Persist (debounced)
  const saveDebouncedRef = useRef(
    debounce(async (next) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('UserPrefs save failed:', e?.message || e);
      }
    }, 450)
  );

  // Hydration logic
  const hydrateUserPrefs = async () => {
    try {
      const json = (await AsyncStorage.getItem(STORAGE_KEY)) ?? (await AsyncStorage.getItem(LEGACY_STORAGE_KEY));
      if (!json) {
        const next = defaultPrefs(getDeviceTimezone());
        setPrefs(next);
        setIsHydrated(true);
        return;
      }
      let parsed = null;
      try {
        parsed = JSON.parse(json);
      } catch (e) {
        console.warn('UserPrefs parse failed, using defaults');
        parsed = null;
      }
      const next = migratePrefs(parsed || {});
      setPrefs(next);
      setIsHydrated(true);
      // Sync evening recap scheduler
      if (typeof next.eveningRecap === 'boolean') {
        try { await setEveningRecapEnabled(next.eveningRecap); } catch {}
      }
    } catch (e) {
      console.warn('UserPrefs hydration failed:', e?.message || e);
      setPrefs(defaultPrefs(getDeviceTimezone()));
      setIsHydrated(true);
    }
  };

  // Initial mount: hydrate and flush pending save on unmount
  useEffect(() => {
    hydrateUserPrefs();
    return () => {
      saveDebouncedRef.current?.flush?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change after hydration
  useEffect(() => {
    if (isHydrated) {
      saveDebouncedRef.current(prefs);
    }
  }, [prefs, isHydrated]);

  // Setters (clamped, immutable)
  const setName = (name) => {
    setPrefs((p) => ({ ...p, name: name || undefined }));
  };

  const setTheme = (theme) => {
    const allowed = ['system', 'light', 'dark'];
    setPrefs((p) => ({ ...p, theme: allowed.includes(theme) ? theme : p.theme }));
  };

  const setAiTone = (tone) => {
    const allowed = ['coach', 'friend', 'zen'];
    setPrefs((p) => ({ ...p, aiTone: allowed.includes(tone) ? tone : p.aiTone }));
  };

  const setDefaultReminder = (time) => {
    if (time !== undefined && !/^\d{2}:\d{2}$/.test(String(time))) {
      return;
    }
    setPrefs((p) => ({
      ...p,
      defaultReminder: time || undefined,
      defaultReminderTime: time || undefined,
    }));
  };

  // Back-compat helper used in existing screens
  const setDefaultReminderTime = (time) => setDefaultReminder(time);

  const toggleEveningRecap = async (enabled) => {
    // Accept optional boolean param; if undefined, toggle
    setPrefs((p) => {
      const nextVal = typeof enabled === 'boolean' ? enabled : !p.eveningRecap;
      // Side-effect: keep scheduler in sync
      setEveningRecapEnabled(nextVal).catch(() => {});
      return { ...p, eveningRecap: nextVal, eveningRecapEnabled: nextVal };
    });
  };

  // Provide a currentTheme helper (back-compat)
  const getCurrentTheme = () => prefs.theme || 'system';
  const isDarkMode = () => getCurrentTheme() === 'dark';

  const value = useMemo(
    () => ({
      prefs,
      isHydrated,
      // Setters (new API)
      setName,
      setTheme,
      setAiTone,
      setDefaultReminder,
      toggleEveningRecap,
      hydrateUserPrefs,
      // Back-compat exports used in parts of the app
      setDefaultReminderTime,
      getCurrentTheme,
      isDarkMode,
    }),
    [prefs, isHydrated]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}

export default UserContext;
