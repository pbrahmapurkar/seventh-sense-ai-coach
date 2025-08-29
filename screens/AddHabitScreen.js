// AddHabitScreen for Seventh Sense AI Coach
// Form to create new habits with type, frequency, and reminder settings

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHabitsStore } from '../store/habitsStore';
import { useUser } from '../context/UserContext';

const AddHabitScreen = () => {
  const navigation = useNavigation();
  const { addHabit } = useHabitsStore();
  const { prefs } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'health',
    freq: 'daily',
    targetPerWeek: 7,
    remindAt: prefs.defaultReminderTime || '09:00',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Update form field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Name Required', 'Please enter a habit name.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const newHabit = {
        name: formData.name.trim(),
        type: formData.type,
        freq: formData.freq,
        targetPerWeek: formData.freq === 'daily' ? 7 : formData.targetPerWeek,
        remindAt: formData.remindAt || '',
      };
      
      await addHabit(newHabit);
      
      Alert.alert(
        'Success!', 
        `"${newHabit.name}" has been added to your habits.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel form
  const handleCancel = () => {
    if (formData.name.trim()) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this habit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  // Get icon for habit type
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
  
  // Get color for habit type
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
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add New Habit</Text>
          <Text style={styles.subtitle}>
            Create a habit that fits your lifestyle and goals
          </Text>
        </View>
        
        {/* Habit Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habit Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            placeholder="e.g., Drink water, Read, Exercise"
            placeholderTextColor="#94a3b8"
            autoFocus
            accessibilityLabel="Habit name input field"
            accessibilityHint="Enter the name of your new habit"
          />
        </View>
        
        {/* Habit Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.typeOptions}>
            {[
              { key: 'health', label: 'Health', icon: 'fitness-outline' },
              { key: 'mind', label: 'Mind', icon: 'brain-outline' },
              { key: 'custom', label: 'Custom', icon: 'star-outline' },
            ].map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeOption,
                  formData.type === type.key && styles.typeOptionSelected,
                  { borderColor: getTypeColor(type.key) }
                ]}
                onPress={() => updateField('type', type.key)}
                accessibilityRole="radio"
                accessibilityLabel={`${type.label} category option`}
                accessibilityState={{ checked: formData.type === type.key }}
              >
                <Ionicons 
                  name={type.icon} 
                  size={24} 
                  color={formData.type === type.key ? getTypeColor(type.key) : '#64748b'} 
                />
                <Text style={[
                  styles.typeLabel,
                  formData.type === type.key && { color: getTypeColor(type.key) }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.frequencyOptions}>
            {[
              { key: 'daily', label: 'Daily', description: 'Every day' },
              { key: 'weekly', label: 'Weekly', description: 'Specific days' },
              { key: 'custom', label: 'Custom', description: 'Set your own target' },
            ].map((freq) => (
              <TouchableOpacity
                key={freq.key}
                style={[
                  styles.frequencyOption,
                  formData.freq === freq.key && styles.frequencyOptionSelected
                ]}
                onPress={() => updateField('freq', freq.key)}
                accessibilityRole="radio"
                accessibilityLabel={`${freq.label} frequency option`}
                accessibilityState={{ checked: formData.freq === freq.key }}
              >
                <View style={styles.frequencyContent}>
                  <Text style={[
                    styles.frequencyLabel,
                    formData.freq === freq.key && styles.frequencyLabelSelected
                  ]}>
                    {freq.label}
                  </Text>
                  <Text style={styles.frequencyDescription}>
                    {freq.description}
                  </Text>
                </View>
                {formData.freq === freq.key && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Target Per Week (for weekly/custom) */}
        {(formData.freq === 'weekly' || formData.freq === 'custom') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {formData.freq === 'weekly' ? 'Days per week' : 'Target per week'}
            </Text>
            <View style={styles.targetOptions}>
              {[3, 4, 5, 6, 7].map((target) => (
                <TouchableOpacity
                  key={target}
                  style={[
                    styles.targetOption,
                    formData.targetPerWeek === target && styles.targetOptionSelected
                  ]}
                  onPress={() => updateField('targetPerWeek', target)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${target} times per week option`}
                  accessibilityState={{ checked: formData.targetPerWeek === target }}
                >
                  <Text style={[
                    styles.targetText,
                    formData.targetPerWeek === target && styles.targetTextSelected
                  ]}>
                    {target}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Reminder Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminder (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            When would you like to be reminded about this habit?
          </Text>
          
          <View style={styles.reminderOptions}>
            <TouchableOpacity
              style={[
                styles.reminderOption,
                !formData.remindAt && styles.reminderOptionSelected
              ]}
              onPress={() => updateField('remindAt', '')}
              accessibilityRole="radio"
              accessibilityLabel="No reminder option"
              accessibilityState={{ checked: !formData.remindAt }}
            >
              <Ionicons 
                name="notifications-off-outline" 
                size={20} 
                color={!formData.remindAt ? '#6366f1' : '#64748b'} 
              />
              <Text style={[
                styles.reminderText,
                !formData.remindAt && styles.reminderTextSelected
              ]}>
                No reminder
              </Text>
            </TouchableOpacity>
            
            {['08:00', '09:00', '10:00', '12:00', '15:00', '18:00'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.reminderOption,
                  formData.remindAt === time && styles.reminderOptionSelected
                ]}
                onPress={() => updateField('remindAt', time)}
                accessibilityRole="radio"
                accessibilityLabel={`${time} reminder time option`}
                accessibilityState={{ checked: formData.remindAt === time }}
              >
                <Ionicons 
                  name="time-outline" 
                  size={20} 
                  color={formData.remindAt === time ? '#6366f1' : '#64748b'} 
                />
                <Text style={[
                  styles.reminderText,
                  formData.remindAt === time && styles.reminderTextSelected
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Cancel adding habit"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, !formData.name.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || !formData.name.trim()}
            accessibilityRole="button"
            accessibilityLabel="Create new habit"
            accessibilityHint="Submit the form to create your new habit"
          >
            {isLoading ? (
              <Text style={styles.submitButtonText}>Creating...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Create Habit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 40,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  
  title: {
    fontSize: 28,
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
    paddingHorizontal: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  textInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  typeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  typeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  
  typeOptionSelected: {
    backgroundColor: '#f8fafc',
  },
  
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 8,
  },
  
  frequencyOptions: {
    gap: 12,
  },
  
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  frequencyOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  
  frequencyContent: {
    flex: 1,
  },
  
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  frequencyLabelSelected: {
    color: '#6366f1',
  },
  
  frequencyDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  
  targetOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  targetOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  targetOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  
  targetText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  
  targetTextSelected: {
    color: '#6366f1',
  },
  
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  
  reminderOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  
  reminderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  
  reminderTextSelected: {
    color: '#6366f1',
  },
  
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginTop: 16,
  },
  
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  
  submitButton: {
    flex: 2,
    height: 56,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default AddHabitScreen;
