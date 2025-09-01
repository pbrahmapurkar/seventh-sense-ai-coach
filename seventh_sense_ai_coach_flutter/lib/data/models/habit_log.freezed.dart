// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'habit_log.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

HabitLog _$HabitLogFromJson(Map<String, dynamic> json) {
  return _HabitLog.fromJson(json);
}

/// @nodoc
mixin _$HabitLog {
  @HiveField(0)
  String get id => throw _privateConstructorUsedError;
  @HiveField(1)
  String get habitId => throw _privateConstructorUsedError;
  @HiveField(2)
  String get dateKey => throw _privateConstructorUsedError;
  @HiveField(3)
  bool get completed => throw _privateConstructorUsedError;
  @HiveField(4)
  DateTime? get completedAt => throw _privateConstructorUsedError;
  @HiveField(5)
  String? get note => throw _privateConstructorUsedError;
  @HiveField(6)
  double get completionValue => throw _privateConstructorUsedError;
  @HiveField(7)
  DateTime get createdAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $HabitLogCopyWith<HabitLog> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $HabitLogCopyWith<$Res> {
  factory $HabitLogCopyWith(HabitLog value, $Res Function(HabitLog) then) =
      _$HabitLogCopyWithImpl<$Res, HabitLog>;
  @useResult
  $Res call(
      {@HiveField(0) String id,
      @HiveField(1) String habitId,
      @HiveField(2) String dateKey,
      @HiveField(3) bool completed,
      @HiveField(4) DateTime? completedAt,
      @HiveField(5) String? note,
      @HiveField(6) double completionValue,
      @HiveField(7) DateTime createdAt});
}

/// @nodoc
class _$HabitLogCopyWithImpl<$Res, $Val extends HabitLog>
    implements $HabitLogCopyWith<$Res> {
  _$HabitLogCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? habitId = null,
    Object? dateKey = null,
    Object? completed = null,
    Object? completedAt = freezed,
    Object? note = freezed,
    Object? completionValue = null,
    Object? createdAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      habitId: null == habitId
          ? _value.habitId
          : habitId // ignore: cast_nullable_to_non_nullable
              as String,
      dateKey: null == dateKey
          ? _value.dateKey
          : dateKey // ignore: cast_nullable_to_non_nullable
              as String,
      completed: null == completed
          ? _value.completed
          : completed // ignore: cast_nullable_to_non_nullable
              as bool,
      completedAt: freezed == completedAt
          ? _value.completedAt
          : completedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      note: freezed == note
          ? _value.note
          : note // ignore: cast_nullable_to_non_nullable
              as String?,
      completionValue: null == completionValue
          ? _value.completionValue
          : completionValue // ignore: cast_nullable_to_non_nullable
              as double,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$HabitLogImplCopyWith<$Res>
    implements $HabitLogCopyWith<$Res> {
  factory _$$HabitLogImplCopyWith(
          _$HabitLogImpl value, $Res Function(_$HabitLogImpl) then) =
      __$$HabitLogImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@HiveField(0) String id,
      @HiveField(1) String habitId,
      @HiveField(2) String dateKey,
      @HiveField(3) bool completed,
      @HiveField(4) DateTime? completedAt,
      @HiveField(5) String? note,
      @HiveField(6) double completionValue,
      @HiveField(7) DateTime createdAt});
}

/// @nodoc
class __$$HabitLogImplCopyWithImpl<$Res>
    extends _$HabitLogCopyWithImpl<$Res, _$HabitLogImpl>
    implements _$$HabitLogImplCopyWith<$Res> {
  __$$HabitLogImplCopyWithImpl(
      _$HabitLogImpl _value, $Res Function(_$HabitLogImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? habitId = null,
    Object? dateKey = null,
    Object? completed = null,
    Object? completedAt = freezed,
    Object? note = freezed,
    Object? completionValue = null,
    Object? createdAt = null,
  }) {
    return _then(_$HabitLogImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      habitId: null == habitId
          ? _value.habitId
          : habitId // ignore: cast_nullable_to_non_nullable
              as String,
      dateKey: null == dateKey
          ? _value.dateKey
          : dateKey // ignore: cast_nullable_to_non_nullable
              as String,
      completed: null == completed
          ? _value.completed
          : completed // ignore: cast_nullable_to_non_nullable
              as bool,
      completedAt: freezed == completedAt
          ? _value.completedAt
          : completedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      note: freezed == note
          ? _value.note
          : note // ignore: cast_nullable_to_non_nullable
              as String?,
      completionValue: null == completionValue
          ? _value.completionValue
          : completionValue // ignore: cast_nullable_to_non_nullable
              as double,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$HabitLogImpl implements _HabitLog {
  const _$HabitLogImpl(
      {@HiveField(0) required this.id,
      @HiveField(1) required this.habitId,
      @HiveField(2) required this.dateKey,
      @HiveField(3) this.completed = false,
      @HiveField(4) this.completedAt,
      @HiveField(5) this.note,
      @HiveField(6) this.completionValue = 1.0,
      @HiveField(7) required this.createdAt});

  factory _$HabitLogImpl.fromJson(Map<String, dynamic> json) =>
      _$$HabitLogImplFromJson(json);

  @override
  @HiveField(0)
  final String id;
  @override
  @HiveField(1)
  final String habitId;
  @override
  @HiveField(2)
  final String dateKey;
  @override
  @JsonKey()
  @HiveField(3)
  final bool completed;
  @override
  @HiveField(4)
  final DateTime? completedAt;
  @override
  @HiveField(5)
  final String? note;
  @override
  @JsonKey()
  @HiveField(6)
  final double completionValue;
  @override
  @HiveField(7)
  final DateTime createdAt;

  @override
  String toString() {
    return 'HabitLog(id: $id, habitId: $habitId, dateKey: $dateKey, completed: $completed, completedAt: $completedAt, note: $note, completionValue: $completionValue, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$HabitLogImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.habitId, habitId) || other.habitId == habitId) &&
            (identical(other.dateKey, dateKey) || other.dateKey == dateKey) &&
            (identical(other.completed, completed) ||
                other.completed == completed) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt) &&
            (identical(other.note, note) || other.note == note) &&
            (identical(other.completionValue, completionValue) ||
                other.completionValue == completionValue) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, habitId, dateKey, completed,
      completedAt, note, completionValue, createdAt);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$HabitLogImplCopyWith<_$HabitLogImpl> get copyWith =>
      __$$HabitLogImplCopyWithImpl<_$HabitLogImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$HabitLogImplToJson(
      this,
    );
  }
}

abstract class _HabitLog implements HabitLog {
  const factory _HabitLog(
      {@HiveField(0) required final String id,
      @HiveField(1) required final String habitId,
      @HiveField(2) required final String dateKey,
      @HiveField(3) final bool completed,
      @HiveField(4) final DateTime? completedAt,
      @HiveField(5) final String? note,
      @HiveField(6) final double completionValue,
      @HiveField(7) required final DateTime createdAt}) = _$HabitLogImpl;

  factory _HabitLog.fromJson(Map<String, dynamic> json) =
      _$HabitLogImpl.fromJson;

  @override
  @HiveField(0)
  String get id;
  @override
  @HiveField(1)
  String get habitId;
  @override
  @HiveField(2)
  String get dateKey;
  @override
  @HiveField(3)
  bool get completed;
  @override
  @HiveField(4)
  DateTime? get completedAt;
  @override
  @HiveField(5)
  String? get note;
  @override
  @HiveField(6)
  double get completionValue;
  @override
  @HiveField(7)
  DateTime get createdAt;
  @override
  @JsonKey(ignore: true)
  _$$HabitLogImplCopyWith<_$HabitLogImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
