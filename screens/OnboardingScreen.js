// OnboardingScreen for Seventh Sense AI Coach
// Collects user name, suggests starter habits, and sets default reminder time

import React, { useMemo, useState } from 'react';
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
import { useTheme, useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';
import { setupPermissions, scheduleDaily } from '../utils/notify';

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedHabits, setSelectedHabits] = useState(['water', 'walk', 'breathe']);
  const [reminderTime, setReminderTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  const navigation = useNavigation();
  const { prefs, setName: setUserName, setDefaultReminder, setDefaultReminderTime } = useUser();
  const addHabit = useHabitsStore(s => s.addHabit);
  
  // Starter habits configuration
  const starterHabits = [
    {
      id: 'water',
      name: 'Drink Water 2L',
      icon: 'water-outline',
      type: 'health',
      freq: 'daily',
      targetPerWeek: 7,
      description: 'Drink 2L of water daily',
    },
    {
      id: 'walk',
      name: 'Walk 10m',
      icon: 'footsteps-outline',
      type: 'health',
      freq: 'daily',
      targetPerWeek: 7,
      description: 'Take a 10-minute walk',
    },
    {
      id: 'breathe',
      name: 'Breathe 2m',
      icon: 'leaf-outline',
      type: 'mind',
      freq: 'daily',
      targetPerWeek: 7,
      description: 'Practice mindful breathing for 2 minutes',
    },
  ];
  
  // Handle habit selection toggle
  const toggleHabit = (habitId) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };
  
  // Handle time picker (simplified for MVP)
  const handleTimeChange = (newTime) => {
    setReminderTime(newTime);
  };

  const isHHmm = (v) => /^\d{2}:\d{2}$/.test(String(v || ''));
  const useCurrentTime = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setReminderTime(`${hh}:${mm}`);
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    if (selectedHabits.length === 0) {
      setError('Pick at least one to begin.');
      return;
    }
    if (reminderTime && !isHHmm(reminderTime)) {
      setError('Enter time as HH:mm (24h).');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Save user preferences
      const trimmed = name.trim();
      if (trimmed) setUserName(trimmed);
      if (reminderTime) {
        // support both current + legacy setter
        if (typeof setDefaultReminder === 'function') setDefaultReminder(reminderTime);
        else setDefaultReminderTime(reminderTime);
      }
      
      // Create selected habits
      const habitsToCreate = starterHabits.filter(habit => selectedHabits.includes(habit.id));
      const created = [];
      for (const habit of habitsToCreate) {
        const h = await addHabit({
          name: habit.name,
          type: habit.type,
          freq: 'daily',
          remindAt: reminderTime || undefined,
          createdAt: Date.now(),
        });
        created.push(h);
      }

      // Notifications: ask permission first, then schedule per habit
      if (reminderTime) {
        const granted = await setupPermissions();
        if (granted) {
          const tz = prefs?.timezone;
          for (const h of created) {
            try { await scheduleDaily(h.id, reminderTime, tz); } catch {}
          }
        }
      }

      // Navigate to main app (reset stack)
      navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render step content
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Welcome</Text>
              <Text style={styles.stepSubtitle}>
                What should we call you? (optional)
              </Text>
            </View>
            
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name (optional)"
              placeholderTextColor="#94a3b8"
              autoFocus
              autoCapitalize="words"
              accessibilityLabel="Name input field"
              accessibilityHint="Enter your name to personalize the app"
            />
            
            <TouchableOpacity
              style={[styles.nextButton]}
              onPress={() => setStep(2)}
              disabled={false}
              accessibilityRole="button"
              accessibilityLabel="Continue to next step"
              accessibilityHint="Move to habit selection step"
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        );
        
      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Choose your starter habits</Text>
              <Text style={styles.stepSubtitle}>
                We've selected some popular habits to get you started
              </Text>
            </View>
            
            <View style={styles.habitsContainer}>
              {starterHabits.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitOption,
                    selectedHabits.includes(habit.id) && styles.habitOptionSelected
                  ]}
                  onPress={() => toggleHabit(habit.id)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${habit.name} habit option`}
                  accessibilityHint={`Select or deselect ${habit.name} as a starter habit`}
                  accessibilityState={{ checked: selectedHabits.includes(habit.id) }}
                >
                  <View style={styles.habitOptionContent}>
                    <View style={[
                      styles.habitIcon,
                      { backgroundColor: selectedHabits.includes(habit.id) ? '#6366f1' : '#f1f5f9' }
                    ]}>
                      <Ionicons 
                        name={habit.icon} 
                        size={24} 
                        color={selectedHabits.includes(habit.id) ? '#ffffff' : '#64748b'} 
                      />
                    </View>
                    
                    <View style={styles.habitInfo}>
                      <Text style={[
                        styles.habitName,
                        selectedHabits.includes(habit.id) && styles.habitNameSelected
                      ]}>
                        {habit.name}
                      </Text>
                      <Text style={styles.habitDescription}>
                        {habit.description}
                      </Text>
                    </View>
                  </View>
                  
                  {selectedHabits.includes(habit.id) && (
                    <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {selectedHabits.length === 0 && (
              <Text style={styles.inlineError}>Pick at least one to begin.</Text>
            )}
            
            <View style={styles.stepButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(1)}
                accessibilityRole="button"
                accessibilityLabel="Go back to previous step"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.nextButton]}
                onPress={() => {
                  if (selectedHabits.length === 0) { setError('Pick at least one to begin.'); return; }
                  setStep(3);
                }}
                disabled={false}
                accessibilityRole="button"
                accessibilityLabel="Continue to next step"
                accessibilityHint="Move to reminder time setup step"
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Daily reminder</Text>
              <Text style={styles.stepSubtitle}>
                Set a time to get a gentle nudge. Optional.
              </Text>
            </View>
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Daily reminder at (HH:mm):</Text>
              <TextInput
                style={styles.timeInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="e.g., 07:30"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                autoCapitalize="none"
                accessibilityLabel="Reminder time input"
                accessibilityHint="Enter time as HH colon mm"
                maxLength={5}
              />
              <View style={styles.timePicker}>
                {['08:00','09:00','18:00'].map(t => (
                  <TouchableOpacity key={t} style={styles.timeButton} onPress={() => handleTimeChange(t)} accessibilityRole="button" accessibilityLabel={`Set reminder time to ${t}`}>
                    <Text style={[styles.timeButtonText, reminderTime === t && styles.timeButtonTextSelected]}>{t}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.timeButton} onPress={useCurrentTime} accessibilityRole="button" accessibilityLabel="Use current time">
                  <Text style={styles.timeButtonText}>Now</Text>
                </TouchableOpacity>
              </View>
              {error ? (<Text style={styles.inlineError}>{error}</Text>) : (<Text style={styles.timeNote}>Optional. You can set per-habit later.</Text>)}
            </View>
            
            <View style={styles.stepButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(2)}
                accessibilityRole="button"
                accessibilityLabel="Go back to previous step"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.completeButton}
                onPress={completeOnboarding}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Complete onboarding and start using the app"
              >
                <Text style={styles.completeButtonText}>{isLoading ? 'Setting up…' : 'Finish'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="sparkles" size={32} color="#6366f1" />
            </View>
            <Text style={styles.appName}>Seventh Sense</Text>
            <Text style={styles.appTagline}>AI Habit Coach</Text>
          </View>
        </View>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(step / 3) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {step} of 3
          </Text>
        </View>
        
        {/* Step content */}
        {renderStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  appTagline: {
    fontSize: 16,
    color: '#64748b',
  },
  
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  
  progressText: {
    fontSize: 14,
    color: '#64748b',
  },
  
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  
  stepHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  stepSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  nameInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#0f172a',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 32,
    textAlign: 'center',
  },
  
  habitsContainer: {
    marginBottom: 40,
  },
  
  habitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  habitOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  
  habitOptionContent: {
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
  
  habitInfo: {
    flex: 1,
  },
  
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  
  habitNameSelected: {
    color: '#6366f1',
  },
  
  habitDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  
  timeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  timeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 24,
  },
  
  timePicker: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  timeInput: {
    width: '60%',
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  
  timeButtonTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  
  timeNote: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },

  inlineError: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  stepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  
  backButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  
  nextButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  
  nextButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  completeButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#10b981',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default OnboardingScreen;
