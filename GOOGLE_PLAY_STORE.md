# Google Play Store Release & Submission Guide

This document contains everything required to publish **FitFlow** to the Google Play Store, including exact store listing copy, graphic asset specifications, Data Safety form answers, content rating guidance, and production build instructions.

---

## 1. Store Listing Metadata

### App Title
* **Title (max 30 chars):** `FitFlow: 20-Min Workout` *(23 characters)*

### Short Description
* **Short Description (max 80 chars):**  
  `Guided 20-minute daily home workouts tailored to your joints, pace, and goals.` *(79 characters)*

### Full Description (max 4,000 chars)
```markdown
Build a consistent, lifelong movement habit in just 20 minutes a day.

FitFlow provides structured, full-body daily movement designed around your personal fitness level, joint comfort, and daily pace. Whether you are getting back into movement, building strength, or maintaining joint mobility, every session is timed to an exact 20-minute window (1,200 seconds) so you always know what to expect.

★ EXACT 20-MINUTE WORKOUT ARCHITECTURE
Every workout follows a scientifically balanced 5-phase structure:
1. Warm-Up & Joint Prep (3:00) — Dynamic arm reaches, torso twists, and hip openers to lubricate joints and raise core temperature.
2. Foundation Strength (6:00) — Bodyweight movements to strengthen the lower body, core, and posture with built-in recovery intervals.
3. Aerobic Capacity & Rhythm (4:30) — Gentle, steady-state cardio to boost daily stamina and heart health without excessive fatigue.
4. Core & Active Stability (3:30) — Targeted abdominal and spinal stability work to support lower-back comfort.
5. Cooldown & Breathing (3:00) — Gentle stretches, child’s pose, and guided parasympathetic breathing to reset your nervous system.

★ TAILORED TO YOUR BODY & JOINTS
* Low-Impact Mode: Zero jumping, soft steps, and controlled motions that protect feet, ankles, and knees.
* Standing-Only Mode: Swaps all floor exercises (planks, bridges, dead bugs) for upright standing variations—ideal for small spaces or limited floor mobility.
* Knee-Friendly Mode: Replaces deep lunges and squats with gentle lateral weight shifts and heel taps.
* Age-Adaptive Pacing: Users aged 55+ automatically receive extended recovery breathing intervals between work sets; users 65+ default to joint-friendly standing progressions.

★ REAL-TIME GUIDED HUD
* Clear looping video demonstrations with alternative exercise previews during rest periods.
* 5-second audio countdown beeps and optional haptic vibration pulses so you can move without staring at the screen.
* Ambient instrumental background music that automatically ducks when countdown beeps play.
* Large, accessible HUD buttons (44pt+ touch targets) for effortless pause, skip, and volume control mid-movement.

★ TRUE OFFLINE PRIVACY
* Zero accounts or passwords required.
* 100% offline: All video clips, timer logic, and journal history live directly on your phone.
* Zero cloud tracking, zero advertising identifiers, and zero third-party analytics.
* You own your data: Export your complete workout history as a JSON backup or erase it completely with one tap.

★ SUSTAINABLE PROGRESS JOURNAL
* Automatic streak tracking calculated against your local calendar day.
* Rate of Perceived Exertion (RPE) feedback after each session dynamically calibrates future recovery ratios.
* Comprehensive 4-week progression stats showing total active minutes, completion rate, and interval work-to-rest ratios.

★ YOUTUBE VIDEO TUTORIALS & COMMUNITY
* Direct one-tap links to detailed form breakdowns and technique guides on our official YouTube channel (@FitFlowWorld).
* Connect with our community, ask form questions, and request future routines.

★ MEDICAL & SAFETY NOTICE
FitFlow is intended for general fitness and wellness guidance and does not provide medical diagnoses or treatment. Always consult a physician or healthcare professional before beginning any new exercise regimen.

Start your daily 20 minutes today with FitFlow.
```

---

## 2. Store Categorization & Tags

* **Application Category:** Health & Fitness (`APPLICATION / HEALTH_AND_FITNESS`)
* **Tags (up to 5 in Play Console):**
  1. Fitness
  2. Workout
  3. Home Workout
  4. Exercise
  5. Calisthenics

---

## 3. Graphic & Media Assets Specifications

Prepare the following assets and upload them in **Google Play Console > Grow > Store presence > Main store listing**:

| Asset | Dimensions | Format | Requirements |
| :--- | :--- | :--- | :--- |
| **App Icon** | 512 x 512 px | 32-bit PNG | Max 1024 KB. No transparent background. (Use `./assets/icon.png`) |
| **Feature Graphic** | 1024 x 500 px | JPEG or 24-bit PNG | Max 15 MB. No transparency. Displays on Google Play banner. |
| **Phone Screenshots** | 1080 x 1920 px or 1080 x 2400 px | PNG or JPEG | Minimum 2 screenshots; 4–8 recommended. 16:9 or 19.5:9 aspect ratio. |
| **Tablet Screenshots (7" & 10")** | 1200 x 1920 px or 2048 x 1536 px | PNG or JPEG | Recommended to enable tablet discovery. |

### Recommended Screenshot Sequence
1. **Screen 1 (Home Screen):** "Your Daily 20-Minute Routine" (Show Today's workout card, 5-phase breakdown, and active adaptations).
2. **Screen 2 (Workout Player HUD):** "Real-Time Guided Video Player" (Show exercise video, countdown ring, rest intervals, and volume controls).
3. **Screen 3 (Joint Adaptations):** "Move Without Strain" (Show Low Impact, Standing Only, and Knee-Friendly toggles).
4. **Screen 4 (Progress Journal):** "Celebrate Every Step" (Show 3-column stats, 4-week progression, and session history).
5. **Screen 5 (Privacy & Offline):** "100% On-Device & Private" (Show zero account requirement, offline availability, and data export).

---

## 4. Google Play Data Safety Section Form Answers

Google Play strictly requires filling out the **Data safety** questionnaire in the Console. Follow these exact answers:

### Overview Questions
1. **Does your app collect or share any of the required user data types?**  
   👉 **Select: No**  
   *(FitFlow stores all profile and workout history strictly locally on the user's device via `AsyncStorage`. No data is ever transmitted off the device).*
2. **Is all of the user data collected by your app encrypted in transit?**  
   👉 **Select: Not applicable** *(No data is transmitted over the internet).*
3. **Do you provide a way for users to request that their data is deleted?**  
   👉 **Select: Yes**  
   *(Users can erase all stored data anytime in Settings via "Reset all app data", or by uninstalling the app).*

### Privacy Policy URL
* Google Play requires a public URL to your privacy policy.
* Publish `PRIVACY_POLICY.md` to GitHub Pages, a GitHub Gist, or your domain (e.g., `https://gideon.github.io/WorkoutApp/privacy-policy.html` or `https://fitflow.app/privacy`).
* Paste the public URL into **Google Play Console > Policy and programs > App content > Privacy policy**.

---

## 5. Content Rating Questionnaire (IARC)

Complete the IARC questionnaire under **App content > Content rating**:

* **Category:** Utility, Productivity, Communication, or Other (or Health & Fitness).
* **Violence:** No
* **Sexuality / Nudity:** No
* **Profanity / Crude Humor:** No
* **Controlled Substances:** No
* **User-Generated Content / Sharing:** No
* **Physical Location Sharing:** No
* **Digital Goods / In-App Purchases:** No
* **Resulting Rating:** **PEGI 3 / ESRB Everyone / USK 0** (universal audience rating).

---

## 6. Permissions & Manifest Compliance

The Android manifest produced by Expo SDK 57 has been verified and hardened:

* `android.permission.VIBRATE` (Standard normal permission, no user prompt required).
* `android.permission.POST_NOTIFICATIONS` (Standard runtime permission on Android 13+).
* **`android.permission.RECORD_AUDIO`:** **STRIPPED.** The `expo-audio` config plugin in `app.json` has `recordAudioAndroid: false` and `microphonePermission: false`. FitFlow will never trigger audio-recording policy violations on Google Play.

---

## 7. Production Build with EAS (Expo Application Services)

### Step 1: Install & Authenticate EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Step 2: Configure Project ID
If not already initialized, link your Expo project:
```bash
eas project:init
```

### Step 3: Run Production Build (Generates `.aab`)
Google Play requires an **Android App Bundle (`.aab`)** for production releases:
```bash
eas build --platform android --profile production
```
EAS will:
1. Automatically generate and securely manage your production Android keystore.
2. Compile native Android binaries targeting API 35 (Android 15).
3. Produce an optimized, signed `.aab` file ready for direct upload to Google Play Console.

### Step 4: Build a Local Preview APK (For Direct Device Testing)
To test a standalone production-like release build directly on your Android phone before uploading:
```bash
eas build --platform android --profile preview
```
Download the resulting `.apk` link to your Android device to verify video playback, countdown audio beeps, and offline navigation in release mode.

---

## 8. Google Play Console Release Checklist

1. [ ] Create application in [Google Play Console](https://play.google.com/console).
2. [ ] Set App Name: `FitFlow: 20-Min Workout`.
3. [ ] Complete **App Content** sections:
   - [ ] Privacy Policy URL.
   - [ ] Ads: Declare **No, my app does not contain ads**.
   - [ ] App Access: Declare **All functionality is available without special access**.
   - [ ] Content Rating: Complete IARC questionnaire (rating: Everyone).
   - [ ] Target Audience: 18 and over / 13+.
   - [ ] News Apps: No.
   - [ ] COVID-19 tracing/status: No.
   - [ ] Data Safety: Submit questionnaire as detailed in Section 4.
   - [ ] Government Apps: No.
   - [ ] Financial Features: No.
   - [ ] Health Apps: Declare general fitness / non-medical.
4. [ ] Upload Store Listing Graphic Assets (512x512 icon, 1024x500 banner, phone screenshots).
5. [ ] Create a release in **Testing > Internal testing**.
6. [ ] Upload the signed `.aab` generated by `eas build`.
7. [ ] Invite internal testers (or test yourself) to confirm smooth installation.
8. [ ] Promote to **Production** and submit for review.
