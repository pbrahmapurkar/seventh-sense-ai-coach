class AppSpacing {
  // Base spacing unit (8dp)
  static const double base = 8.0;
  
  // Small spacing
  static const double xs = 4.0;
  static const double small = 8.0;
  
  // Medium spacing
  static const double medium = 16.0;
  static const double large = 24.0;
  
  // Large spacing
  static const double xl = 32.0;
  static const double xxl = 48.0;
  
  // Extra large spacing
  static const double xxxl = 64.0;
  
  // Component-specific spacing
  static const double cardRadius = 12.0;
  static const double buttonRadius = 8.0;
  static const double inputRadius = 8.0;
  static const double chipRadius = 16.0;
  static const double fabRadius = 28.0;
  
  // Icon sizes
  static const double iconSize = 24.0;
  static const double iconSizeSmall = 16.0;
  static const double iconSizeLarge = 32.0;
  
  // Progress ring sizes
  static const double progressRingSize = 36.0;
  static const double progressRingSizeSmall = 24.0;
  static const double progressRingSizeLarge = 48.0;
  
  // Touch target sizes
  static const double touchTarget = 48.0;
  static const double touchTargetSmall = 40.0;
  
  // Border widths
  static const double borderWidth = 1.0;
  static const double borderWidthThick = 2.0;
  
  // Elevation values
  static const double elevationLow = 1.0;
  static const double elevationMedium = 4.0;
  static const double elevationHigh = 8.0;
  
  // Padding values
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  static const double paddingXLarge = 32.0;
  
  // Margin values
  static const double marginSmall = 8.0;
  static const double marginMedium = 16.0;
  static const double marginLarge = 24.0;
  static const double marginXLarge = 32.0;
  
  // Gap values for lists
  static const double gapSmall = 8.0;
  static const double gapMedium = 16.0;
  static const double gapLarge = 24.0;
  
  // Screen padding
  static const double screenPadding = 16.0;
  static const double screenPaddingLarge = 24.0;
  
  // Bottom navigation bar
  static const double bottomNavHeight = 80.0;
  static const double bottomNavPadding = 16.0;
  
  // App bar
  static const double appBarHeight = 56.0;
  static const double appBarPadding = 16.0;
  
  // FAB
  static const double fabSize = 56.0;
  static const double fabMargin = 16.0;
  
  // Card
  static const double cardPadding = 16.0;
  static const double cardMargin = 8.0;
  
  // List item
  static const double listItemHeight = 72.0;
  static const double listItemPadding = 16.0;
  
  // Button
  static const double buttonHeight = 48.0;
  static const double buttonPadding = 16.0;
  
  // Input field
  static const double inputHeight = 56.0;
  static const double inputPadding = 16.0;
  
  // Chip
  static const double chipHeight = 32.0;
  static const double chipPadding = 12.0;
  
  // Divider
  static const double dividerHeight = 1.0;
  static const double dividerMargin = 16.0;
  
  // Progress bar
  static const double progressBarHeight = 4.0;
  static const double progressBarRadius = 2.0;
  
  // Avatar
  static const double avatarSize = 40.0;
  static const double avatarSizeSmall = 32.0;
  static const double avatarSizeLarge = 56.0;
  
  // Badge
  static const double badgeSize = 20.0;
  static const double badgePadding = 4.0;
  
  // Tooltip
  static const double tooltipPadding = 8.0;
  static const double tooltipRadius = 4.0;
  
  // Modal
  static const double modalPadding = 24.0;
  static const double modalRadius = 16.0;
  
  // Sheet
  static const double sheetPadding = 24.0;
  static const double sheetRadius = 16.0;
  
  // Dialog
  static const double dialogPadding = 24.0;
  static const double dialogRadius = 12.0;
  
  // Snackbar
  static const double snackbarPadding = 16.0;
  static const double snackbarRadius = 8.0;
  
  // Utility methods
  static double multiply(double base, double factor) {
    return base * factor;
  }
  
  static double divide(double base, double divisor) {
    return base / divisor;
  }
  
  static double add(double base, double value) {
    return base + value;
  }
  
  static double subtract(double base, double value) {
    return base - value;
  }
}
