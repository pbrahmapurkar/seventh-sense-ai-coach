// HabitCard component for Seventh Sense AI Coach
// Displays habit information with completion toggle and progress

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressRing from './ProgressRing';

const HabitCard = ({ 
  habit, 
  completedToday, 
  onToggle, 
  onPress,
  style = {}
}) => {
  const { name, icon, remindAt, type } = habit;
  
  // Get icon based on habit type or custom icon
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'health':
        return 'fitness-outline';
      case 'mind':
        return 'brain-outline';
      default:
        return 'star-outline';
    }
  };
  
  // Get type color
  const getTypeColor = () => {
    switch (type) {
      case 'health':
        return '#10b981'; // Green
      case 'mind':
        return '#8b5cf6'; // Purple
      default:
        return '#6366f1'; // Indigo
    }
  };
  
  // Get progress value (1 if completed, 0 if not)
  const progress = completedToday ? 1 : 0;
  
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      onLongPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${name} habit, ${completedToday ? 'completed' : 'not completed'} today`}
      accessibilityHint="Tap to toggle completion, long press for details"
    >
      {/* Left: Icon */}
      <View style={[styles.iconContainer, { backgroundColor: getTypeColor() + '20' }]}>
        <Ionicons 
          name={getIcon()} 
          size={24} 
          color={getTypeColor()} 
        />
      </View>
      
      {/* Middle: Name and reminder info */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        
        {remindAt && (
          <View style={styles.reminderContainer}>
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text style={styles.reminderText}>
              {remindAt}
            </Text>
          </View>
        )}
      </View>
      
      {/* Right: Progress ring and toggle */}
      <View style={styles.rightSection}>
        <ProgressRing
          size={40}
          stroke={3}
          progress={progress}
          color={completedToday ? '#10b981' : '#6366f1'}
          backgroundColor="#e2e8f0"
        />
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            completedToday && styles.toggleButtonCompleted
          ]}
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={completedToday ? 'Mark as incomplete' : 'Mark as complete'}
          accessibilityHint="Toggle habit completion for today"
        >
          <Ionicons 
            name={completedToday ? 'checkmark' : 'add'} 
            size={20} 
            color={completedToday ? '#ffffff' : '#6366f1'} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  reminderText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  
  rightSection: {
    alignItems: 'center',
    gap: 8,
  },
  
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  toggleButtonCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
});

export default HabitCard;
