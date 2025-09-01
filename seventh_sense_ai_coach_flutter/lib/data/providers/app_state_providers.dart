import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/ai_context.dart';
import '../models/habit.dart';
import '../models/habit_log.dart';
import '../../core/services/ai_service.dart';
import '../../core/services/notification_service.dart';
import '../../core/services/storage_service.dart';
import '../../core/utils/date_utils.dart';
import 'habit_providers.dart';
import 'user_providers.dart';

// AI context provider for generating motivational messages
final aiContextProvider = FutureProvider.family<AIContext, String>((ref, timezone) async {
  final habits = await ref.watch(todayHabitsProvider(timezone).future);
  final preferences = await ref.watch(userPreferencesProvider.future);
  
  if (habits.isEmpty) {
    return AIContext(
      habitName: 'your habit',
      aiTone: preferences.aiTone,
      name: preferences.name,
      timezone: preferences.timezone,
    );
  }

  // Find first incomplete habit or use first habit
  final todayKey = DateUtils.getTodayKey(timezone);
  Habit? targetHabit;
  
  for (final habit in habits) {
    final isCompleted = await ref.watch(habitCompletionProvider({
      'habitId': habit.id,
      'dateKey': todayKey,
    }).future);
    if (!isCompleted) {
      targetHabit = habit;
      break;
    }
  }
  
  targetHabit ??= habits.first;

  // Get logs for the target habit
  final logs = await ref.watch(habitLogsProvider(targetHabit.id).future);
  final last3 = logs.take(3).map((log) => log.completed ? 'done' : 'miss').toList();

  // Get streak
  final streak = await ref.watch(habitStreakProvider(targetHabit.id).future);

  return AIContext(
    name: preferences.name,
    habitName: targetHabit.name,
    streak: streak.current,
    last3: last3,
    timezone: preferences.timezone,
    aiTone: preferences.aiTone,
  );
});

// AI message provider
final aiMessageProvider = FutureProvider.family<String, String>((ref, timezone) async {
  final context = await ref.watch(aiContextProvider(timezone).future);
  return AIService.getMotivation(context);
});

// Today's progress provider
final todayProgressProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, timezone) async {
  final habits = await ref.watch(todayHabitsProvider(timezone).future);
  final completed = await ref.watch(todayCompletionProvider(timezone).future);
  final todayKey = DateUtils.getTodayKey(timezone);
  
  return {
    'total': habits.length,
    'completed': completed,
    'pending': habits.length - completed,
    'percentage': habits.isEmpty ? 0.0 : (completed / habits.length) * 100,
    'dateKey': todayKey,
  };
});

// Statistics provider for insights
final statisticsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, timezone) async {
  final habits = await ref.watch(activeHabitsProvider.future);
  final logs = await ref.watch(allLogsProvider.future);
  final todayKey = DateUtils.getTodayKey(timezone);
  
  // Last 7 days
  final last7Days = DateUtils.lastNDays(7, timezone);
  final last7Logs = logs.where((log) => last7Days.contains(log.dateKey) && log.completed).length;
  final last7Total = habits.length * 7;
  final last7Percentage = last7Total > 0 ? (last7Logs / last7Total) * 100 : 0.0;
  
  // Last 30 days
  final last30Days = DateUtils.lastNDays(30, timezone);
  final last30Logs = logs.where((log) => last30Days.contains(log.dateKey) && log.completed).length;
  final last30Total = habits.length * 30;
  final last30Percentage = last30Total > 0 ? (last30Logs / last30Total) * 100 : 0.0;
  
  // Streak statistics
  final habitStreaks = <Map<String, dynamic>>[];
  for (final habit in habits) {
    final streak = await ref.watch(habitStreakProvider(habit.id).future);
    habitStreaks.add({
      'habitId': habit.id,
      'habitName': habit.name,
      'currentStreak': streak.current,
      'longestStreak': streak.longest,
    });
  }
  
  // Sort by current streak
  habitStreaks.sort((a, b) => (b['currentStreak'] as int).compareTo(a['currentStreak'] as int));
  
  return {
    'last7Days': {
      'completed': last7Logs,
      'total': last7Total,
      'percentage': last7Percentage,
    },
    'last30Days': {
      'completed': last30Logs,
      'total': last30Total,
      'percentage': last30Percentage,
    },
    'habitStreaks': habitStreaks,
    'totalHabits': habits.length,
  };
});

// Notification state provider
final notificationStateProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  final enabled = await NotificationService.areNotificationsEnabled();
  final pendingNotifications = await NotificationService.getPendingNotifications();
  
  return {
    'enabled': enabled,
    'userEnabled': preferences.notificationsEnabled,
    'pendingCount': pendingNotifications.length,
    'eveningRecapEnabled': preferences.eveningRecapEnabled,
  };
});

// App initialization provider
final appInitializationProvider = FutureProvider<bool>((ref) async {
  try {
    // Initialize services
    await StorageService.initialize();
    await NotificationService.initialize();
    
    // Load initial data
    await ref.read(userPreferencesProvider.future);
    await ref.read(activeHabitsProvider.future);
    
    return true;
  } catch (e) {
    return false;
  }
});

// Export/Import state provider
final exportImportStateProvider = StateProvider<Map<String, dynamic>>((ref) {
  return {
    'isExporting': false,
    'isImporting': false,
    'lastExport': null,
    'lastImport': null,
    'error': null,
  };
});

// Export data provider
final exportDataProvider = FutureProvider<String>((ref) async {
  return await StorageService.exportData();
});

// Import data provider
final importDataProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, jsonData) async {
  return await StorageService.importData(jsonData);
});

// Migration provider for React Native data
final migrationProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, jsonData) async {
  return await StorageService.migrateFromReactNative(jsonData);
});

// App theme provider
final appThemeProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  
  return {
    'themeMode': preferences.themeMode,
    'isDark': preferences.themeMode == 'dark',
    'isLight': preferences.themeMode == 'light',
    'isSystem': preferences.themeMode == 'system',
  };
});

// App version provider
final appVersionProvider = FutureProvider<Map<String, String>>((ref) async {
  // TODO: Get from package_info_plus
  return {
    'version': '1.0.0',
    'buildNumber': '1',
  };
});

// Device info provider
final deviceInfoProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  // TODO: Get from device_info_plus
  return {
    'platform': 'unknown',
    'version': 'unknown',
  };
});
