// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'ai_context.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

AIContext _$AIContextFromJson(Map<String, dynamic> json) {
  return _AIContext.fromJson(json);
}

/// @nodoc
mixin _$AIContext {
  String? get name => throw _privateConstructorUsedError;
  String get habitName => throw _privateConstructorUsedError;
  int get streak => throw _privateConstructorUsedError;
  List<String>? get last3 => throw _privateConstructorUsedError;
  String? get timeOfDay => throw _privateConstructorUsedError;
  String? get timezone => throw _privateConstructorUsedError;
  String get aiTone => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $AIContextCopyWith<AIContext> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AIContextCopyWith<$Res> {
  factory $AIContextCopyWith(AIContext value, $Res Function(AIContext) then) =
      _$AIContextCopyWithImpl<$Res, AIContext>;
  @useResult
  $Res call(
      {String? name,
      String habitName,
      int streak,
      List<String>? last3,
      String? timeOfDay,
      String? timezone,
      String aiTone});
}

/// @nodoc
class _$AIContextCopyWithImpl<$Res, $Val extends AIContext>
    implements $AIContextCopyWith<$Res> {
  _$AIContextCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = freezed,
    Object? habitName = null,
    Object? streak = null,
    Object? last3 = freezed,
    Object? timeOfDay = freezed,
    Object? timezone = freezed,
    Object? aiTone = null,
  }) {
    return _then(_value.copyWith(
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      habitName: null == habitName
          ? _value.habitName
          : habitName // ignore: cast_nullable_to_non_nullable
              as String,
      streak: null == streak
          ? _value.streak
          : streak // ignore: cast_nullable_to_non_nullable
              as int,
      last3: freezed == last3
          ? _value.last3
          : last3 // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      timeOfDay: freezed == timeOfDay
          ? _value.timeOfDay
          : timeOfDay // ignore: cast_nullable_to_non_nullable
              as String?,
      timezone: freezed == timezone
          ? _value.timezone
          : timezone // ignore: cast_nullable_to_non_nullable
              as String?,
      aiTone: null == aiTone
          ? _value.aiTone
          : aiTone // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AIContextImplCopyWith<$Res>
    implements $AIContextCopyWith<$Res> {
  factory _$$AIContextImplCopyWith(
          _$AIContextImpl value, $Res Function(_$AIContextImpl) then) =
      __$$AIContextImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? name,
      String habitName,
      int streak,
      List<String>? last3,
      String? timeOfDay,
      String? timezone,
      String aiTone});
}

/// @nodoc
class __$$AIContextImplCopyWithImpl<$Res>
    extends _$AIContextCopyWithImpl<$Res, _$AIContextImpl>
    implements _$$AIContextImplCopyWith<$Res> {
  __$$AIContextImplCopyWithImpl(
      _$AIContextImpl _value, $Res Function(_$AIContextImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = freezed,
    Object? habitName = null,
    Object? streak = null,
    Object? last3 = freezed,
    Object? timeOfDay = freezed,
    Object? timezone = freezed,
    Object? aiTone = null,
  }) {
    return _then(_$AIContextImpl(
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      habitName: null == habitName
          ? _value.habitName
          : habitName // ignore: cast_nullable_to_non_nullable
              as String,
      streak: null == streak
          ? _value.streak
          : streak // ignore: cast_nullable_to_non_nullable
              as int,
      last3: freezed == last3
          ? _value._last3
          : last3 // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      timeOfDay: freezed == timeOfDay
          ? _value.timeOfDay
          : timeOfDay // ignore: cast_nullable_to_non_nullable
              as String?,
      timezone: freezed == timezone
          ? _value.timezone
          : timezone // ignore: cast_nullable_to_non_nullable
              as String?,
      aiTone: null == aiTone
          ? _value.aiTone
          : aiTone // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AIContextImpl implements _AIContext {
  const _$AIContextImpl(
      {this.name,
      required this.habitName,
      this.streak = 0,
      final List<String>? last3,
      this.timeOfDay,
      this.timezone,
      this.aiTone = 'coach'})
      : _last3 = last3;

  factory _$AIContextImpl.fromJson(Map<String, dynamic> json) =>
      _$$AIContextImplFromJson(json);

  @override
  final String? name;
  @override
  final String habitName;
  @override
  @JsonKey()
  final int streak;
  final List<String>? _last3;
  @override
  List<String>? get last3 {
    final value = _last3;
    if (value == null) return null;
    if (_last3 is EqualUnmodifiableListView) return _last3;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? timeOfDay;
  @override
  final String? timezone;
  @override
  @JsonKey()
  final String aiTone;

  @override
  String toString() {
    return 'AIContext(name: $name, habitName: $habitName, streak: $streak, last3: $last3, timeOfDay: $timeOfDay, timezone: $timezone, aiTone: $aiTone)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AIContextImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.habitName, habitName) ||
                other.habitName == habitName) &&
            (identical(other.streak, streak) || other.streak == streak) &&
            const DeepCollectionEquality().equals(other._last3, _last3) &&
            (identical(other.timeOfDay, timeOfDay) ||
                other.timeOfDay == timeOfDay) &&
            (identical(other.timezone, timezone) ||
                other.timezone == timezone) &&
            (identical(other.aiTone, aiTone) || other.aiTone == aiTone));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, name, habitName, streak,
      const DeepCollectionEquality().hash(_last3), timeOfDay, timezone, aiTone);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$AIContextImplCopyWith<_$AIContextImpl> get copyWith =>
      __$$AIContextImplCopyWithImpl<_$AIContextImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AIContextImplToJson(
      this,
    );
  }
}

abstract class _AIContext implements AIContext {
  const factory _AIContext(
      {final String? name,
      required final String habitName,
      final int streak,
      final List<String>? last3,
      final String? timeOfDay,
      final String? timezone,
      final String aiTone}) = _$AIContextImpl;

  factory _AIContext.fromJson(Map<String, dynamic> json) =
      _$AIContextImpl.fromJson;

  @override
  String? get name;
  @override
  String get habitName;
  @override
  int get streak;
  @override
  List<String>? get last3;
  @override
  String? get timeOfDay;
  @override
  String? get timezone;
  @override
  String get aiTone;
  @override
  @JsonKey(ignore: true)
  _$$AIContextImplCopyWith<_$AIContextImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
