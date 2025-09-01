// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_preferences.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class UserPreferencesAdapter extends TypeAdapter<UserPreferences> {
  @override
  final int typeId = 2;

  @override
  UserPreferences read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return UserPreferences(
      name: fields[0] as String?,
      themeMode: fields[1] as String,
      aiTone: fields[2] as String,
      defaultReminderTime: fields[3] as String?,
      eveningRecapEnabled: fields[4] as bool,
      notificationsEnabled: fields[5] as bool,
      languageCode: fields[6] as String,
      onboardingCompletedAt: fields[7] as DateTime?,
      timezone: fields[8] as String,
    );
  }

  @override
  void write(BinaryWriter writer, UserPreferences obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.name)
      ..writeByte(1)
      ..write(obj.themeMode)
      ..writeByte(2)
      ..write(obj.aiTone)
      ..writeByte(3)
      ..write(obj.defaultReminderTime)
      ..writeByte(4)
      ..write(obj.eveningRecapEnabled)
      ..writeByte(5)
      ..write(obj.notificationsEnabled)
      ..writeByte(6)
      ..write(obj.languageCode)
      ..writeByte(7)
      ..write(obj.onboardingCompletedAt)
      ..writeByte(8)
      ..write(obj.timezone);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserPreferencesAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserPreferencesImpl _$$UserPreferencesImplFromJson(
        Map<String, dynamic> json) =>
    _$UserPreferencesImpl(
      name: json['name'] as String?,
      themeMode: json['themeMode'] as String? ?? 'system',
      aiTone: json['aiTone'] as String? ?? 'coach',
      defaultReminderTime: json['defaultReminderTime'] as String?,
      eveningRecapEnabled: json['eveningRecapEnabled'] as bool? ?? true,
      notificationsEnabled: json['notificationsEnabled'] as bool? ?? true,
      languageCode: json['languageCode'] as String? ?? 'en',
      onboardingCompletedAt: json['onboardingCompletedAt'] == null
          ? null
          : DateTime.parse(json['onboardingCompletedAt'] as String),
      timezone: json['timezone'] as String? ?? 'UTC',
    );

Map<String, dynamic> _$$UserPreferencesImplToJson(
        _$UserPreferencesImpl instance) =>
    <String, dynamic>{
      'name': instance.name,
      'themeMode': instance.themeMode,
      'aiTone': instance.aiTone,
      'defaultReminderTime': instance.defaultReminderTime,
      'eveningRecapEnabled': instance.eveningRecapEnabled,
      'notificationsEnabled': instance.notificationsEnabled,
      'languageCode': instance.languageCode,
      'onboardingCompletedAt':
          instance.onboardingCompletedAt?.toIso8601String(),
      'timezone': instance.timezone,
    };
