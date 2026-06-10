# VIVORIA — Vital Intelligence

> Personal health & lifestyle tracking app — dark royal-blue × orchid-magenta design system

---

## Overview

**Vivoria** is a React Native (Expo) health companion that unifies skincare routines, nutrition tracking, hydration, vitamins, sleep, body measurements, and daily alarms into one elegant, dark-themed dashboard.

### Core Screens

| Tab | Screen | Description |
|-----|--------|-------------|
| ❤️ Ana | Home Dashboard | Health score hero card, 2×2 metric grid, daily routine toggles, weekly heatmap |
| 🧪 Bakım | Care Guide | Tabbed step-by-step skincare routines (Morning / Night / Post-Workout) |
| 📊 Detaylar | Details | Nutrition macros, water tracker, vitamin stock, sleep log, body measurements |
| ⏱️ Alarmlar | Alarms | Timeline-style prayer times + daily task alarm schedule |
| 👤 Profil | Profile | Health passport card, body stats, goals, app settings, sign out |

---

## Design System

```
Background:  #060d24  (deep royal navy)
Surface 1:   #0d1638
Surface 2:   #131f4e
Primary:     #d946a8  (orchid magenta)
Cyan:        #22d3ee
Emerald:     #10b981
Amber:       #f59e0b
Blue:        #4a80e8
Purple:      #9333ea
```

Tab accent colors: Ana → orchid · Bakım → cyan · Detaylar → blue · Alarmlar → amber · Profil → purple

---

## Tech Stack

- **React Native** + **Expo** ~52
- **Supabase** — auth + cloud sync (`profiles`, `health_logs`, `routine_logs`)
- **expo-linear-gradient** — hero cards, brand gradients
- **react-native-reanimated** — spring-animated tab bar, fade-in screens
- **@expo/vector-icons** (Ionicons) — throughout
- **AsyncStorage** — local routine state, language preference
- **expo-notifications** — daily alarm scheduling

---

## Architecture

```
src/
├── lib/
│   └── supabase.js          # Supabase client + auth helpers
├── context/
│   └── LanguageContext.js   # TR/EN toggle
├── utils/
│   ├── theme.js             # Vivoria color palette + gradients
│   ├── i18n.js              # TR/EN translation strings
│   ├── storage.js           # AsyncStorage helpers
│   ├── notifications.js     # Expo notification scheduling
│   └── dailyLog.js          # Daily log helpers
├── data/
│   └── tasks.js             # Daily task/alarm definitions
├── screens/
│   ├── HomeScreen.js        # Health dashboard
│   ├── BakimScreen.js       # Skincare routine guide
│   ├── DetailsScreen.js     # Nutrition / water / vitamins / sleep / body
│   ├── AlarmsScreen.js      # Timeline alarm schedule
│   ├── ProfileScreen.js     # Settings + profile
│   └── auth/
│       ├── LoginScreen.js
│       └── RegisterScreen.js
└── components/
    ├── Toast.js
    └── LangToggle.js
App.js                       # Root: Vivoria header + 5-tab navigator
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Configure Supabase
cp .env.example .env
# Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# Start dev server
npx expo start
```

---

## Features

- **Health Score** — calculated from today's routines + streak + log history
- **Skincare Routines** — Morning (4 steps), Night (5 steps), Post-Workout guide with product notes
- **Nutrition Tracker** — 4 daily meals with macro breakdown (Protein / Carb / Fat / Calories)
- **Water Tracker** — daily consumption with heat-map consistency view
- **Vitamin Stock** — inventory tracker with days-remaining per supplement
- **Detox Timer** — 6-step morning detox preparation guide with per-step countdown
- **Sleep Log** — auto-recorded sleep duration with quality classification
- **Body Measurements** — weight, height, waist, BMI history
- **Prayer Times** — Istanbul 2026 monthly schedule
- **Bilingual** — Turkish / English (toggle in Profile)

---

*Vivoria · vital intelligence*
