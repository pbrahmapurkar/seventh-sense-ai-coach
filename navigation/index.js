// Seventh Sense - Navigation
// Root stack with onboarding + authenticated tabs. Home stack lives inside tabs.

import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// User context
import { useUser } from '../context/UserContext';

// Route name constants
export const ROUTES = {
  ONBOARDING_STACK: 'Onboarding',
  APP_TABS: 'AppTabs',
  HOME: 'Home',
  ADD_HABIT: 'AddHabit',
  HABIT_DETAIL: 'HabitDetail',
  TAB_HOME: 'TabHome',
  TAB_INSIGHTS: 'TabInsights',
  TAB_SETTINGS: 'TabSettings',
};

/**
 * @typedef {Object} HomeStackParamList
 * @property {undefined} Home
 * @property {{ prefillName?: string } | undefined} AddHabit
 * @property {{ id: string }} HabitDetail
 */

/**
 * @typedef {Object} TabsParamList
 * @property {undefined} TabHome
 * @property {undefined} TabInsights
 * @property {undefined} TabSettings
 */

/**
 * @typedef {Object} RootStackParamList
 * @property {undefined} Onboarding
 * @property {undefined} AppTabs
 */

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// Home stack navigator
function HomeStackNavigator() {
  const theme = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerTintColor: theme.colors.text,
        headerStyle: { backgroundColor: theme.colors.card || theme.colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <HomeStack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          title: 'Seventh Sense',
          headerLargeTitle: Platform.OS === 'ios',
          headerBackVisible: false,
        }}
      />
      <HomeStack.Screen
        name={ROUTES.ADD_HABIT}
        component={AddHabitScreen}
        options={{ title: 'Add Habit' }}
      />
      <HomeStack.Screen
        name={ROUTES.HABIT_DETAIL}
        component={HabitDetailScreen}
        options={{ title: 'Habit' }}
      />
    </HomeStack.Navigator>
  );
}

// Tabs navigator
function AppTabsNavigator() {
  const theme = useTheme();
  const active = theme.colors.primary;
  const inactive = `${theme.colors.text}99`; // ~60% opacity hex suffix
  const tabBg = theme.colors.card || theme.colors.background;

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        headerTintColor: theme.colors.text,
        headerStyle: { backgroundColor: theme.colors.card || theme.colors.background },
        headerShadowVisible: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: { backgroundColor: tabBg },
        tabBarLabelStyle: { includeFontPadding: false },
        tabBarIcon: ({ color, size }) => {
          let name = 'home';
          switch (route.name) {
            case ROUTES.TAB_HOME:
              name = 'home';
              break;
            case ROUTES.TAB_INSIGHTS:
              name = 'bar-chart-2';
              break;
            case ROUTES.TAB_SETTINGS:
              name = 'settings';
              break;
          }
          return <Feather name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name={ROUTES.TAB_HOME}
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name={ROUTES.TAB_INSIGHTS}
        component={InsightsScreen}
        options={{
          title: 'Insights',
          tabBarAccessibilityLabel: 'Insights tab',
        }}
      />
      <Tabs.Screen
        name={ROUTES.TAB_SETTINGS}
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tabs.Navigator>
  );
}

// Linking configuration (optional)
export const linking = {
  prefixes: ['seventh-sense://', 'https://seventhsense.app'],
  config: {
    screens: {
      [ROUTES.APP_TABS]: {
        screens: {
          [ROUTES.TAB_HOME]: {
            screens: {
              [ROUTES.HOME]: 'home',
              [ROUTES.HABIT_DETAIL]: 'habit/:id',
            },
          },
          [ROUTES.TAB_INSIGHTS]: 'insights',
          [ROUTES.TAB_SETTINGS]: 'settings',
        },
      },
      [ROUTES.ONBOARDING_STACK]: 'onboarding',
    },
  },
};

// Root app navigator
function AppNavigator() {
  const { prefs, isHydrated } = useUser();
  const hasCompletedOnboarding = Boolean(prefs?.name);

  return (
    <RootStack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      {!hasCompletedOnboarding ? (
        <RootStack.Screen
          name={ROUTES.ONBOARDING_STACK}
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <RootStack.Screen
          name={ROUTES.APP_TABS}
          component={AppTabsNavigator}
          options={{ headerShown: false }}
        />
      )}
    </RootStack.Navigator>
  );
}

export default AppNavigator;
