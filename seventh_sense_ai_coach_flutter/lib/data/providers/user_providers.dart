import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_preferences.dart';
import '../../core/services/storage_service.dart';

// User preferences provider
final userPreferencesProvider = FutureProvider<UserPreferences>((ref) async {
  await StorageService.initialize();
  return StorageService.getUserPreferences() ?? StorageService.getDefaultUserPreferences();
});

// User preferences notifier
class UserPreferencesNotifier extends StateNotifier<AsyncValue<UserPreferences>> {
  UserPreferencesNotifier() : super(const AsyncValue.loading()) {
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    state = const AsyncValue.loading();
    try {
      await StorageService.initialize();
      final preferences = StorageService.getUserPreferences() ?? StorageService.getDefaultUserPreferences();
      state = AsyncValue.data(preferences);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> updatePreferences(UserPreferences preferences) async {
    try {
      await StorageService.saveUserPreferences(preferences);
      state = AsyncValue.data(preferences);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> updateName(String name) async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(name: name);
      await updatePreferences(updated);
    }
  }

  Future<void> updateThemeMode(String themeMode) async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(themeMode: themeMode);
      await updatePreferences(updated);
    }
  }

  Future<void> updateAITone(String aiTone) async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(aiTone: aiTone);
      await updatePreferences(updated);
    }
  }

  Future<void> updateDefaultReminderTime(String? time) async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(defaultReminderTime: time);
      await updatePreferences(updated);
    }
  }

  Future<void> updateEveningRecapEnabled(bool enabled) async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(eveningRecapEnabled: enabled);
      await updatePreferences(updated);
    }
  }

  Future<void> updateNotificationsEnabled(bool enabled) async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(notificationsEnabled: enabled);
      await updatePreferences(updated);
    }
  }

  Future<void> updateLanguageCode(String languageCode) async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(languageCode: languageCode);
      await updatePreferences(updated);
    }
  }

  Future<void> updateTimezone(String timezone) async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(timezone: timezone);
      await updatePreferences(updated);
    }
  }

  Future<void> completeOnboarding() async {
    final current = state.value;
    if (current != null) {
      final updated = current.copyWith(onboardingCompletedAt: DateTime.now());
      await updatePreferences(updated);
    }
  }

  Future<void> resetPreferences() async {
    try {
      final defaultPreferences = StorageService.getDefaultUserPreferences();
      await StorageService.saveUserPreferences(defaultPreferences);
      state = AsyncValue.data(defaultPreferences);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// User preferences notifier provider
final userPreferencesNotifierProvider = StateNotifierProvider<UserPreferencesNotifier, AsyncValue<UserPreferences>>((ref) {
  return UserPreferencesNotifier();
});

// Individual preference providers for easier access
final userNameProvider = FutureProvider<String>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.displayName;
});

final userThemeModeProvider = FutureProvider<String>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.themeMode;
});

final userAIToneProvider = FutureProvider<String>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.aiTone;
});

final userDefaultReminderTimeProvider = FutureProvider<String?>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.defaultReminderTime;
});

final userEveningRecapEnabledProvider = FutureProvider<bool>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.eveningRecapEnabled;
});

final userNotificationsEnabledProvider = FutureProvider<bool>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.notificationsEnabled;
});

final userLanguageCodeProvider = FutureProvider<String>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.languageCode;
});

final userTimezoneProvider = FutureProvider<String>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.timezone;
});

final onboardingCompletedProvider = FutureProvider<bool>((ref) async {
  final preferences = await ref.watch(userPreferencesProvider.future);
  return preferences.hasCompletedOnboarding;
});
