# Vivoria — Claude Code Instructions

## Project
React Native (Expo ~52) personal health & skincare tracking app. Multi-user, Supabase backend.

## Architecture
- `src/lib/supabase.js` — auth + all table helpers
- `src/utils/theme.js` — Vivoria palette (dark navy × orchid)
- `src/utils/storage.js` — AsyncStorage helpers (BP, BS, water, vitamins, sleep, body)
- `src/utils/i18n.js` — TR/EN translations
- `src/context/LanguageContext.js` — language toggle (key: vivoria_lang)
- `src/screens/HomeScreen.js` — health dashboard
- `src/screens/BakimScreen.js` — skincare: BAKIM (products/routines/templates) + YAŞAM (lifestyle content)
- `src/screens/DetailsScreen.js` — Tansiyon, Kan Şekeri, Beslenme, Su, Vitamin, Detoks, Uyku, Vücut
- `src/screens/AlarmsScreen.js` — timeline alarm schedule
- `src/screens/ProfileScreen.js` — settings + skin profile
- `App.js` — Vivoria header + 5-tab nav

## Supabase Tables
- `profiles` — user profiles (height_cm, weight_kg, age, gender, health_goal)
- `skin_profiles` — skin_type, concerns[]
- `products` — global skincare product library
- `routine_templates` — pre-built routines by skin type
- `template_steps` — steps within templates
- `user_routines` — user's saved routines
- `user_routine_steps` — steps in user routines
- `routine_completions` — daily completion log
- `health_logs` — general health entries

## Key conventions
- All screens use C.* colors from theme.js
- Language: useLang() hook + t() function
- New screens follow the existing pattern: FadeInDown animations, LinearGradient cards, Ionicons
- No hardcoded user data — everything fetched from Supabase or AsyncStorage
