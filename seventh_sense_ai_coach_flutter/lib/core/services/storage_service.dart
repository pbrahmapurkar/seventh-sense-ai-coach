import 'dart:convert';
import 'dart:io';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import '../../data/models/habit.dart';
import '../../data/models/habit_log.dart';
import '../../data/models/user_preferences.dart';
import '../constants/app_constants.dart';

class StorageService {
  static late Box<Habit> _habitsBox;
  static late Box<HabitLog> _logsBox;
  static late Box<UserPreferences> _preferencesBox;
  static late SharedPreferences _prefs;
  
  static bool _initialized = false;

  /// Initialize storage service
  static Future<void> initialize() async {
    if (_initialized) return;

    // Initialize Hive
    await Hive.initFlutter();
    
    // Register adapters
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(HabitAdapter());
    }
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(HabitLogAdapter());
    }
    if (!Hive.isAdapterRegistered(2)) {
      Hive.registerAdapter(UserPreferencesAdapter());
    }

    // Open boxes
    _habitsBox = await Hive.openBox<Habit>(AppConstants.habitsBoxName);
    _logsBox = await Hive.openBox<HabitLog>(AppConstants.logsBoxName);
    _preferencesBox = await Hive.openBox<UserPreferences>(AppConstants.preferencesBoxName);
    
    // Initialize SharedPreferences
    _prefs = await SharedPreferences.getInstance();
    
    _initialized = true;
  }

  /// Close all storage connections
  static Future<void> close() async {
    await _habitsBox.close();
    await _logsBox.close();
    await _preferencesBox.close();
    _initialized = false;
  }

  // Habits CRUD
  static Future<void> saveHabit(Habit habit) async {
    await _habitsBox.put(habit.id, habit);
  }

  static Future<void> saveHabits(List<Habit> habits) async {
    final Map<String, Habit> habitMap = {
      for (final habit in habits) habit.id: habit
    };
    await _habitsBox.putAll(habitMap);
  }

  static List<Habit> getAllHabits() {
    return _habitsBox.values.toList();
  }

  static List<Habit> getActiveHabits() {
    return _habitsBox.values.where((habit) => !habit.isArchived).toList();
  }

  static Habit? getHabit(String id) {
    return _habitsBox.get(id);
  }

  static Future<void> deleteHabit(String id) async {
    await _habitsBox.delete(id);
  }

  static Future<void> archiveHabit(String id) async {
    final habit = _habitsBox.get(id);
    if (habit != null) {
      final archivedHabit = habit.copyWith(archivedAt: DateTime.now());
      await _habitsBox.put(id, archivedHabit);
    }
  }

  // Logs CRUD
  static Future<void> saveHabitLog(HabitLog log) async {
    await _logsBox.put(log.id, log);
  }

  static Future<void> saveHabitLogs(List<HabitLog> logs) async {
    final Map<String, HabitLog> logMap = {
      for (final log in logs) log.id: log
    };
    await _logsBox.putAll(logMap);
  }

  static List<HabitLog> getAllLogs() {
    return _logsBox.values.toList();
  }

  static List<HabitLog> getLogsForHabit(String habitId) {
    return _logsBox.values
        .where((log) => log.habitId == habitId)
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  static List<HabitLog> getLogsForDate(String dateKey) {
    return _logsBox.values
        .where((log) => log.dateKey == dateKey)
        .toList();
  }

  static HabitLog? getLog(String id) {
    return _logsBox.get(id);
  }

  static Future<void> deleteLog(String id) async {
    await _logsBox.delete(id);
  }

  static Future<void> deleteLogsForHabit(String habitId) async {
    final logsToDelete = _logsBox.values
        .where((log) => log.habitId == habitId)
        .map((log) => log.id)
        .toList();
    
    await _logsBox.deleteAll(logsToDelete);
  }

  // User Preferences
  static Future<void> saveUserPreferences(UserPreferences preferences) async {
    await _preferencesBox.put('user_preferences', preferences);
  }

  static UserPreferences? getUserPreferences() {
    return _preferencesBox.get('user_preferences');
  }

  static UserPreferences getDefaultUserPreferences() {
    return const UserPreferences();
  }

  // SharedPreferences for simple key-value storage
  static Future<void> setString(String key, String value) async {
    await _prefs.setString(key, value);
  }

  static String? getString(String key) {
    return _prefs.getString(key);
  }

  static Future<void> setBool(String key, bool value) async {
    await _prefs.setBool(key, value);
  }

  static bool? getBool(String key) {
    return _prefs.getBool(key);
  }

  static Future<void> setInt(String key, int value) async {
    await _prefs.setInt(key, value);
  }

  static int? getInt(String key) {
    return _prefs.getInt(key);
  }

  static Future<void> remove(String key) async {
    await _prefs.remove(key);
  }

  // Export/Import
  static Future<String> exportData() async {
    final habits = getAllHabits();
    final logs = getAllLogs();
    final preferences = getUserPreferences() ?? getDefaultUserPreferences();

    final exportData = {
      'version': AppConstants.currentDataVersion,
      'exportedAt': DateTime.now().toIso8601String(),
      'timezone': preferences.timezone,
      'habits': habits.map((h) => h.toJson()).toList(),
      'logs': logs.map((l) => l.toJson()).toList(),
      'preferences': preferences.toJson(),
    };

    return jsonEncode(exportData);
  }

  static Future<Map<String, dynamic>> importData(String jsonData) async {
    try {
      final data = jsonDecode(jsonData) as Map<String, dynamic>;
      final version = data['version'] as int? ?? 0;
      
      if (version > AppConstants.currentDataVersion) {
        throw Exception('Data version $version is newer than supported version ${AppConstants.currentDataVersion}');
      }

      // Import habits
      if (data['habits'] != null) {
        final habitsJson = data['habits'] as List;
        final habits = habitsJson
            .map((h) => Habit.fromJson(h as Map<String, dynamic>))
            .toList();
        await saveHabits(habits);
      }

      // Import logs
      if (data['logs'] != null) {
        final logsJson = data['logs'] as List;
        final logs = logsJson
            .map((l) => HabitLog.fromJson(l as Map<String, dynamic>))
            .toList();
        await saveHabitLogs(logs);
      }

      // Import preferences
      if (data['preferences'] != null) {
        final preferences = UserPreferences.fromJson(data['preferences'] as Map<String, dynamic>);
        await saveUserPreferences(preferences);
      }

      return {
        'success': true,
        'habitsImported': data['habits']?.length ?? 0,
        'logsImported': data['logs']?.length ?? 0,
        'version': version,
      };
    } catch (e) {
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  // Migration from React Native format
  static Future<Map<String, dynamic>> migrateFromReactNative(String jsonData) async {
    try {
      final data = jsonDecode(jsonData) as Map<String, dynamic>;
      
      // Handle RN format: { habits: [], logs: [] }
      if (data['habits'] != null) {
        final habitsJson = data['habits'] as List;
        final habits = habitsJson
            .map((h) => Habit.fromJson(h as Map<String, dynamic>))
            .toList();
        await saveHabits(habits);
      }

      if (data['logs'] != null) {
        final logsJson = data['logs'] as List;
        final logs = logsJson
            .map((l) => HabitLog.fromJson(l as Map<String, dynamic>))
            .toList();
        await saveHabitLogs(logs);
      }

      return {
        'success': true,
        'habitsImported': data['habits']?.length ?? 0,
        'logsImported': data['logs']?.length ?? 0,
        'migrated': true,
      };
    } catch (e) {
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  // Clear all data
  static Future<void> clearAllData() async {
    await _habitsBox.clear();
    await _logsBox.clear();
    await _preferencesBox.clear();
    await _prefs.clear();
  }

  // Get storage info
  static Map<String, dynamic> getStorageInfo() {
    return {
      'habitsCount': _habitsBox.length,
      'logsCount': _logsBox.length,
      'preferencesCount': _preferencesBox.length,
      'habitsBoxSize': _habitsBox.length,
      'logsBoxSize': _logsBox.length,
      'preferencesBoxSize': _preferencesBox.length,
    };
  }
}
