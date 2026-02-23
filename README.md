# Gym Sweat & Tears 💪

A comprehensive fitness tracking app built with React Native and Expo that helps you create, manage, and track your workout routines with AI-powered workout generation.

## Overview

Gym Sweat & Tears is a modern mobile application designed to streamline your fitness journey. Whether you're a beginner looking to start your fitness journey or an experienced athlete wanting to optimize your training, this app provides the tools you need to achieve your goals.

The app features an intuitive interface for tracking workouts, managing exercise routines, and monitoring your progress over time. With AI-powered workout generation, you can get personalized training programs tailored to your specific goals, experience level, and available equipment.

## Key Features

### 🎯 **AI-Powered Workout Generation**
- Get personalized workout programs based on your fitness goals
- Customize training frequency, experience level, and time constraints
- Receive exercise recommendations with proper form videos
- Safety-focused modifications for physical limitations

### 📊 **Comprehensive Workout Tracking**
- Track sets, reps, and rest periods in real-time
- Monitor workout progress and completion rates
- View detailed exercise history and performance trends
- Session management with pause/resume functionality

### 🗓️ **Smart Scheduling System**
- Schedule workouts for specific days of the week
- Automatic workout rotation and progression tracking
- Today's workout recommendations and next workout preview
- Flexible workout rescheduling

### 📱 **Modern Mobile Experience**
- Beautiful, responsive UI with dark/light theme support
- Smooth animations and haptic feedback
- Offline-first design with local SQLite database
- Cross-platform compatibility (iOS, Android, Web)

### 📈 **Progress Analytics**
- Weekly and monthly workout statistics
- Exercise performance tracking
- Workout completion rates and consistency metrics
- Visual progress indicators and achievements

## Tech Stack

- **Framework**: React Native 0.81 + Expo 54 + React 19
- **Navigation**: Expo Router with file-based routing (typed routes)
- **State Management**: TanStack React Query + React Context
- **Database**: SQLite via expo-sqlite
- **Charts**: Victory Native + @shopify/react-native-skia
- **AI Integration**: Google Gemini AI for workout generation
- **UI Components**: Custom themed components with React Native
- **Testing**: Jest with React Testing Library
- **Code Quality**: ESLint 9 (flat config), Prettier, Husky + lint-staged
- **Build & Deploy**: EAS Build (development, preview, production profiles)

## Getting Started

### Prerequisites

- Node.js v22.14.0 (see `.nvmrc`)
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-sweat-tears
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - **iOS Simulator**: Press `i` in the terminal or scan the QR code with Expo Go
   - **Android Emulator**: Press `a` in the terminal
   - **Web**: Press `w` in the terminal
   - **Physical Device**: Scan the QR code with the Expo Go app

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator
- `npm run web` - Start on web browser
- `npm run lint` - Run ESLint for code quality
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run format` - Format code with Prettier

### Environment Setup

The app uses local SQLite storage, so no additional environment variables are required for basic functionality. However, if you want to use the AI workout generation feature, you'll need to configure the Google Gemini API key in your environment.

#### Setting up Gemini API Key

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key

2. **Configure the API Key**:
   - Create a `.env.local` file in the root directory
   - Add your API key: `EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here`

**Note**: The AI workout generation feature requires a valid Gemini API key to function. Without it, you can still use all other features of the app including manual workout creation and tracking.

## Project Structure

```
gym-sweat-tears/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (tabs)/            # Tab navigation (home, workouts, history, analytics, settings)
│   ├── workout.tsx        # Active workout session
│   ├── workout-editor.tsx # Workout creation/editing
│   └── workout-preview.tsx # Workout preview before starting
├── components/            # React components organized by feature
│   ├── ui/               # Base UI components
│   ├── home/             # Home screen components
│   ├── workout/          # Workout session components
│   ├── workout-editor/   # Workout creation (AI + manual)
│   ├── workout-preview/  # Workout preview components
│   ├── history/          # History screen components
│   ├── analytics/        # Chart components (PR, weight, frequency)
│   └── settings/         # Settings screen components
├── database/             # SQLite database layer
│   ├── services/         # CRUD operations per entity
│   ├── schema.ts         # Table definitions
│   └── types.ts          # TypeScript interfaces
├── hooks/                # Custom React hooks
│   └── service/          # React Query wrappers for DB services
├── contexts/             # React Context providers (Settings, WorkoutTimer)
├── services/             # External APIs (Gemini AI, YouTube verification)
├── validation/           # Zod validation schemas
├── constants/            # Colors, theme values
└── assets/               # Fonts and images
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to start your fitness journey?** 🏋️‍♂️ Get started with Gym Sweat & Tears today!



Step-by-Step Publishing Guide

  Prerequisites

  npm install -g eas-cli
  eas login

  ---
  iOS — Apple App Store

  1. Apple Developer Program
  - Enroll at developer.apple.com ($99/year)
  - Note your Team ID from Membership page

  2. App Store Connect
  - Go to appstoreconnect.apple.com → My Apps → +
  - Fill in: name, primary language, bundle ID (com.its-john.gymsweattears), SKU (anything unique, e.g. gymsweattears-001)
  - Note the App ID (numeric) from the app's page URL

  3. Update eas.json — fill in your real values:
  "appleId": "you@email.com",
  "ascAppId": "1234567890",   ← the numeric App Store Connect App ID
  "appleTeamId": "XXXXXXXXXX" ← from Apple Developer Membership

  4. Build & submit:
  eas build --platform ios --profile production
  eas submit --platform ios --profile production

  5. In App Store Connect — complete the listing:
  - Screenshots (required: 6.7" iPhone + 12.9" iPad if tablet is enabled)
  - Description, keywords, category (Health & Fitness)
  - Privacy policy URL (required — must host one publicly)
  - Age rating questionnaire
  - Submit for review (~1-3 days)

  ---
  Android — Google Play Store

  1. Google Play Console
  - Register at play.google.com/console ($25 one-time)
  - Create app → name, default language, app/game, free/paid

  2. Service Account for automated submission
  - In Play Console → Setup → API access → link to a Google Cloud project
  - Create a service account with Release Manager role
  - Download the JSON key → save as google-service-account.json in project root (already gitignored)

  3. Build & submit:
  eas build --platform android --profile production
  eas submit --platform android --profile production
  This submits to the internal test track first (safe — not public). You can promote to production from the Play Console.

  4. Complete the Play Console listing:
  - Store listing: description, screenshots, feature graphic (1024×500px)
  - Privacy policy URL (same one as iOS is fine)
  - Content rating questionnaire
  - Target audience
  - Promote from Internal → Production when ready

  ---
  Privacy Policy (Required by Both Stores)

  Since the app uses an AI API (Gemini), you must have a privacy policy. The easiest free options:
  - Host a page on GitHub Pages or Notion (make it public)
  - Use a generator like privacypolicygenerator.info

  The policy needs to mention: data you collect, third-party APIs used (Google Gemini), and that no personal health data is sold.

  ---
  Build Both Platforms at Once

  eas build --platform all --profile production

  Then submit each separately once builds complete.