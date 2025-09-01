import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'theme/app_theme.dart';
import 'router.dart';
import '../data/providers/app_state_providers.dart';
import '../data/providers/user_providers.dart';
import '../core/services/storage_service.dart';
import '../core/services/notification_service.dart';

class SeventhSenseApp extends ConsumerStatefulWidget {
  const SeventhSenseApp({super.key});

  @override
  ConsumerState<SeventhSenseApp> createState() => _SeventhSenseAppState();
}

class _SeventhSenseAppState extends ConsumerState<SeventhSenseApp> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      // Initialize services
      await StorageService.initialize();
      await NotificationService.initialize();
      
      // Set system UI overlay style
      SystemChrome.setSystemUIOverlayStyle(
        const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          systemNavigationBarColor: Colors.transparent,
          systemNavigationBarIconBrightness: Brightness.dark,
        ),
      );
    } catch (e) {
      // Handle initialization errors
      debugPrint('App initialization error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final appInitialized = ref.watch(appInitializationProvider);
    final userPreferences = ref.watch(userPreferencesProvider);
    
    return appInitialized.when(
      data: (initialized) {
        if (!initialized) {
          return MaterialApp(
            title: 'Seventh Sense AI Coach',
            theme: AppTheme.lightTheme,
            home: const _InitializationScreen(),
          );
        }
        
        return userPreferences.when(
          data: (preferences) {
            return MaterialApp.router(
              title: 'Seventh Sense AI Coach',
              theme: AppTheme.getTheme(preferences.themeMode),
              darkTheme: AppTheme.darkTheme,
              themeMode: _getThemeMode(preferences.themeMode),
              routerConfig: AppRouter.router,
              debugShowCheckedModeBanner: false,
              builder: (context, child) {
                return MediaQuery(
                  data: MediaQuery.of(context).copyWith(
                    textScaler: MediaQuery.of(context).textScaler.clamp(
                      minScaleFactor: 0.8,
                      maxScaleFactor: 1.2,
                    ),
                  ),
                  child: child!,
                );
              },
            );
          },
          loading: () => MaterialApp(
            title: 'Seventh Sense AI Coach',
            theme: AppTheme.lightTheme,
            home: const _LoadingScreen(),
          ),
          error: (error, stack) => MaterialApp(
            title: 'Seventh Sense AI Coach',
            theme: AppTheme.lightTheme,
            home: _ErrorScreen(error: error, stack: stack),
          ),
        );
      },
      loading: () => MaterialApp(
        title: 'Seventh Sense AI Coach',
        theme: AppTheme.lightTheme,
        home: const _LoadingScreen(),
      ),
      error: (error, stack) => MaterialApp(
        title: 'Seventh Sense AI Coach',
        theme: AppTheme.lightTheme,
        home: _ErrorScreen(error: error, stack: stack),
      ),
    );
  }

  ThemeMode _getThemeMode(String themeMode) {
    switch (themeMode) {
      case 'dark':
        return ThemeMode.dark;
      case 'light':
        return ThemeMode.light;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }
}

class _LoadingScreen extends StatelessWidget {
  const _LoadingScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Loading Seventh Sense...',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.onBackground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InitializationScreen extends StatelessWidget {
  const _InitializationScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: Center(
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
              'Failed to initialize app',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Theme.of(context).colorScheme.onBackground,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Please restart the app',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorScreen extends StatelessWidget {
  final Object error;
  final StackTrace? stack;

  const _ErrorScreen({required this.error, this.stack});

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
                'Something went wrong',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Theme.of(context).colorScheme.onBackground,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  // Restart app or navigate to home
                  Navigator.of(context).pushReplacementNamed('/');
                },
                child: const Text('Try Again'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
