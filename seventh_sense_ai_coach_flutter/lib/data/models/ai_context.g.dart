// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ai_context.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AIContextImpl _$$AIContextImplFromJson(Map<String, dynamic> json) =>
    _$AIContextImpl(
      name: json['name'] as String?,
      habitName: json['habitName'] as String,
      streak: (json['streak'] as num?)?.toInt() ?? 0,
      last3:
          (json['last3'] as List<dynamic>?)?.map((e) => e as String).toList(),
      timeOfDay: json['timeOfDay'] as String?,
      timezone: json['timezone'] as String?,
      aiTone: json['aiTone'] as String? ?? 'coach',
    );

Map<String, dynamic> _$$AIContextImplToJson(_$AIContextImpl instance) =>
    <String, dynamic>{
      'name': instance.name,
      'habitName': instance.habitName,
      'streak': instance.streak,
      'last3': instance.last3,
      'timeOfDay': instance.timeOfDay,
      'timezone': instance.timezone,
      'aiTone': instance.aiTone,
    };
