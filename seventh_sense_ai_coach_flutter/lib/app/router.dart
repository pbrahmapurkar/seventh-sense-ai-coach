import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../presentation/screens/onboarding/welcome_screen.dart';
import '../presentation/screens/onboarding/name_input_screen.dart';
import '../presentation/screens/onboarding/starter_habits_screen.dart';
import '../presentation/screens/onboarding/notifications_screen.dart';
import '../presentation/screens/home/home_screen.dart';
import '../presentation/screens/habits/add_habit_screen.dart';
import '../presentation/screens/habits/habit_detail_screen.dart';
import '../presentation/screens/insights/insights_screen.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../data/providers/user_providers.dart';
import '../data/providers/app_state_providers.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      // Check if user has completed onboarding
      final onboardingCompleted = false; // TODO: Get from provider
      
      if (!onboardingCompleted && state.uri.path != '/onboarding') {
        return '/onboarding';
      }
      
      return null;
    },
    routes: [
      // Onboarding routes
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/onboarding/name',
        builder: (context, state) => const NameInputScreen(),
      ),
      GoRoute(
        path: '/onboarding/starter-habits',
        builder: (context, state) => const StarterHabitsScreen(),
      ),
      GoRoute(
        path: '/onboarding/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      
      // Main app routes
      ShellRoute(
        builder: (context, state, child) => _MainShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/insights',
            builder: (context, state) => const InsightsScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
      
      // Habit routes
      GoRoute(
        path: '/habit/add',
        builder: (context, state) => const AddHabitScreen(),
      ),
      GoRoute(
        path: '/habit/:id',
        builder: (context, state) {
          final habitId = state.pathParameters['id']!;
          return HabitDetailScreen(habitId: habitId);
        },
      ),
    ],
    errorBuilder: (context, state) => _ErrorScreen(error: state.error),
  );
}

class _MainShell extends StatelessWidget {
  final Widget child;

  const _MainShell({required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _getCurrentIndex(context),
        onTap: (index) => _onTabTapped(context, index),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Today',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.insights_outlined),
            activeIcon: Icon(Icons.insights),
            label: 'Insights',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined),
            activeIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
      floatingActionButton: _buildFAB(context),
    );
  }

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location == '/') return 0;
    if (location == '/insights') return 1;
    if (location == '/settings') return 2;
    return 0;
  }

  void _onTabTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/insights');
        break;
      case 2:
        context.go('/settings');
        break;
    }
  }

  Widget? _buildFAB(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    
    // Only show FAB on home screen
    if (location == '/') {
      return FloatingActionButton(
        onPressed: () => context.go('/habit/add'),
        child: const Icon(Icons.add),
      );
    }
    
    return null;
  }
}

class _ErrorScreen extends StatelessWidget {
  final Exception? error;

  const _ErrorScreen({this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                'Page not found',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Theme.of(context).colorScheme.onBackground,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                error?.toString() ?? 'The page you\'re looking for doesn\'t exist.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
