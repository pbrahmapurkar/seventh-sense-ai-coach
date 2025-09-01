import 'package:flutter/material.dart';

class AppColors {
  // Primary colors
  static const Color primary = Color(0xFF4F46E5); // Indigo
  static const Color primaryContainer = Color(0xFFE0E7FF);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onPrimaryContainer = Color(0xFF1E1B4B);
  
  // Secondary colors
  static const Color secondary = Color(0xFF10B981); // Emerald
  static const Color secondaryContainer = Color(0xFFD1FAE5);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color onSecondaryContainer = Color(0xFF064E3B);
  
  // Tertiary colors
  static const Color tertiary = Color(0xFFF59E0B); // Amber
  static const Color tertiaryContainer = Color(0xFFFEF3C7);
  static const Color onTertiary = Color(0xFFFFFFFF);
  static const Color onTertiaryContainer = Color(0xFF78350F);
  
  // Surface colors
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF8FAFC);
  static const Color onSurface = Color(0xFF1E293B);
  static const Color onSurfaceVariant = Color(0xFF64748B);
  
  // Background colors
  static const Color background = Color(0xFFF8FAFC);
  static const Color onBackground = Color(0xFF1E293B);
  
  // Error colors
  static const Color error = Color(0xFFEF4444);
  static const Color errorContainer = Color(0xFFFEE2E2);
  static const Color onError = Color(0xFFFFFFFF);
  static const Color onErrorContainer = Color(0xFF7F1D1D);
  
  // Outline colors
  static const Color outline = Color(0xFFE2E8F0);
  static const Color outlineVariant = Color(0xFFCBD5E1);
  
  // Shadow colors
  static const Color shadow = Color(0xFF000000);
  
  // Success colors
  static const Color success = Color(0xFF10B981);
  static const Color successContainer = Color(0xFFD1FAE5);
  static const Color onSuccess = Color(0xFFFFFFFF);
  static const Color onSuccessContainer = Color(0xFF064E3B);
  
  // Warning colors
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningContainer = Color(0xFFFEF3C7);
  static const Color onWarning = Color(0xFFFFFFFF);
  static const Color onWarningContainer = Color(0xFF78350F);
  
  // Info colors
  static const Color info = Color(0xFF3B82F6);
  static const Color infoContainer = Color(0xFFDBEAFE);
  static const Color onInfo = Color(0xFFFFFFFF);
  static const Color onInfoContainer = Color(0xFF1E3A8A);
  
  // Habit type colors
  static const Color healthColor = Color(0xFF10B981); // Emerald
  static const Color mindColor = Color(0xFF8B5CF6); // Violet
  static const Color customColor = Color(0xFFF59E0B); // Amber
  
  // Progress colors
  static const Color progressBackground = Color(0xFFE2E8F0);
  static const Color progressForeground = Color(0xFF4F46E5);
  
  // Card colors
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFE2E8F0);
  
  // Text colors
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color textDisabled = Color(0xFFCBD5E1);
  
  // Icon colors
  static const Color iconPrimary = Color(0xFF1E293B);
  static const Color iconSecondary = Color(0xFF64748B);
  static const Color iconDisabled = Color(0xFFCBD5E1);
  
  // Divider colors
  static const Color divider = Color(0xFFE2E8F0);
  static const Color dividerStrong = Color(0xFFCBD5E1);
  
  // Overlay colors
  static const Color overlay = Color(0x80000000);
  static const Color overlayLight = Color(0x40000000);
  
  // Gradient colors
  static const List<Color> primaryGradient = [
    Color(0xFF4F46E5),
    Color(0xFF6366F1),
  ];
  
  static const List<Color> secondaryGradient = [
    Color(0xFF10B981),
    Color(0xFF34D399),
  ];
  
  static const List<Color> tertiaryGradient = [
    Color(0xFFF59E0B),
    Color(0xFFFBBF24),
  ];
  
  // Dark theme colors
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkSurfaceVariant = Color(0xFF334155);
  static const Color darkOnSurface = Color(0xFFF1F5F9);
  static const Color darkOnSurfaceVariant = Color(0xFF94A3B8);
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkOnBackground = Color(0xFFF1F5F9);
  static const Color darkOutline = Color(0xFF475569);
  static const Color darkCardBackground = Color(0xFF1E293B);
  static const Color darkCardBorder = Color(0xFF475569);
  
  // Utility methods
  static Color getHabitTypeColor(String type) {
    switch (type) {
      case 'health':
        return healthColor;
      case 'mind':
        return mindColor;
      case 'custom':
        return customColor;
      default:
        return primary;
    }
  }
  
  static Color getProgressColor(double percentage) {
    if (percentage >= 80) return success;
    if (percentage >= 60) return warning;
    if (percentage >= 40) return info;
    return error;
  }
  
  static Color getStreakColor(int streak) {
    if (streak >= 7) return success;
    if (streak >= 3) return warning;
    return info;
  }
}
