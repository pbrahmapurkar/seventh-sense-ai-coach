// Seventh Sense AI Coach - Main App
// Integrates navigation, providers, and theme management

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProvider } from './context/UserContext';
import { useUser } from './context/UserContext';
import { useHabitsStore } from './store/habitsStore';
import Navigation from './navigation';
import { configureNotifications } from './utils/notify';

// App wrapper component
const AppWrapper = () => {
  const { isHydrated: userHydrated } = useUser();
  const { isHydrated: storeHydrated, hydrate: hydrateStore } = useHabitsStore();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Configure notifications
        configureNotifications();
        
        // Hydrate store
        await hydrateStore();
        
        // Wait for both contexts to be hydrated
        if (userHydrated && storeHydrated) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [userHydrated, storeHydrated]);

  // Show loading screen while hydrating
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        
        <View style={styles.loadingContent}>
          <View style={styles.logo}>
            <Ionicons name="sparkles" size={48} color="#6366f1" />
          </View>
          
          <Text style={styles.appName}>Seventh Sense</Text>
          <Text style={styles.appTagline}>AI Habit Coach</Text>
          
          <View style={styles.loadingIndicator}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#6366f1" />
            <Text style={styles.loadingText}>Loading your habits...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Navigation />
    </>
  );
};

// Main App component
export default function App() {
  return (
    <UserProvider>
      <AppWrapper />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingContent: {
    alignItems: 'center',
  },
  
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  
  appTagline: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 48,
  },
  
  loadingIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
  },
});
