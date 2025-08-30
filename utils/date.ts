// Seventh Sense - TZ-aware date utilities (no external deps)

export type DateKey = string; // "YYYY-MM-DD"
export type TZ = string; // IANA timezone

export type LogLike = {
  date: DateKey;
  completed: boolean;
};

export interface StreakData {
  current: number;
  longest: number;
}

// ----------------------------
// Internal helpers
// ----------------------------

function safeTZ(tz?: string): string {
  try {
    const fromIntl = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz && typeof tz === 'string' && tz.length > 0 ? tz : fromIntl || 'UTC';
  } catch {
    return tz || 'UTC';
  }
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatKeyFromYMD(y: number, m: number, d: number): DateKey {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

// Extract local Y/M/D in the requested timezone using Intl API.
function getLocalYMDInTZ(date: Date, tz: string): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Using formatToParts to avoid string parsing edge cases
  const parts = fmt.formatToParts(date);
  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const d = Number(parts.find((p) => p.type === 'day')?.value);
  return { y, m, d };
}

// Convert a YYYY-MM-DD key to a UTC Date at 00:00 for that local day.
// We always operate at UTC midnight and re-derive local YMD via Intl after arithmetic.
function dateKeyToDateAtStartOfDay(key: DateKey, tz: string): Date {
  const [y, m, d] = key.split('-').map((x) => Number(x));
  // Constructing UTC midnight for the local date prevents DST issues when adding days.
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0, 0));
}

// ----------------------------
// Exports
// ----------------------------

/**
 * Get today's date key in YYYY-MM-DD for the given timezone.
 * Example: getTodayKey('Asia/Kolkata') → '2025-08-29'
 */
export function getTodayKey(tz: string): DateKey {
  const zone = safeTZ(tz);
  const { y, m, d } = getLocalYMDInTZ(new Date(), zone);
  return formatKeyFromYMD(y, m, d);
}

/**
 * Check if two date keys represent the same local day in the given timezone.
 * Accepts already-normalized YYYY-MM-DD strings.
 */
export function isSameDay(a: DateKey, b: DateKey, tz: string): boolean {
  if (a === b) return true;
  // Normalize by parsing and formatting back, to tolerate minor inconsistencies.
  const zone = safeTZ(tz);
  const da = dateKeyToDateAtStartOfDay(a, zone);
  const db = dateKeyToDateAtStartOfDay(b, zone);
  const { y: ay, m: am, d: ad } = getLocalYMDInTZ(da, zone);
  const { y: by, m: bm, d: bd } = getLocalYMDInTZ(db, zone);
  const ak = formatKeyFromYMD(ay, am, ad);
  const bk = formatKeyFromYMD(by, bm, bd);
  return ak === bk;
}

/**
 * Add n days (can be negative) to a date key in the provided timezone.
 * Uses UTC midnight arithmetic to avoid DST pitfalls.
 * Example: addDays('2025-03-09', 1, 'America/Los_Angeles') → '2025-03-10'
 */
export function addDays(key: DateKey, n: number, tz?: string): DateKey {
  const zone = safeTZ(tz);
  const base = dateKeyToDateAtStartOfDay(key, zone);
  const next = new Date(base.getTime() + n * 24 * 60 * 60 * 1000);
  const { y, m, d } = getLocalYMDInTZ(next, zone);
  return formatKeyFromYMD(y, m, d);
}

/**
 * Return the last n days as date keys, newest → oldest, inclusive of today.
 * Example (n=3): ['2025-08-29','2025-08-28','2025-08-27']
 */
export function lastNDays(n: number, tz: string): DateKey[] {
  const zone = safeTZ(tz);
  const out: DateKey[] = [];
  let cur = getTodayKey(zone);
  out.push(cur);
  for (let i = 1; i < Math.max(1, n); i++) {
    cur = addDays(cur, -1, zone);
    out.push(cur);
  }
  return out; // newest → oldest
}

/**
 * Get weekday number for a date key. Sunday = 0, Monday = 1, ... Saturday = 6.
 */
export function getWeekday(key: DateKey, tz: string): number {
  const zone = safeTZ(tz);
  const [y, m, d] = key.split('-').map((x) => Number(x));
  // Day-of-week depends only on Y/M/D in Gregorian, so UTC is fine here.
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return dt.getUTCDay(); // 0..6, Sun=0
}

/**
 * Compute streak data from logs. Only counts unique days with completed=true.
 * current: length of the trailing consecutive run ending TODAY in tz; otherwise 0.
 */
export function computeStreak(logs: LogLike[], tz: string): StreakData {
  const zone = safeTZ(tz);
  if (!Array.isArray(logs) || logs.length === 0) return { current: 0, longest: 0 };

  // Unique completed dates
  const unique = new Set<string>();
  for (const l of logs) {
    if (l && l.completed && typeof l.date === 'string') unique.add(l.date);
  }
  const dates = Array.from(unique).sort(); // ascending (oldest → newest)
  if (dates.length === 0) return { current: 0, longest: 0 };

  // Compute longest chain of consecutive days
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevNext = addDays(dates[i - 1], 1, zone);
    if (dates[i] === prevNext) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak: only if the last completed day is today in tz
  const today = getTodayKey(zone);
  const last = dates[dates.length - 1];
  let current = 0;
  if (last === today) {
    // Walk backwards from end while consecutive
    current = 1;
    let cursor = last;
    for (let i = dates.length - 2; i >= 0; i--) {
      const prev = addDays(cursor, -1, zone);
      if (dates[i] === prev) {
        current += 1;
        cursor = prev;
      } else {
        break;
      }
    }
  } else {
    current = 0; // per MVP rule
  }

  return { current, longest };
}

/**
 * Minimal frequency helper for whether a habit should show today.
 * - daily  → true
 * - weekly → true (MVP; refine later for chosen weekdays)
 * - custom → true if targetPerWeek provided; otherwise true (MVP)
 */
export function datesForFrequency(
  freq: 'daily' | 'weekly' | 'custom',
  targetPerWeek?: number,
  tz?: string
): { shouldShowToday: boolean } {
  switch (freq) {
    case 'daily':
      return { shouldShowToday: true };
    case 'weekly':
      return { shouldShowToday: true }; // MVP: always show
    case 'custom':
      return { shouldShowToday: typeof targetPerWeek === 'number' ? true : true };
    default:
      return { shouldShowToday: true };
  }
}
