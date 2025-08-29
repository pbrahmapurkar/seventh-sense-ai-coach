// Date utilities for Seventh Sense AI Coach

export interface StreakData {
  current: number;
  longest: number;
}

export interface Log {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  note?: string;
  createdAt: number;
}

/**
 * Get today's date key in YYYY-MM-DD format
 */
export function getTodayKey(timezone?: string): string {
  const now = new Date();
  if (timezone) {
    // For now, use local timezone. In production, you'd use a proper timezone library
    return now.toISOString().split('T')[0];
  }
  return now.toISOString().split('T')[0];
}

/**
 * Check if two date keys represent the same day
 */
export function isSameDay(a: string, b: string, timezone?: string): boolean {
  return a === b;
}

/**
 * Add n days to a date key
 */
export function addDays(dateKey: string, n: number): string {
  const date = new Date(dateKey);
  date.setDate(date.getDate() + n);
  return date.toISOString().split('T')[0];
}

/**
 * Get the last n days as date keys
 */
export function lastNDays(n: number, timezone?: string): string[] {
  const today = new Date();
  const dates: string[] = [];
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Get weekday name from date key
 */
export function getWeekday(dateKey: string): string {
  const date = new Date(dateKey);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get short weekday name from date key
 */
export function getShortWeekday(dateKey: string): string {
  const date = new Date(dateKey);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Compute streak data from logs
 */
export function computeStreak(logs: Log[], timezone?: string): StreakData {
  if (logs.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort logs by date (newest first)
  const sortedLogs = logs
    .filter(log => log.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedLogs.length === 0) {
    return { current: 0, longest: 0 };
  }

  const today = getTodayKey(timezone);
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check current streak from today backwards
  let currentDate = today;
  for (const log of sortedLogs) {
    if (log.date === currentDate) {
      currentStreak++;
      tempStreak++;
      currentDate = addDays(currentDate, -1);
    } else if (log.date === addDays(currentDate, -1)) {
      tempStreak++;
      currentDate = addDays(currentDate, -1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let lastDate: string | null = null;
  for (const log of sortedLogs) {
    if (lastDate === null) {
      tempStreak = 1;
      lastDate = log.date;
    } else if (log.date === addDays(lastDate, -1)) {
      tempStreak++;
      lastDate = log.date;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
      lastDate = log.date;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Get dates for a specific frequency
 */
export function datesForFrequency(
  frequency: 'daily' | 'weekly' | 'custom',
  targetPerWeek?: number,
  startDate?: string
): string[] {
  const start = startDate || getTodayKey();
  const dates: string[] = [];
  
  if (frequency === 'daily') {
    // Return next 7 days
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
    }
  } else if (frequency === 'weekly') {
    // Return next 4 weeks (assuming weekly target)
    for (let i = 0; i < 28; i += 7) {
      dates.push(addDays(start, i));
    }
  } else if (frequency === 'custom' && targetPerWeek) {
    // For custom frequency, return dates based on target per week
    // This is a simplified implementation
    const daysPerWeek = Math.ceil(7 / targetPerWeek);
    for (let i = 0; i < 7; i += daysPerWeek) {
      dates.push(addDays(start, i));
    }
  }
  
  return dates;
}

/**
 * Check if a date is today
 */
export function isToday(dateKey: string): boolean {
  return dateKey === getTodayKey();
}

/**
 * Check if a date is in the past
 */
export function isPast(dateKey: string): boolean {
  const today = getTodayKey();
  return dateKey < today;
}

/**
 * Check if a date is in the future
 */
export function isFuture(dateKey: string): boolean {
  const today = getTodayKey();
  return dateKey > today;
}

/**
 * Get relative date string (Today, Yesterday, etc.)
 */
export function getRelativeDate(dateKey: string): string {
  const today = getTodayKey();
  const yesterday = addDays(today, -1);
  
  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';
  
  const diffDays = Math.floor(
    (new Date(today).getTime() - new Date(dateKey).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (diffDays < 7) {
    return getWeekday(dateKey);
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}
