import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:hive/hive.dart';

part 'user_preferences.freezed.dart';
part 'user_preferences.g.dart';

@freezed
@HiveType(typeId: 2)
class UserPreferences with _$UserPreferences {
  const factory UserPreferences({
    @HiveField(0) String? name,
    @HiveField(1) @Default('system') String themeMode,
    @HiveField(2) @Default('coach') String aiTone,
    @HiveField(3) String? defaultReminderTime,
    @HiveField(4) @Default(true) bool eveningRecapEnabled,
    @HiveField(5) @Default(true) bool notificationsEnabled,
    @HiveField(6) @Default('en') String languageCode,
    @HiveField(7) DateTime? onboardingCompletedAt,
    @HiveField(8) @Default('UTC') String timezone,
  }) = _UserPreferences;

  factory UserPreferences.fromJson(Map<String, dynamic> json) => _$UserPreferencesFromJson(json);
}

extension UserPreferencesExtension on UserPreferences {
  bool get hasCompletedOnboarding => onboardingCompletedAt != null;
  
  String get displayName => name?.isNotEmpty == true ? name! : 'Friend';
  
  String get themeModeDisplay {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  }
  
  String get aiToneDisplay {
    switch (aiTone) {
      case 'coach':
        return 'Coach';
      case 'friend':
        return 'Friend';
      case 'zen':
        return 'Zen';
      default:
        return 'Coach';
    }
  }
  
  bool get hasDefaultReminder => defaultReminderTime != null && defaultReminderTime!.isNotEmpty;
}
