// InsightsScreen for Seventh Sense AI Coach
// Shows habit statistics, streaks, and progress over time

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHabitsStore } from '../store/habitsStore';
import { getTodayKey, lastNDays } from '../utils/date';
import ProgressRing from '../components/ProgressRing';

const InsightsScreen = () => {
  const navigation = useNavigation();
  const { 
    habits, 
    getCompletionPercentage, 
    getStreak,
    isHydrated 
  } = useHabitsStore();
  
  const [stats, setStats] = useState({
    sevenDay: 0,
    thirtyDay: 0,
  });
  const [habitStats, setHabitStats] = useState([]);
  
  // Load insights data
  useEffect(() => {
    if (isHydrated) {
      loadInsights();
    }
  }, [isHydrated]);
  
  // Load insights data
  const loadInsights = () => {
    const today = getTodayKey();
    const sevenDaysAgo = lastNDays(7)[0];
    const thirtyDaysAgo = lastNDays(30)[0];
    
    // Calculate completion percentages
    const sevenDayPercentage = getCompletionPercentage(sevenDaysAgo, today);
    const thirtyDayPercentage = getCompletionPercentage(thirtyDaysAgo, today);
    
    setStats({
      sevenDay: sevenDayPercentage,
      thirtyDay: thirtyDayPercentage,
    });
    
    // Calculate individual habit stats
    const activeHabits = habits.filter(h => !h.archived);
    const habitStatsData = activeHabits.map(habit => {
      const streak = getStreak(habit.id);
      return {
        ...habit,
        streak: streak.current,
        longestStreak: streak.longest,
      };
    }).sort((a, b) => b.streak - a.streak);
    
    setHabitStats(habitStatsData);
  };
  
  // Navigate to habit detail
  const handleHabitPress = (habit) => {
    navigation.navigate('HabitDetail', { 
      habitId: habit.id,
      habitName: habit.name 
    });
  };
  
  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'health':
        return '#10b981';
      case 'mind':
        return '#8b5cf6';
      default:
        return '#6366f1';
    }
  };
  
  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'health':
        return 'fitness-outline';
      case 'mind':
        return 'brain-outline';
      default:
        return 'star-outline';
    }
  };
  
  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics-outline" size={48} color="#6366f1" />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>
            Track your progress and celebrate your achievements
          </Text>
        </View>
        
        {/* Overall Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          
          <View style={styles.progressCards}>
            <View style={styles.progressCard}>
              <ProgressRing
                size={80}
                stroke={6}
                progress={stats.sevenDay / 100}
                showPercentage={true}
                color="#6366f1"
              />
              <Text style={styles.progressLabel}>7 Days</Text>
              <Text style={styles.progressSubtitle}>This week</Text>
            </View>
            
            <View style={styles.progressCard}>
              <ProgressRing
                size={80}
                stroke={6}
                progress={stats.thirtyDay / 100}
                showPercentage={true}
                color="#10b981"
              />
              <Text style={styles.progressLabel}>30 Days</Text>
              <Text style={styles.progressSubtitle}>This month</Text>
            </View>
          </View>
        </View>
        
        {/* Habits Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habits Overview</Text>
          
          {habitStats.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="add-circle-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyStateTitle}>No habits yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add some habits to start tracking your progress
              </Text>
              <TouchableOpacity
                style={styles.addHabitButton}
                onPress={() => navigation.navigate('AddHabit')}
                accessibilityRole="button"
                accessibilityLabel="Add your first habit"
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addHabitButtonText}>Add Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {habitStats.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={styles.habitCard}
                  onPress={() => handleHabitPress(habit)}
                  accessibilityRole="button"
                  accessibilityLabel={`${habit.name} habit, current streak ${habit.streak} days`}
                  accessibilityHint="Tap to view detailed habit information"
                >
                  {/* Left: Icon and Info */}
                  <View style={styles.habitInfo}>
                    <View style={[
                      styles.habitIcon,
                      { backgroundColor: getTypeColor(habit.type) + '20' }
                    ]}>
                      <Ionicons 
                        name={getTypeIcon(habit.type)} 
                        size={24} 
                        color={getTypeColor(habit.type)} 
                      />
                    </View>
                    
                    <View style={styles.habitDetails}>
                      <Text style={styles.habitName}>{habit.name}</Text>
                      <Text style={styles.habitType}>
                        {habit.type.charAt(0).toUpperCase() + habit.type.slice(1)} • {habit.freq}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Right: Streak Info */}
                  <View style={styles.streakInfo}>
                    <View style={styles.currentStreak}>
                      <Text style={styles.streakNumber}>{habit.streak}</Text>
                      <Text style={styles.streakLabel}>Current</Text>
                    </View>
                    
                    <View style={styles.longestStreak}>
                      <Text style={styles.streakNumber}>{habit.longestStreak}</Text>
                      <Text style={styles.streakLabel}>Longest</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Quick Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          
          <View style={styles.quickStats}>
            <View style={styles.quickStatCard}>
              <Ionicons name="flame-outline" size={24} color="#f59e0b" />
              <Text style={styles.quickStatNumber}>
                {habitStats.reduce((sum, h) => sum + h.streak, 0)}
              </Text>
              <Text style={styles.quickStatLabel}>Total Streak Days</Text>
            </View>
            
            <View style={styles.quickStatCard}>
              <Ionicons name="trophy-outline" size={24} color="#8b5cf6" />
              <Text style={styles.quickStatNumber}>
                {habitStats.reduce((max, h) => Math.max(max, h.longestStreak), 0)}
              </Text>
              <Text style={styles.quickStatLabel}>Best Streak</Text>
            </View>
            
            <View style={styles.quickStatCard}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
              <Text style={styles.quickStatNumber}>
                {habitStats.filter(h => h.streak > 0).length}
              </Text>
              <Text style={styles.quickStatLabel}>Active Habits</Text>
            </View>
          </View>
        </View>
        
        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          
          <View style={styles.tipsList}>
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb-outline" size={20} color="#6366f1" />
              </View>
              <Text style={styles.tipText}>
                Start with small, achievable habits to build momentum
              </Text>
            </View>
            
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="time-outline" size={20} color="#10b981" />
              </View>
              <Text style={styles.tipText}>
                Consistency beats perfection - focus on showing up every day
              </Text>
            </View>
            
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="trending-up-outline" size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.tipText}>
                Track your progress to stay motivated and identify patterns
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 20,
  },
  
  progressCards: {
    flexDirection: 'row',
    gap: 16,
  },
  
  progressCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  progressLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 4,
  },
  
  progressSubtitle: {
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
    gap: 12,
  },
  
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  habitDetails: {
    flex: 1,
  },
  
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  habitType: {
    fontSize: 14,
    color: '#64748b',
  },
  
  streakInfo: {
    alignItems: 'flex-end',
  },
  
  currentStreak: {
    alignItems: 'center',
    marginBottom: 8,
  },
  
  longestStreak: {
    alignItems: 'center',
  },
  
  streakNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  
  streakLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8,
    marginBottom: 4,
  },
  
  quickStatLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  tipsList: {
    gap: 12,
  },
  
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },
});

export default InsightsScreen;
