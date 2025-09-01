import '../../data/models/habit.dart';

class HabitTemplates {
  static const List<Map<String, dynamic>> starterHabits = [
    {
      'id': 'water',
      'name': 'Drink Water 2L',
      'icon': 'water-outline',
      'type': 'health',
      'frequency': 'daily',
      'targetPerWeek': 7,
      'description': 'Drink 2L of water daily',
      'defaultRemindAt': '09:00',
      'color': '#4F46E5',
      'difficulty': 'easy',
    },
    {
      'id': 'walk',
      'name': 'Walk 10m',
      'icon': 'footsteps-outline',
      'type': 'health',
      'frequency': 'daily',
      'targetPerWeek': 7,
      'description': 'Take a 10-minute walk',
      'defaultRemindAt': '18:00',
      'color': '#10B981',
      'difficulty': 'easy',
    },
    {
      'id': 'breathe',
      'name': 'Breathe 2m',
      'icon': 'leaf-outline',
      'type': 'mind',
      'frequency': 'daily',
      'targetPerWeek': 7,
      'description': 'Practice mindful breathing for 2 minutes',
      'defaultRemindAt': '12:30',
      'color': '#F59E0B',
      'difficulty': 'easy',
    },
  ];

  static List<Habit> getStarterHabits() {
    final now = DateTime.now();
    return starterHabits.map((template) {
      return Habit(
        id: template['id'],
        name: template['name'],
        type: template['type'],
        frequency: template['frequency'],
        targetPerWeek: template['targetPerWeek'],
        remindAt: template['defaultRemindAt'],
        createdAt: now,
        icon: template['icon'],
        difficulty: template['difficulty'],
        description: template['description'],
        color: template['color'],
      );
    }).toList();
  }

  static const List<String> habitTypes = ['health', 'mind', 'custom'];
  static const List<String> habitFrequencies = ['daily', 'weekly', 'custom'];
  static const List<String> habitDifficulties = ['easy', 'medium', 'hard'];
  
  static const List<String> habitIcons = [
    'water-outline',
    'footsteps-outline',
    'leaf-outline',
    'book-outline',
    'heart-outline',
    'brain-outline',
    'moon-outline',
    'sun-outline',
    'star-outline',
    'target-outline',
    'check-circle-outline',
    'clock-outline',
    'calendar-outline',
    'trending-up-outline',
    'activity-outline',
  ];

  static const List<String> habitColors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1', // Blue
  ];
}
