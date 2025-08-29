// HomeScreen for Seventh Sense AI Coach
// Displays today's habits, completion status, and AI motivation

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';
import { getTodayKey } from '../utils/date';
import HabitCard from '../components/HabitCard';
import AIMessage from '../components/AIMessage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { prefs } = useUser();
  const { 
    getTodayHabits, 
    toggleCompletion, 
    isCompletedOnDate,
    isHydrated 
  } = useHabitsStore();
  
  const [todayKey, setTodayKey] = useState('');
  const [todayHabits, setTodayHabits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHabitForAI, setSelectedHabitForAI] = useState(null);
  
  // Get today's date key
  useEffect(() => {
    const today = getTodayKey(prefs.timezone);
    setTodayKey(today);
  }, [prefs.timezone]);
  
  // Load today's habits
  useEffect(() => {
    if (isHydrated && todayKey) {
      loadTodayHabits();
    }
  }, [isHydrated, todayKey]);
  
  // Load today's habits
  const loadTodayHabits = () => {
    const habits = getTodayHabits(todayKey);
    setTodayHabits(habits);
    
    // Set first habit for AI motivation if available
    if (habits.length > 0 && !selectedHabitForAI) {
      setSelectedHabitForAI(habits[0].id);
    }
  };
  
  // Handle habit completion toggle
  const handleToggleHabit = async (habitId) => {
    try {
      await toggleCompletion(habitId, todayKey);
      // Reload habits to reflect changes
      loadTodayHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };
  
  // Handle habit card press (navigate to detail)
  const handleHabitPress = (habit) => {
    navigation.navigate('HabitDetail', { 
      habitId: habit.id,
      habitName: habit.name 
    });
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await useHabitsStore.getState().hydrate();
      loadTodayHabits();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Navigate to add habit screen
  const handleAddHabit = () => {
    navigation.navigate('AddHabit');
  };
  
  // Get completion statistics
  const getCompletionStats = () => {
    if (todayHabits.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = todayHabits.filter(habit => 
      isCompletedOnDate(habit.id, todayKey)
    ).length;
    
    return {
      completed,
      total: todayHabits.length,
      percentage: Math.round((completed / todayHabits.length) * 100)
    };
  };
  
  const stats = getCompletionStats();
  
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 22) return 'Good evening';
    return 'Good night';
  };
  
  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="sparkles" size={48} color="#6366f1" />
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {getGreeting()}{prefs.name ? `, ${prefs.name}` : ''}! 👋
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        {/* Quick stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.percentage}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Habits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <Text style={styles.sectionSubtitle}>
              {stats.completed === stats.total && stats.total > 0 
                ? '🎉 All done for today!' 
                : `${stats.total - stats.completed} remaining`
              }
            </Text>
          </View>
          
          {todayHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="add-circle-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyStateTitle}>No habits for today</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add some habits to get started on your journey
              </Text>
              <TouchableOpacity
                style={styles.addHabitButton}
                onPress={handleAddHabit}
                accessibilityRole="button"
                accessibilityLabel="Add your first habit"
                accessibilityHint="Navigate to add habit screen"
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addHabitButtonText}>Add Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {todayHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completedToday={isCompletedOnDate(habit.id, todayKey)}
                  onToggle={() => handleToggleHabit(habit.id)}
                  onPress={() => handleHabitPress(habit)}
                />
              ))}
            </View>
          )}
        </View>
        
        {/* AI Motivation Section */}
        {selectedHabitForAI && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI Motivation</Text>
              <Text style={styles.sectionSubtitle}>
                Get personalized encouragement for your habits
              </Text>
            </View>
            
            <AIMessage 
              habitId={selectedHabitForAI}
              style={styles.aiMessage}
            />
          </View>
        )}
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleAddHabit}
              accessibilityRole="button"
              accessibilityLabel="Add new habit"
              accessibilityHint="Navigate to add habit screen"
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="add" size={24} color="#6366f1" />
              </View>
              <Text style={styles.quickActionText}>Add Habit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Insights')}
              accessibilityRole="button"
              accessibilityLabel="View insights and progress"
              accessibilityHint="Navigate to insights screen"
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="analytics" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.quickActionText}>View Progress</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Settings')}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              accessibilityHint="Navigate to settings screen"
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="settings" size={24} color="#64748b" />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddHabit}
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
        accessibilityHint="Quick access to add habit screen"
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  
  loadingText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
  },
  
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  headerContent: {
    marginBottom: 20,
  },
  
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  date: {
    fontSize: 16,
    color: '#64748b',
  },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 100,
  },
  
  section: {
    marginTop: 24,
  },
  
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  
  addHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  
  addHabitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  habitsList: {
    paddingHorizontal: 4,
  },
  
  aiMessage: {
    marginHorizontal: 16,
  },
  
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a',
    textAlign: 'center',
  },
  
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default HomeScreen;
