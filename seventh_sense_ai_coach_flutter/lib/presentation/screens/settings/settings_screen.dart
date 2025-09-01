import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../app/theme/colors.dart';
import '../../../app/theme/typography.dart';
import '../../../app/theme/spacing.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.screenPadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Settings',
                style: AppTypography.headlineSmall.copyWith(
                  color: Theme.of(context).colorScheme.onBackground,
                  fontWeight: FontWeight.bold,
                ),
              ),
              
              const SizedBox(height: AppSpacing.large),
              
              Expanded(
                child: ListView(
                  children: [
                    _buildSettingsSection(context, 'Preferences', [
                      _buildSettingsItem(context, 'Name', 'Not set', Icons.person, onTap: () {}),
                      _buildSettingsItem(context, 'Theme', 'System', Icons.palette, onTap: () {}),
                      _buildSettingsItem(context, 'AI Tone', 'Coach', Icons.psychology, onTap: () {}),
                    ]),
                    
                    const SizedBox(height: AppSpacing.large),
                    
                    _buildSettingsSection(context, 'Notifications', [
                      _buildSettingsItem(context, 'Daily Reminders', 'Enabled', Icons.notifications, onTap: () {}),
                      _buildSettingsItem(context, 'Evening Recap', 'Enabled', Icons.bedtime, onTap: () {}),
                    ]),
                    
                    const SizedBox(height: AppSpacing.large),
                    
                    _buildSettingsSection(context, 'Data', [
                      _buildSettingsItem(context, 'Export Data', '', Icons.download, onTap: () {}),
                      _buildSettingsItem(context, 'Import Data', '', Icons.upload, onTap: () {}),
                      _buildSettingsItem(context, 'Clear All Data', '', Icons.delete_forever, onTap: () {}, isDestructive: true),
                    ]),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsSection(BuildContext context, String title, List<Widget> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTypography.titleMedium.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSpacing.medium),
        Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
            border: Border.all(
              color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
            ),
          ),
          child: Column(
            children: items,
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsItem(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon, {
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isDestructive ? AppColors.error : AppColors.primary,
      ),
      title: Text(
        title,
        style: AppTypography.bodyLarge.copyWith(
          color: isDestructive ? AppColors.error : Theme.of(context).colorScheme.onSurface,
        ),
      ),
      subtitle: subtitle.isNotEmpty
          ? Text(
              subtitle,
              style: AppTypography.bodySmall.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
            )
          : null,
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
