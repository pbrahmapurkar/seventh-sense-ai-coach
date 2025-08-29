// Seventh Sense - Zustand Habits Store (local-first)
// - Habits + Logs with throttled persistence and safe hydration

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelScheduled } from '../utils/notify';

let dateUtils;
try {
  // utils/date.ts exports computeStreak in this project
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  dateUtils = require('../utils/date');
} catch (e) {
  dateUtils = {};
}
const computeStreakExternal = dateUtils?.computeStreak;

const STORAGE_KEY = 'SS_STORE_V1';
const LEGACY_KEYS = ['habits', 'logs'];
const LATEST_VERSION = 1;

function genId() {
  const rand = Math.floor(Math.random() * 1e6).toString(36);
  return Date.now().toString(36) + rand;
}

function throttle(fn, delay = 500) {
  let last = 0,
    timer = null,
    lastArgs = null;
  const throttled = (...args) => {
    const now = Date.now();
    lastArgs = args;
    const invoke = () => {
      last = now;
      timer = null;
      fn(...(lastArgs || []));
    };
    if (now - last >= delay) {
      invoke();
    } else if (!timer) {
      timer = setTimeout(invoke, delay - (now - last));
    }
  };
  throttled.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      fn(...(lastArgs || []));
    }
  };
  return throttled;
}

function initialState() {
  return {
    habits: [],
    logs: [],
    version: LATEST_VERSION,
    _hydrated: false,
    isHydrated: false, // for backward compatibility
  };
}

// Fallback streak calculation if utils/date.computeStreak is unavailable
function fallbackComputeStreak(logsForHabit = []) {
  const completedDates = Array.from(
    new Set(
      logsForHabit
        .filter((l) => l.completed)
        .map((l) => l.date)
        .filter(Boolean)
    )
  ).sort(); // ascending

  if (completedDates.length === 0) return { current: 0, longest: 0 };

  const addOneDay = (key) => {
    const d = new Date(key);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Longest streak
  let longest = 1;
  let currentSeq = 1;
  for (let i = 1; i < completedDates.length; i++) {
    if (completedDates[i] === addOneDay(completedDates[i - 1])) {
      currentSeq += 1;
      longest = Math.max(longest, currentSeq);
    } else {
      currentSeq = 1;
    }
  }

  // Current streak: walk from latest backwards
  let current = 1;
  for (let i = completedDates.length - 1; i > 0; i--) {
    if (completedDates[i] === addOneDay(completedDates[i - 1])) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, longest };
}

export const useHabitsStore = create((set, get) => {
  // Throttled saver (captures get())
  const saveThrottled = throttle(async () => {
    try {
      const { habits, logs } = get();
      const payload = JSON.stringify({ habits, logs, version: LATEST_VERSION });
      await AsyncStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      console.warn('Store save failed:', e?.message || e);
    }
  }, 500);

  return {
    ...initialState(),

    // Internal force save (exposed for tests or manual flush)
    _saveNow: async () => {
      try {
        const { habits, logs } = get();
        const payload = JSON.stringify({ habits, logs, version: LATEST_VERSION });
        await AsyncStorage.setItem(STORAGE_KEY, payload);
      } catch (e) {
        console.warn('Store immediate save failed:', e?.message || e);
      }
    },

    // Public: hydrate from storage (safe against corrupt data)
    hydrateFromStorage: async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          try {
            const parsed = JSON.parse(json);
            const habits = Array.isArray(parsed?.habits) ? parsed.habits : [];
            const logs = Array.isArray(parsed?.logs) ? parsed.logs : [];
            set({ habits, logs, version: LATEST_VERSION, _hydrated: true, isHydrated: true });
            return;
          } catch (e) {
            console.warn('Store parse failed, trying legacy keys');
          }
        }
        // Legacy migration path
        const [habitsJson, logsJson] = await Promise.all([
          AsyncStorage.getItem(LEGACY_KEYS[0]),
          AsyncStorage.getItem(LEGACY_KEYS[1]),
        ]);
        const habits = habitsJson ? JSON.parse(habitsJson) : [];
        const logs = logsJson ? JSON.parse(logsJson) : [];
        set({ habits: Array.isArray(habits) ? habits : [], logs: Array.isArray(logs) ? logs : [], version: LATEST_VERSION, _hydrated: true, isHydrated: true });
        // Save migrated payload to new key (fire-and-forget)
        get()._saveNow?.();
      } catch (e) {
        console.warn('Store hydration failed:', e?.message || e);
        set({ ...initialState(), _hydrated: true, isHydrated: true });
      }
    },

    // Backward-compat alias used elsewhere
    hydrate: async () => {
      await get().hydrateFromStorage();
    },

    // Core state setters used by Settings import/export
    setHabits: (habits) => {
      set({ habits: Array.isArray(habits) ? habits : [] });
      saveThrottled();
    },
    setLogs: (logs) => {
      set({ logs: Array.isArray(logs) ? logs : [] });
      saveThrottled();
    },

    // Mutations
    addHabit: (habit) => {
      const newHabit = {
        id: habit?.id || genId(),
        name: habit?.name || 'Habit',
        type: habit?.type || 'health',
        freq: habit?.freq || 'daily',
        targetPerWeek: habit?.targetPerWeek ?? 7,
        remindAt: habit?.remindAt,
        createdAt: habit?.createdAt || Date.now(),
        archived: !!habit?.archived,
        icon: habit?.icon,
      };
      set((state) => ({ habits: [...state.habits, newHabit] }));
      saveThrottled();
      return newHabit;
    },

    updateHabit: (id, patch) => {
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      }));
      saveThrottled();
    },

    archiveHabit: (id) => {
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)),
      }));
      saveThrottled();
    },

    deleteHabit: async (id) => {
      // Cancel scheduled notifications (best effort)
      try { await cancelScheduled(id); } catch {}
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
        logs: state.logs.filter((l) => l.habitId !== id),
      }));
      await get()._saveNow();
    },

    toggleCompletion: (habitId, dateKey) => {
      const { logs } = get();
      const existing = logs.find((l) => l.habitId === habitId && l.date === dateKey && l.completed);
      if (existing) {
        set({ logs: logs.filter((l) => !(l.habitId === habitId && l.date === dateKey && l.completed)) });
      } else {
        const newLog = {
          id: genId(),
          habitId,
          date: dateKey,
          completed: true,
          createdAt: Date.now(),
        };
        set({ logs: [...logs.filter((l) => !(l.habitId === habitId && l.date === dateKey)), newLog] });
      }
      saveThrottled();
    },

    // Selectors
    getTodayHabits: (dateKey) => {
      // For MVP: include all non-archived habits regardless of freq
      const { habits } = get();
      return habits.filter((h) => !h.archived);
    },

    getHabitLogs: (habitId) => {
      const { logs } = get();
      return logs
        .filter((l) => l.habitId === habitId)
        .sort((a, b) => {
          if (a.date === b.date) return (b.createdAt || 0) - (a.createdAt || 0);
          return a.date < b.date ? 1 : -1; // newer date first
        });
    },

    isCompletedOnDate: (habitId, dateKey) => {
      const { logs } = get();
      return logs.some((l) => l.habitId === habitId && l.date === dateKey && l.completed);
    },

    getStreak: (habitId) => {
      const { logs } = get();
      const forHabit = logs.filter((l) => l.habitId === habitId && l.completed);
      if (typeof computeStreakExternal === 'function') {
        try {
          return computeStreakExternal(forHabit);
        } catch {}
      }
      return fallbackComputeStreak(forHabit);
    },

    // Dev helpers
    wipeAll: async () => {
      set({ ...initialState(), _hydrated: true, isHydrated: true });
      try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
    },
    reset: async () => {
      await get().wipeAll();
    },
  };
});

// Optional convenience selectors
export const selectors = {
  getTodayHabits: (dateKey) => useHabitsStore.getState().getTodayHabits(dateKey),
  getHabitLogs: (habitId) => useHabitsStore.getState().getHabitLogs(habitId),
  getStreak: (habitId) => useHabitsStore.getState().getStreak(habitId),
};
