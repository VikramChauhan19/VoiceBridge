# Voice Bridge

Voice Bridge is a production-focused React Native app built with Expo and Firebase to support communication for deaf and mute users.

## Features

- Speech-to-text with voice input controls
- Text-to-speech with Hindi and English output
- Real-time chat powered by Firebase Firestore
- Accessibility-first UI with large touch targets
- Professional tab-based interface (Bridge, Chat, Settings)

## Tech Stack

- React Native + Expo Router
- Firebase Firestore
- i18next + react-i18next (English + Hindi)
- Zustand for app-level state
- `expo-speech` for voice output

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add Firebase config values in `app.json` under `expo.extra`:
   - `firebaseApiKey`
   - `firebaseAuthDomain`
   - `firebaseProjectId`
   - `firebaseStorageBucket`
   - `firebaseMessagingSenderId`
   - `firebaseAppId`
3. Start the app:
   ```bash
   npx expo start
   ```

## Project Structure

- `app/` route definitions (tabs)
- `src/config/` environment + Firebase setup
- `src/features/voice/` speech-to-text and text-to-speech modules
- `src/features/chat/` Firestore chat hooks/services/screens
- `src/features/settings/` accessibility and app status screen
- `src/shared/components/` reusable UI components
- `src/localization/` i18n resources and setup

## Production Notes

- Configure Firestore rules before deployment.
- For best speech recognition reliability, use an EAS development build.
- Add crash/error tracking (e.g. Sentry) and analytics for production telemetry.
