// SettingsScreen for Seventh Sense AI Coach
// Manages user preferences, data export/import, and app settings

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Switch,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useHabitsStore } from '../store/habitsStore';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { 
    prefs, 
    setName, 
    setTheme, 
    setAiTone, 
    setDefaultReminderTime, 
    toggleEveningRecap,
    isDarkMode 
  } = useUser();
  
  const { habits, logs, reset: resetStore } = useHabitsStore();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(prefs.name);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle name edit
  const handleNameEdit = () => {
    if (editName.trim()) {
      setName(editName.trim());
      setIsEditingName(false);
    } else {
      Alert.alert('Name Required', 'Please enter a valid name.');
    }
  };
  
  // Export data
  const handleExportData = async () => {
    try {
      setIsLoading(true);
      
      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        user: prefs,
        habits: habits,
        logs: logs,
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `seventh-sense-backup-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Seventh Sense Data',
        });
      } else {
        Alert.alert(
          'Export Complete',
          `Data exported to: ${fileUri}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Import data
  const handleImportData = async () => {
    try {
      setIsLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const importData = JSON.parse(fileContent);
      
      // Validate import data
      if (!importData.version || !importData.habits || !importData.logs) {
        throw new Error('Invalid backup file format');
      }
      
      // Confirm import
      Alert.alert(
        'Confirm Import',
        `This will import ${importData.habits.length} habits and ${importData.logs.length} logs. This action will replace your current data. Are you sure?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                // Reset current store
                resetStore();
                
                // Import new data
                if (importData.user) {
                  // Update user preferences
                  Object.keys(importData.user).forEach(key => {
                    if (key in prefs) {
                      // Update individual preferences
                      switch (key) {
                        case 'name':
                          setName(importData.user[key]);
                          break;
                        case 'theme':
                          setTheme(importData.user[key]);
                          break;
                        case 'aiTone':
                          setAiTone(importData.user[key]);
                          break;
                        case 'defaultReminderTime':
                          setDefaultReminderTime(importData.user[key]);
                          break;
                        case 'eveningRecapEnabled':
                          toggleEveningRecap(importData.user[key]);
                          break;
                      }
                    }
                  });
                }
                
                // Import habits and logs
                if (importData.habits) {
                  useHabitsStore.getState().setHabits(importData.habits);
                }
                if (importData.logs) {
                  useHabitsStore.getState().setLogs(importData.logs);
                }
                
                Alert.alert('Import Complete', 'Your data has been imported successfully!');
                
              } catch (error) {
                console.error('Error during import:', error);
                Alert.alert('Import Failed', 'Failed to import data. Please try again.');
              }
            },
          },
        ]
      );
      
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Import Failed', 'Failed to import data. Please check the file format and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset all data
  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your habits, logs, and settings. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              resetStore();
              // Reset user preferences to defaults
              setName('');
              setTheme('system');
              setAiTone('coach');
              setDefaultReminderTime('09:00');
              toggleEveningRecap(false);
              
              Alert.alert('Reset Complete', 'All data has been reset. You will be redirected to onboarding.');
              // Navigation will automatically handle going back to onboarding
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Reset Failed', 'Failed to reset data. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  // Get theme display name
  const getThemeDisplayName = (theme) => {
    switch (theme) {
      case 'system':
        return 'System Default';
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System Default';
    }
  };
  
  // Get AI tone display name
  const getAiToneDisplayName = (tone) => {
    switch (tone) {
      case 'coach':
        return 'Motivational Coach';
      case 'friend':
        return 'Supportive Friend';
      case 'zen':
        return 'Mindful Guide';
      default:
        return 'Motivational Coach';
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your Seventh Sense experience
          </Text>
        </View>
        
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="person-outline" size={20} color="#6366f1" />
              <Text style={styles.settingLabel}>Name</Text>
            </View>
            
            {isEditingName ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  autoFocus
                  accessibilityLabel="Name input field"
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleNameEdit}
                  accessibilityRole="button"
                  accessibilityLabel="Save name"
                >
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.settingValue}
                onPress={() => setIsEditingName(true)}
                accessibilityRole="button"
                accessibilityLabel="Edit name"
              >
                <Text style={styles.settingValueText}>
                  {prefs.name || 'Not set'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="color-palette-outline" size={20} color="#8b5cf6" />
              <Text style={styles.settingLabel}>Theme</Text>
            </View>
            
            <TouchableOpacity
              style={styles.settingValue}
              onPress={() => {
                const themes = ['system', 'light', 'dark'];
                const currentIndex = themes.indexOf(prefs.theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                setTheme(nextTheme);
              }}
              accessibilityRole="button"
              accessibilityLabel="Change theme"
            >
              <Text style={styles.settingValueText}>
                {getThemeDisplayName(prefs.theme)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* AI Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Coach</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="sparkles-outline" size={20} color="#f59e0b" />
              <Text style={styles.settingLabel}>AI Tone</Text>
            </View>
            
            <TouchableOpacity
              style={styles.settingValue}
              onPress={() => {
                const tones = ['coach', 'friend', 'zen'];
                const currentIndex = tones.indexOf(prefs.aiTone);
                const nextTone = tones[(currentIndex + 1) % tones.length];
                setAiTone(nextTone);
              }}
              accessibilityRole="button"
              accessibilityLabel="Change AI tone"
            >
              <Text style={styles.settingValueText}>
                {getAiToneDisplayName(prefs.aiTone)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="time-outline" size={20} color="#10b981" />
              <Text style={styles.settingLabel}>Default Reminder Time</Text>
            </View>
            
            <TouchableOpacity
              style={styles.settingValue}
              onPress={() => {
                const times = ['08:00', '09:00', '10:00', '12:00', '15:00', '18:00'];
                const currentIndex = times.indexOf(prefs.defaultReminderTime);
                const nextTime = times[(currentIndex + 1) % times.length];
                setDefaultReminderTime(nextTime);
              }}
              accessibilityRole="button"
              accessibilityLabel="Change default reminder time"
            >
              <Text style={styles.settingValueText}>
                {prefs.defaultReminderTime}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={20} color="#6366f1" />
              <Text style={styles.settingLabel}>Evening Recap Notifications</Text>
              <Text style={styles.settingDescription}>
                Get a daily reminder to check in on your habits
              </Text>
            </View>
            
            <Switch
              value={prefs.eveningRecapEnabled}
              onValueChange={toggleEveningRecap}
              trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
              thumbColor="#ffffff"
              accessibilityRole="switch"
              accessibilityLabel="Toggle evening recap notifications"
            />
          </View>
        </View>
        
        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Export your data"
            accessibilityHint="Export all habits, logs, and settings to a JSON file"
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="download-outline" size={20} color="#10b981" />
              <Text style={styles.actionButtonText}>Export Data</Text>
            </View>
            {isLoading && (
              <Text style={styles.loadingText}>Exporting...</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImportData}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Import data from backup"
            accessibilityHint="Import habits, logs, and settings from a backup file"
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="upload-outline" size={20} color="#6366f1" />
              <Text style={styles.actionButtonText}>Import Data</Text>
            </View>
            {isLoading && (
              <Text style={styles.loadingText}>Importing...</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleResetData}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Reset all data"
            accessibilityHint="Permanently delete all habits, logs, and settings"
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.actionButtonText, styles.dangerText]}>Reset All Data</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Habits</Text>
            <Text style={styles.infoValue}>{habits.length}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Logs</Text>
            <Text style={styles.infoValue}>{logs.length}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Storage</Text>
            <Text style={styles.infoValue}>Local (Device)</Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by Seventh Sense AI Coach
          </Text>
          <Text style={styles.footerSubtext}>
            Your data stays on your device
          </Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16,
  },
  
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  settingValueText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  editInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    minWidth: 120,
  },
  
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  
  dangerButton: {
    borderWidth: 2,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  
  dangerText: {
    color: '#ef4444',
  },
  
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  footerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default SettingsScreen;
