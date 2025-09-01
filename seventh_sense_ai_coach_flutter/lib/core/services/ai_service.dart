import '../../data/models/ai_context.dart';
import '../utils/date_utils.dart';

class AIService {
  static const Map<String, Map<String, Map<String, String>>> _templates = {
    'coach': {
      'morning': {
        'slump': '{name}, reset starts now. One small win on {habit} today. {tip}.',
        'rebound': 'Good rebound on {habit}. Lock it in with a 2-minute start now. {tip}.',
        's8p_up': '{streak} days strong. Keep momentum: schedule {habit} first. {tip}.',
        's4_7_up': 'Nice streak ({streak}). Protect it—start tiny and finish early. {tip}.',
        's1_3_up': 'Solid start. Repeat the cue and go. {tip}.',
        's0_down': 'No worries. Pick one tiny action for {habit}. {tip}.',
        's0_new': 'Make it effortless: 2-minute {habit} to begin. {tip}.',
      },
      'afternoon': {
        'slump': 'Midday reset: a small {habit} rep now. {tip}.',
        'rebound': 'Back on track. Anchor {habit} to a routine task. {tip}.',
        's8p_up': '{streak} days—excellent. Keep it light and consistent. {tip}.',
        's4_7_up': 'Streak forming. Set a clear cue then act. {tip}.',
        's1_3_up': 'Stack {habit} after something you already do. {tip}.',
        's0_down': 'Start tiny: 60 seconds of {habit}. {tip}.',
        's0_new': 'Try a 1-minute test run for {habit}. {tip}.',
      },
      'evening': {
        'slump': 'Close your day with a small {habit}. {tip}.',
        'rebound': 'Great save. Prep tomorrow\'s cue for {habit}. {tip}.',
        's8p_up': '{streak} days—prep tomorrow in 1 minute. {tip}.',
        's4_7_up': 'Bank the streak: small, done, repeat. {tip}.',
        's1_3_up': 'End strong today. Keep it simple. {tip}.',
        's0_down': 'A tiny step tonight counts. {tip}.',
        's0_new': 'Lay one small brick for {habit} now. {tip}.',
      },
      'night': {
        'slump': 'Gentle reset. One minute on {habit}, then rest. {tip}.',
        'rebound': 'Nice rebound. Set a visible cue for morning. {tip}.',
        's8p_up': '{streak} days—prepare next step before sleep. {tip}.',
        's4_7_up': 'Quiet win now; cue ready for morning. {tip}.',
        's1_3_up': 'Keep it tiny tonight; momentum matters. {tip}.',
        's0_down': 'No pressure—just one minute on {habit}. {tip}.',
        's0_new': 'Set tomorrow\'s cue for {habit}. {tip}.',
      },
    },
    'friend': {
      'morning': {
        'slump': 'Fresh start, {name}. Tiny {habit} now—{tip}.',
        'rebound': 'You\'re bouncing back—nice. Quick {habit} hit now. {tip}. 😊',
        's8p_up': '{streak} days! Keep it light and go. {tip}. 😊',
        's4_7_up': 'Streak vibes. Same cue, small start. {tip}.',
        's1_3_up': 'Good groove. One easy rep. {tip}.',
        's0_down': 'No stress—just a tiny step on {habit}. {tip}.',
        's0_new': 'Test drive time: 2 minutes on {habit}. {tip}.',
      },
      'afternoon': {
        'slump': 'Midday nudge—small {habit} break. {tip}.',
        'rebound': 'Back at it—nice. Anchor {habit} to a task. {tip}. 😊',
        's8p_up': '{streak} days strong. Keep it chill. {tip}. 😊',
        's4_7_up': 'Nice rhythm. Repeat your cue. {tip}.',
        's1_3_up': 'One easy rep right now. {tip}.',
        's0_down': 'Tiny counts—60 seconds of {habit}. {tip}.',
        's0_new': 'Give it a go—1 minute on {habit}. {tip}.',
      },
      'evening': {
        'slump': 'Day\'s not over. Small {habit} win now. {tip}.',
        'rebound': 'Good save today. Prep tomorrow\'s cue. {tip}. 😊',
        's8p_up': '{streak} days—set up tomorrow in 1 min. {tip}. 😊',
        's4_7_up': 'Lock it in with a tiny step. {tip}.',
        's1_3_up': 'Finish easy today. {tip}.',
        's0_down': 'Just a little is plenty. {tip}.',
        's0_new': 'Lay one small brick for {habit}. {tip}.',
      },
      'night': {
        'slump': 'Gentle finish. One minute on {habit}. {tip}.',
        'rebound': 'Back on track—nice. Cue for morning set? {tip}. 😊',
        's8p_up': '{streak} days—nice. Prep and rest. {tip}. 😊',
        's4_7_up': 'Quiet win now, cue ready. {tip}.',
        's1_3_up': 'Tiny step, then lights out. {tip}.',
        's0_down': 'No pressure—just a minute. {tip}.',
        's0_new': 'Set a morning cue for {habit}. {tip}.',
      },
    },
    'zen': {
      'morning': {
        'slump': 'Begin again. One small {habit}. {tip}.',
        'rebound': 'Return to the path. A quiet start. {tip}.',
        's8p_up': '{streak} days. Continue, lightly. {tip}.',
        's4_7_up': 'Keep the thread. Small step. {tip}.',
        's1_3_up': 'Start softly. One simple act. {tip}.',
        's0_down': 'No judgment. One breath, then {habit}. {tip}.',
        's0_new': 'Plant a seed for {habit}. {tip}.',
      },
      'afternoon': {
        'slump': 'Pause. A small {habit}. {tip}.',
        'rebound': 'Back to center. One easy step. {tip}.',
        's8p_up': '{streak} days. Steady presence. {tip}.',
        's4_7_up': 'Continue gently. {tip}.',
        's1_3_up': 'A simple move now. {tip}.',
        's0_down': 'Release pressure. A tiny act. {tip}.',
        's0_new': 'Begin small. {tip}.',
      },
      'evening': {
        'slump': 'Close the day softly. {habit}. {tip}.',
        'rebound': 'A quiet return. Prepare the cue. {tip}.',
        's8p_up': '{streak} days. Prepare, then rest. {tip}.',
        's4_7_up': 'Keep it light. One step. {tip}.',
        's1_3_up': 'Finish with ease. {tip}.',
        's0_down': 'Only a small act. {tip}.',
        's0_new': 'Set tomorrow\'s cue. {tip}.',
      },
      'night': {
        'slump': 'Reset gently. One minute. {tip}.',
        'rebound': 'Return to rhythm. Cue ready. {tip}.',
        's8p_up': '{streak} days. Prepare and sleep. {tip}.',
        's4_7_up': 'Quiet step, then rest. {tip}.',
        's1_3_up': 'Small act, lights low. {tip}.',
        's0_down': 'Ease into it. {tip}.',
        's0_new': 'Lay out the cue. {tip}.',
      },
    },
  };

  static String _buildTip(String habit, String tod) {
    final h = habit.toLowerCase();
    if (h.contains('water')) return 'keep a bottle within reach';
    if (h.contains('walk')) return 'start with 4 minutes now';
    if (h.contains('meditat') || h.contains('breathe')) return 'take 5 slow breaths';
    
    switch (tod) {
      case 'morning':
        return 'set a 5-minute starter';
      case 'afternoon':
        return 'stack it after a routine task';
      case 'evening':
        return 'prepare for tomorrow in 1 minute';
      default:
        return 'lay out what you need now';
    }
  }

  static String _analyzeLast3(List<String> last3) {
    if (last3.isEmpty) return 'none';
    
    final doneCount = last3.where((x) => x == 'done').length;
    final missCount = last3.where((x) => x == 'miss').length;
    
    if (doneCount == last3.length) return 'up';
    if (missCount == last3.length) return 'down';
    return 'mixed';
  }

  static String _selectBucket(int streak, List<String> last3Arr) {
    final trend = _analyzeLast3(last3Arr);
    final missCount = last3Arr.where((x) => x == 'miss').length;
    final doneCount = last3Arr.where((x) => x == 'done').length;
    
    if (missCount >= 2) return 'slump';
    if (doneCount >= 1 && missCount >= 1 && last3Arr.isNotEmpty && last3Arr.first == 'done') {
      return 'rebound';
    }
    if (streak >= 8) return 's8p_up';
    if (streak >= 4) return 's4_7_up';
    if (streak >= 1) return 's1_3_up';
    if (trend == 'down') return 's0_down';
    return 's0_new';
  }

  static String _interpolate(String tpl, Map<String, String> map) {
    String out = tpl;
    map.forEach((key, value) {
      out = out.replaceAll('{$key}', value);
    });
    out = out.replaceAll(RegExp(r'\s+'), ' ').trim();
    return out;
  }

  static String _stripEmojisIfNeeded(String tone, String text) {
    if (tone == 'friend') return text;
    return text.replaceAll(RegExp(r'[\u{1F300}-\u{1FAFF}]', unicode: true), '');
  }

  static String _enforceLength(String msg) {
    const max = 220;
    if (msg.length <= max) return msg;
    
    final lastPeriod = msg.lastIndexOf('.');
    if (lastPeriod > 0) {
      final trimmed = msg.substring(0, lastPeriod + 1).trim();
      if (trimmed.length <= max) return trimmed;
    }
    
    return '${msg.substring(0, max - 1).trim()}…';
  }

  static String _safeStreak(int? n) {
    return (n ?? 0) >= 0 ? (n ?? 0).toString() : '0';
  }

  /// Generate deterministic motivational message
  static String getMotivation(AIContext ctx) {
    final name = ctx.displayName;
    final tone = ctx.aiTone;
    final tod = ctx.timeOfDay ?? DateUtils.getTimeOfDay(ctx.timezone);
    final streak = int.tryParse(_safeStreak(ctx.streak)) ?? 0;
    final last3Arr = ctx.last3Outcomes;
    final habitName = ctx.displayHabitName;

    final bucket = _selectBucket(streak, last3Arr);
    final tip = _buildTip(habitName, tod);
    
    final templates = _templates[tone]?[tod]?[bucket];
    if (templates == null) {
      return 'Keep going with $habitName. $tip.';
    }
    
    final msg = _interpolate(templates, {
      'name': name,
      'habit': habitName,
      'streak': streak.toString(),
      'tip': tip,
    });
    
    final clean = _stripEmojisIfNeeded(tone, msg);
    return _enforceLength(clean);
  }

  /// Build compact prompt for future providers
  static String buildMotivationPrompt(AIContext ctx) {
    final name = ctx.displayName;
    final tone = ctx.aiTone;
    final tod = ctx.timeOfDay ?? DateUtils.getTimeOfDay(ctx.timezone);
    final streak = _safeStreak(ctx.streak);
    final last = (ctx.last3Outcomes).join(',');
    
    return [
      'Role: You are a concise micro-coach.',
      'User: $name',
      'Habit: ${ctx.habitName}',
      'Streak: $streak',
      'Recent: ${last.isEmpty ? 'none' : last}',
      'TimeOfDay: $tod',
      'Tone: $tone',
      'Write 1–2 short sentences (<=180 chars total). Be specific.',
      'Use at most one emoji only if tone=friend. Include one tiny action tip.',
    ].join('\n');
  }
}
