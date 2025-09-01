// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'habit.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Habit _$HabitFromJson(Map<String, dynamic> json) {
  return _Habit.fromJson(json);
}

/// @nodoc
mixin _$Habit {
  @HiveField(0)
  String get id => throw _privateConstructorUsedError;
  @HiveField(1)
  String get name => throw _privateConstructorUsedError;
  @HiveField(2)
  String get type => throw _privateConstructorUsedError;
  @HiveField(3)
  String get frequency => throw _privateConstructorUsedError;
  @HiveField(4)
  int get targetPerWeek => throw _privateConstructorUsedError;
  @HiveField(5)
  String? get remindAt => throw _privateConstructorUsedError;
  @HiveField(6)
  DateTime get createdAt => throw _privateConstructorUsedError;
  @HiveField(7)
  DateTime? get archivedAt => throw _privateConstructorUsedError;
  @HiveField(8)
  String get icon => throw _privateConstructorUsedError;
  @HiveField(9)
  String get difficulty => throw _privateConstructorUsedError;
  @HiveField(10)
  String? get description => throw _privateConstructorUsedError;
  @HiveField(11)
  String get color => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $HabitCopyWith<Habit> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $HabitCopyWith<$Res> {
  factory $HabitCopyWith(Habit value, $Res Function(Habit) then) =
      _$HabitCopyWithImpl<$Res, Habit>;
  @useResult
  $Res call(
      {@HiveField(0) String id,
      @HiveField(1) String name,
      @HiveField(2) String type,
      @HiveField(3) String frequency,
      @HiveField(4) int targetPerWeek,
      @HiveField(5) String? remindAt,
      @HiveField(6) DateTime createdAt,
      @HiveField(7) DateTime? archivedAt,
      @HiveField(8) String icon,
      @HiveField(9) String difficulty,
      @HiveField(10) String? description,
      @HiveField(11) String color});
}

/// @nodoc
class _$HabitCopyWithImpl<$Res, $Val extends Habit>
    implements $HabitCopyWith<$Res> {
  _$HabitCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? type = null,
    Object? frequency = null,
    Object? targetPerWeek = null,
    Object? remindAt = freezed,
    Object? createdAt = null,
    Object? archivedAt = freezed,
    Object? icon = null,
    Object? difficulty = null,
    Object? description = freezed,
    Object? color = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      frequency: null == frequency
          ? _value.frequency
          : frequency // ignore: cast_nullable_to_non_nullable
              as String,
      targetPerWeek: null == targetPerWeek
          ? _value.targetPerWeek
          : targetPerWeek // ignore: cast_nullable_to_non_nullable
              as int,
      remindAt: freezed == remindAt
          ? _value.remindAt
          : remindAt // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      archivedAt: freezed == archivedAt
          ? _value.archivedAt
          : archivedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      icon: null == icon
          ? _value.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String,
      difficulty: null == difficulty
          ? _value.difficulty
          : difficulty // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      color: null == color
          ? _value.color
          : color // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$HabitImplCopyWith<$Res> implements $HabitCopyWith<$Res> {
  factory _$$HabitImplCopyWith(
          _$HabitImpl value, $Res Function(_$HabitImpl) then) =
      __$$HabitImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@HiveField(0) String id,
      @HiveField(1) String name,
      @HiveField(2) String type,
      @HiveField(3) String frequency,
      @HiveField(4) int targetPerWeek,
      @HiveField(5) String? remindAt,
      @HiveField(6) DateTime createdAt,
      @HiveField(7) DateTime? archivedAt,
      @HiveField(8) String icon,
      @HiveField(9) String difficulty,
      @HiveField(10) String? description,
      @HiveField(11) String color});
}

/// @nodoc
class __$$HabitImplCopyWithImpl<$Res>
    extends _$HabitCopyWithImpl<$Res, _$HabitImpl>
    implements _$$HabitImplCopyWith<$Res> {
  __$$HabitImplCopyWithImpl(
      _$HabitImpl _value, $Res Function(_$HabitImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? type = null,
    Object? frequency = null,
    Object? targetPerWeek = null,
    Object? remindAt = freezed,
    Object? createdAt = null,
    Object? archivedAt = freezed,
    Object? icon = null,
    Object? difficulty = null,
    Object? description = freezed,
    Object? color = null,
  }) {
    return _then(_$HabitImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      frequency: null == frequency
          ? _value.frequency
          : frequency // ignore: cast_nullable_to_non_nullable
              as String,
      targetPerWeek: null == targetPerWeek
          ? _value.targetPerWeek
          : targetPerWeek // ignore: cast_nullable_to_non_nullable
              as int,
      remindAt: freezed == remindAt
          ? _value.remindAt
          : remindAt // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      archivedAt: freezed == archivedAt
          ? _value.archivedAt
          : archivedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      icon: null == icon
          ? _value.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String,
      difficulty: null == difficulty
          ? _value.difficulty
          : difficulty // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      color: null == color
          ? _value.color
          : color // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$HabitImpl implements _Habit {
  const _$HabitImpl(
      {@HiveField(0) required this.id,
      @HiveField(1) required this.name,
      @HiveField(2) this.type = 'health',
      @HiveField(3) this.frequency = 'daily',
      @HiveField(4) this.targetPerWeek = 7,
      @HiveField(5) this.remindAt,
      @HiveField(6) required this.createdAt,
      @HiveField(7) this.archivedAt,
      @HiveField(8) this.icon = 'water-outline',
      @HiveField(9) this.difficulty = 'medium',
      @HiveField(10) this.description,
      @HiveField(11) this.color = '#4F46E5'});

  factory _$HabitImpl.fromJson(Map<String, dynamic> json) =>
      _$$HabitImplFromJson(json);

  @override
  @HiveField(0)
  final String id;
  @override
  @HiveField(1)
  final String name;
  @override
  @JsonKey()
  @HiveField(2)
  final String type;
  @override
  @JsonKey()
  @HiveField(3)
  final String frequency;
  @override
  @JsonKey()
  @HiveField(4)
  final int targetPerWeek;
  @override
  @HiveField(5)
  final String? remindAt;
  @override
  @HiveField(6)
  final DateTime createdAt;
  @override
  @HiveField(7)
  final DateTime? archivedAt;
  @override
  @JsonKey()
  @HiveField(8)
  final String icon;
  @override
  @JsonKey()
  @HiveField(9)
  final String difficulty;
  @override
  @HiveField(10)
  final String? description;
  @override
  @JsonKey()
  @HiveField(11)
  final String color;

  @override
  String toString() {
    return 'Habit(id: $id, name: $name, type: $type, frequency: $frequency, targetPerWeek: $targetPerWeek, remindAt: $remindAt, createdAt: $createdAt, archivedAt: $archivedAt, icon: $icon, difficulty: $difficulty, description: $description, color: $color)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$HabitImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.frequency, frequency) ||
                other.frequency == frequency) &&
            (identical(other.targetPerWeek, targetPerWeek) ||
                other.targetPerWeek == targetPerWeek) &&
            (identical(other.remindAt, remindAt) ||
                other.remindAt == remindAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.archivedAt, archivedAt) ||
                other.archivedAt == archivedAt) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            (identical(other.difficulty, difficulty) ||
                other.difficulty == difficulty) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.color, color) || other.color == color));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      type,
      frequency,
      targetPerWeek,
      remindAt,
      createdAt,
      archivedAt,
      icon,
      difficulty,
      description,
      color);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$HabitImplCopyWith<_$HabitImpl> get copyWith =>
      __$$HabitImplCopyWithImpl<_$HabitImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$HabitImplToJson(
      this,
    );
  }
}

abstract class _Habit implements Habit {
  const factory _Habit(
      {@HiveField(0) required final String id,
      @HiveField(1) required final String name,
      @HiveField(2) final String type,
      @HiveField(3) final String frequency,
      @HiveField(4) final int targetPerWeek,
      @HiveField(5) final String? remindAt,
      @HiveField(6) required final DateTime createdAt,
      @HiveField(7) final DateTime? archivedAt,
      @HiveField(8) final String icon,
      @HiveField(9) final String difficulty,
      @HiveField(10) final String? description,
      @HiveField(11) final String color}) = _$HabitImpl;

  factory _Habit.fromJson(Map<String, dynamic> json) = _$HabitImpl.fromJson;

  @override
  @HiveField(0)
  String get id;
  @override
  @HiveField(1)
  String get name;
  @override
  @HiveField(2)
  String get type;
  @override
  @HiveField(3)
  String get frequency;
  @override
  @HiveField(4)
  int get targetPerWeek;
  @override
  @HiveField(5)
  String? get remindAt;
  @override
  @HiveField(6)
  DateTime get createdAt;
  @override
  @HiveField(7)
  DateTime? get archivedAt;
  @override
  @HiveField(8)
  String get icon;
  @override
  @HiveField(9)
  String get difficulty;
  @override
  @HiveField(10)
  String? get description;
  @override
  @HiveField(11)
  String get color;
  @override
  @JsonKey(ignore: true)
  _$$HabitImplCopyWith<_$HabitImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
