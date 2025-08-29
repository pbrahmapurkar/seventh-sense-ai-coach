// User Context for Seventh Sense AI Coach
// Manages user preferences, theme, and settings

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setEveningRecapEnabled } from '../utils/notify';

// User preferences interface
export const UserPrefs = {
  name: '',
  timezone: '',
  aiTone: 'coach', // 'coach' | 'friend' | 'zen'
  theme: 'system', // 'system' | 'light' | 'dark'
  defaultReminderTime: '09:00',
  eveningRecapEnabled: false,
};

// Context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [prefs, setPrefs] = useState(UserPrefs);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load preferences from storage
  useEffect(() => {
    loadPreferences();
  }, []);

  // Load preferences from AsyncStorage
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      
      const storedPrefs = await AsyncStorage.getItem('user_preferences');
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs);
        
        // Merge with defaults to handle missing properties
        const mergedPrefs = { ...UserPrefs, ...parsedPrefs };
        
        // Set timezone if not already set
        if (!mergedPrefs.timezone) {
          mergedPrefs.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        
        setPrefs(mergedPrefs);
        
        // Update evening recap setting
        if (mergedPrefs.eveningRecapEnabled) {
          await setEveningRecapEnabled(true);
        }
      } else {
        // Set default timezone
        const defaultPrefs = {
          ...UserPrefs,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        setPrefs(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      // Set defaults on error
      const defaultPrefs = {
        ...UserPrefs,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      setPrefs(defaultPrefs);
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  };

  // Save preferences to storage (debounced)
  const savePreferences = async (newPrefs) => {
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  // Debounced save function
  let saveTimeout;
  const debouncedSave = (newPrefs) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => savePreferences(newPrefs), 1000);
  };

  // Update preferences
  const updatePrefs = (updates) => {
    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);
    debouncedSave(newPrefs);
  };

  // Individual preference setters
  const setName = (name) => updatePrefs({ name });
  const setTheme = (theme) => updatePrefs({ theme });
  const setAiTone = (aiTone) => updatePrefs({ aiTone });
  const setDefaultReminderTime = (defaultReminderTime) => updatePrefs({ defaultReminderTime });
  
  const toggleEveningRecap = async (enabled) => {
    updatePrefs({ eveningRecapEnabled: enabled });
    await setEveningRecapEnabled(enabled);
  };

  // Get current theme (resolves system theme)
  const getCurrentTheme = () => {
    if (prefs.theme === 'system') {
      // For now, default to light. In production, you'd use a proper theme detection
      return 'light';
    }
    return prefs.theme;
  };

  // Check if dark mode is active
  const isDarkMode = () => getCurrentTheme() === 'dark';

  // Context value
  const value = {
    prefs,
    isLoading,
    isHydrated,
    setName,
    setTheme,
    setAiTone,
    setDefaultReminderTime,
    toggleEveningRecap,
    getCurrentTheme,
    isDarkMode,
    updatePrefs,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Export default
export default UserContext;
