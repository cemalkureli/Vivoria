import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { View, Text, StatusBar, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

import { C, GRAD } from './src/utils/theme';
import { supabase } from './src/lib/supabase';
import { LanguageProvider, useLang } from './src/context/LanguageContext';
import { t } from './src/utils/i18n';
import { setupNotifications, scheduleTodayNotifications } from './src/utils/notifications';
import { getAllSchedulableTasks } from './src/data/tasks';

import LoginScreen    from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen     from './src/screens/HomeScreen';
import BakimScreen    from './src/screens/BakimScreen';
import DetailsScreen  from './src/screens/DetailsScreen';
import AlarmsScreen   from './src/screens/AlarmsScreen';
import ProfileScreen  from './src/screens/ProfileScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: C.bg,
    card:       C.s1,
    text:       C.text,
    border:     C.border,
    primary:    C.orchid,
  },
};

const TABS = [
  { name: 'Ana',      icon: 'heart',      outline: 'heart-outline',       labelKey: 'tabHome'    },
  { name: 'Bakım',    icon: 'flask',      outline: 'flask-outline',        labelKey: 'tabCare'    },
  { name: 'Detaylar', icon: 'analytics',  outline: 'analytics-outline',    labelKey: 'tabDetails' },
  { name: 'Alarmlar', icon: 'timer',      outline: 'timer-outline',        labelKey: 'tabAlarms'  },
  { name: 'Profil',   icon: 'person-circle', outline: 'person-circle-outline', labelKey: 'tabProfile' },
];

const TAB_COLORS = {
  Ana:      C.orchid,
  Bakım:    C.cyan,
  Detaylar: C.blue,
  Alarmlar: C.amber,
  Profil:   C.purple,
};

// ─── Vivoria Header ──────────────────────────────────────────────────────────
function Header() {
  const [now, setNow] = useState(new Date());
  const { lang } = useLang();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days_tr   = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
  const days_en   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months_tr = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const months_en = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const h   = String(now.getHours()).padStart(2, '0');
  const m   = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  const dayStr = lang === 'tr'
    ? `${days_tr[now.getDay()]} · ${now.getDate()} ${months_tr[now.getMonth()]}`
    : `${days_en[now.getDay()]} · ${months_en[now.getMonth()]} ${now.getDate()}`;

  return (
    <LinearGradient
      colors={['#0d1638', '#060d24']}
      style={hdr.wrap}
    >
      {/* Left: Vivoria brand */}
      <View style={hdr.brandRow}>
        <LinearGradient colors={GRAD.orchid} style={hdr.brandIcon}>
          <Ionicons name="heart" size={14} color="#fff" />
        </LinearGradient>
        <View>
          <Text style={hdr.brandName}>
            VIV<Text style={{ color: C.orchid }}>O</Text>RIA
          </Text>
          <Text style={hdr.brandTagline}>vital intelligence</Text>
        </View>
      </View>

      {/* Right: live clock */}
      <View style={hdr.clockWrap}>
        <Text style={hdr.clockTime}>
          {h}:{m}
          <Text style={hdr.clockSec}>:{sec}</Text>
        </Text>
        <Text style={hdr.clockDate}>{dayStr}</Text>
      </View>
    </LinearGradient>
  );
}

// ─── Custom Tab Bar ──────────────────────────────────────────────────────────
function TabItem({ route, focused, onPress }) {
  const tab   = TABS.find(t => t.name === route.name);
  const color = TAB_COLORS[route.name] || C.orchid;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 12, stiffness: 180 }) }],
  }));

  const handlePress = () => {
    scale.value = 0.85;
    setTimeout(() => { scale.value = 1; }, 100);
    onPress();
  };

  return (
    <View style={tb.item} onTouchEnd={handlePress}>
      {focused && (
        <Animated.View
          entering={FadeIn.duration(180)}
          style={[tb.activeBar, { backgroundColor: color }]}
        />
      )}
      <Animated.View style={[animStyle, { alignItems: 'center' }]}>
        {focused ? (
          <LinearGradient
            colors={[color + '30', color + '10']}
            style={tb.activeBubble}
          >
            <Ionicons name={tab?.icon} size={22} color={color} />
          </LinearGradient>
        ) : (
          <View style={tb.iconWrap}>
            <Ionicons name={tab?.outline} size={22} color={C.dim} />
          </View>
        )}
        <Text style={[tb.label, { color: focused ? color : C.dim }]}>
          {route.name.toUpperCase()}
        </Text>
      </Animated.View>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tb.bar}>
      <LinearGradient colors={['#0d1638', '#060d24']} style={tb.barGrad}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          return (
            <TabItem
              key={route.key}
              route={route}
              focused={focused}
              onPress={() => {
                if (!focused) navigation.navigate(route.name);
              }}
            />
          );
        })}
      </LinearGradient>
    </View>
  );
}

// ─── Main Tabs ────────────────────────────────────────────────────────────────
function MainTabs({ onSignOut }) {
  const { lang } = useLang();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <Header />
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Ana"      component={HomeScreen}    />
        <Tab.Screen name="Bakım"    component={BakimScreen}   />
        <Tab.Screen name="Detaylar" component={DetailsScreen} />
        <Tab.Screen name="Alarmlar" component={AlarmsScreen}  />
        <Tab.Screen name="Profil">
          {() => <ProfileScreen onSignOut={onSignOut} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}

// ─── Splash / loading ─────────────────────────────────────────────────────────
function SplashView() {
  return (
    <LinearGradient colors={['#060d24', '#1a0050', '#060d24']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Animated.View entering={FadeInDown.duration(700)} style={{ alignItems: 'center', gap: 8 }}>
        {/* Animated logo orb */}
        <LinearGradient colors={GRAD.orchid} style={{
          width: 84, height: 84, borderRadius: 28,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Ionicons name="heart" size={36} color="#fff" />
        </LinearGradient>
        <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: 6 }}>
          VIV<Text style={{ color: C.orchid }}>O</Text>RIA
        </Text>
        <Text style={{ color: C.muted, fontSize: 12, letterSpacing: 3, fontWeight: '600' }}>
          VITAL INTELLIGENCE
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function Root() {
  const [session,  setSession]  = useState(undefined);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    (async () => {
      try {
        await setupNotifications();
        await scheduleTodayNotifications(getAllSchedulableTasks());
      } catch (_) {}

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        SplashScreen.hideAsync();
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      return () => subscription.unsubscribe();
    })();
  }, []);

  const handleSignOut = () => {
    setSession(null);
    setAuthMode('login');
  };

  if (session === undefined) return <SplashView />;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {session ? (
        <NavigationContainer theme={navTheme}>
          <MainTabs onSignOut={handleSignOut} />
        </NavigationContainer>
      ) : (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
          {authMode === 'login' ? (
            <LoginScreen
              onSuccess={() => {}}
              onGoRegister={() => setAuthMode('register')}
            />
          ) : (
            <RegisterScreen
              onSuccess={() => setAuthMode('login')}
              onGoLogin={() => setAuthMode('login')}
            />
          )}
        </SafeAreaView>
      )}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const hdr = {
  wrap:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border2 },
  brandRow:    { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon:   { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandName:   { color: C.text, fontSize: 17, fontWeight: '900', letterSpacing: 2 },
  brandTagline:{ color: C.dim, fontSize: 9, letterSpacing: 2, fontWeight: '600', textTransform: 'uppercase', marginTop: 1 },
  clockWrap:   { alignItems: 'flex-end' },
  clockTime:   { color: C.text, fontSize: 16, fontWeight: '800' },
  clockSec:    { color: C.muted, fontSize: 11, fontWeight: '400' },
  clockDate:   { color: C.muted, fontSize: 10, fontWeight: '600' },
};

const tb = {
  bar:         { borderTopWidth: 1, borderTopColor: C.border2 },
  barGrad:     { flexDirection: 'row', paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 22 : 8 },
  item:        { flex: 1, alignItems: 'center', paddingTop: 4 },
  activeBar:   { position: 'absolute', top: -6, width: 24, height: 2, borderRadius: 2 },
  activeBubble:{ width: 46, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  iconWrap:    { width: 46, height: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  label:       { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
};
