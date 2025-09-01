import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:hive/hive.dart';

part 'habit_log.freezed.dart';
part 'habit_log.g.dart';

@freezed
@HiveType(typeId: 1)
class HabitLog with _$HabitLog {
  const factory HabitLog({
    @HiveField(0) required String id,
    @HiveField(1) required String habitId,
    @HiveField(2) required String dateKey,
    @HiveField(3) @Default(false) bool completed,
    @HiveField(4) DateTime? completedAt,
    @HiveField(5) String? note,
    @HiveField(6) @Default(1.0) double completionValue,
    @HiveField(7) required DateTime createdAt,
  }) = _HabitLog;

  factory HabitLog.fromJson(Map<String, dynamic> json) => _$HabitLogFromJson(json);
}

extension HabitLogExtension on HabitLog {
  bool get isCompleted => completed;
  
  String get dateKeyYYYYMMDD => dateKey;
  
  DateTime? get completionDateTime => completedAt;
  
  String get noteText => note ?? '';
  
  double get value => completionValue;
}
