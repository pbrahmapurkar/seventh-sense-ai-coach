// HabitDetailScreen for Seventh Sense AI Coach
// Shows habit details, history, streaks, and edit/delete options

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHabitsStore } from '../store/habitsStore';
import { getTodayKey, lastNDays, getRelativeDate } from '../utils/date';
import ProgressRing from '../components/ProgressRing';

const HabitDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { habitId } = route.params;
  
  const { 
    habits, 
    getHabitLogs, 
    getStreak, 
    updateHabit, 
    deleteHabit,
    isCompletedOnDate,
    toggleCompletion 
  } = useHabitsStore();
  
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Load habit data
  useEffect(() => {
    if (habitId) {
      loadHabitData();
    }
  }, [habitId]);
  
  // Load habit data
  const loadHabitData = () => {
    const foundHabit = habits.find(h => h.id === habitId);
    if (foundHabit) {
      setHabit(foundHabit);
      setEditData({
        name: foundHabit.name,
        type: foundHabit.type,
        freq: foundHabit.freq,
        targetPerWeek: foundHabit.targetPerWeek,
        remindAt: foundHabit.remindAt || '',
      });
      
      // Load logs and streak
      const habitLogs = getHabitLogs(habitId, 30);
      setLogs(habitLogs);
      
      const habitStreak = getStreak(habitId);
      setStreak(habitStreak);
    }
  };
  
  // Handle edit save
  const handleSaveEdit = async () => {
    if (!editData.name.trim()) {
      Alert.alert('Name Required', 'Please enter a habit name.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const updates = {
        name: editData.name.trim(),
        type: editData.type,
        freq: editData.freq,
        targetPerWeek: editData.freq === 'daily' ? 7 : editData.targetPerWeek,
        remindAt: editData.remindAt || '',
      };
      
      await updateHabit(habitId, updates);
      
      // Reload habit data
      loadHabitData();
      setIsEditing(false);
      
      Alert.alert('Success', 'Habit updated successfully!');
      
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle habit deletion
  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone and will remove all associated data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          }
        },
      ]
    );
  };
  
  // Toggle completion for a specific date
  const handleToggleDate = async (dateKey) => {
    try {
      await toggleCompletion(habitId, dateKey);
      // Reload data
      loadHabitData();
    } catch (error) {
      console.error('Error toggling completion:', error);
      Alert.alert('Error', 'Failed to update completion. Please try again.');
    }
  };
  
  // Get completion percentage for last 30 days
  const getCompletionPercentage = () => {
    if (logs.length === 0) return 0;
    const completed = logs.filter(log => log.completed).length;
    return Math.round((completed / logs.length) * 100);
  };
  
  // Get last 30 days for history view
  const getLast30Days = () => {
    const days = lastNDays(30);
    return days.map(dateKey => ({
      dateKey,
      completed: isCompletedOnDate(habitId, dateKey),
      isToday: dateKey === getTodayKey(),
    }));
  };
  
  if (!habit) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading habit details...</Text>
      </View>
    );
  }
  
  const last30Days = getLast30Days();
  const completionPercentage = getCompletionPercentage();
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.habitInfo}>
            <View style={[
              styles.habitIcon,
              { backgroundColor: getTypeColor(habit.type) + '20' }
            ]}>
              <Ionicons 
                name={getTypeIcon(habit.type)} 
                size={32} 
                color={getTypeColor(habit.type)} 
              />
            </View>
            
            <View style={styles.habitDetails}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitType}>
                {habit.type.charAt(0).toUpperCase() + habit.type.slice(1)} • {habit.freq}
              </Text>
              {habit.remindAt && (
                <View style={styles.reminderInfo}>
                  <Ionicons name="time-outline" size={16} color="#64748b" />
                  <Text style={styles.reminderText}>Reminder at {habit.remindAt}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsEditing(true)}
              accessibilityRole="button"
              accessibilityLabel="Edit habit"
            >
              <Ionicons name="create-outline" size={20} color="#6366f1" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete habit"
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ProgressRing
              size={60}
              stroke={4}
              progress={streak.current / 10}
              label={streak.current.toString()}
              color="#a855f7"
            />
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <ProgressRing
              size={60}
              stroke={4}
              progress={streak.longest / 10}
              label={streak.longest.toString()}
              color="#10b981"
            />
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <ProgressRing
              size={60}
              stroke={4}
              progress={completionPercentage / 100}
              showPercentage={true}
              color="#6366f1"
            />
            <Text style={styles.statLabel}>30-Day Completion</Text>
          </View>
        </View>
        
        {/* History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 30 Days</Text>
          <Text style={styles.sectionSubtitle}>
            Tap on a date to toggle completion
          </Text>
          
          <View style={styles.historyGrid}>
            {last30Days.map((day, index) => (
              <TouchableOpacity
                key={day.dateKey}
                style={[
                  styles.historyDay,
                  day.completed && styles.historyDayCompleted,
                  day.isToday && styles.historyDayToday
                ]}
                onPress={() => handleToggleDate(day.dateKey)}
                accessibilityRole="button"
                accessibilityLabel={`${day.dateKey}, ${day.completed ? 'completed' : 'not completed'}`}
                accessibilityHint="Tap to toggle completion for this date"
              >
                <Text style={[
                  styles.historyDayText,
                  day.completed && styles.historyDayTextCompleted,
                  day.isToday && styles.historyDayTextToday
                ]}>
                  {new Date(day.dateKey).getDate()}
                </Text>
                {day.completed && (
                  <Ionicons name="checkmark" size={12} color="#ffffff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setIsEditing(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Edit Habit</Text>
            
            <TouchableOpacity
              style={[styles.modalSaveButton, !editData.name.trim() && styles.modalSaveButtonDisabled]}
              onPress={handleSaveEdit}
              disabled={isLoading || !editData.name.trim()}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
            >
              {isLoading ? (
                <Text style={styles.modalSaveText}>Saving...</Text>
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Habit Name</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editData.name}
                onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
                placeholder="Enter habit name"
                accessibilityLabel="Habit name input field"
              />
            </View>
            
            {/* Type */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Category</Text>
              <View style={styles.modalTypeOptions}>
                {[
                  { key: 'health', label: 'Health', icon: 'fitness-outline' },
                  { key: 'mind', label: 'Mind', icon: 'brain-outline' },
                  { key: 'custom', label: 'Custom', icon: 'star-outline' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.modalTypeOption,
                      editData.type === type.key && styles.modalTypeOptionSelected,
                      { borderColor: getTypeColor(type.key) }
                    ]}
                    onPress={() => setEditData(prev => ({ ...prev, type: type.key }))}
                    accessibilityRole="radio"
                    accessibilityLabel={`${type.label} category option`}
                    accessibilityState={{ checked: editData.type === type.key }}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={20} 
                      color={editData.type === type.key ? getTypeColor(type.key) : '#64748b'} 
                    />
                    <Text style={[
                      styles.modalTypeLabel,
                      editData.type === type.key && { color: getTypeColor(type.key) }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Frequency */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Frequency</Text>
              <View style={styles.modalFrequencyOptions}>
                {[
                  { key: 'daily', label: 'Daily' },
                  { key: 'weekly', label: 'Weekly' },
                  { key: 'custom', label: 'Custom' },
                ].map((freq) => (
                  <TouchableOpacity
                    key={freq.key}
                    style={[
                      styles.modalFrequencyOption,
                      editData.freq === freq.key && styles.modalFrequencyOptionSelected
                    ]}
                    onPress={() => setEditData(prev => ({ ...prev, freq: freq.key }))}
                    accessibilityRole="radio"
                    accessibilityLabel={`${freq.label} frequency option`}
                    accessibilityState={{ checked: editData.freq === freq.key }}
                  >
                    <Text style={[
                      styles.modalFrequencyLabel,
                      editData.freq === freq.key && styles.modalFrequencyLabelSelected
                    ]}>
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Target Per Week */}
            {(editData.freq === 'weekly' || editData.freq === 'custom') && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Target per week</Text>
                <View style={styles.modalTargetOptions}>
                  {[3, 4, 5, 6, 7].map((target) => (
                    <TouchableOpacity
                      key={target}
                      style={[
                        styles.modalTargetOption,
                        editData.targetPerWeek === target && styles.modalTargetOptionSelected
                      ]}
                      onPress={() => setEditData(prev => ({ ...prev, targetPerWeek: target }))}
                      accessibilityRole="radio"
                      accessibilityLabel={`${target} times per week option`}
                      accessibilityState={{ checked: editData.targetPerWeek === target }}
                    >
                      <Text style={[
                        styles.modalTargetText,
                        editData.targetPerWeek === target && styles.modalTargetTextSelected
                      ]}>
                        {target}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Reminder */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Daily Reminder</Text>
              <View style={styles.modalReminderOptions}>
                <TouchableOpacity
                  style={[
                    styles.modalReminderOption,
                    !editData.remindAt && styles.modalReminderOptionSelected
                  ]}
                  onPress={() => setEditData(prev => ({ ...prev, remindAt: '' }))}
                  accessibilityRole="radio"
                  accessibilityLabel="No reminder option"
                  accessibilityState={{ checked: !editData.remindAt }}
                >
                  <Ionicons 
                    name="notifications-off-outline" 
                    size={16} 
                    color={!editData.remindAt ? '#6366f1' : '#64748b'} 
                  />
                  <Text style={[
                    styles.modalReminderText,
                    !editData.remindAt && styles.modalReminderTextSelected
                  ]}>
                    No reminder
                  </Text>
                </TouchableOpacity>
                
                {['08:00', '09:00', '10:00', '12:00', '15:00', '18:00'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.modalReminderOption,
                      editData.remindAt === time && styles.modalReminderOptionSelected
                    ]}
                    onPress={() => setEditData(prev => ({ ...prev, remindAt: time }))}
                    accessibilityRole="radio"
                    accessibilityLabel={`${time} reminder time option`}
                    accessibilityState={{ checked: editData.remindAt === time }}
                  >
                    <Ionicons 
                      name="time-outline" 
                      size={16} 
                      color={editData.remindAt === time ? '#6366f1' : '#64748b'} 
                    />
                    <Text style={[
                      styles.modalReminderText,
                      editData.remindAt === time && styles.modalReminderTextSelected
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// Helper functions
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  
  scrollView: {
    flex: 1,
  },
  
  headerCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  habitIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  habitDetails: {
    flex: 1,
  },
  
  habitName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  habitType: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  reminderText: {
    fontSize: 14,
    color: '#64748b',
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  
  deleteButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  
  deleteButtonText: {
    color: '#ef4444',
  },
  
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
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
  
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  historyDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  historyDayCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  
  historyDayToday: {
    borderColor: '#6366f1',
    borderWidth: 3,
  },
  
  historyDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  
  historyDayTextCompleted: {
    color: '#ffffff',
  },
  
  historyDayTextToday: {
    color: '#6366f1',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6366f1',
    borderRadius: 12,
  },
  
  modalSaveButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  modalContent: {
    flex: 1,
    padding: 20,
  },
  
  modalSection: {
    marginBottom: 24,
  },
  
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  
  modalTextInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  modalTypeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  modalTypeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  
  modalTypeOptionSelected: {
    backgroundColor: '#f8fafc',
  },
  
  modalTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 8,
  },
  
  modalFrequencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  modalFrequencyOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  modalFrequencyOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  
  modalFrequencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  
  modalFrequencyLabelSelected: {
    color: '#6366f1',
  },
  
  modalTargetOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  modalTargetOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  modalTargetOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  
  modalTargetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  
  modalTargetTextSelected: {
    color: '#6366f1',
  },
  
  modalReminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  modalReminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  
  modalReminderOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  
  modalReminderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  
  modalReminderTextSelected: {
    color: '#6366f1',
  },
});

export default HabitDetailScreen;
