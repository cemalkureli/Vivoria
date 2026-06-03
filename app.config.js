export default {
  expo: {
    name: 'Vivoria',
    slug: 'vivoria',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/os.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: { image: './assets/splash.png', backgroundColor: '#060d24', resizeMode: 'contain' },
    android: {
      package: 'com.vivoria.app',
      adaptiveIcon: { foregroundImage: './assets/os.png', backgroundColor: '#060d24' },
      permissions: [
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'USE_EXACT_ALARM',
        'SCHEDULE_EXACT_ALARM',
        'POST_NOTIFICATIONS',
        'FOREGROUND_SERVICE',
        'WAKE_LOCK',
        'USE_FULL_SCREEN_INTENT',
        'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      ],
    },
    ios: { bundleIdentifier: 'com.vivoria.app' },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/os.png',
          color: '#d946a8',
          sounds: ['./assets/alarm.mp3'],
          mode: 'production',
        },
      ],
    ],
    extra: {
      supabaseUrl:     process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
