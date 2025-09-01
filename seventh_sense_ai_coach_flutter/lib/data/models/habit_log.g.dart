// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'habit_log.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class HabitLogAdapter extends TypeAdapter<HabitLog> {
  @override
  final int typeId = 1;

  @override
  HabitLog read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return HabitLog(
      id: fields[0] as String,
      habitId: fields[1] as String,
      dateKey: fields[2] as String,
      completed: fields[3] as bool,
      completedAt: fields[4] as DateTime?,
      note: fields[5] as String?,
      completionValue: fields[6] as double,
      createdAt: fields[7] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, HabitLog obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.habitId)
      ..writeByte(2)
      ..write(obj.dateKey)
      ..writeByte(3)
      ..write(obj.completed)
      ..writeByte(4)
      ..write(obj.completedAt)
      ..writeByte(5)
      ..write(obj.note)
      ..writeByte(6)
      ..write(obj.completionValue)
      ..writeByte(7)
      ..write(obj.createdAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HabitLogAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$HabitLogImpl _$$HabitLogImplFromJson(Map<String, dynamic> json) =>
    _$HabitLogImpl(
      id: json['id'] as String,
      habitId: json['habitId'] as String,
      dateKey: json['dateKey'] as String,
      completed: json['completed'] as bool? ?? false,
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      note: json['note'] as String?,
      completionValue: (json['completionValue'] as num?)?.toDouble() ?? 1.0,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$HabitLogImplToJson(_$HabitLogImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'habitId': instance.habitId,
      'dateKey': instance.dateKey,
      'completed': instance.completed,
      'completedAt': instance.completedAt?.toIso8601String(),
      'note': instance.note,
      'completionValue': instance.completionValue,
      'createdAt': instance.createdAt.toIso8601String(),
    };
