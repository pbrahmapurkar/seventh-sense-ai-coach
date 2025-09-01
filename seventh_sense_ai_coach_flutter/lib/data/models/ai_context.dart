import 'package:freezed_annotation/freezed_annotation.dart';

part 'ai_context.freezed.dart';
part 'ai_context.g.dart';

@freezed
class AIContext with _$AIContext {
  const factory AIContext({
    String? name,
    required String habitName,
    @Default(0) int streak,
    List<String>? last3,
    String? timeOfDay,
    String? timezone,
    @Default('coach') String aiTone,
  }) = _AIContext;

  factory AIContext.fromJson(Map<String, dynamic> json) => _$AIContextFromJson(json);
}

extension AIContextExtension on AIContext {
  String get displayName => name?.isNotEmpty == true ? name! : 'Friend';
  
  String get displayHabitName => habitName.isNotEmpty ? habitName : 'your habit';
  
  List<String> get last3Outcomes => last3 ?? [];
  
  String get timeOfDayDisplay {
    switch (timeOfDay) {
      case 'morning':
        return 'Morning';
      case 'afternoon':
        return 'Afternoon';
      case 'evening':
        return 'Evening';
      case 'night':
        return 'Night';
      default:
        return 'Day';
    }
  }
  
  String get aiToneDisplay {
    switch (aiTone) {
      case 'coach':
        return 'Coach';
      case 'friend':
        return 'Friend';
      case 'zen':
        return 'Zen';
      default:
        return 'Coach';
    }
  }
}
