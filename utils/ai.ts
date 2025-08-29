// Seventh Sense - Deterministic on-device AI helpers (TypeScript)
// - No external dependencies
// - Rule-based, deterministic messages; pluggable external provider kept disabled

export type AITone = 'coach' | 'friend' | 'zen';

export type AIContext = {
  name?: string;            // "Pratik"
  habitName: string;        // "Drink 2L water"
  streak?: number;          // current streak count
  last3?: Array<'done'|'miss'>; // most recent first
  timeOfDay?: 'morning'|'afternoon'|'evening'|'night';
  tz?: string;              // used only if computing timeOfDay
  aiTone?: AITone;          // default 'coach'
};

export type AIProvider = (prompt: string, ctx: AIContext) => Promise<string>;

let externalProvider: AIProvider | undefined;
let externalEnabled = false;

// Resolve time of day using Intl with optional timezone
function resolveTimeOfDay(ctx: AIContext): NonNullable<AIContext['timeOfDay']> {
  if (ctx.timeOfDay) return ctx.timeOfDay;
  const zone = ctx.tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false });
  const parts = fmt.formatToParts(new Date());
  const hh = Number(parts.find(p => p.type === 'hour')?.value || '0');
  const mm = Number(parts.find(p => p.type === 'minute')?.value || '0');
  const minutes = hh * 60 + mm;
  if (minutes >= 5*60 && minutes <= 11*60 + 59) return 'morning';
  if (minutes >= 12*60 && minutes <= 16*60 + 59) return 'afternoon';
  if (minutes >= 17*60 && minutes <= 21*60 + 29) return 'evening';
  return 'night';
}

// Back-compat export used in AIMessage.js
export function getTimeOfDay(): NonNullable<AIContext['timeOfDay']> {
  return resolveTimeOfDay({ habitName: 'habit' });
}

function safeStreak(n?: number): number { return Number.isFinite(n) && (n as number) >= 0 ? (n as number) : 0; }

function analyzeLast3(last3?: Array<'done'|'miss'>) {
  if (!last3 || last3.length === 0) return { doneCount: 0, missCount: 0, trend: 'none' as const };
  const doneCount = last3.filter(x => x === 'done').length;
  const missCount = last3.filter(x => x === 'miss').length;
  const trend = doneCount === last3.length ? 'up' : (missCount === last3.length ? 'down' : 'mixed');
  return { doneCount, missCount, trend };
}

type Bucket = 'slump' | 'rebound' | 's8p_up' | 's4_7_up' | 's1_3_up' | 's0_down' | 's0_new';
type TOD = NonNullable<AIContext['timeOfDay']>;

const TEMPLATES: Record<AITone, Record<TOD, Record<Bucket, string>>> = {
  coach: {
    morning: {
      slump:    '{name}, reset starts now. One small win on {habit} today. {tip}.',
      rebound:  'Good rebound on {habit}. Lock it in with a 2-minute start now. {tip}.',
      s8p_up:   '{streak} days strong. Keep momentum: schedule {habit} first. {tip}.',
      s4_7_up:  'Nice streak ({streak}). Protect it—start tiny and finish early. {tip}.',
      s1_3_up:  'Solid start. Repeat the cue and go. {tip}.',
      s0_down:  'No worries. Pick one tiny action for {habit}. {tip}.',
      s0_new:   'Make it effortless: 2-minute {habit} to begin. {tip}.',
    },
    afternoon: {
      slump:    'Midday reset: a small {habit} rep now. {tip}.',
      rebound:  'Back on track. Anchor {habit} to a routine task. {tip}.',
      s8p_up:   '{streak} days—excellent. Keep it light and consistent. {tip}.',
      s4_7_up:  'Streak forming. Set a clear cue then act. {tip}.',
      s1_3_up:  'Stack {habit} after something you already do. {tip}.',
      s0_down:  'Start tiny: 60 seconds of {habit}. {tip}.',
      s0_new:   'Try a 1-minute test run for {habit}. {tip}.',
    },
    evening: {
      slump:    'Close your day with a small {habit}. {tip}.',
      rebound:  'Great save. Prep tomorrow’s cue for {habit}. {tip}.',
      s8p_up:   '{streak} days—prep tomorrow in 1 minute. {tip}.',
      s4_7_up:  'Bank the streak: small, done, repeat. {tip}.',
      s1_3_up:  'End strong today. Keep it simple. {tip}.',
      s0_down:  'A tiny step tonight counts. {tip}.',
      s0_new:   'Lay one small brick for {habit} now. {tip}.',
    },
    night: {
      slump:    'Gentle reset. One minute on {habit}, then rest. {tip}.',
      rebound:  'Nice rebound. Set a visible cue for morning. {tip}.',
      s8p_up:   '{streak} days—prepare next step before sleep. {tip}.',
      s4_7_up:  'Quiet win now; cue ready for morning. {tip}.',
      s1_3_up:  'Keep it tiny tonight; momentum matters. {tip}.',
      s0_down:  'No pressure—just one minute on {habit}. {tip}.',
      s0_new:   'Set tomorrow’s cue for {habit}. {tip}.',
    },
  },
  friend: {
    morning: {
      slump:    'Fresh start, {name}. Tiny {habit} now—{tip}.',
      rebound:  'You’re bouncing back—nice. Quick {habit} hit now. {tip}. 😊',
      s8p_up:   '{streak} days! Keep it light and go. {tip}. 😊',
      s4_7_up:  'Streak vibes. Same cue, small start. {tip}.',
      s1_3_up:  'Good groove. One easy rep. {tip}.',
      s0_down:  'No stress—just a tiny step on {habit}. {tip}.',
      s0_new:   'Test drive time: 2 minutes on {habit}. {tip}.',
    },
    afternoon: {
      slump:    'Midday nudge—small {habit} break. {tip}.',
      rebound:  'Back at it—nice. Anchor {habit} to a task. {tip}. 😊',
      s8p_up:   '{streak} days strong. Keep it chill. {tip}. 😊',
      s4_7_up:  'Nice rhythm. Repeat your cue. {tip}.',
      s1_3_up:  'One easy rep right now. {tip}.',
      s0_down:  'Tiny counts—60 seconds of {habit}. {tip}.',
      s0_new:   'Give it a go—1 minute on {habit}. {tip}.',
    },
    evening: {
      slump:    'Day’s not over. Small {habit} win now. {tip}.',
      rebound:  'Good save today. Prep tomorrow’s cue. {tip}. 😊',
      s8p_up:   '{streak} days—set up tomorrow in 1 min. {tip}. 😊',
      s4_7_up:  'Lock it in with a tiny step. {tip}.',
      s1_3_up:  'Finish easy today. {tip}.',
      s0_down:  'Just a little is plenty. {tip}.',
      s0_new:   'Lay one small brick for {habit}. {tip}.',
    },
    night: {
      slump:    'Gentle finish. One minute on {habit}. {tip}.',
      rebound:  'Back on track—nice. Cue for morning set? {tip}. 😊',
      s8p_up:   '{streak} days—nice. Prep and rest. {tip}. 😊',
      s4_7_up:  'Quiet win now, cue ready. {tip}.',
      s1_3_up:  'Tiny step, then lights out. {tip}.',
      s0_down:  'No pressure—just a minute. {tip}.',
      s0_new:   'Set a morning cue for {habit}. {tip}.',
    },
  },
  zen: {
    morning: {
      slump:    'Begin again. One small {habit}. {tip}.',
      rebound:  'Return to the path. A quiet start. {tip}.',
      s8p_up:   '{streak} days. Continue, lightly. {tip}.',
      s4_7_up:  'Keep the thread. Small step. {tip}.',
      s1_3_up:  'Start softly. One simple act. {tip}.',
      s0_down:  'No judgment. One breath, then {habit}. {tip}.',
      s0_new:   'Plant a seed for {habit}. {tip}.',
    },
    afternoon: {
      slump:    'Pause. A small {habit}. {tip}.',
      rebound:  'Back to center. One easy step. {tip}.',
      s8p_up:   '{streak} days. Steady presence. {tip}.',
      s4_7_up:  'Continue gently. {tip}.',
      s1_3_up:  'A simple move now. {tip}.',
      s0_down:  'Release pressure. A tiny act. {tip}.',
      s0_new:   'Begin small. {tip}.',
    },
    evening: {
      slump:    'Close the day softly. {habit}. {tip}.',
      rebound:  'A quiet return. Prepare the cue. {tip}.',
      s8p_up:   '{streak} days. Prepare, then rest. {tip}.',
      s4_7_up:  'Keep it light. One step. {tip}.',
      s1_3_up:  'Finish with ease. {tip}.',
      s0_down:  'Only a small act. {tip}.',
      s0_new:   'Set tomorrow’s cue. {tip}.',
    },
    night: {
      slump:    'Reset gently. One minute. {tip}.',
      rebound:  'Return to rhythm. Cue ready. {tip}.',
      s8p_up:   '{streak} days. Prepare and sleep. {tip}.',
      s4_7_up:  'Quiet step, then rest. {tip}.',
      s1_3_up:  'Small act, lights low. {tip}.',
      s0_down:  'Ease into it. {tip}.',
      s0_new:   'Lay out the cue. {tip}.',
    },
  },
};

function buildTip(habit: string, tod: TOD): string {
  const h = habit.toLowerCase();
  if (h.includes('water')) return 'keep a bottle within reach';
  if (h.includes('walk')) return 'start with 4 minutes now';
  if (h.includes('meditat') || h.includes('breathe')) return 'take 5 slow breaths';
  switch (tod) {
    case 'morning': return 'set a 5-minute starter';
    case 'afternoon': return 'stack it after a routine task';
    case 'evening': return 'prepare for tomorrow in 1 minute';
    default: return 'lay out what you need now';
  }
}

function selectBucket(streak: number, last3Arr: Array<'done'|'miss'>): Bucket {
  const { doneCount, missCount, trend } = analyzeLast3(last3Arr);
  if (missCount >= 2) return 'slump';
  if (doneCount >= 1 && missCount >= 1 && last3Arr[0] === 'done') return 'rebound';
  if (streak >= 8) return 's8p_up';
  if (streak >= 4) return 's4_7_up';
  if (streak >= 1) return 's1_3_up';
  if (trend === 'down') return 's0_down';
  return 's0_new';
}

function interpolate(tpl: string, map: Record<string, string|number>): string {
  let out = tpl.replace(/\{(\w+)\}/g, (_, k) => String(map[k] ?? ''));
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

function stripEmojisIfNeeded(tone: AITone, text: string): string {
  if (tone === 'friend') return text;
  try { return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, ''); } catch { return text; }
}

function enforceLength(msg: string): string {
  const MAX = 220;
  if (msg.length <= MAX) return msg;
  const lastPeriod = msg.lastIndexOf('.');
  if (lastPeriod > 0) {
    const trimmed = msg.slice(0, lastPeriod + 1).trim();
    if (trimmed.length <= MAX) return trimmed;
  }
  return (msg.slice(0, MAX - 1).trimEnd() + '…');
}

// Build compact prompt for future providers
export function buildMotivationPrompt(ctx: AIContext): string {
  const name = ctx.name || 'friend';
  const tone = ctx.aiTone || 'coach';
  const tod = resolveTimeOfDay(ctx);
  const streak = safeStreak(ctx.streak);
  const last = (ctx.last3 || []).join(',');
  return [
    'Role: You are a concise micro-coach.',
    `User: ${name}`,
    `Habit: ${ctx.habitName}`,
    `Streak: ${streak}`,
    `Recent: ${last || 'none'}`,
    `TimeOfDay: ${tod}`,
    `Tone: ${tone}`,
    'Write 1–2 short sentences (<=180 chars total). Be specific.',
    'Use at most one emoji only if tone=friend. Include one tiny action tip.',
  ].join('\n');
}

function timeout<T>(ms: number, err = 'timeout'): Promise<T> { return new Promise((_, rej) => setTimeout(() => rej(new Error(err)), ms)); }

// Deterministic generator; optional external provider (disabled by default)
export async function getMotivation(ctx: AIContext): Promise<string> {
  const name = ctx.name || 'friend';
  const tone: AITone = (ctx.aiTone as AITone) || 'coach';
  const tod = resolveTimeOfDay(ctx);
  const streak = safeStreak(ctx.streak);
  const last3Arr: Array<'done'|'miss'> = (ctx.last3 && ctx.last3.length ? ctx.last3 : []) as Array<'done'|'miss'>;

  if (externalEnabled && externalProvider) {
    try {
      const prompt = buildMotivationPrompt({ ...ctx, name, aiTone: tone, timeOfDay: tod, streak, last3: last3Arr });
      const result = await Promise.race([ externalProvider(prompt, ctx), timeout<string>(2500) ]);
      if (typeof result === 'string' && result.trim()) return enforceLength(result.trim());
    } catch { /* fall back */ }
  }

  const bucket = selectBucket(streak, last3Arr);
  const tip = buildTip(ctx.habitName, tod);
  const tpl = TEMPLATES[tone][tod][bucket];
  const msg = interpolate(tpl, { name, habit: ctx.habitName, streak, tip });
  const clean = stripEmojisIfNeeded(tone, msg);
  return enforceLength(clean);
}

// External provider plumbing
export function setExternalAIProvider(p?: AIProvider): void { externalProvider = p; }
export function enableExternalProvider(enable: boolean): void { externalEnabled = !!enable; }
export function isExternalProviderEnabled(): boolean { return externalEnabled; }

// Backward-compat shim for existing JS usage in components/AIMessage.js
type LegacyContext = { name?: string; habitName: string; streak?: number; last3Outcomes?: boolean[]; timeOfDay?: 'morning'|'afternoon'|'evening'|'night'; aiTone?: AITone; tz?: string; };
export async function generateMotivation(ctx: LegacyContext): Promise<string> {
  const last3: Array<'done'|'miss'> | undefined = ctx.last3Outcomes ? ctx.last3Outcomes.map(b => (b ? 'done' : 'miss')) : undefined;
  return getMotivation({ name: ctx.name, habitName: ctx.habitName, streak: ctx.streak, last3, timeOfDay: ctx.timeOfDay, aiTone: ctx.aiTone, tz: ctx.tz });
}
