import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/habit.dart';
import '../models/habit_log.dart';
import '../../core/services/storage_service.dart';
import '../../core/utils/date_utils.dart';

// Storage service provider
final storageServiceProvider = Provider<Type>((ref) {
  return StorageService;
});

// All habits provider
final allHabitsProvider = FutureProvider<List<Habit>>((ref) async {
  await StorageService.initialize();
  return StorageService.getAllHabits();
});

// Active habits provider
final activeHabitsProvider = FutureProvider<List<Habit>>((ref) async {
  await StorageService.initialize();
  return StorageService.getActiveHabits();
});

// Today's habits provider
final todayHabitsProvider = FutureProvider.family<List<Habit>, String>((ref, timezone) async {
  final habits = await ref.watch(activeHabitsProvider.future);
  final todayKey = DateUtils.getTodayKey(timezone);
  
  // For MVP: return all active habits regardless of frequency
  return habits;
});

// Habit by ID provider
final habitProvider = FutureProvider.family<Habit?, String>((ref, habitId) async {
  await StorageService.initialize();
  return StorageService.getHabit(habitId);
});

// All logs provider
final allLogsProvider = FutureProvider<List<HabitLog>>((ref) async {
  await StorageService.initialize();
  return StorageService.getAllLogs();
});

// Logs for habit provider
final habitLogsProvider = FutureProvider.family<List<HabitLog>, String>((ref, habitId) async {
  await StorageService.initialize();
  return StorageService.getLogsForHabit(habitId);
});

// Logs for date provider
final dateLogsProvider = FutureProvider.family<List<HabitLog>, String>((ref, dateKey) async {
  await StorageService.initialize();
  return StorageService.getLogsForDate(dateKey);
});

// Completion status provider for a habit on a specific date
final habitCompletionProvider = FutureProvider.family<bool, Map<String, String>>((ref, params) async {
  final habitId = params['habitId']!;
  final dateKey = params['dateKey']!;
  
  final logs = await ref.watch(habitLogsProvider(habitId).future);
  return logs.any((log) => log.dateKey == dateKey && log.completed);
});

// Streak data provider for a habit
final habitStreakProvider = FutureProvider.family<StreakData, String>((ref, habitId) async {
  final logs = await ref.watch(habitLogsProvider(habitId).future);
  final completedLogs = logs.where((log) => log.completed).toList();
  
  // Convert to LogLike format for DateUtils
  final logLikes = completedLogs.map((log) => LogLike(
    date: log.dateKey,
    completed: log.completed,
  )).toList();
  
  // Get timezone from user preferences (default to UTC)
  const timezone = 'UTC'; // TODO: Get from user preferences
  return DateUtils.computeStreak(logLikes, timezone);
});

// Today's completion count provider
final todayCompletionProvider = FutureProvider.family<int, String>((ref, timezone) async {
  final habits = await ref.watch(todayHabitsProvider(timezone).future);
  final todayKey = DateUtils.getTodayKey(timezone);
  
  int completed = 0;
  for (final habit in habits) {
    final isCompleted = await ref.watch(habitCompletionProvider({
      'habitId': habit.id,
      'dateKey': todayKey,
    }).future);
    if (isCompleted) completed++;
  }
  
  return completed;
});

// Habit state notifier
class HabitNotifier extends StateNotifier<AsyncValue<List<Habit>>> {
  HabitNotifier() : super(const AsyncValue.loading()) {
    _loadHabits();
  }

  Future<void> _loadHabits() async {
    state = const AsyncValue.loading();
    try {
      await StorageService.initialize();
      final habits = StorageService.getAllHabits();
      state = AsyncValue.data(habits);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> addHabit(Habit habit) async {
    try {
      await StorageService.saveHabit(habit);
      await _loadHabits();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> updateHabit(String id, Habit updatedHabit) async {
    try {
      await StorageService.saveHabit(updatedHabit);
      await _loadHabits();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> deleteHabit(String id) async {
    try {
      await StorageService.deleteHabit(id);
      await StorageService.deleteLogsForHabit(id);
      await _loadHabits();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> archiveHabit(String id) async {
    try {
      await StorageService.archiveHabit(id);
      await _loadHabits();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// Habit notifier provider
final habitNotifierProvider = StateNotifierProvider<HabitNotifier, AsyncValue<List<Habit>>>((ref) {
  return HabitNotifier();
});

// Log state notifier
class LogNotifier extends StateNotifier<AsyncValue<List<HabitLog>>> {
  LogNotifier() : super(const AsyncValue.loading()) {
    _loadLogs();
  }

  Future<void> _loadLogs() async {
    state = const AsyncValue.loading();
    try {
      await StorageService.initialize();
      final logs = StorageService.getAllLogs();
      state = AsyncValue.data(logs);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> addLog(HabitLog log) async {
    try {
      await StorageService.saveHabitLog(log);
      await _loadLogs();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> toggleCompletion(String habitId, String dateKey) async {
    try {
      final logs = await StorageService.getLogsForHabit(habitId);
      final existingLog = logs.where((log) => log.dateKey == dateKey && log.completed).firstOrNull;
      
      if (existingLog != null) {
        // Remove completion
        await StorageService.deleteLog(existingLog.id);
      } else {
        // Add completion
        final newLog = HabitLog(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          habitId: habitId,
          dateKey: dateKey,
          completed: true,
          completedAt: DateTime.now(),
          createdAt: DateTime.now(),
        );
        await StorageService.saveHabitLog(newLog);
      }
      
      await _loadLogs();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> deleteLog(String id) async {
    try {
      await StorageService.deleteLog(id);
      await _loadLogs();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// Log notifier provider
final logNotifierProvider = StateNotifierProvider<LogNotifier, AsyncValue<List<HabitLog>>>((ref) {
  return LogNotifier();
});
