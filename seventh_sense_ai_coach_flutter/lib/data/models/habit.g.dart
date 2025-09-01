// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'habit.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class HabitAdapter extends TypeAdapter<Habit> {
  @override
  final int typeId = 0;

  @override
  Habit read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Habit(
      id: fields[0] as String,
      name: fields[1] as String,
      type: fields[2] as String,
      frequency: fields[3] as String,
      targetPerWeek: fields[4] as int,
      remindAt: fields[5] as String?,
      createdAt: fields[6] as DateTime,
      archivedAt: fields[7] as DateTime?,
      icon: fields[8] as String,
      difficulty: fields[9] as String,
      description: fields[10] as String?,
      color: fields[11] as String,
    );
  }

  @override
  void write(BinaryWriter writer, Habit obj) {
    writer
      ..writeByte(12)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.type)
      ..writeByte(3)
      ..write(obj.frequency)
      ..writeByte(4)
      ..write(obj.targetPerWeek)
      ..writeByte(5)
      ..write(obj.remindAt)
      ..writeByte(6)
      ..write(obj.createdAt)
      ..writeByte(7)
      ..write(obj.archivedAt)
      ..writeByte(8)
      ..write(obj.icon)
      ..writeByte(9)
      ..write(obj.difficulty)
      ..writeByte(10)
      ..write(obj.description)
      ..writeByte(11)
      ..write(obj.color);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HabitAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$HabitImpl _$$HabitImplFromJson(Map<String, dynamic> json) => _$HabitImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String? ?? 'health',
      frequency: json['frequency'] as String? ?? 'daily',
      targetPerWeek: (json['targetPerWeek'] as num?)?.toInt() ?? 7,
      remindAt: json['remindAt'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      archivedAt: json['archivedAt'] == null
          ? null
          : DateTime.parse(json['archivedAt'] as String),
      icon: json['icon'] as String? ?? 'water-outline',
      difficulty: json['difficulty'] as String? ?? 'medium',
      description: json['description'] as String?,
      color: json['color'] as String? ?? '#4F46E5',
    );

Map<String, dynamic> _$$HabitImplToJson(_$HabitImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'type': instance.type,
      'frequency': instance.frequency,
      'targetPerWeek': instance.targetPerWeek,
      'remindAt': instance.remindAt,
      'createdAt': instance.createdAt.toIso8601String(),
      'archivedAt': instance.archivedAt?.toIso8601String(),
      'icon': instance.icon,
      'difficulty': instance.difficulty,
      'description': instance.description,
      'color': instance.color,
    };
