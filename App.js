import { useEffect, useState } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

import { C } from './src/utils/theme';
import { setupNotifications, scheduleTodayNotifications } from './src/utils/notifications';
import { getTodayTasks, getAllSchedulableTasks } from './src/data/tasks';

import BakimScreen    from './src/screens/BakimScreen';
import DetailsScreen  from './src/screens/DetailsScreen';
import AlarmsScreen   from './src/screens/AlarmsScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

SplashScreen.preventAutoHideAsync();

const Tab      = createBottomTabNavigator();
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: C.bg, card: C.s1, text: C.text, border: C.border, primary: C.lime },
};

function Header() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const days   = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const h   = String(now.getHours()).padStart(2, '0');
  const m   = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return (
    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:18, paddingVertical:12, backgroundColor:C.bg, borderBottomWidth:1, borderBottomColor:C.border }}>
      <Text style={{ color:C.lime, fontSize:20, fontWeight:'900', letterSpacing:1 }}>
        HEALTH<Text style={{ color:C.muted }}>/CARE</Text>
      </Text>
      <View style={{ alignItems:'flex-end' }}>
        <Text style={{ color:C.text, fontSize:20, fontWeight:'800' }}>
          {h}:{m}<Text style={{ color:C.muted, fontSize:14 }}>:{sec}</Text>
        </Text>
        <Text style={{ color:C.muted, fontSize:11 }}>{days[now.getDay()]}, {now.getDate()} {months[now.getMonth()]}</Text>
      </View>
    </View>
  );
}

function TabIcon({ emoji, focused }) {
  return <Text style={{ fontSize:18, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function App() {
  useEffect(() => {
    (async () => {
      await setupNotifications();
      await scheduleTodayNotifications(getAllSchedulableTasks());
      await SplashScreen.hideAsync();
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <NavigationContainer theme={navTheme}>
        <SafeAreaView style={{ flex:1, backgroundColor:C.bg }} edges={['top']}>
          <Header />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: { backgroundColor:C.s1, borderTopColor:C.border, borderTopWidth:1, height:60, paddingBottom:6 },
              tabBarActiveTintColor:   C.lime,
              tabBarInactiveTintColor: C.muted,
              tabBarLabelStyle: { fontSize:9, fontWeight:'700', letterSpacing:0.3 },
              tabBarIcon: ({ focused }) => {
                const icons = { 'Bakım':'🧴', 'Detaylar':'📊', 'Alarmlar':'🔔' };
                return <TabIcon emoji={icons[route.name]} focused={focused} />;
              },
            })}
          >
            <Tab.Screen name="Bakım"    component={BakimScreen}   options={{ tabBarLabel: 'BAKIM' }}    />
            <Tab.Screen name="Detaylar" component={DetailsScreen} options={{ tabBarLabel: 'DETAYLAR' }} />
            <Tab.Screen name="Alarmlar" component={AlarmsScreen}  options={{ tabBarLabel: 'ALARMLAR' }} />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
