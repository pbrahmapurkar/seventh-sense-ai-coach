// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_preferences.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

UserPreferences _$UserPreferencesFromJson(Map<String, dynamic> json) {
  return _UserPreferences.fromJson(json);
}

/// @nodoc
mixin _$UserPreferences {
  @HiveField(0)
  String? get name => throw _privateConstructorUsedError;
  @HiveField(1)
  String get themeMode => throw _privateConstructorUsedError;
  @HiveField(2)
  String get aiTone => throw _privateConstructorUsedError;
  @HiveField(3)
  String? get defaultReminderTime => throw _privateConstructorUsedError;
  @HiveField(4)
  bool get eveningRecapEnabled => throw _privateConstructorUsedError;
  @HiveField(5)
  bool get notificationsEnabled => throw _privateConstructorUsedError;
  @HiveField(6)
  String get languageCode => throw _privateConstructorUsedError;
  @HiveField(7)
  DateTime? get onboardingCompletedAt => throw _privateConstructorUsedError;
  @HiveField(8)
  String get timezone => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserPreferencesCopyWith<UserPreferences> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserPreferencesCopyWith<$Res> {
  factory $UserPreferencesCopyWith(
          UserPreferences value, $Res Function(UserPreferences) then) =
      _$UserPreferencesCopyWithImpl<$Res, UserPreferences>;
  @useResult
  $Res call(
      {@HiveField(0) String? name,
      @HiveField(1) String themeMode,
      @HiveField(2) String aiTone,
      @HiveField(3) String? defaultReminderTime,
      @HiveField(4) bool eveningRecapEnabled,
      @HiveField(5) bool notificationsEnabled,
      @HiveField(6) String languageCode,
      @HiveField(7) DateTime? onboardingCompletedAt,
      @HiveField(8) String timezone});
}

/// @nodoc
class _$UserPreferencesCopyWithImpl<$Res, $Val extends UserPreferences>
    implements $UserPreferencesCopyWith<$Res> {
  _$UserPreferencesCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = freezed,
    Object? themeMode = null,
    Object? aiTone = null,
    Object? defaultReminderTime = freezed,
    Object? eveningRecapEnabled = null,
    Object? notificationsEnabled = null,
    Object? languageCode = null,
    Object? onboardingCompletedAt = freezed,
    Object? timezone = null,
  }) {
    return _then(_value.copyWith(
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      themeMode: null == themeMode
          ? _value.themeMode
          : themeMode // ignore: cast_nullable_to_non_nullable
              as String,
      aiTone: null == aiTone
          ? _value.aiTone
          : aiTone // ignore: cast_nullable_to_non_nullable
              as String,
      defaultReminderTime: freezed == defaultReminderTime
          ? _value.defaultReminderTime
          : defaultReminderTime // ignore: cast_nullable_to_non_nullable
              as String?,
      eveningRecapEnabled: null == eveningRecapEnabled
          ? _value.eveningRecapEnabled
          : eveningRecapEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      notificationsEnabled: null == notificationsEnabled
          ? _value.notificationsEnabled
          : notificationsEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      languageCode: null == languageCode
          ? _value.languageCode
          : languageCode // ignore: cast_nullable_to_non_nullable
              as String,
      onboardingCompletedAt: freezed == onboardingCompletedAt
          ? _value.onboardingCompletedAt
          : onboardingCompletedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      timezone: null == timezone
          ? _value.timezone
          : timezone // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UserPreferencesImplCopyWith<$Res>
    implements $UserPreferencesCopyWith<$Res> {
  factory _$$UserPreferencesImplCopyWith(_$UserPreferencesImpl value,
          $Res Function(_$UserPreferencesImpl) then) =
      __$$UserPreferencesImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@HiveField(0) String? name,
      @HiveField(1) String themeMode,
      @HiveField(2) String aiTone,
      @HiveField(3) String? defaultReminderTime,
      @HiveField(4) bool eveningRecapEnabled,
      @HiveField(5) bool notificationsEnabled,
      @HiveField(6) String languageCode,
      @HiveField(7) DateTime? onboardingCompletedAt,
      @HiveField(8) String timezone});
}

/// @nodoc
class __$$UserPreferencesImplCopyWithImpl<$Res>
    extends _$UserPreferencesCopyWithImpl<$Res, _$UserPreferencesImpl>
    implements _$$UserPreferencesImplCopyWith<$Res> {
  __$$UserPreferencesImplCopyWithImpl(
      _$UserPreferencesImpl _value, $Res Function(_$UserPreferencesImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = freezed,
    Object? themeMode = null,
    Object? aiTone = null,
    Object? defaultReminderTime = freezed,
    Object? eveningRecapEnabled = null,
    Object? notificationsEnabled = null,
    Object? languageCode = null,
    Object? onboardingCompletedAt = freezed,
    Object? timezone = null,
  }) {
    return _then(_$UserPreferencesImpl(
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      themeMode: null == themeMode
          ? _value.themeMode
          : themeMode // ignore: cast_nullable_to_non_nullable
              as String,
      aiTone: null == aiTone
          ? _value.aiTone
          : aiTone // ignore: cast_nullable_to_non_nullable
              as String,
      defaultReminderTime: freezed == defaultReminderTime
          ? _value.defaultReminderTime
          : defaultReminderTime // ignore: cast_nullable_to_non_nullable
              as String?,
      eveningRecapEnabled: null == eveningRecapEnabled
          ? _value.eveningRecapEnabled
          : eveningRecapEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      notificationsEnabled: null == notificationsEnabled
          ? _value.notificationsEnabled
          : notificationsEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      languageCode: null == languageCode
          ? _value.languageCode
          : languageCode // ignore: cast_nullable_to_non_nullable
              as String,
      onboardingCompletedAt: freezed == onboardingCompletedAt
          ? _value.onboardingCompletedAt
          : onboardingCompletedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      timezone: null == timezone
          ? _value.timezone
          : timezone // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UserPreferencesImpl implements _UserPreferences {
  const _$UserPreferencesImpl(
      {@HiveField(0) this.name,
      @HiveField(1) this.themeMode = 'system',
      @HiveField(2) this.aiTone = 'coach',
      @HiveField(3) this.defaultReminderTime,
      @HiveField(4) this.eveningRecapEnabled = true,
      @HiveField(5) this.notificationsEnabled = true,
      @HiveField(6) this.languageCode = 'en',
      @HiveField(7) this.onboardingCompletedAt,
      @HiveField(8) this.timezone = 'UTC'});

  factory _$UserPreferencesImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserPreferencesImplFromJson(json);

  @override
  @HiveField(0)
  final String? name;
  @override
  @JsonKey()
  @HiveField(1)
  final String themeMode;
  @override
  @JsonKey()
  @HiveField(2)
  final String aiTone;
  @override
  @HiveField(3)
  final String? defaultReminderTime;
  @override
  @JsonKey()
  @HiveField(4)
  final bool eveningRecapEnabled;
  @override
  @JsonKey()
  @HiveField(5)
  final bool notificationsEnabled;
  @override
  @JsonKey()
  @HiveField(6)
  final String languageCode;
  @override
  @HiveField(7)
  final DateTime? onboardingCompletedAt;
  @override
  @JsonKey()
  @HiveField(8)
  final String timezone;

  @override
  String toString() {
    return 'UserPreferences(name: $name, themeMode: $themeMode, aiTone: $aiTone, defaultReminderTime: $defaultReminderTime, eveningRecapEnabled: $eveningRecapEnabled, notificationsEnabled: $notificationsEnabled, languageCode: $languageCode, onboardingCompletedAt: $onboardingCompletedAt, timezone: $timezone)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserPreferencesImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.themeMode, themeMode) ||
                other.themeMode == themeMode) &&
            (identical(other.aiTone, aiTone) || other.aiTone == aiTone) &&
            (identical(other.defaultReminderTime, defaultReminderTime) ||
                other.defaultReminderTime == defaultReminderTime) &&
            (identical(other.eveningRecapEnabled, eveningRecapEnabled) ||
                other.eveningRecapEnabled == eveningRecapEnabled) &&
            (identical(other.notificationsEnabled, notificationsEnabled) ||
                other.notificationsEnabled == notificationsEnabled) &&
            (identical(other.languageCode, languageCode) ||
                other.languageCode == languageCode) &&
            (identical(other.onboardingCompletedAt, onboardingCompletedAt) ||
                other.onboardingCompletedAt == onboardingCompletedAt) &&
            (identical(other.timezone, timezone) ||
                other.timezone == timezone));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      name,
      themeMode,
      aiTone,
      defaultReminderTime,
      eveningRecapEnabled,
      notificationsEnabled,
      languageCode,
      onboardingCompletedAt,
      timezone);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UserPreferencesImplCopyWith<_$UserPreferencesImpl> get copyWith =>
      __$$UserPreferencesImplCopyWithImpl<_$UserPreferencesImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserPreferencesImplToJson(
      this,
    );
  }
}

abstract class _UserPreferences implements UserPreferences {
  const factory _UserPreferences(
      {@HiveField(0) final String? name,
      @HiveField(1) final String themeMode,
      @HiveField(2) final String aiTone,
      @HiveField(3) final String? defaultReminderTime,
      @HiveField(4) final bool eveningRecapEnabled,
      @HiveField(5) final bool notificationsEnabled,
      @HiveField(6) final String languageCode,
      @HiveField(7) final DateTime? onboardingCompletedAt,
      @HiveField(8) final String timezone}) = _$UserPreferencesImpl;

  factory _UserPreferences.fromJson(Map<String, dynamic> json) =
      _$UserPreferencesImpl.fromJson;

  @override
  @HiveField(0)
  String? get name;
  @override
  @HiveField(1)
  String get themeMode;
  @override
  @HiveField(2)
  String get aiTone;
  @override
  @HiveField(3)
  String? get defaultReminderTime;
  @override
  @HiveField(4)
  bool get eveningRecapEnabled;
  @override
  @HiveField(5)
  bool get notificationsEnabled;
  @override
  @HiveField(6)
  String get languageCode;
  @override
  @HiveField(7)
  DateTime? get onboardingCompletedAt;
  @override
  @HiveField(8)
  String get timezone;
  @override
  @JsonKey(ignore: true)
  _$$UserPreferencesImplCopyWith<_$UserPreferencesImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
