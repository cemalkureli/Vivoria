import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { C, GRAD } from '../utils/theme';
import { useLang } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import { supabase, getTaskTemplates, saveTaskTemplate, deleteTaskTemplate } from '../lib/supabase';

// ─── Prayer times (Istanbul 2026) ────────────────────────────────────────────
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

const CAT_CONFIG = {
  sabah:    { label: 'Sabah Rutini',      color: C.orchid,  icon: 'sunny-outline'      },
  bakim:    { label: 'Bakım',             color: C.cyan,    icon: 'flask-outline'       },
  beslenme: { label: 'Beslenme',          color: C.emerald, icon: 'restaurant-outline'  },
  vitamin:  { label: 'Vitamin',           color: C.orange,  icon: 'bandage-outline'     },
  hareket:  { label: 'Hareket',           color: C.emerald, icon: 'walk-outline'        },
  is:       { label: 'İş',               color: C.blue,    icon: 'briefcase-outline'   },
  su:       { label: 'Su',               color: C.blue,    icon: 'water-outline'       },
  spor:     { label: 'Spor',             color: C.rose,    icon: 'barbell-outline'     },
  gece:     { label: 'Gece',             color: C.purple,  icon: 'moon-outline'        },
  genel:    { label: 'Genel',            color: C.muted,   icon: 'alarm-outline'       },
};

const CAT_LIST = Object.entries(CAT_CONFIG).map(([key, v]) => ({ key, ...v }));

// ─── Timeline item ────────────────────────────────────────────────────────────
function TimelineItem({ time, label, color, icon, delay, last, onDelete }) {
  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(350)} style={tl.row}>
      <View style={tl.timeCol}>
        <Text style={[tl.time, { color }]}>{time}</Text>
        {!last && <View style={[tl.connector, { backgroundColor: color + '30' }]} />}
      </View>
      <View style={tl.dotWrap}>
        <LinearGradient colors={[color, color + 'aa']} style={tl.dot}>
          <Ionicons name={icon ?? 'alarm-outline'} size={11} color="#fff" />
        </LinearGradient>
      </View>
      <View style={tl.card}>
        <Text style={tl.cardLabel}>{label}</Text>
        <Text style={tl.cardSub}>sesli alarm</Text>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={{ padding: 8 }}>
          <Ionicons name="trash-outline" size={14} color={C.dim} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ─── Section badge ────────────────────────────────────────────────────────────
function SectionBadge({ label, color, icon, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)}
      style={[tl.badge, { borderColor: color + '50' }]}>
      <LinearGradient colors={[color + '25', color + '10']} style={tl.badgeGrad}>
        <Ionicons name={icon} size={13} color={color} />
        <Text style={[tl.badgeLabel, { color }]}>{label.toUpperCase()}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Prayer card ─────────────────────────────────────────────────────────────
function PrayerCard({ time, label, desc, emoji, delay }) {
  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(350)}
      style={[tl.prayerCard, { borderColor: C.orange + '35' }]}>
      <LinearGradient colors={[C.orange + '20', C.orange + '08']} style={tl.prayerGrad}>
        <View style={[tl.prayerIcon, { backgroundColor: C.orange + '25' }]}>
          <Text style={{ fontSize: 16 }}>{emoji}</Text>
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
  const { lang }             = useLang();
  const [userId, setUserId]  = useState(null);
  const [tasks,  setTasks]   = useState([]);
  const [modal,  setModal]   = useState(false);
  const [form,   setForm]    = useState({ label: '', time: '', category: 'genel' });

  const today    = new Date();
  const month    = today.getMonth() + 1;
  const vakitler = NAMAZ_TABLE[month];

  useFocusEffect(useCallback(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
      getTaskTemplates(data.user.id).then(setTasks).catch(() => {});
    });
  }, []));

  async function handleAdd() {
    if (!form.label.trim() || !form.time || !userId) return;
    await saveTaskTemplate(userId, form);
    setTasks(await getTaskTemplates(userId));
    setModal(false);
    setForm({ label: '', time: '', category: 'genel' });
  }

  async function handleDelete(task) {
    Alert.alert('Sil', `"${task.label}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        await deleteTaskTemplate(task.id);
        setTasks(await getTaskTemplates(userId));
      }},
    ]);
  }

  // Group tasks by category
  const groups = {};
  for (const task of tasks) {
    const cat = task.category ?? 'genel';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(task);
  }

  let delay = 0;

  return (
    <ScrollView style={tl.root} contentContainerStyle={tl.content} showsVerticalScrollIndicator={false}>

      {/* ── LEGEND ── */}
      <Animated.View entering={FadeInDown.duration(300)} style={tl.legend}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="alarm-outline" size={14} color={C.orchid} />
          <Text style={{ color: C.muted, fontSize: 12 }}>Sesli alarm</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="add-circle-outline" size={14} color={C.emerald} />
          <Text style={{ color: C.muted, fontSize: 12 }}>Alarm eklemek için aşağıdaki butonu kullan</Text>
        </View>
      </Animated.View>

      {/* ── NAMAZ ── */}
      <SectionBadge label="Namaz Vakitleri" color={C.orange} icon="time-outline" delay={50} />
      <Animated.View entering={FadeInDown.delay(70).duration(300)} style={tl.namazNote}>
        <Ionicons name="location-outline" size={12} color={C.orange} />
        <Text style={tl.namazNoteTxt}>İstanbul · {AY[month]} 2026 · Aylık ortalama</Text>
      </Animated.View>
      <PrayerCard time={vakitler?.sabah}      label="Sabah Namazı"         desc="Güneş doğmadan 15dk önce" emoji="🌅" delay={90}  />
      <PrayerCard time={vakitler?.ogleIkindi} label="Öğle + İkindi Namazı" desc="İkindiden 15dk önce"      emoji="☀️" delay={130} />
      <PrayerCard time={vakitler?.aksamYatsi} label="Akşam + Yatsı Namazı" desc="Yatsıdan 15dk önce"       emoji="🌙" delay={170} />

      {/* ── USER TASKS ── */}
      {tasks.length > 0 && Object.keys(groups).map(catKey => {
        const cfg = CAT_CONFIG[catKey] ?? CAT_CONFIG.genel;
        delay += 40;
        const groupDelay = delay;
        const items = groups[catKey];
        return (
          <View key={catKey}>
            <SectionBadge label={cfg.label} color={cfg.color} icon={cfg.icon} delay={groupDelay} />
            {items.map((item, idx) => {
              delay += 30;
              return (
                <TimelineItem
                  key={item.id}
                  time={item.time ?? '--:--'}
                  label={item.label}
                  color={cfg.color}
                  icon={cfg.icon}
                  delay={delay}
                  last={idx === items.length - 1}
                  onDelete={() => handleDelete(item)}
                />
              );
            })}
          </View>
        );
      })}

      {tasks.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center' }}>
            Henüz alarm eklemediniz.{'\n'}Aşağıdaki butona tıklayın.
          </Text>
        </View>
      )}

      {/* ── ADD ALARM BUTTON ── */}
      <TouchableOpacity onPress={() => setModal(true)} activeOpacity={0.85} style={{ marginTop: 20 }}>
        <LinearGradient colors={GRAD.orchid} style={{ borderRadius: 16, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Alarm Ekle</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ── ADD MODAL ── */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <TouchableOpacity style={tl.overlay} activeOpacity={1} onPress={() => setModal(false)}>
          <TouchableOpacity activeOpacity={1} style={tl.modal} onPress={() => {}}>
            <Text style={tl.modalTitle}>Yeni Alarm</Text>

            <Text style={tl.modalLabel}>Alarm Etiketi</Text>
            <TextInput
              style={tl.modalInput}
              value={form.label} onChangeText={v => setForm(p => ({ ...p, label: v }))}
              placeholder="ör. Sabah rutini, Su iç..." placeholderTextColor={C.muted}
              autoFocus
            />

            <Text style={tl.modalLabel}>Saat (HH:MM)</Text>
            <TextInput
              style={tl.modalInput}
              value={form.time} onChangeText={v => setForm(p => ({ ...p, time: v }))}
              placeholder="08:00" placeholderTextColor={C.muted}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={tl.modalLabel}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CAT_LIST.map(cat => (
                  <TouchableOpacity key={cat.key} onPress={() => setForm(p => ({ ...p, category: cat.key }))}
                    activeOpacity={0.8}
                    style={[tl.catChip, form.category === cat.key && { backgroundColor: cat.color + '25', borderColor: cat.color + '70' }]}>
                    <Ionicons name={cat.icon} size={13} color={form.category === cat.key ? cat.color : C.dim} />
                    <Text style={[tl.catChipTxt, form.category === cat.key && { color: cat.color }]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={tl.cancelBtn} onPress={() => setModal(false)}>
                <Text style={{ color: C.muted, fontWeight: '700' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tl.saveBtn} onPress={handleAdd}>
                <Text style={{ color: C.bg, fontWeight: '900' }}>Ekle ✓</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}

const tl = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 48 },

  legend:     { backgroundColor: C.s1, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border2, marginBottom: 16, gap: 6 },

  badge:     { alignSelf: 'flex-start', borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 10, marginTop: 16 },
  badgeGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  badgeLabel:{ fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  namazNote:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10, marginTop: -6 },
  namazNoteTxt: { color: C.muted, fontSize: 11 },

  prayerCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 8, borderWidth: 1 },
  prayerGrad: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  prayerIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  prayerLabel:{ color: C.orange, fontSize: 14, fontWeight: '800' },
  prayerDesc: { color: C.muted, fontSize: 11, marginTop: 2 },
  prayerTime: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  prayerTimeTxt: { color: C.orange, fontSize: 15, fontWeight: '900' },

  row:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  timeCol:   { width: 54, alignItems: 'flex-end', paddingRight: 8, paddingTop: 10 },
  time:      { fontSize: 12, fontWeight: '800', lineHeight: 14 },
  connector: { width: 1.5, flex: 1, marginTop: 4, marginRight: 1, minHeight: 20 },
  dotWrap:   { width: 22, alignItems: 'center', marginTop: 8 },
  dot:       { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  card:      { flex: 1, backgroundColor: C.s1, borderRadius: 12, padding: 10, marginLeft: 8, borderWidth: 1, borderColor: C.border2 },
  cardLabel: { color: C.text, fontSize: 12, fontWeight: '700' },
  cardSub:   { color: C.muted, fontSize: 10, marginTop: 2 },

  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end', padding: 16 },
  modal:      { backgroundColor: C.s1, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border2 },
  modalTitle: { color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 16 },
  modalLabel: { color: C.muted, fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  modalInput: { backgroundColor: C.s2, borderRadius: 12, borderWidth: 1, borderColor: C.border2, color: C.text, paddingHorizontal: 14, height: 46, fontSize: 15, marginBottom: 14 },
  catChip:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border2, backgroundColor: C.s1 },
  catChipTxt: { color: C.dim, fontSize: 11, fontWeight: '700' },
  cancelBtn:  { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.border2, alignItems: 'center', justifyContent: 'center' },
  saveBtn:    { flex: 2, height: 44, borderRadius: 12, backgroundColor: C.orchid, alignItems: 'center', justifyContent: 'center' },
});
