class AppConstants {
  // App Info
  static const String appName = 'Seventh Sense AI Coach';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Habit tracking with AI motivation';
  
  // Storage Keys
  static const String storageKey = 'SS_STORE_V1';
  static const String notificationPermissionKey = 'SS_NOTIF_PERMISSION_V1';
  static const String notificationMapKey = 'SS_NOTIF_MAP_V1';
  static const String recapStateKey = 'SS_RECAP_STATE_V1';
  static const String recapEnabledKey = 'SS_RECAP_ENABLED_V1';
  
  // Hive Box Names
  static const String habitsBoxName = 'habits';
  static const String logsBoxName = 'logs';
  static const String preferencesBoxName = 'preferences';
  
  // Notification Channels
  static const String dailyHabitsChannelId = 'daily_habits';
  static const String dailyHabitsChannelName = 'Daily Habits';
  static const String dailyHabitsChannelDescription = 'Reminders for daily habits';
  
  static const String recapChannelId = 'recap';
  static const String recapChannelName = 'Evening Recap';
  static const String recapChannelDescription = 'Evening recap notifications';
  
  // Default Values
  static const String defaultTimezone = 'UTC';
  static const String defaultAITone = 'coach';
  static const String defaultThemeMode = 'system';
  static const String defaultLanguageCode = 'en';
  static const String defaultReminderTime = '09:00';
  static const String eveningRecapTime = '20:30';
  
  // Quiet Hours (22:00 - 07:00)
  static const int quietHoursStart = 22;
  static const int quietHoursEnd = 7;
  static const int quietHoursRescheduleHour = 7;
  static const int quietHoursRescheduleMinute = 5;
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double cardRadius = 12.0;
  static const double fabSize = 56.0;
  static const double iconSize = 24.0;
  static const double progressRingSize = 36.0;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // Validation
  static const int maxHabitNameLength = 50;
  static const int maxNoteLength = 200;
  static const double minCompletionValue = 0.0;
  static const double maxCompletionValue = 10.0;
  
  // Export/Import
  static const String exportFileName = 'seventh_sense_backup';
  static const String exportFileExtension = '.json';
  static const int currentDataVersion = 1;
}
