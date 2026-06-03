import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { C, GRAD } from '../utils/theme';
import { getTodayTasks } from '../data/tasks';

// ─── Prayer times ─────────────────────────────────────────────────────────────
const NAMAZ_TABLE = {
  1:  { sabah: '07:54', ogleIkindi: '15:17', aksamYatsi: '19:04' },
  2:  { sabah: '07:18', ogleIkindi: '15:47', aksamYatsi: '19:34' },
  3:  { sabah: '06:28', ogleIkindi: '16:13', aksamYatsi: '20:05' },
  4:  { sabah: '05:42', ogleIkindi: '16:31', aksamYatsi: '20:42' },
  5:  { sabah: '05:13', ogleIkindi: '16:42', aksamYatsi: '21:24' },
  6:  { sabah: '05:09', ogleIkindi: '16:51', aksamYatsi: '22:08' },
  7:  { sabah: '05:14', ogleIkindi: '16:55', aksamYatsi: '21:52' },
  8:  { sabah: '05:38', ogleIkindi: '16:35', aksamYatsi: '20:56' },
  9:  { sabah: '06:08', ogleIkindi: '16:03', aksamYatsi: '20:00' },
  10: { sabah: '06:38', ogleIkindi: '15:27', aksamYatsi: '19:15' },
  11: { sabah: '07:13', ogleIkindi: '15:07', aksamYatsi: '18:54' },
  12: { sabah: '07:47', ogleIkindi: '15:07', aksamYatsi: '18:54' },
};

const AY = ['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const CAT = {
  sabah:    { group: 'Sabah Rutini',      color: C.orchid,  icon: 'sunny-outline'     },
  bakim:    { group: 'Bakım',             color: C.cyan,    icon: 'flask-outline'      },
  beslenme: { group: 'Beslenme',          color: C.emerald, icon: 'restaurant-outline' },
  vitamin:  { group: 'Vitamin & Takviye', color: C.orange,  icon: 'bandage-outline'    },
  hareket:  { group: 'Hareket',           color: C.emerald, icon: 'walk-outline'       },
  is:       { group: 'İş Bloğu',          color: C.blue,    icon: 'briefcase-outline'  },
  su:       { group: 'Su',                color: C.blue,    icon: 'water-outline'      },
  barfiks:  { group: 'Barfiks',           color: C.orchid,  icon: 'fitness-outline'    },
  spor:     { group: 'Spor Hazırlık',     color: C.rose,    icon: 'barbell-outline'    },
  gece:     { group: 'Gece',              color: C.purple,  icon: 'moon-outline'       },
};

const GROUP_ORDER = [
  'Sabah Rutini','İş Bloğu','Su','Barfiks',
  'Beslenme','Bakım','Vitamin & Takviye',
  'Spor Hazırlık','Hareket','Gece',
];

// ─── Timeline item ────────────────────────────────────────────────────────────
function TimelineItem({ time, label, subtitle, color, icon, sporOnly, delay, last }) {
  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(350)} style={tl.row}>
      {/* Time column */}
      <View style={tl.timeCol}>
        <Text style={[tl.time, { color }]}>{time}</Text>
        {!last && <View style={[tl.connector, { backgroundColor: color + '30' }]} />}
      </View>

      {/* Dot */}
      <View style={tl.dotWrap}>
        <LinearGradient
          colors={sporOnly ? [C.orange, C.rose] : [color, color + 'aa']}
          style={tl.dot}
        >
          <Ionicons name={icon || 'alarm-outline'} size={11} color="#fff" />
        </LinearGradient>
      </View>

      {/* Card */}
      <View style={[tl.card, sporOnly && { borderColor: C.orange + '40', backgroundColor: C.orange + '06' }]}>
        <Text style={[tl.cardLabel, sporOnly && { color: C.orange }]}>{label}</Text>
        <Text style={tl.cardSub}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionBadge({ label, color, icon, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)} style={[tl.badge, { borderColor: color + '50' }]}>
      <LinearGradient colors={[color + '25', color + '10']} style={tl.badgeGrad}>
        <Ionicons name={icon} size={13} color={color} />
        <Text style={[tl.badgeLabel, { color }]}>{label.toUpperCase()}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Prayer card ─────────────────────────────────────────────────────────────
function PrayerCard({ time, label, desc, icon, delay }) {
  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(350)} style={tl.prayerCard}>
      <LinearGradient colors={[C.orange + '20', C.orange + '08']} style={tl.prayerGrad}>
        <View style={[tl.prayerIcon, { backgroundColor: C.orange + '25' }]}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={tl.prayerLabel}>{label}</Text>
          <Text style={tl.prayerDesc}>{desc}</Text>
        </View>
        <View style={[tl.prayerTime, { backgroundColor: C.orange + '20' }]}>
          <Text style={tl.prayerTimeTxt}>{time}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AlarmsScreen() {
  const today    = new Date();
  const month    = today.getMonth() + 1;
  const vakitler = NAMAZ_TABLE[month];
  const tasks    = getTodayTasks();

  // Group tasks
  const groups = {};
  for (const task of tasks) {
    const cfg = CAT[task.category] || { group: task.category, color: C.orchid, icon: 'alarm-outline' };
    if (!groups[cfg.group]) groups[cfg.group] = { ...cfg, items: [] };
    groups[cfg.group].items.push(task);
  }

  const orderedGroups = [
    ...GROUP_ORDER.filter(g => groups[g]),
    ...Object.keys(groups).filter(g => !GROUP_ORDER.includes(g)),
  ];

  let delay = 0;

  return (
    <ScrollView style={tl.root} contentContainerStyle={tl.content} showsVerticalScrollIndicator={false}>

      {/* ── LEGEND ── */}
      <Animated.View entering={FadeInDown.duration(300)} style={tl.legend}>
        {[
          { icon: 'alarm-outline',   color: C.orchid, txt: 'Sesli alarm çalar' },
          { icon: 'barbell-outline', color: C.orange, txt: 'Sadece spor günü'  },
          { icon: 'moon-outline',    color: C.purple, txt: 'Gece bildirimi'     },
        ].map((l, i) => (
          <View key={i} style={tl.legendItem}>
            <View style={[tl.legendDot, { backgroundColor: l.color + '30', borderColor: l.color + '60', borderWidth: 1 }]}>
              <Ionicons name={l.icon} size={10} color={l.color} />
            </View>
            <Text style={tl.legendTxt}>{l.txt}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── NAMAZ ── */}
      <SectionBadge label="Namaz Vakitleri" color={C.orange} icon="time-outline" delay={50} />
      <Animated.View entering={FadeInDown.delay(80).duration(350)} style={tl.namazNote}>
        <Ionicons name="location-outline" size={12} color={C.orange} />
        <Text style={tl.namazNoteTxt}>İstanbul · {AY[month]} 2026 · Aylık ortalama</Text>
      </Animated.View>

      <PrayerCard time={vakitler?.sabah}      label="Sabah Namazı"          desc="Güneş doğmadan 15dk önce" icon="🌅" delay={100} />
      <PrayerCard time={vakitler?.ogleIkindi} label="Öğle + İkindi Namazı"  desc="İkindiden 15dk önce"      icon="☀️" delay={150} />
      <PrayerCard time={vakitler?.aksamYatsi} label="Akşam + Yatsı Namazı"  desc="Yatsıdan 15dk önce"       icon="🌙" delay={200} />

      {/* ── TASK GROUPS ── */}
      {orderedGroups.map(groupName => {
        const { color, icon, items } = groups[groupName];
        delay += 40;
        const groupDelay = delay;
        return (
          <View key={groupName}>
            <SectionBadge label={groupName} color={color} icon={icon} delay={groupDelay} />
            {items.map((item, idx) => {
              delay += 35;
              return (
                <TimelineItem
                  key={item.id}
                  time={item.time}
                  label={item.label}
                  subtitle={`🔔 sesli alarm${item.sporOnly ? ' · ⚡ spor günü' : ''}`}
                  color={color}
                  icon={icon}
                  sporOnly={item.sporOnly}
                  delay={delay}
                  last={idx === items.length - 1}
                />
              );
            })}
          </View>
        );
      })}

      {/* ── KELIME BİLDİRİMİ ── */}
      <SectionBadge label="Günlük Kelime" color={C.purple} icon="book-outline" delay={delay + 40} />
      {['09:00', '13:30', '20:30'].map((t, i) => {
        delay += 35;
        return (
          <TimelineItem
            key={t}
            time={t}
            label="Günün Kelimesi"
            subtitle="🔔 sesli alarm · her gün"
            color={C.purple}
            icon="book-outline"
            delay={delay}
            last={i === 2}
          />
        );
      })}

    </ScrollView>
  );
}

const tl = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },

  // Legend
  legend:     { backgroundColor: C.s1, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border2, marginBottom: 16, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot:  { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  legendTxt:  { color: C.muted, fontSize: 12 },

  // Section badge
  badge:     { alignSelf: 'flex-start', borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 10, marginTop: 16 },
  badgeGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  badgeLabel:{ fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  // Namaz note
  namazNote:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10, marginTop: -6 },
  namazNoteTxt: { color: C.muted, fontSize: 11 },

  // Prayer card
  prayerCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: C.orange + '35' },
  prayerGrad: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  prayerIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  prayerLabel:{ color: C.orange, fontSize: 14, fontWeight: '800' },
  prayerDesc: { color: C.muted, fontSize: 11, marginTop: 2 },
  prayerTime: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  prayerTimeTxt: { color: C.orange, fontSize: 15, fontWeight: '900' },

  // Timeline row
  row:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  timeCol:   { width: 54, alignItems: 'flex-end', paddingRight: 8, paddingTop: 10 },
  time:      { fontSize: 12, fontWeight: '800', lineHeight: 14 },
  connector: { width: 1.5, flex: 1, marginTop: 4, marginRight: 1, minHeight: 20 },

  dotWrap:   { width: 22, alignItems: 'center', marginTop: 8 },
  dot:       { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },

  card:     { flex: 1, backgroundColor: C.s1, borderRadius: 12, padding: 10, marginLeft: 8, borderWidth: 1, borderColor: C.border2, marginBottom: 0 },
  cardLabel:{ color: C.text, fontSize: 12, fontWeight: '700' },
  cardSub:  { color: C.muted, fontSize: 10, marginTop: 2 },
});
