# FitFlow Privacy Policy

**Effective Date:** October 10, 2026  
**Last Updated:** October 10, 2026

FitFlow ("we", "our", or "the app") is designed with a strict **offline-first, privacy-by-default** philosophy. We believe your physical health, movement habits, and personal profile are entirely your own business.

---

## 1. Information We Do NOT Collect

FitFlow does **not** collect, transmit, sell, or monetize your personal data. Specifically:

* **No Account Required:** You do not need to register with an email address, phone number, username, or password.
* **No Cloud Telemetry or Analytics:** We do not include third-party tracking SDKs (e.g., Google Analytics, Firebase Analytics, Mixpanel, Adjust, AppsFlyer).
* **No Advertisements:** FitFlow contains zero advertising networks and zero advertising identifiers (no Google Advertising ID / GAID collection).
* **No Server Storage:** We do not operate remote servers that log or store your workout sessions.
* **No Audio or Video Recording:** While the app plays workout demonstration videos and audio countdown beeps, it does not record your microphone, camera, or surroundings.

---

## 2. Information Stored Locally on Your Device

All information used by the app remains exclusively in your device's private, sandboxed local application storage (`AsyncStorage`):

| Data Type | Description & Purpose | Storage Location |
| :--- | :--- | :--- |
| **User Profile** | Your selected fitness goal, fitness level, age (optional), and joint adaptation toggles (low impact, standing-only, knee-friendly). Used solely by the on-device algorithm to calculate interval durations and select exercise variations. | Local sandboxed storage |
| **Workout Journal** | Timestamp, duration, completion status, skipped intervals, and optional effort feedback (RPE). Used solely to render your personal streak and journal history on your device. | Local sandboxed storage |
| **Preferences** | Countdown sound beeps, ambient music volume/toggle, tactile haptic pulses, and preferred daily reminder notification time. | Local sandboxed storage |

---

## 3. Device Permissions & Why They Are Used

FitFlow requests the minimum permissions necessary to deliver standard timer and workout functionality:

* **Vibration (`android.permission.VIBRATE`):**  
  Used to trigger tactile haptic pulses when workout intervals transition (e.g., moving from an active exercise to rest) and when a 20-minute workout finishes.
* **Post Notifications (`android.permission.POST_NOTIFICATIONS`):**  
  Used only on Android 13+ (API 33+) if you explicitly choose to turn on daily workout reminders. Notifications are scheduled **locally on your device** via the Android alarm manager. No notification tokens or remote push messages are ever sent to a server.
* **Microphone / Audio Recording (`android.permission.RECORD_AUDIO`):**  
  **Explicitly stripped and disabled.** FitFlow only plays audio; it never listens or records.

---

## 4. Data Control, Export, and Deletion

In compliance with Google Play Data Safety policies, GDPR, and CCPA:

* **Data Export:** You can export your entire workout journal and profile as a standard JSON file at any time by going to **Settings > Data & backups > Backup & export journal (JSON)**.
* **Instant Data Erasure:** You can permanently delete all workout history, current streaks, and profile preferences at any time by going to **Settings > Data & backups > Reset all app data**. This instantly purges all local storage keys.
* **Uninstalling the App:** Uninstalling FitFlow from your device automatically erases all sandboxed app data held by the operating system.

---

## 5. Children's Privacy

FitFlow does not knowingly collect or solicit personal information from children under the age of 13. The app is rated for general audiences (PEGI 3 / Everyone) and does not contain user communications or unmoderated content.

---

## 6. External Links & YouTube Channel

FitFlow contains optional links to exercise demonstration tutorials and community discussion on our official YouTube channel ([@FitFlowWorld](https://www.youtube.com/@FitFlowWorld)). When you tap a YouTube button, your device opens the YouTube application or web browser. Any interaction on YouTube (watching videos, liking, commenting, or subscribing) is governed by YouTube's Terms of Service and Google's Privacy Policy. FitFlow never accesses, tracks, or receives any information from your YouTube account.

---

## 7. Health & Exercise Disclaimer

FitFlow provides general physical activity routines for personal wellness. It is **not** a medical device and does not provide medical diagnoses, physical therapy, or healthcare treatment. Consult a physician before beginning any exercise routine, especially if you have cardiovascular conditions, balance issues, joint injuries, or are pregnant. Always stop immediately if you feel pain, faintness, or dizziness.

---

## 8. Changes to This Privacy Policy

Because FitFlow does not transmit data over the network, any future modifications to this policy will be delivered exclusively through versioned updates to the app on Google Play.

---

## 9. Contact & Inquiries

If you have questions, feedback, or need assistance regarding this Privacy Policy or data privacy in FitFlow, please open an issue on our GitHub repository or contact:

* **Project:** FitFlow
* **Repository:** [https://github.com/gideon/WorkoutApp](https://github.com/gideon/WorkoutApp)
* **Email Support:** support@fitflow.app
