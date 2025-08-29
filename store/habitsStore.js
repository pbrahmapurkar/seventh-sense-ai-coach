// Habits store using Zustand for Seventh Sense AI Coach
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayKey, computeStreak } from '../utils/date';
import { scheduleDaily, cancelScheduled } from '../utils/notify';

// Data models
export const Habit = {
  id: '',
  name: '',
  icon: '',
  type: 'health', // 'health' | 'mind' | 'custom'
  freq: 'daily', // 'daily' | 'weekly' | 'custom'
  targetPerWeek: 7,
  remindAt: '', // "HH:mm"
  createdAt: 0,
  archived: false,
};

export const Log = {
  id: '',
  habitId: '',
  date: '', // "YYYY-MM-DD"
  completed: false,
  note: '',
  createdAt: 0,
};

// Store state
const initialState = {
  habits: [],
  logs: [],
  isLoading: false,
  isHydrated: false,
};

// Store actions and selectors
export const useHabitsStore = create((set, get) => ({
  ...initialState,

  // Actions
  setHabits: (habits) => set({ habits }),
  setLogs: (logs) => set({ logs }),
  setLoading: (isLoading) => set({ isLoading }),
  setHydrated: (isHydrated) => set({ isHydrated }),

  // Add a new habit
  addHabit: async (habit) => {
    const newHabit = {
      ...habit,
      id: generateId(),
      createdAt: Date.now(),
    };

    set((state) => ({
      habits: [...state.habits, newHabit],
    }));

    // Schedule notification if reminder time is set
    if (habit.remindAt) {
      await scheduleDaily(newHabit.id, habit.remindAt);
    }

    // Persist to storage
    await persistStore();
    
    return newHabit;
  },

  // Update an existing habit
  updateHabit: async (id, updates) => {
    const state = get();
    const habitIndex = state.habits.findIndex(h => h.id === id);
    
    if (habitIndex === -1) return null;

    const oldHabit = state.habits[habitIndex];
    const updatedHabit = { ...oldHabit, ...updates };

    // Handle notification changes
    if (updates.remindAt !== undefined) {
      if (updates.remindAt) {
        // Cancel old notification and schedule new one
        await cancelScheduled(id);
        await scheduleDaily(id, updates.remindAt);
      } else {
        // Cancel notification if reminder was removed
        await cancelScheduled(id);
      }
    }

    set((state) => ({
      habits: state.habits.map(h => h.id === id ? updatedHabit : h),
    }));

    // Persist to storage
    await persistStore();
    
    return updatedHabit;
  },

  // Archive a habit (soft delete)
  archiveHabit: async (id) => {
    set((state) => ({
      habits: state.habits.map(h => 
        h.id === id ? { ...h, archived: true } : h
      ),
    }));

    // Persist to storage
    await persistStore();
  },

  // Delete a habit completely
  deleteHabit: async (id) => {
    // Cancel any scheduled notifications
    await cancelScheduled(id);

    // Remove habit and all its logs
    set((state) => ({
      habits: state.habits.filter(h => h.id !== id),
      logs: state.logs.filter(l => l.habitId !== id),
    }));

    // Persist to storage
    await persistStore();
  },

  // Toggle habit completion for a specific date
  toggleCompletion: async (habitId, dateKey) => {
    const state = get();
    const existingLog = state.logs.find(
      l => l.habitId === habitId && l.date === dateKey
    );

    if (existingLog) {
      // Remove existing log
      set((state) => ({
        logs: state.logs.filter(l => l.id !== existingLog.id),
      }));
    } else {
      // Create new log
      const newLog = {
        id: generateId(),
        habitId,
        date: dateKey,
        completed: true,
        createdAt: Date.now(),
      };

      set((state) => ({
        logs: [...state.logs, newLog],
      }));
    }

    // Persist to storage
    await persistStore();
  },

  // Get habits for today based on frequency rules
  getTodayHabits: (dateKey = getTodayKey()) => {
    const state = get();
    const today = dateKey || getTodayKey();
    
    return state.habits
      .filter(habit => !habit.archived)
      .filter(habit => {
        if (habit.freq === 'daily') return true;
        if (habit.freq === 'weekly') {
          // For weekly habits, show on specific days
          const dayOfWeek = new Date(today).getDay();
          // Simple logic: show on Monday, Wednesday, Friday
          return [1, 3, 5].includes(dayOfWeek);
        }
        if (habit.freq === 'custom') {
          // For custom frequency, show based on target per week
          const logs = state.logs.filter(l => l.habitId === habit.id);
          const thisWeekLogs = logs.filter(l => {
            const logDate = new Date(l.date);
            const todayDate = new Date(today);
            const diffTime = todayDate.getTime() - logDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays >= 0;
          });
          return thisWeekLogs.length < (habit.targetPerWeek || 3);
        }
        return false;
      });
  },

  // Get logs for a specific habit
  getHabitLogs: (habitId, days = 30) => {
    const state = get();
    const today = getTodayKey();
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return state.logs
      .filter(l => l.habitId === habitId)
      .filter(l => new Date(l.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Get streak data for a habit
  getStreak: (habitId) => {
    const state = get();
    const logs = state.logs.filter(l => l.habitId === habitId && l.completed);
    return computeStreak(logs);
  },

  // Get completion status for a habit on a specific date
  isCompletedOnDate: (habitId, dateKey) => {
    const state = get();
    return state.logs.some(
      l => l.habitId === habitId && l.date === dateKey && l.completed
    );
  },

  // Get overall completion percentage for a date range
  getCompletionPercentage: (startDate, endDate) => {
    const state = get();
    const habits = state.habits.filter(h => !h.archived && h.freq === 'daily');
    
    if (habits.length === 0) return 0;

    let totalCompletions = 0;
    let totalOpportunities = 0;

    habits.forEach(habit => {
      const logs = state.logs.filter(
        l => l.habitId === habit.id && 
             l.date >= startDate && 
             l.date <= endDate
      );
      const completed = logs.filter(l => l.completed).length;
      totalCompletions += completed;
      totalOpportunities += 1; // One opportunity per day for daily habits
    });

    return totalOpportunities > 0 ? (totalCompletions / totalOpportunities) * 100 : 0;
  },

  // Hydrate store from AsyncStorage
  hydrate: async () => {
    try {
      set({ isLoading: true });
      
      const [habitsJson, logsJson] = await Promise.all([
        AsyncStorage.getItem('habits'),
        AsyncStorage.getItem('logs'),
      ]);

      const habits = habitsJson ? JSON.parse(habitsJson) : [];
      const logs = logsJson ? JSON.parse(logsJson) : [];

      set({ habits, logs, isHydrated: true });
      
      console.log('Store hydrated:', { habits: habits.length, logs: logs.length });
    } catch (error) {
      console.error('Error hydrating store:', error);
      set({ isHydrated: true }); // Mark as hydrated even on error
    } finally {
      set({ isLoading: false });
    }
  },

  // Reset store to initial state
  reset: () => {
    set(initialState);
    AsyncStorage.multiRemove(['habits', 'logs']);
  },
}));

// Persistence helpers
let persistTimeout;
const persistStore = async () => {
  // Debounce persistence to avoid excessive writes
  clearTimeout(persistTimeout);
  persistTimeout = setTimeout(async () => {
    try {
      const state = useHabitsStore.getState();
      await Promise.all([
        AsyncStorage.setItem('habits', JSON.stringify(state.habits)),
        AsyncStorage.setItem('logs', JSON.stringify(state.logs)),
      ]);
    } catch (error) {
      console.error('Error persisting store:', error);
    }
  }, 1000);
};

// Utility function to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Export selectors for convenience
export const selectors = {
  getTodayHabits: (dateKey) => useHabitsStore.getState().getTodayHabits(dateKey),
  getHabitLogs: (habitId, days) => useHabitsStore.getState().getHabitLogs(habitId, days),
  getStreak: (habitId) => useHabitsStore.getState().getStreak(habitId),
  isCompletedOnDate: (habitId, dateKey) => useHabitsStore.getState().isCompletedOnDate(habitId, dateKey),
  getCompletionPercentage: (startDate, endDate) => useHabitsStore.getState().getCompletionPercentage(startDate, endDate),
};
