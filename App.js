// Seventh Sense - App Root
// - Initializes theme from UserContext
// - Registers Expo Notifications handler
// - Hydrates UserContext + Zustand store, precomputes todayKey
// - Renders NavigationContainer (via /navigation) with theme
// - Shows minimal loading UI until hydration completes

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Appearance, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator, { linking as navLinking } from './navigation';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider, useUser } from './context/UserContext';
import { useHabitsStore } from './store/habitsStore';
import { getTodayKey } from './utils/date';
import colorsModule, { darkColors as darkOverrides } from './theme/colors';

// Storage keys (centralized)
const STORAGE_KEYS = {
  USER_PREFS: 'SS_USER_PREFS_V1',
  STORE: 'SS_STORE_V1',
};

// Notifications: register a basic handler once (no custom sound/vibration)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Minimal theme computation: builds appTheme and React Navigation theme
function useResolvedTheme(prefsTheme) {
  const systemScheme = Appearance.getColorScheme?.() || 'light';
  const resolvedScheme = prefsTheme === 'system' ? systemScheme : prefsTheme || 'light';

  const { appTheme, navTheme } = useMemo(() => {
    const isDark = resolvedScheme === 'dark';
    const base = colorsModule;
    const dark = darkOverrides || {};

    const palette = {
      background: isDark ? dark.background?.primary || '#0f172a' : base.background.primary,
      text: isDark ? dark.text?.primary || '#f8fafc' : base.text.primary,
      card: isDark ? dark.background?.secondary || '#1e293b' : base.background.secondary,
      border: isDark ? dark.border?.light || '#334155' : base.border.light,
      primary: base.primary[500],
    };

    const appThemeObj = {
      scheme: resolvedScheme,
      colors: palette,
    };

    const navThemeObj = {
      dark: isDark,
      colors: {
        primary: palette.primary,
        background: palette.background,
        card: palette.card,
        text: palette.text,
        border: palette.border,
        notification: palette.primary,
      },
    };

    return { appTheme: appThemeObj, navTheme: navThemeObj };
  }, [resolvedScheme]);

  return { colorScheme: resolvedScheme, appTheme, navTheme };
}

// Boot manager handles hydration and loading state
function BootManager() {
  const { prefs, isHydrated: userHydrated } = useUser();
  const store = useHabitsStore();
  const [isBooting, setIsBooting] = useState(true);
  const todayKeyRef = useRef(null);

  const { navTheme, colorScheme } = useResolvedTheme(prefs?.theme || 'system');

  // Fallback hydration for store if missing
  const fallbackHydrateStore = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STORE);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Expecting shape { habits:[], logs:[] }
        if (parsed && typeof parsed === 'object') {
          useHabitsStore.setState?.({
            habits: Array.isArray(parsed.habits) ? parsed.habits : [],
            logs: Array.isArray(parsed.logs) ? parsed.logs : [],
            isHydrated: true,
            isLoading: false,
          });
        } else {
          useHabitsStore.setState?.({ isHydrated: true, isLoading: false });
        }
      } else {
        useHabitsStore.setState?.({ isHydrated: true, isLoading: false });
      }
    } catch (e) {
      console.warn('Fallback store hydration failed:', e?.message || e);
      useHabitsStore.setState?.({ isHydrated: true, isLoading: false });
    }
  };

  // Boot: hydrate store once
  useEffect(() => {
    const hydrate = async () => {
      try {
        if (typeof store.hydrate === 'function') {
          await store.hydrate();
        } else {
          await fallbackHydrateStore();
        }
      } catch (e) {
        console.warn('Store hydration error:', e?.message || e);
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Precompute today key once user prefs available
  useEffect(() => {
    try {
      const tz = prefs?.timezone;
      todayKeyRef.current = getTodayKey(tz);
    } catch (e) {
      todayKeyRef.current = getTodayKey();
    }
  }, [prefs?.timezone]);

  // When both hydrated, hide splash
  useEffect(() => {
    if (userHydrated && store.isHydrated) {
      setIsBooting(false);
    }
  }, [userHydrated, store.isHydrated]);

  // Loading/Splash UI
  if (isBooting) {
    const bg = navTheme.colors.background;
    const text = navTheme.colors.text;
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: bg }]}
        accessibilityLabel="Loading Seventh Sense"
        accessible
      >
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={bg}
        />
        <ActivityIndicator size="large" color={navTheme.colors.primary} />
        <Text style={[styles.loadingText, { color: text }]}>Seventh Sense</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={navTheme.colors.background}
      />
      <NavigationContainer theme={navTheme} linking={navLinking}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

// Root App
export default function App() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <BootManager />
      </SafeAreaProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontWeight: '600',
  },
});
