// Notification utilities for Seventh Sense AI Coach
// Handles local notifications with quiet hours and evening recap

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayKey } from './date';

// Storage keys
const PERMISSION_KEY = 'notification_permission';
const EVENING_RECAP_KEY = 'evening_recap_enabled';

// Notification types
export interface NotificationData {
  habitId: string;
  type: 'daily' | 'evening_recap';
  time?: string; // HH:mm for daily notifications
}

/**
 * Setup notification permissions
 */
export async function setupPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    const hasPermission = finalStatus === 'granted';
    await AsyncStorage.setItem(PERMISSION_KEY, JSON.stringify(hasPermission));
    
    return hasPermission;
  } catch (error) {
    console.error('Error setting up notification permissions:', error);
    return false;
  }
}

/**
 * Check if notifications are permitted
 */
export async function hasNotificationPermission(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(PERMISSION_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
    
    // Check system permission
    const { status } = await Notifications.getPermissionsAsync();
    const hasPermission = status === 'granted';
    await AsyncStorage.setItem(PERMISSION_KEY, JSON.stringify(hasPermission));
    
    return hasPermission;
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}

/**
 * Schedule daily notification for a habit
 */
export async function scheduleDaily(
  habitId: string,
  timeHHmm: string,
  timezone?: string
): Promise<string | null> {
  try {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission, skipping schedule');
      return null;
    }
    
    // Parse time
    const [hours, minutes] = timeHHmm.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid time format: ${timeHHmm}`);
    }
    
    // Check quiet hours (22:00 - 07:00)
    let targetHours = hours;
    let targetMinutes = minutes;
    let targetDate = new Date();
    
    if (hours >= 22 || hours < 7) {
      // Shift to 07:05 next day
      targetHours = 7;
      targetMinutes = 5;
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Set target time
    targetDate.setHours(targetHours, targetMinutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (targetDate <= new Date()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Create notification content
    const habit = await getHabitName(habitId);
    const title = 'Time for your habit!';
    const body = `Don't forget to ${habit.toLowerCase()} today.`;
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { habitId, type: 'daily' } as NotificationData,
      },
      trigger: {
        hour: targetHours,
        minute: targetMinutes,
        repeats: true,
      },
    });
    
    console.log(`Scheduled daily notification for habit ${habitId} at ${targetHours}:${targetMinutes.toString().padStart(2, '0')}`);
    return notificationId;
    
  } catch (error) {
    console.error('Error scheduling daily notification:', error);
    return null;
  }
}

/**
 * Cancel scheduled notification for a habit
 */
export async function cancelScheduled(habitId: string): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      const data = notification.content.data as NotificationData;
      if (data?.habitId === habitId && data?.type === 'daily') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`Cancelled notification for habit ${habitId}`);
      }
    }
  } catch (error) {
    console.error('Error cancelling scheduled notification:', error);
  }
}

/**
 * Schedule evening recap if needed
 */
export async function scheduleEveningRecapIfNeeded(
  timezone?: string,
  time: string = '20:30'
): Promise<string | null> {
  try {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      return null;
    }
    
    // Check if evening recap is enabled
    const enabled = await AsyncStorage.getItem(EVENING_RECAP_KEY);
    if (enabled !== 'true') {
      return null;
    }
    
    // Parse time
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid time format: ${time}`);
    }
    
    // Check quiet hours
    if (hours >= 22 || hours < 7) {
      // Shift to 07:05 next day
      hours = 7;
      minutes = 5;
    }
    
    // Set target time
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (targetDate <= new Date()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Evening Habit Check-in',
        body: 'How did your habits go today? Take a moment to reflect.',
        data: { type: 'evening_recap' } as NotificationData,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
    
    console.log(`Scheduled evening recap at ${hours}:${minutes.toString().padStart(2, '0')}`);
    return notificationId;
    
  } catch (error) {
    console.error('Error scheduling evening recap:', error);
    return null;
  }
}

/**
 * Cancel evening recap notification
 */
export async function cancelEveningRecap(): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      const data = notification.content.data as NotificationData;
      if (data?.type === 'evening_recap') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log('Cancelled evening recap notification');
      }
    }
  } catch (error) {
    console.error('Error cancelling evening recap notification:', error);
  }
}

/**
 * Enable/disable evening recap notifications
 */
export async function setEveningRecapEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(EVENING_RECAP_KEY, JSON.stringify(enabled));
    
    if (enabled) {
      await scheduleEveningRecapIfNeeded();
    } else {
      await cancelEveningRecap();
    }
  } catch (error) {
    console.error('Error setting evening recap enabled:', error);
  }
}

/**
 * Check if evening recap is enabled
 */
export async function isEveningRecapEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(EVENING_RECAP_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking evening recap enabled:', error);
    return false;
  }
}

/**
 * Get habit name from storage (helper function)
 */
async function getHabitName(habitId: string): Promise<string> {
  try {
    const habitsJson = await AsyncStorage.getItem('habits');
    if (habitsJson) {
      const habits = JSON.parse(habitsJson);
      const habit = habits.find((h: any) => h.id === habitId);
      return habit?.name || 'your habit';
    }
    return 'your habit';
  } catch (error) {
    console.error('Error getting habit name:', error);
    return 'your habit';
  }
}

/**
 * Configure notification handler
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Clear all scheduled notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cleared all scheduled notifications');
  } catch (error) {
    console.error('Error clearing all notifications:', error);
  }
}
