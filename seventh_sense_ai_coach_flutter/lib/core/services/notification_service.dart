import 'dart:convert';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../constants/app_constants.dart';
import '../utils/date_utils.dart';
import 'storage_service.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  static bool _initialized = false;

  /// Initialize notification service
  static Future<void> initialize() async {
    if (_initialized) return;

    // Initialize notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channels
    await _createNotificationChannels();

    _initialized = true;
  }

  static Future<void> _createNotificationChannels() async {
    // Daily habits channel
    const androidDailyChannel = AndroidNotificationChannel(
      AppConstants.dailyHabitsChannelId,
      AppConstants.dailyHabitsChannelName,
      description: AppConstants.dailyHabitsChannelDescription,
      importance: Importance.defaultImportance,
    );

    // Recap channel
    const androidRecapChannel = AndroidNotificationChannel(
      AppConstants.recapChannelId,
      AppConstants.recapChannelName,
      description: AppConstants.recapChannelDescription,
      importance: Importance.defaultImportance,
    );

    await _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidDailyChannel);

    await _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidRecapChannel);
  }

  static void _onNotificationTapped(NotificationResponse response) {
    // Handle notification tap
    final payload = response.payload;
    if (payload != null) {
      try {
        final data = jsonDecode(payload) as Map<String, dynamic>;
        // Handle different notification types
        switch (data['type']) {
          case 'habit-daily':
            // Navigate to habit detail
            break;
          case 'recap':
            // Navigate to home
            break;
        }
      } catch (e) {
        // Handle error
      }
    }
  }

  /// Request notification permissions
  static Future<bool> requestPermissions() async {
    final androidPlugin = _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidPlugin != null) {
      final granted = await androidPlugin.requestNotificationsPermission();
      return granted ?? false;
    }

    // For iOS, assume permissions are granted for now
    return true;
  }

  /// Check if notifications are enabled
  static Future<bool> areNotificationsEnabled() async {
    final androidPlugin = _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidPlugin != null) {
      final enabled = await androidPlugin.areNotificationsEnabled();
      return enabled ?? false;
    }

    return true; // Assume enabled for iOS
  }

  /// Schedule daily notification for a habit
  static Future<String?> scheduleDailyNotification(
    String habitId,
    String timeHHmm,
    String timezone,
  ) async {
    try {
      final permissionsGranted = await requestPermissions();
      if (!permissionsGranted) return null;

      final parsed = DateUtils.parseHHmm(timeHHmm);
      if (parsed == null) return null;

      int hour = parsed['hour']!;
      int minute = parsed['minute']!;

      // Enforce quiet hours
      if (DateUtils.inQuietHours(hour, minute)) {
        hour = AppConstants.quietHoursRescheduleHour;
        minute = AppConstants.quietHoursRescheduleMinute;
      }

      // Cancel existing notification
      await cancelScheduledNotification(habitId);

      // Schedule new notification
      final notificationId = int.parse(habitId.hashCode.toString().replaceAll('-', ''));
      await _notifications.periodicallyShow(
        notificationId,
        'Seventh Sense',
        'Time for your habit. Open to check off today.',
        RepeatInterval.daily,
        NotificationDetails(
          android: AndroidNotificationDetails(
            AppConstants.dailyHabitsChannelId,
            AppConstants.dailyHabitsChannelName,
            channelDescription: AppConstants.dailyHabitsChannelDescription,
            importance: Importance.defaultImportance,
            priority: Priority.defaultPriority,
          ),
          iOS: const DarwinNotificationDetails(),
        ),
        payload: jsonEncode({
          'habitId': habitId,
          'type': 'habit-daily',
        }),
      );

      // Store notification mapping
      final notificationMap = _getNotificationMap();
      notificationMap[habitId] = notificationId.toString();
      await _saveNotificationMap(notificationMap);

      return notificationId.toString();
    } catch (e) {
      return null;
    }
  }

  /// Cancel scheduled notification for a habit
  static Future<void> cancelScheduledNotification(String habitId) async {
    try {
      final notificationMap = _getNotificationMap();
      final notificationId = notificationMap[habitId];
      
      if (notificationId != null) {
        await _notifications.cancel(int.parse(notificationId));
        notificationMap.remove(habitId);
        await _saveNotificationMap(notificationMap);
      }
    } catch (e) {
      // Handle error
    }
  }

  /// Schedule evening recap notification (simplified)
  static Future<String?> scheduleEveningRecap(String timezone, String time) async {
    try {
      final permissionsGranted = await requestPermissions();
      if (!permissionsGranted) return null;

      final todayKey = DateUtils.getTodayKey(timezone);
      final recapState = _getRecapState();
      
      if (recapState['dateKey'] == todayKey && recapState['notifId'] != null) {
        return null; // Already scheduled for today
      }

      final parsed = DateUtils.parseHHmm(time);
      if (parsed == null) return null;

      int hour = parsed['hour']!;
      int minute = parsed['minute']!;

      // Check if time has passed
      final now = DateTime.now();
      final targetTime = DateTime(now.year, now.month, now.day, hour, minute);
      if (now.isAfter(targetTime)) {
        return null; // Too late today
      }

      // For now, just schedule a simple notification using show instead of zonedSchedule
      final notificationId = todayKey.hashCode;
      await _notifications.show(
        notificationId,
        'Evening recap',
        'Wrap your day: check any remaining habits.',
        const NotificationDetails(
          android: AndroidNotificationDetails(
            AppConstants.recapChannelId,
            AppConstants.recapChannelName,
            channelDescription: AppConstants.recapChannelDescription,
          ),
          iOS: DarwinNotificationDetails(),
        ),
        payload: jsonEncode({'type': 'recap'}),
      );

      await _saveRecapState(todayKey, notificationId.toString());
      return notificationId.toString();
    } catch (e) {
      return null;
    }
  }

  /// Cancel all scheduled notifications
  static Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
    await _clearNotificationMaps();
  }

  /// Get pending notifications
  static Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _notifications.pendingNotificationRequests();
  }

  // Helper methods for storing notification mappings
  static Map<String, String> _getNotificationMap() {
    final json = StorageService.getString(AppConstants.notificationMapKey);
    if (json != null) {
      try {
        final data = jsonDecode(json) as Map<String, dynamic>;
        return Map<String, String>.from(data);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  static Future<void> _saveNotificationMap(Map<String, String> map) async {
    await StorageService.setString(AppConstants.notificationMapKey, jsonEncode(map));
  }

  static Map<String, dynamic> _getRecapState() {
    final json = StorageService.getString(AppConstants.recapStateKey);
    if (json != null) {
      try {
        final data = jsonDecode(json) as Map<String, dynamic>;
        return Map<String, dynamic>.from(data);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  static Future<void> _saveRecapState(String dateKey, String? notifId) async {
    final state = {
      'dateKey': dateKey,
      'notifId': notifId,
    };
    await StorageService.setString(AppConstants.recapStateKey, jsonEncode(state));
  }

  static Future<void> _clearNotificationMaps() async {
    await StorageService.remove(AppConstants.notificationMapKey);
    await StorageService.remove(AppConstants.recapStateKey);
  }

  /// Set evening recap enabled/disabled
  static Future<void> setEveningRecapEnabled(bool enabled) async {
    await StorageService.setBool(AppConstants.recapEnabledKey, enabled);
    
    if (!enabled) {
      // Cancel any scheduled recap for today
      final recapState = _getRecapState();
      if (recapState['notifId'] != null) {
        await _notifications.cancel(int.parse(recapState['notifId']));
        await _saveRecapState('', null);
      }
    }
  }

  /// Check if evening recap is enabled
  static bool isEveningRecapEnabled() {
    return StorageService.getBool(AppConstants.recapEnabledKey) ?? true;
  }
}
