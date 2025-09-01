import 'dart:convert';

typedef DateKey = String; // "YYYY-MM-DD"
typedef TZ = String; // IANA timezone

class LogLike {
  final String date;
  final bool completed;
  
  LogLike({required this.date, required this.completed});
}

class StreakData {
  final int current;
  final int longest;
  
  StreakData({required this.current, required this.longest});
}

class DateUtils {
  static String safeTZ(String? tz) {
    try {
      final fromIntl = DateTime.now().timeZoneName;
      return tz != null && tz.isNotEmpty ? tz : fromIntl.isNotEmpty ? fromIntl : 'UTC';
    } catch (e) {
      return tz ?? 'UTC';
    }
  }

  static String pad2(int n) {
    return n < 10 ? '0$n' : n.toString();
  }

  static String formatKeyFromYMD(int y, int m, int d) {
    return '$y-${pad2(m)}-${pad2(d)}';
  }

  static Map<String, int> getLocalYMDInTZ(DateTime date, String tz) {
    // Using DateTime methods for timezone conversion
    final utc = date.toUtc();
    final local = utc.toLocal();
    
    return {
      'y': local.year,
      'm': local.month,
      'd': local.day,
    };
  }

  static DateTime dateKeyToDateAtStartOfDay(String key, String tz) {
    final parts = key.split('-').map((x) => int.parse(x)).toList();
    final y = parts[0];
    final m = parts[1];
    final d = parts[2];
    
    return DateTime.utc(y, m, d, 0, 0, 0, 0);
  }

  /// Get today's date key in YYYY-MM-DD for the given timezone.
  /// Example: getTodayKey('Asia/Kolkata') → '2025-08-29'
  static String getTodayKey(String tz) {
    final zone = safeTZ(tz);
    final now = DateTime.now();
    final local = now.toLocal();
    return formatKeyFromYMD(local.year, local.month, local.day);
  }

  /// Check if two date keys represent the same local day in the given timezone.
  static bool isSameDay(String a, String b, String tz) {
    if (a == b) return true;
    
    final zone = safeTZ(tz);
    final da = dateKeyToDateAtStartOfDay(a, zone);
    final db = dateKeyToDateAtStartOfDay(b, zone);
    
    return da.isAtSameMomentAs(db);
  }

  /// Add n days (can be negative) to a date key in the provided timezone.
  static String addDays(String key, int n, String? tz) {
    final zone = safeTZ(tz);
    final base = dateKeyToDateAtStartOfDay(key, zone);
    final next = base.add(Duration(days: n));
    final local = next.toLocal();
    return formatKeyFromYMD(local.year, local.month, local.day);
  }

  /// Return the last n days as date keys, newest → oldest, inclusive of today.
  static List<String> lastNDays(int n, String tz) {
    final zone = safeTZ(tz);
    final out = <String>[];
    String cur = getTodayKey(zone);
    out.add(cur);
    
    for (int i = 1; i < n; i++) {
      cur = addDays(cur, -1, zone);
      out.add(cur);
    }
    
    return out; // newest → oldest
  }

  /// Get weekday number for a date key. Sunday = 0, Monday = 1, ... Saturday = 6.
  static int getWeekday(String key, String tz) {
    final zone = safeTZ(tz);
    final parts = key.split('-').map((x) => int.parse(x)).toList();
    final y = parts[0];
    final m = parts[1];
    final d = parts[2];
    
    final dt = DateTime.utc(y, m, d);
    return dt.weekday % 7; // Convert to 0-6 range (Sunday = 0)
  }

  /// Compute streak data from logs. Only counts unique days with completed=true.
  static StreakData computeStreak(List<LogLike> logs, String tz) {
    final zone = safeTZ(tz);
    
    if (logs.isEmpty) return StreakData(current: 0, longest: 0);

    // Unique completed dates
    final unique = <String>{};
    for (final l in logs) {
      if (l.completed && l.date.isNotEmpty) {
        unique.add(l.date);
      }
    }
    
    final dates = unique.toList()..sort(); // ascending (oldest → newest)
    if (dates.isEmpty) return StreakData(current: 0, longest: 0);

    // Compute longest chain of consecutive days
    int longest = 1;
    int run = 1;
    for (int i = 1; i < dates.length; i++) {
      final prevNext = addDays(dates[i - 1], 1, zone);
      if (dates[i] == prevNext) {
        run += 1;
        if (run > longest) longest = run;
      } else {
        run = 1;
      }
    }

    // Current streak: only if the last completed day is today in tz
    final today = getTodayKey(zone);
    final last = dates.last;
    int current = 0;
    
    if (last == today) {
      // Walk backwards from end while consecutive
      current = 1;
      String cursor = last;
      for (int i = dates.length - 2; i >= 0; i--) {
        final prev = addDays(cursor, -1, zone);
        if (dates[i] == prev) {
          current += 1;
          cursor = prev;
        } else {
          break;
        }
      }
    } else {
      current = 0; // per MVP rule
    }

    return StreakData(current: current, longest: longest);
  }

  /// Minimal frequency helper for whether a habit should show today.
  static Map<String, bool> datesForFrequency(
    String freq,
    int? targetPerWeek,
    String? tz,
  ) {
    switch (freq) {
      case 'daily':
        return {'shouldShowToday': true};
      case 'weekly':
        return {'shouldShowToday': true}; // MVP: always show
      case 'custom':
        return {'shouldShowToday': targetPerWeek != null};
      default:
        return {'shouldShowToday': true};
    }
  }

  /// Parse HH:mm time string to hour and minute
  static Map<String, int>? parseHHmm(String hhmm) {
    final regex = RegExp(r'^\d{2}:\d{2}$');
    if (!regex.hasMatch(hhmm)) return null;
    
    final parts = hhmm.split(':').map((v) => int.parse(v)).toList();
    final h = parts[0];
    final m = parts[1];
    
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return {'hour': h, 'minute': m};
  }

  /// Check if time is in quiet hours (22:00 - 07:00)
  static bool inQuietHours(int hour, int minute) {
    if (hour >= 22) return true;
    if (hour < 7) return true;
    return false;
  }

  /// Get current time of day
  static String getTimeOfDay(String? tz) {
    final zone = safeTZ(tz);
    final now = DateTime.now();
    final local = now.toLocal();
    final hour = local.hour;
    
    if (hour >= 5 && hour <= 11) return 'morning';
    if (hour >= 12 && hour <= 16) return 'afternoon';
    if (hour >= 17 && hour <= 21) return 'evening';
    return 'night';
  }
}
