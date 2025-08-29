# Seventh Sense AI Coach

A production-ready Expo (managed) React Native app for building and tracking habits with AI-powered motivation. Built with local-first storage and a pluggable AI provider architecture.

## 🚀 Features

- **Habit Management**: Create, edit, and track daily/weekly/custom habits
- **AI Motivation**: Get personalized encouragement based on your progress and preferences
- **Progress Tracking**: Visual progress rings, streaks, and completion statistics
- **Smart Notifications**: Local notifications with quiet hours support
- **Data Export/Import**: Backup and restore your habit data
- **Local-First**: All data stored locally on your device
- **Accessibility**: Full accessibility support with proper labels and hints

## 🛠 Tech Stack

- **Framework**: Expo SDK (managed workflow)
- **Navigation**: React Navigation v6 (Stack + Tab)
- **State Management**: Zustand (lightweight store)
- **Storage**: AsyncStorage (local persistence)
- **Notifications**: Expo Notifications (local only)
- **Charts**: Custom SVG progress rings (no heavy libraries)
- **TypeScript**: Used in utility files for type safety

## 📱 Screens

1. **Onboarding**: Name input, starter habits selection, reminder setup
2. **Home**: Today's habits, quick completion, AI motivation
3. **Add Habit**: Form to create new habits with type and frequency
4. **Habit Detail**: History view, streak tracking, edit/delete
5. **Insights**: Progress statistics, habit overview, tips
6. **Settings**: User preferences, data management, app info

## 🏗 Project Structure

```
seventh-sense-ai-coach/
├── App.js                    # Main app entry point
├── navigation/               # Navigation configuration
│   └── index.js             # Stack + Tab navigators
├── context/                  # React Context providers
│   └── UserContext.js       # User preferences & settings
├── store/                    # State management
│   └── habitsStore.js       # Zustand store for habits & logs
├── utils/                    # Utility functions
│   ├── date.ts              # Date operations & streak logic
│   ├── ai.ts                # AI motivation & provider shims
│   └── notify.ts            # Notification management
├── screens/                  # App screens
│   ├── OnboardingScreen.js  # User onboarding flow
│   ├── HomeScreen.js        # Main dashboard
│   ├── AddHabitScreen.js    # Habit creation form
│   ├── HabitDetailScreen.js # Habit details & editing
│   ├── InsightsScreen.js    # Progress analytics
│   └── SettingsScreen.js    # App settings & data management
├── components/               # Reusable components
│   ├── HabitCard.js         # Individual habit display
│   ├── AIMessage.js         # AI motivation display
│   └── ProgressRing.js      # SVG progress visualization
└── theme/                    # Design system
    ├── colors.js            # Color palette & tokens
    └── typography.js        # Typography scale & weights
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd seventh-sense-ai-coach
   npm install
   ```

2. **Install additional dependencies:**
   ```bash
   npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-safe-area-context react-native-screens @react-native-async-storage/async-storage expo-notifications zustand expo-sharing expo-file-system expo-document-picker
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## 📊 Data Models

### Habit
```typescript
{
  id: string;
  name: string;
  icon?: string;
  type: 'health' | 'mind' | 'custom';
  freq: 'daily' | 'weekly' | 'custom';
  targetPerWeek?: number;
  remindAt?: string;        // "HH:mm"
  createdAt: number;
  archived?: boolean;
}
```

### Log
```typescript
{
  id: string;
  habitId: string;
  date: string;             // "YYYY-MM-DD"
  completed: boolean;
  note?: string;
  createdAt: number;
}
```

### UserPrefs
```typescript
{
  name?: string;
  timezone: string;
  aiTone: 'coach' | 'friend' | 'zen';
  theme: 'system' | 'light' | 'dark';
  defaultReminderTime: string;
  eveningRecapEnabled: boolean;
}
```

## 🔧 Configuration

### AI Provider Setup

The app includes a pluggable AI provider system. By default, it uses on-device templates, but you can easily integrate with external APIs:

```typescript
// In utils/ai.ts
import { setAIProvider, openAIProvider } from './ai';

// Enable OpenAI integration
setAIProvider(openAIProvider);
```

### Notification Settings

- **Quiet Hours**: 22:00 - 07:00 (notifications automatically shift to 07:05)
- **Evening Recap**: Optional daily check-in at 20:30
- **Permission**: Requested during onboarding

## 🎨 Design System

### Colors
- **Primary**: Indigo (#6366f1) - Main brand color
- **Secondary**: Violet (#8b5cf6) - Accent color
- **Success**: Green (#10b981) - Completion states
- **Warning**: Amber (#f59e0b) - Pending states
- **Error**: Red (#ef4444) - Error states

### Typography
- **Scale**: 12px to 48px with consistent ratios
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line Heights**: Optimized for readability (1.4-1.6)

## 📱 Platform Support

- **iOS**: 13.0+ (Expo SDK 53)
- **Android**: 6.0+ (API level 23)
- **Web**: Not supported (mobile-first design)

## 🔒 Privacy & Security

- **Local Storage**: All data stays on your device
- **No Backend**: No external servers or data collection
- **Export Control**: Full control over your data export/import
- **Permissions**: Only notification permissions requested

## 🚧 Development Notes

### State Management
- **Zustand**: Lightweight alternative to Redux
- **Persistence**: Automatic AsyncStorage sync with debouncing
- **Hydration**: Store loads from storage on app start

### Performance
- **Lazy Loading**: Screens load only when needed
- **Debounced Persistence**: Storage writes are optimized
- **SVG Components**: Lightweight progress visualizations

### Accessibility
- **Labels**: All interactive elements have accessibility labels
- **Hints**: Contextual help for complex interactions
- **Font Scaling**: Supports system font size preferences

## 🔮 Future Enhancements

- **Cloud Sync**: Optional Firebase/backend integration
- **Advanced AI**: OpenAI/Claude API integration
- **Social Features**: Habit sharing and accountability
- **Analytics**: Detailed progress insights and trends
- **Widgets**: iOS/Android home screen widgets
- **Dark Mode**: Full dark theme support

## 🐛 Troubleshooting

### Common Issues

1. **Navigation not working**: Ensure all navigation dependencies are installed
2. **Notifications not showing**: Check device notification permissions
3. **Data not persisting**: Verify AsyncStorage is working correctly
4. **Build errors**: Clear Metro cache with `npx expo start --clear`

### Debug Mode

Enable debug logging by setting environment variables:
```bash
export EXPO_DEBUG=true
export EXPO_LOGS=true
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code comments for implementation details

---

**Built with ❤️ for habit building and personal growth**
