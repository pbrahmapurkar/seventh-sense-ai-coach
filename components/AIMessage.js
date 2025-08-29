// AIMessage component for Seventh Sense AI Coach
// Displays AI-generated motivation with refresh capability

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateMotivation, getTimeOfDay } from '../utils/ai';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';

const AIMessage = ({ habitId, style = {} }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { prefs } = useUser();
  const { getStreak, getHabitLogs } = useHabitsStore();
  
  // Generate motivation message
  const generateMessage = async () => {
    if (!habitId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Get habit details
      const habit = useHabitsStore.getState().habits.find(h => h.id === habitId);
      if (!habit) {
        setError('Habit not found');
        return;
      }
      
      // Get streak data
      const streak = getStreak(habitId);
      
      // Get last 3 outcomes
      const logs = getHabitLogs(habitId, 7);
      const last3Outcomes = logs.slice(0, 3).map(log => log.completed);
      
      // Get time of day
      const timeOfDay = getTimeOfDay();
      
      // Build context
      const context = {
        name: prefs.name || 'there',
        habitName: habit.name,
        streak: streak.current,
        last3Outcomes,
        timeOfDay,
        aiTone: prefs.aiTone,
      };
      
      // Generate motivation
      const motivation = await generateMotivation(context);
      setMessage(motivation);
      
    } catch (err) {
      console.error('Error generating motivation:', err);
      setError('Failed to generate motivation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate initial message on mount
  React.useEffect(() => {
    if (habitId && !message && !isLoading) {
      generateMessage();
    }
  }, [habitId]);
  
  if (!habitId) return null;
  
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={20} color="#6366f1" />
          <Text style={styles.title}>AI Motivation</Text>
        </View>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generateMessage}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Refresh motivation message"
          accessibilityHint="Generate a new AI motivation message"
        >
          {isLoading ? (
            <ActivityIndicator size={16} color="#6366f1" />
          ) : (
            <Ionicons name="refresh" size={16} color="#6366f1" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Message content */}
      <View style={styles.messageContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={20} color="#6366f1" />
            <Text style={styles.loadingText}>Generating motivation...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : message ? (
          <Text style={styles.messageText}>{message}</Text>
        ) : (
          <Text style={styles.placeholderText}>
            Tap refresh to get motivated!
          </Text>
        )}
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Seventh Sense AI
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  messageContainer: {
    minHeight: 60,
    justifyContent: 'center',
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    flex: 1,
  },
  
  messageText: {
    fontSize: 16,
    color: '#0f172a',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  
  placeholderText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  footer: {
    marginTop: 12,
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default AIMessage;
