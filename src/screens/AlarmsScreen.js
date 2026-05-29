import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { C } from '../utils/theme';
import { getTodayTasks } from '../data/tasks';

// ─── Aylık namaz alarm saatleri ──────────────────────────────────────────────
const NAMAZ_ALARM_TABLE = {
  1:  { sabah: '07:54', ogleIkindi: '15:17', aksamYatsi: '19:04' }, // Ocak
  2:  { sabah: '07:18', ogleIkindi: '15:47', aksamYatsi: '19:34' }, // Şubat
  3:  { sabah: '06:28', ogleIkindi: '16:13', aksamYatsi: '20:05' }, // Mart
  4:  { sabah: '05:42', ogleIkindi: '16:31', aksamYatsi: '20:42' }, // Nisan
  5:  { sabah: '05:13', ogleIkindi: '16:42', aksamYatsi: '21:24' }, // Mayıs
  6:  { sabah: '05:09', ogleIkindi: '16:51', aksamYatsi: '22:08' }, // Haziran
  7:  { sabah: '05:14', ogleIkindi: '16:55', aksamYatsi: '21:52' }, // Temmuz
  8:  { sabah: '05:38', ogleIkindi: '16:35', aksamYatsi: '20:56' }, // Ağustos
  9:  { sabah: '06:08', ogleIkindi: '16:03', aksamYatsi: '20:00' }, // Eylül
  10: { sabah: '06:38', ogleIkindi: '15:27', aksamYatsi: '19:15' }, // Ekim
  11: { sabah: '07:13', ogleIkindi: '15:07', aksamYatsi: '18:54' }, // Kasım
  12: { sabah: '07:47', ogleIkindi: '15:07', aksamYatsi: '18:54' }, // Aralık
};

const AY_ISIMLERI = ['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const CATEGORY_CONFIG = {
  sabah:    { group: 'Sabah Rutini',      color: C.lime   },
  bakim:    { group: 'Bakım',             color: C.purple },
  beslenme: { group: 'Beslenme',          color: C.green  },
  vitamin:  { group: 'Vitamin & Takviye', color: C.orange },
  hareket:  { group: 'Hareket',           color: C.green  },
  is:       { group: 'İş Bloğu',          color: C.blue   },
  su:       { group: 'Su',                color: C.blue   },
  barfiks:  { group: 'Barfiks',           color: C.lime   },
  spor:     { group: 'Spor Hazırlık',     color: C.red    },
  gece:     { group: 'Gece',              color: C.purple },
};

const GROUP_ORDER = [
  'Sabah Rutini','İş Bloğu','Su','Barfiks',
  'Beslenme','Bakım','Vitamin & Takviye',
  'Spor Hazırlık','Hareket','Gece',
];

export default function AlarmsScreen() {
  const today   = new Date();
  const month   = today.getMonth() + 1;
  const vakitler = NAMAZ_ALARM_TABLE[month];
  const ayAdi   = AY_ISIMLERI[month];

  const tasks = getTodayTasks();

  // Görevleri gruplara ayır
  const groups = {};
  for (const task of tasks) {
    const cfg = CATEGORY_CONFIG[task.category] || { group: task.category, color: C.lime };
    if (!groups[cfg.group]) groups[cfg.group] = { color: cfg.color, items: [] };
    groups[cfg.group].items.push(task);
  }

  const orderedGroups = [
    ...GROUP_ORDER.filter(g => groups[g]),
    ...Object.keys(groups).filter(g => !GROUP_ORDER.includes(g)),
  ];

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

      <View style={s.infoCard}>
        <Text style={s.infoText}>
          🔔 <Text style={{ color: C.lime, fontWeight: '700' }}>Alarm</Text> = sesli çalar, titreşir{'\n'}
          ⚡ <Text style={{ color: C.orange, fontWeight: '700' }}>Spor günü</Text> = sadece spor günlerinde aktif
        </Text>
      </View>

      {/* ─── NAMAZ ALARMLARI ─── */}
      <Text style={[s.catTitle, { color: C.orange }]}>── NAMAZ VAKİTLERİ</Text>

      <View style={[s.namazCard, { marginBottom: 6 }]}>
        <Text style={s.namazCardNote}>
          🕌 {ayAdi} ayı için otomatik alarm saatleri · İstanbul 2026
        </Text>
      </View>

      {/* Sabah */}
      <View style={[s.alarmRow, s.namazRow]}>
        <Text style={[s.alarmTime, { color: C.orange }]}>{vakitler?.sabah}</Text>
        <View style={s.alarmInfo}>
          <Text style={[s.alarmLabel, { color: C.orange }]}>🕌 Sabah Namazı</Text>
          <Text style={s.alarmType}>🔔 sesli alarm · güneş doğmadan 15dk önce</Text>
        </View>
        <Text style={s.alarmIcon}>🌅</Text>
      </View>

      {/* Öğle + İkindi */}
      <View style={[s.alarmRow, s.namazRow]}>
        <Text style={[s.alarmTime, { color: C.orange }]}>{vakitler?.ogleIkindi}</Text>
        <View style={s.alarmInfo}>
          <Text style={[s.alarmLabel, { color: C.orange }]}>🕌 Öğle + İkindi Namazı</Text>
          <Text style={s.alarmType}>🔔 sesli alarm · ikindiden 15dk önce</Text>
        </View>
        <Text style={s.alarmIcon}>☀️</Text>
      </View>

      {/* Akşam + Yatsı */}
      <View style={[s.alarmRow, s.namazRow]}>
        <Text style={[s.alarmTime, { color: C.orange }]}>{vakitler?.aksamYatsi}</Text>
        <View style={s.alarmInfo}>
          <Text style={[s.alarmLabel, { color: C.orange }]}>🕌 Akşam + Yatsı Namazı</Text>
          <Text style={s.alarmType}>🔔 sesli alarm · yatsıdan 15dk önce</Text>
        </View>
        <Text style={s.alarmIcon}>🌙</Text>
      </View>

      {/* ─── GÖREV ALARMLARI ─── */}
      {orderedGroups.map(groupName => {
        const { color, items } = groups[groupName];
        return (
          <View key={groupName}>
            <Text style={[s.catTitle, { color }]}>{'── ' + groupName.toUpperCase()}</Text>
            {items.map(item => (
              <View key={item.id} style={[s.alarmRow, item.sporOnly && s.sporRow]}>
                <Text style={[s.alarmTime, { color }]}>{item.time}</Text>
                <View style={s.alarmInfo}>
                  <Text style={[s.alarmLabel, item.sporOnly && { color: C.orange }]}>
                    {item.label}
                  </Text>
                  <Text style={s.alarmType}>
                    🔔 sesli alarm{item.sporOnly ? ' · ⚡ spor günü' : ''}
                  </Text>
                </View>
                <Text style={s.alarmIcon}>⏰</Text>
              </View>
            ))}
          </View>
        );
      })}

      {/* ─── KELİME BİLDİRİMLERİ ─── */}
      <Text style={[s.catTitle, { color: C.purple }]}>── GÜNLÜK KELİME</Text>
      {['09:00', '13:30', '20:30'].map(t => (
        <View key={t} style={s.alarmRow}>
          <Text style={[s.alarmTime, { color: C.purple }]}>{t}</Text>
          <View style={s.alarmInfo}>
            <Text style={s.alarmLabel}>Günün Kelimesi</Text>
            <Text style={s.alarmType}>🔔 sesli alarm · her gün</Text>
          </View>
          <Text style={s.alarmIcon}>🗣️</Text>
        </View>
      ))}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  infoCard: { backgroundColor: C.s1, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 16 },
  infoText: { color: C.muted, fontSize: 13, lineHeight: 22 },
  catTitle: { fontSize: 11, letterSpacing: 2, fontWeight: '800', marginBottom: 8, marginTop: 16 },
  alarmRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.s1, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 12, marginBottom: 6,
  },
  sporRow:  { borderColor: 'rgba(251,146,60,0.25)', backgroundColor: 'rgba(251,146,60,0.04)' },
  namazRow: { borderColor: 'rgba(251,146,60,0.35)', backgroundColor: 'rgba(251,146,60,0.06)' },
  namazCard:{ backgroundColor: 'rgba(251,146,60,0.05)', borderWidth: 1, borderColor: 'rgba(251,146,60,0.2)', borderRadius: 10, padding: 10 },
  namazCardNote: { color: C.orange, fontSize: 12, fontWeight: '600' },
  alarmTime:  { fontWeight: '800', fontSize: 16, width: 48 },
  alarmInfo:  { flex: 1 },
  alarmLabel: { color: C.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  alarmType:  { color: C.muted, fontSize: 11 },
  alarmIcon:  { fontSize: 18 },
});