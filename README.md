# FitFlow (WorkoutApp)

> Mindful, adaptive 20-minute daily movement designed for lifelong joint health, stamina, and consistency. 100% offline and privacy-first.

---

## Overview

FitFlow is a React Native mobile application built on **Expo SDK 57** that guides users through a balanced, daily 20-minute home movement routine. Every session adheres strictly to a **1,200-second (20:00) duration invariant**, divided into five scientifically sequenced phases:

1. **Warm-Up & Mobility (3:00)** — Joint prep, dynamic reaches, and spinal lubrication.
2. **Foundation Strength (6:00)** — Controlled bodyweight resistance with tailored work/rest ratios.
3. **Aerobic Capacity (4:30)** — Steady, joint-friendly cardio intervals.
4. **Core Stability (3:30)** — Low-back support and anti-rotational stability.
5. **Cooldown & Breathing (3:00)** — Parasympathetic nervous system reset and stretching.

---

## Key Features

* **Adaptive Joint & Movement Customization:**
  * **Low Impact:** Zero jumping, gentle marching, and soft landings.
  * **Standing Only:** Swaps all floor exercises (planks, bridges, dead bugs) for standing variations for small spaces or limited floor mobility.
  * **Knee-Friendly:** Substitutes deep lunges with lateral weight shifts and balance taps.
  * **Age-Adaptive Progression:** Users aged 55+ automatically receive extra recovery breathing intervals between work sets; users 65+ default to joint-friendly standing variations.
* **Smart Video & Audio HUD:**
  * Offline MP4 video demonstrations with upcoming exercise previews during rest intervals.
  * 5-second countdown audio beeps and tactile haptic pulses so users never need to watch the screen continuously.
  * Ambient instrumental background music that ducks smoothly when audio beeps trigger.
  * 44pt+ touch targets for effortless pause, skip, and volume control mid-movement.
* **Habit & Progress Tracking:**
  * Local streak tracker calculated against distinct local calendar dates.
  * Post-workout Rate of Perceived Exertion (RPE) feedback that adapts future recovery intervals.
  * 4-week progression stats showing total active minutes, completion rate, and interval work-to-rest ratios.
* **Configurable Local Reminders:**
  * Daily workout notifications scheduled with customizable time presets (7:30 AM, 12:30 PM, 6:00 PM, 8:30 PM) via local Android/iOS alarms.
* **100% Offline & Private:**
  * Zero user accounts, zero cloud servers, zero advertisements, and zero third-party telemetry.
  * Data portability: Full JSON journal backup/export and one-tap local data erasure.

---

## Tech Stack & Architecture

* **Framework:** [React Native 0.86](https://reactnative.dev/) with [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
* **Language:** TypeScript 6
* **Navigation:** React Navigation v7 (Bottom Tabs)
* **Media & Sensory:**
  * `expo-video` for hardware-accelerated looping workout demonstrations
  * `expo-audio` for countdown sound beeps and ambient background music
  * `expo-haptics` for tactile interval transitions
  * `expo-notifications` for local daily reminders
* **Storage:** `@react-native-async-storage/async-storage` (device-sandboxed)
* **Design System:** Custom semantic design tokens (`src/components/ui.tsx`) adhering to the *Impeccable* UI standards (single elevation declarations, high contrast, tabular numerals).

---

## Directory Structure

```text
├── assets/                  # Icons, splash art, audio soundbites, and 26 exercise video MP4s
├── src/
│   ├── components/
│   │   └── ui.tsx           # Cohesive design system components and semantic tokens
│   ├── data/
│   │   ├── exerciseVideos.ts # Exercise video asset mapping
│   │   └── workoutData.ts   # 20-minute routine builder, phase generator, and age adaptations
│   ├── lib/
│   │   ├── AppState.tsx     # Global state context (profile, sessions, export, wipe)
│   │   ├── notifications.ts # Local notification scheduling and permissions
│   │   ├── stats.ts         # Streak calculation, calendar grouping, validation
│   │   ├── storage.ts       # Sandboxed local storage operations
│   │   └── timer.ts         # High-precision interval workout timer
│   ├── screens/
│   │   ├── HomeScreen.tsx   # Today's workout card, week strip, routine overview
│   │   ├── WorkoutScreen.tsx# Active workout HUD, video player, audio/haptic controls
│   │   ├── CompleteWorkoutScreen.tsx # Session summary, streak counter, RPE feedback
│   │   ├── ProgressScreen.tsx# 4-week statistics, KPI cards, session history
│   │   ├── ProfileScreen.tsx # User settings, reminders, sensory toggles, data backup/reset
│   │   └── OnboardingScreen.tsx # First-run goal, level, and joint customization
│   └── types/
│       └── workout.ts       # Core TypeScript domain models and presets
├── tests/
│   └── core.cjs             # Node.js built-in test suite (20-min invariant, timer, streaks)
├── app.json                 # Expo SDK 57 app configuration & hardened permissions
├── eas.json                 # Expo Application Services build configuration
├── GOOGLE_PLAY_STORE.md     # Production release guide, Data Safety answers, store listing
└── PRIVACY_POLICY.md        # Comprehensive offline-first privacy policy
```

---

## Getting Started

### Prerequisites
* Node.js 18+ (tested on Node.js 24)
* npm 9+
* Expo Go app on iOS or Android (for development) or an Android Emulator

### Installation
```bash
git clone https://github.com/gideon/WorkoutApp.git
cd WorkoutApp
npm install
```

### Starting Development Server
```bash
# Start Expo development server (LAN / Local)
npx expo start

# Start with tunnel mode (useful for remote physical devices)
npx expo start --tunnel -c
```

Scan the QR code in the terminal with the **Expo Go** app on Android or the Camera app on iOS.

---

## Quality & Verification

Run the automated test suite and typechecks before committing or releasing:

```bash
# TypeScript compiler type check
npm run typecheck

# Core invariant unit test suite (runs in ~240ms)
npm test

# Verify Expo project configuration and dependency compatibility
npx expo-doctor
```

---

## Production & Google Play Store Release

Refer to [`GOOGLE_PLAY_STORE.md`](./GOOGLE_PLAY_STORE.md) for full submission copy, asset guidelines, and Google Play Data Safety answers.

### Building for Android with EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build production Android App Bundle (.aab)
eas build --platform android --profile production

# Build local preview APK (for manual device testing)
eas build --platform android --profile preview
```

---

## Security & Privacy Guarantee

* **Sandboxed Storage:** All user data is restricted to the operating system's private application sandbox.
* **No Unnecessary Permissions:** The dangerous `RECORD_AUDIO` permission has been stripped from the native manifest via the `expo-audio` config plugin. Only `VIBRATE` and `POST_NOTIFICATIONS` are requested.
* **Full Data Ownership:** Users can export their entire history as a JSON file or wipe all data with one tap in Settings.
* Review the full [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md) for details.

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
