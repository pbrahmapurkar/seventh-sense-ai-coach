import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:hive/hive.dart';

part 'habit.freezed.dart';
part 'habit.g.dart';

@freezed
@HiveType(typeId: 0)
class Habit with _$Habit {
  const factory Habit({
    @HiveField(0) required String id,
    @HiveField(1) required String name,
    @HiveField(2) @Default('health') String type,
    @HiveField(3) @Default('daily') String frequency,
    @HiveField(4) @Default(7) int targetPerWeek,
    @HiveField(5) String? remindAt,
    @HiveField(6) required DateTime createdAt,
    @HiveField(7) DateTime? archivedAt,
    @HiveField(8) @Default('water-outline') String icon,
    @HiveField(9) @Default('medium') String difficulty,
    @HiveField(10) String? description,
    @HiveField(11) @Default('#4F46E5') String color,
  }) = _Habit;

  factory Habit.fromJson(Map<String, dynamic> json) => _$HabitFromJson(json);
}

extension HabitExtension on Habit {
  bool get isArchived => archivedAt != null;
  
  bool get hasReminder => remindAt != null && remindAt!.isNotEmpty;
  
  String get displayName => name.isNotEmpty ? name : 'Untitled Habit';
  
  String get typeDisplay {
    switch (type) {
      case 'health':
        return 'Health';
      case 'mind':
        return 'Mind';
      case 'custom':
        return 'Custom';
      default:
        return 'Custom';
    }
  }
  
  String get frequencyDisplay {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        return 'Custom';
      default:
        return 'Daily';
    }
  }
}
