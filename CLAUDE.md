# Unsub

Subscription tracking app — helps users manage and cancel unwanted subscriptions.

## Stack

- **Framework:** Expo SDK 54 + React Native 0.81
- **Router:** expo-router (file-based routing)
- **State:** AsyncStorage (local persistence)
- **Monetisation:** RevenueCat (react-native-purchases)
- **Notifications:** expo-notifications
- **UI:** Dark mode, custom components (no UI library)

## Project Structure

- `app/` — Routes (tabs, onboarding, trial, paywall, help, privacy)
- `src/components/` — Reusable UI components
- `src/data/` — Data models and storage
- `src/hooks/` — Custom React hooks
- `src/utils/` — Utility functions

## Commands

- `npx expo start` — Dev server
- `npx expo start --android` — Android
- `npx expo start --ios` — iOS

## Git

- Remote: https://github.com/thomasthumb1989-blip/Unsub.git
- After code changes, prompt: "Want me to commit?"
- After committing, prompt: "Want me to push?"
- Never commit or push without explicit user approval.
