import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated, FlatList, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { C, GRAD } from '../utils/theme';
import { useLang } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import {
  getSleepLogs, getBodyMeasurements, saveBodyMeasurement,
  getDoneToday, getVitaminStock, saveVitaminStock,
  saveBPRecord, getBPLogs, classifyBP,
  saveBSRecord, getBSLogs, classifyBS,
  getTodayWaterMl, addWaterMl,
} from '../utils/storage';
import {
  supabase,
  getNutritionGoals, upsertNutritionGoals,
  getMealTemplates, saveMealTemplate, deleteMealTemplate,
  getSupplements, saveSupplements,
} from '../lib/supabase';
import { getRecentLog } from '../utils/dailyLog';

const TABS = ['Tansiyon', 'Kan Şekeri', 'Beslenme', 'Su', 'Vitamin', 'Detoks', 'Uyku', 'Vücut'];
const W = Dimensions.get('window').width;

// ─── helpers ─────────────────────────────────────────────────────────────────
function getLast7Dates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}
const GUN_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// ─── Drum-roll number picker ──────────────────────────────────────────────────
function DrumPicker({ min, max, value, onChange, color, width = 80 }) {
  const ITEM_H = 44;
  const VISIBLE = 5;
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const ref = useRef(null);

  useEffect(() => {
    const idx = values.indexOf(value);
    if (idx >= 0) {
      setTimeout(() => ref.current?.scrollToIndex({ index: idx, animated: false }), 100);
    }
  }, []);

  return (
    <View style={{ width, height: ITEM_H * VISIBLE, overflow: 'hidden', borderRadius: 12, backgroundColor: C.s2, borderWidth: 1, borderColor: C.border2 }}>
      {/* selection highlight */}
      <View style={{ position: 'absolute', top: ITEM_H * 2, height: ITEM_H, width: '100%', backgroundColor: color + '20', borderTopWidth: 1, borderBottomWidth: 1, borderColor: color + '50', zIndex: 1 }} pointerEvents="none" />
      <FlatList
        ref={ref}
        data={values}
        keyExtractor={v => String(v)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        getItemLayout={(_, idx) => ({ length: ITEM_H, offset: ITEM_H * idx, index: idx })}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          onChange(values[Math.max(0, Math.min(idx, values.length - 1))]);
        }}
        ListHeaderComponent={<View style={{ height: ITEM_H * 2 }} />}
        ListFooterComponent={<View style={{ height: ITEM_H * 2 }} />}
        renderItem={({ item }) => (
          <View style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: item === value ? color : C.muted, fontSize: item === value ? 22 : 15, fontWeight: item === value ? '900' : '400' }}>
              {item}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// ─── BP classification legend ─────────────────────────────────────────────────
const BP_CLASSES = [
  { label: 'Hipotansiyon', color: '#4a80e8', sys: '<90',    dia: '<60'   },
  { label: 'Normal',       color: '#10b981', sys: '90-119', dia: '60-79' },
  { label: 'Yüksek',       color: '#f59e0b', sys: '120-129',dia: '<80'  },
  { label: 'HT Evre 1',    color: '#f97316', sys: '130-139',dia: '80-89' },
  { label: 'HT Evre 2',    color: '#ea580c', sys: '140-179',dia: '90-119'},
  { label: 'Kriz',         color: '#f43f5e', sys: '≥180',   dia: '≥120' },
];

// ─── Recommended Reading articles ─────────────────────────────────────────────
const ARTICLES = [
  { title: 'Uykunun kalp sağlığına etkisi',          emoji: '💤' },
  { title: 'Yüksek tansiyona yol açan faktörler',    emoji: '⚠️' },
  { title: 'Tansiyonu düşürme ve yönetme yolları',   emoji: '💊' },
  { title: 'Tuz tüketimi ve hipertansiyon ilişkisi', emoji: '🧂' },
  { title: 'Günde 30 dakika yürüyüşün faydaları',    emoji: '🚶' },
];

// ─── Tansiyon (Blood Pressure) tab ────────────────────────────────────────────
function Tansiyon() {
  const [logs,     setLogs]     = useState([]);
  const [modal,    setModal]    = useState(false);
  const [sys,      setSys]      = useState(120);
  const [dia,      setDia]      = useState(80);
  const [pulse,    setPulse]    = useState(70);
  const [note,     setNote]     = useState('');
  const [noteVisible, setNoteVisible] = useState(false);

  useFocusEffect(useCallback(() => { getBPLogs().then(setLogs); }, []));

  const saveRecord = async () => {
    await saveBPRecord({ sys, dia, pulse, note });
    const updated = await getBPLogs();
    setLogs(updated);
    setModal(false);
    setNote('');
  };

  // 24h average (last 24 logs max)
  const last24 = logs.slice(0, 24);
  const avgSys   = last24.length ? Math.round(last24.reduce((s, l) => s + l.sys,   0) / last24.length) : null;
  const avgDia   = last24.length ? Math.round(last24.reduce((s, l) => s + l.dia,   0) / last24.length) : null;
  const avgPulse = last24.length ? Math.round(last24.reduce((s, l) => s + l.pulse, 0) / last24.length) : null;

  // Bar chart: last 7 readings
  const chart7 = logs.slice(0, 7).reverse();
  const chartMax = Math.max(...chart7.map(l => l.sys), 140);

  const curClass = classifyBP(sys, dia);

  function fmtDate(iso) {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* ── LEGEND ── */}
      <View style={d.card}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {BP_CLASSES.map(c => (
            <View key={c.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.color }} />
              <Text style={{ color: C.muted, fontSize: 10, fontWeight: '600' }}>{c.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── 24h AVERAGE ── */}
      {avgSys !== null && (
        <View style={[d.card, { borderColor: classifyBP(avgSys, avgDia).color + '50' }]}>
          <Text style={[d.cardTitle, { marginBottom: 12 }]}>24 Saat Ortalaması</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {[['Sistolik', avgSys, 'mmHg', C.orchid], ['Diastolik', avgDia, 'mmHg', C.cyan], ['Nabız', avgPulse, 'BPM', C.amber]].map(([lbl, val, unit, color]) => (
              <View key={lbl} style={{ alignItems: 'center' }}>
                <Text style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{lbl}</Text>
                <Text style={{ color, fontSize: 32, fontWeight: '900', lineHeight: 34 }}>{val}</Text>
                <Text style={{ color: C.muted, fontSize: 11 }}>{unit}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: classifyBP(avgSys, avgDia).color + '18', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: classifyBP(avgSys, avgDia).color + '40' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: classifyBP(avgSys, avgDia).color }} />
              <Text style={{ color: classifyBP(avgSys, avgDia).color, fontSize: 13, fontWeight: '800' }}>{classifyBP(avgSys, avgDia).label}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── BAR CHART ── */}
      {chart7.length > 0 && (
        <View style={d.card}>
          <Text style={[d.cardTitle, { marginBottom: 14 }]}>Son {chart7.length} Ölçüm</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 }}>
            {chart7.map((l, i) => {
              const cls = classifyBP(l.sys, l.dia);
              const barH = Math.max((l.sys / chartMax) * 100, 12);
              const d2 = new Date(l.date);
              return (
                <View key={i} style={{ alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: C.muted, fontSize: 9 }}>{l.sys}</Text>
                  <View style={{ width: 28, height: barH, backgroundColor: cls.color, borderRadius: 8 }} />
                  <Text style={{ color: C.muted, fontSize: 9 }}>{l.dia}</Text>
                  <Text style={{ color: C.dim, fontSize: 8 }}>{d2.getDate()}/{d2.getMonth()+1}</Text>
                </View>
              );
            })}
          </View>
          {/* Gradient color scale */}
          <View style={{ flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 12 }}>
            {BP_CLASSES.map(c => <View key={c.label} style={{ flex: 1, backgroundColor: c.color }} />)}
          </View>
        </View>
      )}

      {/* ── RECOMMENDED READING ── */}
      <Text style={[d.sectionTitle, { marginBottom: 10, marginTop: 4 }]}>ÖNERİLEN OKUMALAR</Text>
      {ARTICLES.map((a, i) => (
        <View key={i} style={[d.suRow, { gap: 12 }]}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
          </View>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: '600', flex: 1 }}>{a.title}</Text>
          <Ionicons name="chevron-forward" size={14} color={C.dim} />
        </View>
      ))}

      {/* ── REMINDER CARD ── */}
      <View style={[d.card, { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8, borderColor: C.cyan + '40' }]}>
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.cyan + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="alarm-outline" size={24} color={C.cyan} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[d.cardTitle, { color: C.cyan }]}>Hatırlatıcı</Text>
          <Text style={{ color: C.muted, fontSize: 12 }}>Ölçüm için akıllı alarm kur</Text>
        </View>
        <View style={{ backgroundColor: C.cyan + '20', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.cyan + '50' }}>
          <Text style={{ color: C.cyan, fontSize: 12, fontWeight: '700' }}>Ekle ▶</Text>
        </View>
      </View>

      {/* ── HISTORY ── */}
      {logs.length > 0 && (
        <>
          <Text style={[d.sectionTitle, { marginBottom: 10, marginTop: 8 }]}>GEÇMİŞ ÖLÇÜMLER</Text>
          {logs.slice(0, 10).map((l, i) => {
            const cls = classifyBP(l.sys, l.dia);
            return (
              <View key={i} style={[d.suRow, { borderLeftWidth: 3, borderLeftColor: cls.color }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 15, fontWeight: '800' }}>
                    {l.sys}/{l.dia} <Text style={{ color: C.muted, fontSize: 11, fontWeight: '400' }}>mmHg</Text>
                    {'  '}<Text style={{ color: C.amber, fontSize: 13 }}>{l.pulse} BPM</Text>
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{fmtDate(l.date)}{l.note ? ' · ' + l.note : ''}</Text>
                </View>
                <View style={{ backgroundColor: cls.color + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: cls.color, fontSize: 11, fontWeight: '700' }}>{cls.label}</Text>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* ── ADD RECORD BUTTON ── */}
      <TouchableOpacity onPress={() => setModal(true)} activeOpacity={0.85} style={{ marginTop: 16 }}>
        <LinearGradient colors={GRAD.orchid} style={{ borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>+ Kayıt Ekle</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ── ADD RECORD MODAL ── */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setModal(false)}>
            <TouchableOpacity activeOpacity={1} style={[d.measModal, { maxHeight: '90%' }]} onPress={() => {}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={d.measModalTitle}>Yeni Tansiyon Kaydı</Text>

                {/* Drum pickers */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <DrumPicker min={60} max={200} value={sys} onChange={setSys} color={C.orchid} />
                    <Text style={{ color: C.muted, fontSize: 11 }}>Sistolik</Text>
                  </View>
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <DrumPicker min={40} max={130} value={dia} onChange={setDia} color={C.cyan} />
                    <Text style={{ color: C.muted, fontSize: 11 }}>Diastolik</Text>
                  </View>
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <DrumPicker min={40} max={180} value={pulse} onChange={setPulse} color={C.amber} />
                    <Text style={{ color: C.muted, fontSize: 11 }}>Nabız</Text>
                  </View>
                </View>

                {/* Live classification */}
                <View style={{ alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ backgroundColor: curClass.color + '20', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7, borderWidth: 1, borderColor: curClass.color + '50' }}>
                    <Text style={{ color: curClass.color, fontSize: 15, fontWeight: '900' }}>{curClass.label}</Text>
                  </View>
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>SIS {sys}–{sys+10} ve DIA {dia}–{dia+10}</Text>
                </View>

                {/* Gradient bar */}
                <View style={{ flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
                  {BP_CLASSES.map(c => <View key={c.label} style={{ flex: 1, backgroundColor: c.color }} />)}
                </View>

                {/* Note toggle */}
                <TouchableOpacity onPress={() => setNoteVisible(v => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, alignSelf: 'flex-end' }}>
                  <Ionicons name="document-text-outline" size={14} color={C.orchid} />
                  <Text style={{ color: C.orchid, fontSize: 12, fontWeight: '700' }}>Not {noteVisible ? '▲' : '+'}</Text>
                </TouchableOpacity>
                {noteVisible && (
                  <TextInput
                    style={[d.measInput, { width: '100%', height: 44, marginBottom: 12, textAlign: 'left', paddingHorizontal: 12 }]}
                    value={note} onChangeText={setNote}
                    placeholder="Not ekle..." placeholderTextColor={C.muted}
                  />
                )}

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={d.cancelBtn} onPress={() => setModal(false)}>
                    <Text style={{ color: C.muted, fontWeight: '700' }}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={d.saveBtn} onPress={saveRecord}>
                    <Text style={{ color: C.bg, fontWeight: '900' }}>Kaydet ✓</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

// ─── Kan Şekeri (Blood Sugar) tab ─────────────────────────────────────────────
function KanSekeri() {
  const [logs,   setLogs]   = useState([]);
  const [modal,  setModal]  = useState(false);
  const [value,  setValue]  = useState(100);
  const [type,   setType]   = useState('Açken');
  const [note,   setNote]   = useState('');

  useFocusEffect(useCallback(() => { getBSLogs().then(setLogs); }, []));

  const saveRecord = async () => {
    await saveBSRecord({ value, unit: 'mg/dL', type, note });
    setLogs(await getBSLogs());
    setModal(false);
  };

  const latest = logs[0];
  const latestCls = latest ? classifyBS(latest.value, latest.type) : null;

  function fmtDate(iso) {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* ── LAST READING ── */}
      {latest && (
        <View style={[d.card, { borderColor: latestCls.color + '50' }]}>
          <Text style={d.cardTitle}>Son Ölçüm</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: latestCls.color, fontSize: 48, fontWeight: '900', lineHeight: 52 }}>{latest.value}</Text>
              <Text style={{ color: C.muted, fontSize: 13 }}>mg/dL</Text>
              <View style={{ backgroundColor: latestCls.color + '20', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6, borderWidth: 1, borderColor: latestCls.color + '40' }}>
                <Text style={{ color: latestCls.color, fontSize: 12, fontWeight: '800' }}>{latestCls.label}</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={[d.suRow, { borderLeftWidth: 3, borderLeftColor: '#10b981' }]}>
                <View><Text style={{ color: C.muted, fontSize: 10 }}>Açken Normal</Text><Text style={{ color: C.text, fontSize: 12 }}>70–99 mg/dL</Text></View>
              </View>
              <View style={[d.suRow, { borderLeftWidth: 3, borderLeftColor: '#f59e0b' }]}>
                <View><Text style={{ color: C.muted, fontSize: 10 }}>Açken Riskli</Text><Text style={{ color: C.text, fontSize: 12 }}>100–125 mg/dL</Text></View>
              </View>
              <View style={[d.suRow, { borderLeftWidth: 3, borderLeftColor: '#f43f5e' }]}>
                <View><Text style={{ color: C.muted, fontSize: 10 }}>Diyabet</Text><Text style={{ color: C.text, fontSize: 12 }}>≥126 mg/dL</Text></View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ── TYPE SELECTOR ── */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {['Açken', 'Tokluk', 'Rastgele'].map(tp => (
          <TouchableOpacity key={tp} onPress={() => setType(tp)}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 1, alignItems: 'center',
              borderColor: type === tp ? C.orchid : C.border2,
              backgroundColor: type === tp ? C.orchid + '18' : 'transparent' }}>
            <Text style={{ color: type === tp ? C.orchid : C.muted, fontSize: 12, fontWeight: '700' }}>{tp}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── HISTORY ── */}
      {logs.length > 0 && (
        <>
          <Text style={[d.sectionTitle, { marginBottom: 10 }]}>GEÇMİŞ ÖLÇÜMLER</Text>
          {logs.slice(0, 10).map((l, i) => {
            const cls = classifyBS(l.value, l.type);
            return (
              <View key={i} style={[d.suRow, { borderLeftWidth: 3, borderLeftColor: cls.color }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 15, fontWeight: '800' }}>
                    {l.value} <Text style={{ color: C.muted, fontSize: 11, fontWeight: '400' }}>{l.unit}</Text>
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{fmtDate(l.date)} · {l.type}</Text>
                </View>
                <View style={{ backgroundColor: cls.color + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: cls.color, fontSize: 11, fontWeight: '700' }}>{cls.label}</Text>
                </View>
              </View>
            );
          })}
        </>
      )}

      <TouchableOpacity onPress={() => setModal(true)} activeOpacity={0.85} style={{ marginTop: 16 }}>
        <LinearGradient colors={GRAD.orchid} style={{ borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>+ Kayıt Ekle</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setModal(false)}>
            <TouchableOpacity activeOpacity={1} style={d.measModal} onPress={() => {}}>
              <Text style={d.measModalTitle}>Kan Şekeri Kaydı</Text>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <DrumPicker min={40} max={500} value={value} onChange={setValue} color={C.orchid} width={100} />
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>mg/dL</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                {['Açken', 'Tokluk', 'Rastgele'].map(tp => (
                  <TouchableOpacity key={tp} onPress={() => setType(tp)}
                    style={{ flex: 1, paddingVertical: 7, borderRadius: 10, borderWidth: 1, alignItems: 'center',
                      borderColor: type === tp ? C.orchid : C.border2,
                      backgroundColor: type === tp ? C.orchid + '18' : 'transparent' }}>
                    <Text style={{ color: type === tp ? C.orchid : C.muted, fontSize: 12, fontWeight: '700' }}>{tp}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={d.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={{ color: C.muted, fontWeight: '700' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={d.saveBtn} onPress={saveRecord}>
                  <Text style={{ color: C.bg, fontWeight: '900' }}>Kaydet ✓</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── Beslenme ─────────────────────────────────────────────────────────────────
const MEAL_COLORS = [C.emerald, C.blue, C.orchid, C.amber, C.cyan, C.rose];

function Beslenme() {
  const { lang }            = useLang();
  const [goals,    setGoals]   = useState(null);
  const [meals,    setMeals]   = useState([]);
  const [openIdx,  setOpenIdx] = useState(null);
  const [userId,   setUserId]  = useState(null);
  const [modal,    setModal]   = useState(false);
  const [editMeal, setEditMeal]= useState(null);
  const [form, setForm]        = useState({ title:'', time_hint:'', calories:0, protein_g:0, carb_g:0, fat_g:0, description:'' });
  const [goalModal, setGoalModal] = useState(false);
  const [goalForm,  setGoalForm]  = useState({});

  useFocusEffect(useCallback(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      const uid = data.user.id;
      setUserId(uid);
      Promise.all([getNutritionGoals(uid), getMealTemplates(uid)]).then(([g, m]) => {
        setGoals(g); setMeals(m);
      }).catch(() => {});
    });
  }, []));

  const totals = meals.reduce((acc, m) => ({
    p: acc.p + (m.protein_g ?? 0),
    c: acc.c + (m.carb_g ?? 0),
    y: acc.y + (m.fat_g ?? 0),
    k: acc.k + (m.calories ?? 0),
  }), { p: 0, c: 0, y: 0, k: 0 });

  const targets = { p: goals?.protein_g ?? 150, c: goals?.carb_g ?? 200, y: goals?.fat_g ?? 60, k: goals?.calories ?? 2000 };

  async function handleSaveMeal() {
    if (!form.title.trim() || !userId) return;
    await saveMealTemplate(userId, editMeal ? { ...editMeal, ...form } : form);
    setMeals(await getMealTemplates(userId));
    setModal(false); setEditMeal(null);
    setForm({ title:'', time_hint:'', calories:0, protein_g:0, carb_g:0, fat_g:0, description:'' });
  }

  async function handleDeleteMeal(meal) {
    Alert.alert(t('deleteConfirmTitle', lang), `"${meal.title}" silinsin mi?`, [
      { text: t('cancel', lang), style: 'cancel' },
      { text: t('delete', lang), style: 'destructive', onPress: async () => {
        await deleteMealTemplate(meal.id);
        setMeals(await getMealTemplates(userId));
      }},
    ]);
  }

  async function handleSaveGoals() {
    if (!userId) return;
    await upsertNutritionGoals(userId, goalForm);
    setGoals({ ...goals, ...goalForm });
    setGoalModal(false);
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>

      {/* Makro özeti */}
      <View style={d.card}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <Text style={d.cardTitle}>Makro Durumu</Text>
          <TouchableOpacity onPress={() => { setGoalForm({ protein_g: targets.p, carb_g: targets.c, fat_g: targets.y, calories: targets.k }); setGoalModal(true); }}
            style={{ backgroundColor: C.orchid + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.orchid + '40' }}>
            <Text style={{ color: C.orchid, fontSize: 11, fontWeight: '700' }}>Hedefleri Düzenle</Text>
          </TouchableOpacity>
        </View>
        {[
          { label: t('protein', lang),  cur: totals.p, max: targets.p, unit:'g',  color: C.orchid  },
          { label: t('carbs', lang),    cur: totals.c, max: targets.c, unit:'g',  color: C.blue    },
          { label: t('fat', lang),      cur: totals.y, max: targets.y, unit:'g',  color: C.purple  },
          { label: t('calories', lang), cur: totals.k, max: targets.k, unit:'',   color: C.emerald },
        ].map(({ label, cur, max, unit, color }) => (
          <View key={label} style={{ marginBottom:10 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
              <Text style={{ color:C.muted, fontSize:12 }}>{label}</Text>
              <Text style={{ color, fontSize:12, fontWeight:'800' }}>{cur}{unit} / {max}{unit}</Text>
            </View>
            <View style={{ height:8, backgroundColor:C.s3, borderRadius:100, overflow:'hidden' }}>
              <View style={{ height:'100%', width:`${Math.min((cur/max)*100,100)}%`, backgroundColor:color, borderRadius:100 }} />
            </View>
          </View>
        ))}
      </View>

      {/* Öğün listesi */}
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <Text style={d.sectionTitle}>ÖĞÜNLER</Text>
        <TouchableOpacity onPress={() => { setEditMeal(null); setModal(true); }}
          style={{ backgroundColor: C.orchid + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.orchid + '40' }}>
          <Text style={{ color: C.orchid, fontSize: 11, fontWeight: '700' }}>+ Öğün Ekle</Text>
        </TouchableOpacity>
      </View>

      {meals.length === 0 ? (
        <View style={{ alignItems:'center', paddingVertical:32 }}>
          <Text style={{ color:C.muted, fontSize:13 }}>Henüz öğün yok. + Öğün Ekle ile başla.</Text>
        </View>
      ) : meals.map((meal, idx) => {
        const color  = MEAL_COLORS[idx % MEAL_COLORS.length];
        const isOpen = openIdx === idx;
        return (
          <View key={meal.id ?? idx} style={[d.mealCard, isOpen && { borderColor: color }]}>
            <View style={[d.mealBar, { backgroundColor: color }]} />
            <TouchableOpacity onPress={() => setOpenIdx(isOpen ? null : idx)} activeOpacity={0.8}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <View style={{ flex:1 }}>
                  <Text style={[d.mealTitle, { color }]}>{meal.title}</Text>
                  {meal.time_hint && <Text style={d.mealTime}>🕐 {meal.time_hint}</Text>}
                  {meal.description && !isOpen && <Text style={d.mealDesc}>{meal.description}</Text>}
                </View>
                <TouchableOpacity onPress={() => handleDeleteMeal(meal)} style={{ paddingHorizontal:8 }}>
                  <Ionicons name="trash-outline" size={15} color={C.dim} />
                </TouchableOpacity>
                <Text style={{ color:C.muted, fontSize:16 }}>{isOpen ? '▲' : '▼'}</Text>
              </View>
              <View style={d.macroRow}>
                {[['P',meal.protein_g+'g',C.orchid],['C',meal.carb_g+'g',C.blue],['Y',meal.fat_g+'g',C.purple],['kcal',meal.calories,C.emerald]].map(([k,v,c])=>(
                  <View key={k} style={d.macroBox}><Text style={[d.macroVal,{color:c}]}>{v}</Text><Text style={d.macroKey}>{k}</Text></View>
                ))}
              </View>
            </TouchableOpacity>
            {isOpen && meal.description && (
              <View style={d.mealNote}><Text style={d.mealNoteText}>{meal.description}</Text></View>
            )}
          </View>
        );
      })}

      {/* Hedef toplam */}
      <View style={d.totalCard}>
        <Text style={d.totalTitle}>GÜNLÜK HEDEF TOPLAM</Text>
        <View style={{flexDirection:'row',gap:8,marginTop:8}}>
          {[['Protein',targets.p+'g',C.orchid],['Carb',targets.c+'g',C.blue],['Yağ',targets.y+'g',C.purple],['Kalori',''+targets.k,C.emerald]].map(([k,v,c])=>(
            <View key={k} style={[d.macroBox,{flex:1}]}><Text style={[d.macroVal,{color:c,fontSize:15}]}>{v}</Text><Text style={d.macroKey}>{k}</Text></View>
          ))}
        </View>
      </View>

      {/* Öğün ekleme modalı */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
          <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setModal(false)}>
            <TouchableOpacity activeOpacity={1} style={d.measModal} onPress={()=>{}}>
              <ScrollView>
                <Text style={d.measModalTitle}>{editMeal ? 'Öğünü Düzenle' : 'Yeni Öğün'}</Text>
                {[
                  ['Öğün adı', 'title', false],
                  ['Saat (ör. 08:00)', 'time_hint', false],
                  ['Açıklama', 'description', false],
                ].map(([lbl, key]) => (
                  <View key={key} style={d.measInputRow}>
                    <Text style={d.measInputLabel}>{lbl}</Text>
                    <TextInput style={[d.measInput, {width:'50%'}]} value={String(form[key])} onChangeText={v => setForm(p=>({...p,[key]:v}))} placeholderTextColor={C.muted} placeholder={lbl} />
                  </View>
                ))}
                {[['Kalori','calories'],['Protein (g)','protein_g'],['Karb (g)','carb_g'],['Yağ (g)','fat_g']].map(([lbl,key])=>(
                  <View key={key} style={d.measInputRow}>
                    <Text style={d.measInputLabel}>{lbl}</Text>
                    <TextInput style={d.measInput} value={String(form[key])} onChangeText={v => setForm(p=>({...p,[key]:parseInt(v)||0}))} keyboardType="number-pad" placeholderTextColor={C.muted} placeholder="0" />
                  </View>
                ))}
                <View style={{flexDirection:'row',gap:10,marginTop:16}}>
                  <TouchableOpacity style={d.cancelBtn} onPress={() => setModal(false)}><Text style={{color:C.muted,fontWeight:'700'}}>İptal</Text></TouchableOpacity>
                  <TouchableOpacity style={d.saveBtn} onPress={handleSaveMeal}><Text style={{color:C.bg,fontWeight:'900'}}>Kaydet ✓</Text></TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Hedef düzenleme modalı */}
      <Modal visible={goalModal} transparent animationType="slide" onRequestClose={() => setGoalModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
          <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setGoalModal(false)}>
            <TouchableOpacity activeOpacity={1} style={d.measModal} onPress={()=>{}}>
              <Text style={d.measModalTitle}>Günlük Hedefler</Text>
              {[['Kalori','calories'],['Protein (g)','protein_g'],['Karbonhidrat (g)','carb_g'],['Yağ (g)','fat_g']].map(([lbl,key])=>(
                <View key={key} style={d.measInputRow}>
                  <Text style={d.measInputLabel}>{lbl}</Text>
                  <TextInput style={d.measInput} value={String(goalForm[key]??0)} onChangeText={v=>setGoalForm(p=>({...p,[key]:parseInt(v)||0}))} keyboardType="number-pad" placeholderTextColor={C.muted} placeholder="0" />
                </View>
              ))}
              <View style={{flexDirection:'row',gap:10,marginTop:16}}>
                <TouchableOpacity style={d.cancelBtn} onPress={()=>setGoalModal(false)}><Text style={{color:C.muted,fontWeight:'700'}}>İptal</Text></TouchableOpacity>
                <TouchableOpacity style={d.saveBtn} onPress={handleSaveGoals}><Text style={{color:C.bg,fontWeight:'900'}}>Kaydet ✓</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── Su ───────────────────────────────────────────────────────────────────────
function Su() {
  const [done,     setDone]     = useState({});
  const [recentLog, setLog]     = useState([]);
  const fillAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    Promise.all([getDoneToday(), getRecentLog(7)]).then(([d, log]) => {
      setDone(d); setLog(log);
    });
  }, []));

  // Su görevleri ve mL değerleri
  const WATER_TASKS = [
    { ids:['wi_detoks','ct_detoks','pz_detoks'],           label:'Detoks iksiri',     ml:200,  color:C.emerald  },
    { ids:['wi_ogun_2','ct_ogun_2','pz_ogun_2'],           label:'Öğün 2 shake',      ml:300,  color:C.blue   },
    { ids:['wi_su_1','ct_su_1','pz_su_1'],                 label:'Su alarm — 09:30',  ml:250,  color:C.blue   },
    { ids:['wi_su_2','ct_su_2','pz_su_2'],                 label:'Su alarm — 11:00',  ml:250,  color:C.blue   },
    { ids:['wi_preworkout','ct_preworkout'],                label:'Pre-workout suyu',  ml:500,  color:C.rose    },
    { ids:['wi_su_3','ct_su_3','pz_su_3'],                 label:'Su alarm — 14:30',  ml:250,  color:C.blue   },
    { ids:['wi_ogun_4','ct_ogun_4','pz_ogun_4'],           label:'Öğün 4 shake',      ml:300,  color:C.blue   },
    { ids:['wi_su_4','ct_su_4','pz_su_4'],                 label:'Su alarm — 21:00',  ml:250,  color:C.blue   },
  ];
  const TARGET_ML = 2300; // alarm + shake suları

  let consumedMl = 0;
  WATER_TASKS.forEach(t => { if (t.ids.some(id => done[id])) consumedMl += t.ml; });
  const pct = Math.min(Math.round((consumedMl / TARGET_ML) * 100), 100);

  // Kafein hesabı
  const kafeinDone = ['wi_preworkout','ct_preworkout'].some(id => done[id]);
  const kafein = kafeinDone ? 200 : 0;

  // Animasyon
  useEffect(() => {
    Animated.timing(fillAnim, { toValue: pct / 100, duration:800, useNativeDriver:false }).start();
  }, [pct]);

  // 7 günlük su ısı haritası
  const last7 = getLast7Dates();
  const heatmap = last7.map(dateStr => {
    const entry = recentLog.find(e => e?.date === dateStr);
    if (!entry) return { dateStr, score: -1 };
    const waterDone = (entry.completed || []).filter(t =>
      t.id.includes('_su_') || t.id.includes('_detoks')
    ).length;
    return { dateStr, score: waterDone };
  });

  function heatColor(score) {
    if (score < 0)  return C.s3;
    if (score === 0) return C.rose + '88';
    if (score <= 2)  return C.orange + 'aa';
    if (score <= 4)  return C.orchid + 'aa';
    return C.emerald;
  }

  const fillWidth = fillAnim.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });

  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>

      {/* Büyük su dolum göstergesi */}
      <View style={d.card}>
        <Text style={d.cardTitle}>💧 Bugünkü Su Durumu</Text>
        <View style={{ alignItems:'center', paddingVertical:16 }}>
          <Text style={{ color:C.blue, fontSize:48, fontWeight:'900', lineHeight:52 }}>
            {consumedMl}<Text style={{ fontSize:18, fontWeight:'400' }}>ml</Text>
          </Text>
          <Text style={{ color:C.muted, fontSize:13, marginTop:4 }}>
            Hedef: {TARGET_ML}ml · %{pct} tamamlandı
          </Text>
        </View>
        <View style={{ height:16, backgroundColor:C.s3, borderRadius:100, overflow:'hidden', marginBottom:8 }}>
          <Animated.View style={{ height:'100%', width: fillWidth, backgroundColor:C.blue, borderRadius:100 }} />
        </View>
        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          <Text style={{ color:C.muted, fontSize:11 }}>0ml</Text>
          <Text style={{ color:C.blue, fontSize:11, fontWeight:'700' }}>
            {TARGET_ML - consumedMl > 0 ? `${TARGET_ML - consumedMl}ml kaldı` : '🎉 Hedef tamam!'}
          </Text>
          <Text style={{ color:C.muted, fontSize:11 }}>{TARGET_ML}ml</Text>
        </View>
      </View>

      {/* Kafein takibi */}
      <View style={[d.card, { borderColor: kafein > 0 ? C.orange + '55' : C.border }]}>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <Text style={d.cardTitle}>⚡ Kafein Takibi</Text>
          <Text style={{ color: kafein > 0 ? C.orange : C.muted, fontSize:18, fontWeight:'900' }}>
            {kafein}mg
          </Text>
        </View>
        <Text style={{ color:C.muted, fontSize:12, marginTop:4 }}>
          {kafein > 0
            ? 'Pre-workout aktif · Uyku saatinden 6+ saat önce kesilmeli'
            : 'Kafein alınmadı · Bugün spor günüyse pre-workout gelecek'}
        </Text>
        <View style={{ height:6, backgroundColor:C.s3, borderRadius:100, overflow:'hidden', marginTop:8 }}>
          <View style={{ height:'100%', width:`${Math.min((kafein/400)*100,100)}%`, backgroundColor:C.orange, borderRadius:100 }} />
        </View>
        <Text style={{ color:C.dim, fontSize:10, marginTop:4 }}>Güvenli limit: ~400mg/gün</Text>
      </View>

      {/* 7 günlük ısı haritası */}
      <View style={d.card}>
        <Text style={[d.cardTitle, { marginBottom:12 }]}>📅 Son 7 Gün — Su Tutarlılığı</Text>
        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          {heatmap.map((day, i) => {
            const dayOfWeek = new Date(day.dateStr).getDay();
            return (
              <View key={i} style={{ alignItems:'center', gap:4 }}>
                <View style={{ width:32, height:32, borderRadius:8, backgroundColor: heatColor(day.score), alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ color:'#fff', fontSize:11, fontWeight:'800' }}>
                    {day.score >= 0 ? day.score : '?'}
                  </Text>
                </View>
                <Text style={{ color:C.muted, fontSize:10 }}>{GUN_LABELS[dayOfWeek]}</Text>
              </View>
            );
          })}
        </View>
        <Text style={{ color:C.muted, fontSize:10, marginTop:8, textAlign:'center' }}>
          Sayılar: tamamlanan su/detoks görev sayısı
        </Text>
      </View>

      {/* Su dağılım listesi */}
      <Text style={[d.sectionTitle, { marginBottom:10 }]}>GÜNLÜK DAĞILIM</Text>
      {WATER_TASKS.map((t, i) => {
        const isDone = t.ids.some(id => done[id]);
        return (
          <View key={i} style={[d.suRow, isDone && { borderColor: t.color + '55' }]}>
            <View style={{ width:10, height:10, borderRadius:5, backgroundColor: isDone ? t.color : C.dim, marginTop:2 }} />
            <Text style={[d.suLabel, isDone && { color: C.text }]}>{t.label}</Text>
            <Text style={{ color: isDone ? t.color : C.muted, fontWeight:'800', fontSize:13 }}>{t.ml}ml</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Vitamin ──────────────────────────────────────────────────────────────────
const SUP_COLORS = [C.orchid, C.blue, C.orange, C.emerald, C.rose, C.purple, C.cyan, C.amber, C.teal];

function Vitamin() {
  const { lang }                = useLang();
  const [sups,      setSups]    = useState([]);
  const [stock,     setStock]   = useState({});
  const [userId,    setUserId]  = useState(null);
  const [editModal, setEdit]    = useState(null);
  const [editVal,   setEditVal] = useState('');
  const [addModal,  setAddModal]= useState(false);
  const [newSup,    setNewSup]  = useState({ name:'', daily_dose:1, unit:'kapsul' });

  useFocusEffect(useCallback(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
      Promise.all([getSupplements(data.user.id), getVitaminStock()]).then(([s, st]) => {
        setSups(s); setStock(st);
      }).catch(() => {});
    });
  }, []));

  async function handleAddSup() {
    if (!newSup.name.trim() || !userId) return;
    const updated = [...sups, { ...newSup, color: SUP_COLORS[sups.length % SUP_COLORS.length] }];
    await saveSupplements(userId, updated);
    setSups(await getSupplements(userId));
    setAddModal(false);
    setNewSup({ name:'', daily_dose:1, unit:'kapsul' });
  }

  async function handleDeleteSup(idx) {
    const updated = sups.filter((_, i) => i !== idx);
    await saveSupplements(userId, updated);
    setSups(await getSupplements(userId));
  }

  async function saveStock() {
    const val = parseFloat(editVal);
    if (!isNaN(val) && val >= 0) {
      const key = editModal.id ?? editModal.name;
      const updated = { ...stock, [key]: val };
      await saveVitaminStock(updated);
      setStock(updated);
    }
    setEdit(null);
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>

      {/* Tips */}
      <View style={[d.card, { marginBottom:16 }]}>
        <Text style={d.cardTitle}>Emilim Ipuclari</Text>
        {[
          { emoji:'☀️', txt:'Yagda cozunen vitaminler (D3, K2) yagli yemekle al.', renk:C.orchid },
          { emoji:'🌙', txt:'Magnezyum glisinát — yatmadan 30-60dk once en etkili.', renk:C.purple },
          { emoji:'🍊', txt:'C vitamini, bitkisel demir emilimini 3x arttirir.', renk:C.orange },
          { emoji:'⏰', txt:'Kreatin — zamanlama degil tutarlilik onemli.', renk:C.rose },
        ].map((tip, i) => (
          <View key={i} style={[d.tipCard, { borderLeftColor: tip.renk }]}>
            <Text style={{ fontSize:16, marginRight:8 }}>{tip.emoji}</Text>
            <Text style={{ color:C.muted, fontSize:12, flex:1, lineHeight:16 }}>{tip.txt}</Text>
          </View>
        ))}
      </View>

      {/* Stok */}
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <Text style={d.sectionTitle}>STOK TAKIBI</Text>
        <TouchableOpacity onPress={() => setAddModal(true)}
          style={{ backgroundColor:C.orchid+'20', borderRadius:10, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:C.orchid+'40' }}>
          <Text style={{ color:C.orchid, fontSize:11, fontWeight:'700' }}>+ Takviye Ekle</Text>
        </TouchableOpacity>
      </View>

      {sups.length === 0 ? (
        <Text style={{ color:C.muted, textAlign:'center', paddingVertical:24 }}>Takviye eklemediniz.</Text>
      ) : sups.map((sup, i) => {
        const key = sup.id ?? sup.name;
        const mevcut = stock[key];
        const gunKaldi = mevcut !== undefined ? Math.floor(mevcut / (sup.daily_dose || 1)) : null;
        const dusuk = gunKaldi !== null && gunKaldi < 10;
        const color = sup.color ?? SUP_COLORS[i % SUP_COLORS.length];
        return (
          <TouchableOpacity key={key} style={[d.vitStockRow, dusuk && { borderColor:C.rose+'88' }]}
            onPress={() => { setEdit(sup); setEditVal(mevcut !== undefined ? String(mevcut) : ''); }} activeOpacity={0.75}>
            <View style={{ width:8, height:8, borderRadius:4, backgroundColor:color, marginTop:2, flexShrink:0 }} />
            <View style={{ flex:1, marginLeft:10 }}>
              <Text style={{ color:C.text, fontSize:13, fontWeight:'700' }}>{sup.name}</Text>
              <Text style={{ color:C.muted, fontSize:11 }}>{sup.daily_dose} {sup.unit}/gun</Text>
            </View>
            <View style={{ alignItems:'flex-end' }}>
              {gunKaldi !== null ? (
                <>
                  <Text style={{ color:dusuk ? C.rose : color, fontSize:14, fontWeight:'900' }}>{mevcut} {sup.unit}</Text>
                  <Text style={{ color:dusuk ? C.rose : C.muted, fontSize:10 }}>{dusuk ? '⚠️ ' : ''}{gunKaldi} gun kaldi</Text>
                </>
              ) : <Text style={{ color:C.muted, fontSize:12 }}>Stok gir</Text>}
            </View>
            <TouchableOpacity onPress={() => handleDeleteSup(i)} style={{ paddingLeft:10 }}>
              <Ionicons name="trash-outline" size={14} color={C.dim} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      {sups.length > 0 && (
        <View style={[d.card, { marginTop:16 }]}>
          <Text style={d.cardTitle}>Aylik Tuketim Tahmini</Text>
          <View style={{ marginTop:8, gap:4 }}>
            {sups.map((s, i) => (
              <View key={i} style={{ flexDirection:'row', justifyContent:'space-between' }}>
                <Text style={{ color:C.muted, fontSize:12 }}>{s.name}</Text>
                <Text style={{ color:s.color ?? SUP_COLORS[i%SUP_COLORS.length], fontSize:12, fontWeight:'700' }}>~{(s.daily_dose||1)*30} {s.unit}/ay</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {editModal && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setEdit(null)}>
          <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{ flex:1 }}>
            <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setEdit(null)}>
              <TouchableOpacity activeOpacity={1} style={d.smallModal} onPress={()=>{}}>
                <Text style={d.measModalTitle}>{editModal.name}</Text>
                <Text style={{ color:C.muted, fontSize:12, marginBottom:12, textAlign:'center' }}>Stok ({editModal.unit})</Text>
                <TextInput style={[d.measInput,{width:'100%',marginBottom:16,fontSize:20,height:52}]} value={editVal} onChangeText={setEditVal} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={C.muted} autoFocus />
                <View style={{ flexDirection:'row', gap:10 }}>
                  <TouchableOpacity style={d.cancelBtn} onPress={() => setEdit(null)}><Text style={{ color:C.muted, fontWeight:'700' }}>Iptal</Text></TouchableOpacity>
                  <TouchableOpacity style={d.saveBtn} onPress={saveStock}><Text style={{ color:C.bg, fontWeight:'900' }}>Kaydet</Text></TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      )}

      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{ flex:1 }}>
          <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setAddModal(false)}>
            <TouchableOpacity activeOpacity={1} style={d.smallModal} onPress={()=>{}}>
              <Text style={d.measModalTitle}>Yeni Takviye</Text>
              {[['Ad','name'],['Birim (kapsul/g/ml)','unit']].map(([lbl,key])=>(
                <View key={key} style={d.measInputRow}>
                  <Text style={d.measInputLabel}>{lbl}</Text>
                  <TextInput style={[d.measInput,{width:'55%'}]} value={newSup[key]} onChangeText={v=>setNewSup(p=>({...p,[key]:v}))} placeholderTextColor={C.muted} placeholder={lbl} />
                </View>
              ))}
              <View style={d.measInputRow}>
                <Text style={d.measInputLabel}>Gunluk Doz</Text>
                <TextInput style={d.measInput} value={String(newSup.daily_dose)} onChangeText={v=>setNewSup(p=>({...p,daily_dose:parseFloat(v)||1}))} keyboardType="decimal-pad" placeholderTextColor={C.muted} placeholder="1" />
              </View>
              <View style={{ flexDirection:'row', gap:10, marginTop:16 }}>
                <TouchableOpacity style={d.cancelBtn} onPress={() => setAddModal(false)}><Text style={{ color:C.muted, fontWeight:'700' }}>Iptal</Text></TouchableOpacity>
                <TouchableOpacity style={d.saveBtn} onPress={handleAddSup}><Text style={{ color:C.bg, fontWeight:'900' }}>Ekle</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
// ─── Detoks ───────────────────────────────────────────────────────────────────
function Detoks() {
  const [timerActive,  setTimerActive]  = useState(false);
  const [currentStep,  setCurrentStep]  = useState(0);
  const [elapsed,      setElapsed]      = useState(0);
  const [recentLog,    setLog]          = useState([]);
  const intervalRef = useRef(null);

  useFocusEffect(useCallback(() => {
    getRecentLog(7).then(setLog);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []));

  const STEPS = [
    { isim:'🧅 Zencefil',    sure:30,  aciklama:'1-2cm taze rendeliyor • Kaba rende kullan' },
    { isim:'🍋 Limon',        sure:20,  aciklama:'½ limonun suyunu sık • Tohumları at' },
    { isim:'🫛 Pancar',       sure:20,  aciklama:'¼ küçük pancarın suyunu sık' },
    { isim:'🟡 Zerdeçal + Biber', sure:5, aciklama:'¼ tsp zerdeçal + 1 tutam kara biber • Biber emilim için ŞART' },
    { isim:'🍂 Tarçın',       sure:5,   aciklama:'¼ tsp Ceylon tarçını ekle' },
    { isim:'💧 Ilık Su',      sure:60,  aciklama:'200ml 50-60°C su ekle • Karıştır • 1dk beklet • İç' },
  ];

  const totalSure = STEPS.reduce((s, st) => s + st.sure, 0);

  const startTimer = () => {
    setTimerActive(true);
    setElapsed(0);
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
      setElapsed(0);
    } else {
      clearInterval(intervalRef.current);
      setTimerActive(false);
      setCurrentStep(0);
      setElapsed(0);
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimerActive(false);
    setCurrentStep(0);
    setElapsed(0);
  };

  const step = STEPS[currentStep];
  const stepPct = Math.min((elapsed / step.sure) * 100, 100);

  // 7 günlük tutarlılık
  const last7 = getLast7Dates();
  const consistency = last7.map(dateStr => {
    const entry = recentLog.find(e => e?.date === dateStr);
    if (!entry) return { dateStr, done: false, noData: true };
    const detoksDone = (entry.completed || []).some(t => t.id.includes('_detoks'));
    return { dateStr, done: detoksDone, noData: false };
  });

  const doneCount = consistency.filter(d => d.done).length;

  const ALISVERIS = [
    { isim:'Taze Zencefil', miktar:'~14cm kök (1 hafta)', not:'Küçük zencefil kökleri al' },
    { isim:'Limon',          miktar:'4 adet / hafta',       not:'Oda sıcaklığında kalsın' },
    { isim:'Pancar',         miktar:'2 küçük / hafta',      not:'Taze tercih et' },
    { isim:'Zerdeçal',       miktar:'1 tsp × 7 = ~7g',      not:'Taze veya toz' },
    { isim:'Ceylon Tarçını', miktar:'~7g / hafta',           not:'Çin tarçını değil!' },
    { isim:'Kara Biber',     miktar:'Az · 1 hafta',          not:'Zerdeçal ile zorunlu' },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>

      {/* 7 günlük tutarlılık */}
      <View style={d.card}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <Text style={d.cardTitle}>📅 Son 7 Gün Tutarlılık</Text>
          <Text style={{ color:C.orchid, fontSize:13, fontWeight:'900' }}>{doneCount}/7</Text>
        </View>
        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          {consistency.map((day, i) => {
            const dayOfWeek = new Date(day.dateStr).getDay();
            return (
              <View key={i} style={{ alignItems:'center', gap:4 }}>
                <View style={{
                  width:34, height:34, borderRadius:8,
                  backgroundColor: day.noData ? C.s3 : day.done ? C.orchid : C.rose + '66',
                  alignItems:'center', justifyContent:'center',
                }}>
                  <Text style={{ fontSize:16 }}>{day.noData ? '?' : day.done ? '✓' : '✗'}</Text>
                </View>
                <Text style={{ color:C.muted, fontSize:10 }}>{GUN_LABELS[dayOfWeek]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Adım adım zamanlayıcı */}
      <View style={d.card}>
        <Text style={d.cardTitle}>⏱️ Hazırlık Zamanlayıcısı</Text>
        <Text style={{ color:C.muted, fontSize:11, marginBottom:16 }}>
          Toplam süre: ~{totalSure} saniye
        </Text>

        {!timerActive ? (
          <TouchableOpacity style={d.startBtn} onPress={startTimer}>
            <Text style={{ color:C.bg, fontWeight:'900', fontSize:15 }}>▶ Başla</Text>
          </TouchableOpacity>
        ) : (
          <View>
            {/* Adım sayacı */}
            <View style={{ flexDirection:'row', gap:4, marginBottom:12 }}>
              {STEPS.map((_, i) => (
                <View key={i} style={{ flex:1, height:4, borderRadius:2, backgroundColor: i < currentStep ? C.orchid : i === currentStep ? C.blue : C.s3 }} />
              ))}
            </View>

            {/* Mevcut adım */}
            <View style={{ backgroundColor:C.s2, borderRadius:12, padding:16, marginBottom:12 }}>
              <Text style={{ color:C.orchid, fontSize:11, fontWeight:'700', marginBottom:4 }}>
                ADIM {currentStep + 1} / {STEPS.length}
              </Text>
              <Text style={{ color:C.text, fontSize:16, fontWeight:'800', marginBottom:6 }}>
                {step.isim}
              </Text>
              <Text style={{ color:C.muted, fontSize:12, lineHeight:18 }}>{step.aciklama}</Text>
            </View>

            {/* Progress bar + süre */}
            <View style={{ height:8, backgroundColor:C.s3, borderRadius:100, overflow:'hidden', marginBottom:6 }}>
              <View style={{ height:'100%', width:`${stepPct}%`, backgroundColor:C.blue, borderRadius:100 }} />
            </View>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:16 }}>
              <Text style={{ color:C.muted, fontSize:12 }}>{elapsed}s geçti</Text>
              <Text style={{ color:C.blue, fontSize:12, fontWeight:'700' }}>
                Hedef: {step.sure}s
              </Text>
            </View>

            <View style={{ flexDirection:'row', gap:8 }}>
              <TouchableOpacity style={[d.cancelBtn, { flex:1 }]} onPress={resetTimer}>
                <Text style={{ color:C.muted, fontWeight:'700' }}>Sıfırla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={d.saveBtn} onPress={nextStep}>
                <Text style={{ color:C.bg, fontWeight:'900' }}>
                  {currentStep < STEPS.length - 1 ? 'Sonraki Adım ▶' : '✓ Tamamlandı!'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* İçerik bilgisi */}
      <Text style={[d.sectionTitle, { marginBottom:10 }]}>🌿 MALZEME & FAYDASI</Text>
      {[
        ['Zencefil','1-2cm taze rendelenmiş','Anti-inflamatuar · Sindirim ↑ · Bağırsak hareketi ↑',C.emerald],
        ['Limon','½ taze sıkılmış','Karaciğer detoksu · C vitamini · pH dengesi',C.orchid],
        ['Pancar','¼ küçük, suyunu sık','Nitrat → NO → kan dolaşımı ↑ · Cilt yenilenmesi',C.rose],
        ['Zerdeçal','¼ tsp + kara biber','Kurkumin: anti-inflamatuar · Biber emilim için ŞART',C.orange],
        ['Ceylon Tarçını','¼ tsp','Kan şekeri dengesi · Antioksidan',C.orange],
        ['Kara Biber','1 tutam','Zerdeçal emilimini %2000 artırır',C.muted],
        ['Ilık Su','200ml (50-60°C)','Enzimler korunur · Bağırsak uyandırılır',C.blue],
      ].map(([isim,miktar,fayda,renk],i)=>(
        <View key={i} style={[d.mealCard, { marginBottom:6 }]}>
          <View style={[d.mealBar,{backgroundColor:renk}]} />
          <Text style={[d.mealTitle,{color:renk}]}>{isim}</Text>
          <Text style={d.vitaminDoz}>{miktar}</Text>
          <Text style={d.vitaminNot}>{fayda}</Text>
        </View>
      ))}

      {/* Alışveriş listesi */}
      <Text style={[d.sectionTitle, { marginTop:16, marginBottom:10 }]}>🛒 HAFTALIK ALIŞVERİŞ LİSTESİ</Text>
      {ALISVERIS.map((item, i) => (
        <View key={i} style={d.suRow}>
          <View style={{ flex:1 }}>
            <Text style={{ color:C.text, fontSize:13, fontWeight:'700' }}>{item.isim}</Text>
            <Text style={{ color:C.muted, fontSize:11 }}>{item.not}</Text>
          </View>
          <Text style={{ color:C.orchid, fontWeight:'800', fontSize:12 }}>{item.miktar}</Text>
        </View>
      ))}
      <View style={[d.mealNote, { marginTop:8 }]}>
        <Text style={d.mealNoteText}>🛒 Cumartesi 15:00 — Alışveriş hatırlatması · Stokları kontrol et!</Text>
      </View>
    </ScrollView>
  );
}

// ─── Uyku ─────────────────────────────────────────────────────────────────────
function Uyku() {
  const [logs, setLogs] = useState([]);
  useFocusEffect(useCallback(() => { getSleepLogs().then(setLogs); }, []));
  function fmt(mins) { const h=Math.floor(mins/60); const m=mins%60; return `${h}s ${m>0?m+'dk':''}`.trim(); }
  function quality(mins) {
    if (mins >= 450) return { label:'Mükemmel', color:C.emerald, pct:100 };
    if (mins >= 390) return { label:'İyi',       color:C.orchid,  pct:85  };
    if (mins >= 360) return { label:'Orta',      color:C.orange,pct:65  };
    return                  { label:'Yetersiz',  color:C.rose,   pct:40  };
  }
  function fmtTime(iso) { const d=new Date(iso); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
  const avg = logs.length > 0 ? Math.round(logs.reduce((s,l)=>s+l.durationMins,0)/logs.length) : 0;
  return (
    <ScrollView contentContainerStyle={{padding:16,paddingBottom:32}}>
      <View style={d.card}>
        <Text style={d.cardTitle}>😴 Uyku Takibi</Text>
        <Text style={{ color:C.muted, fontSize:12, marginTop:4 }}>Uyku görevi tamamlandığında otomatik kaydedilir. Hedef: 7-8 saat</Text>
      </View>
      {avg > 0 && (
        <View style={[d.card,{borderColor:'rgba(167,139,250,0.3)'}]}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <Text style={d.cardTitle}>Ortalama Uyku</Text>
            <Text style={{ color:C.purple, fontSize:20, fontWeight:'900' }}>{fmt(avg)}</Text>
          </View>
          <View style={{height:8,backgroundColor:C.s3,borderRadius:100,overflow:'hidden',marginTop:10}}>
            <View style={{height:'100%',width:`${Math.min((avg/480)*100,100)}%`,backgroundColor:C.purple,borderRadius:100}} />
          </View>
          <Text style={{color:C.muted,fontSize:11,marginTop:4}}>{quality(avg).label} · Son {logs.length} gün ortalaması</Text>
        </View>
      )}
      {logs.length === 0 ? (
        <View style={{alignItems:'center',paddingVertical:40}}>
          <Text style={{fontSize:40,marginBottom:12}}>💤</Text>
          <Text style={{color:C.muted,fontSize:14,textAlign:'center',lineHeight:22}}>Henüz kayıt yok.{'\n'}Uyku görevini tamamladığında otomatik kaydedilecek.</Text>
        </View>
      ) : logs.map((log,i) => {
        const q = quality(log.durationMins);
        return (
          <View key={i} style={[d.sleepRow,{borderLeftColor:q.color}]}>
            <View style={{flex:1}}>
              <Text style={{color:C.text,fontSize:13,fontWeight:'700'}}>{log.date}</Text>
              <Text style={{color:C.muted,fontSize:11,marginTop:2}}>{fmtTime(log.sleepISO)} → {fmtTime(log.wakeISO)}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={{color:q.color,fontSize:15,fontWeight:'900'}}>{fmt(log.durationMins)}</Text>
              <Text style={{color:q.color,fontSize:10,fontWeight:'700'}}>{q.label}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Vücut ────────────────────────────────────────────────────────────────────
function Vucut() {
  const [measurements, setMeasurements] = useState([]);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [form, setForm] = useState({ kilo:'', boy:'', bel:'', gogus:'', kalca:'', kolL:'', kolR:'' });
  useFocusEffect(useCallback(() => { getBodyMeasurements().then(setMeasurements); }, []));
  const setF = (k, v) => setForm(p => ({...p, [k]:v}));
  const save = async () => {
    const data = {};
    Object.entries(form).forEach(([k,v]) => { if (v) data[k] = parseFloat(v)||v; });
    if (Object.keys(data).length === 0) { setModalOpen(false); return; }
    await saveBodyMeasurement(data);
    setMeasurements(await getBodyMeasurements());
    setModalOpen(false);
    setForm({kilo:'',boy:'',bel:'',gogus:'',kalca:'',kolL:'',kolR:''});
  };
  function bmi(m) { if (!m.kilo||!m.boy) return null; return (m.kilo/((m.boy/100)**2)).toFixed(1); }
  function fmtDate(iso) { const d=new Date(iso); const months=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']; return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`; }
  const latest = measurements[0];
  return (
    <ScrollView contentContainerStyle={{padding:16,paddingBottom:32}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <Text style={[d.cardTitle,{fontSize:14}]}>📏 Vücut Ölçümleri</Text>
        <TouchableOpacity style={d.addMeasBtn} onPress={()=>setModalOpen(true)}>
          <Text style={{color:C.bg,fontWeight:'900',fontSize:12}}>+ Ölçüm Ekle</Text>
        </TouchableOpacity>
      </View>
      {latest && (
        <View style={[d.card,{borderColor:'rgba(52,211,153,0.3)'}]}>
          <Text style={[d.cardTitle,{color:C.emerald,marginBottom:10}]}>Son Ölçüm — {fmtDate(latest.date)}</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
            {[['Kilo',latest.kilo,'kg'],['Boy',latest.boy,'cm'],['Bel',latest.bel,'cm'],['Göğüs',latest.gogus,'cm'],['Kalça',latest.kalca,'cm'],['Sol Kol',latest.kolL,'cm'],['Sağ Kol',latest.kolR,'cm']].filter(([,v])=>v!==undefined).map(([label,val,unit])=>(
              <View key={label} style={d.measBox}><Text style={d.measVal}>{val}<Text style={{fontSize:10}}>{unit}</Text></Text><Text style={d.measLabel}>{label}</Text></View>
            ))}
            {bmi(latest)&&<View style={[d.measBox,{borderColor:'rgba(232,244,74,0.3)'}]}><Text style={[d.measVal,{color:C.orchid}]}>{bmi(latest)}</Text><Text style={d.measLabel}>BMI</Text></View>}
          </View>
        </View>
      )}
      {measurements.length === 0 ? (
        <View style={{alignItems:'center',paddingVertical:40}}><Text style={{fontSize:40,marginBottom:12}}>📏</Text><Text style={{color:C.muted,fontSize:14,textAlign:'center',lineHeight:22}}>Henüz ölçüm yok.{'\n'}+ Ölçüm Ekle ile başla.</Text></View>
      ) : measurements.map((m,i) => (
        <View key={i} style={d.measHistRow}>
          <Text style={{color:C.muted,fontSize:11,width:90}}>{fmtDate(m.date)}</Text>
          <View style={{flex:1,flexDirection:'row',flexWrap:'wrap',gap:6}}>
            {[['⚖️',m.kilo,'kg'],['↕',m.boy,'cm'],['🔄',m.bel,'cm']].filter(([,v])=>v).map(([icon,val,unit],j)=>(<Text key={j} style={{color:C.text,fontSize:12}}>{icon} {val}{unit}</Text>))}
            {bmi(m)&&<Text style={{color:C.orchid,fontSize:12}}>BMI {bmi(m)}</Text>}
          </View>
        </View>
      ))}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={()=>setModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
          <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={()=>setModalOpen(false)}>
            <TouchableOpacity activeOpacity={1} style={d.measModal} onPress={()=>{}}>
              <Text style={d.measModalTitle}>📏 Yeni Ölçüm</Text>
              {[['kilo','Kilo','kg','75'],['boy','Boy','cm','178'],['bel','Bel','cm','80'],['gogus','Göğüs','cm','100'],['kalca','Kalça','cm','95'],['kolL','Sol Kol','cm','35'],['kolR','Sağ Kol','cm','35']].map(([key,label,unit,ph])=>(
                <View key={key} style={d.measInputRow}>
                  <Text style={d.measInputLabel}>{label} ({unit})</Text>
                  <TextInput style={d.measInput} value={form[key]} onChangeText={v=>setF(key,v)} keyboardType="decimal-pad" placeholder={ph} placeholderTextColor={C.muted} maxLength={6} />
                </View>
              ))}
              <View style={{flexDirection:'row',gap:10,marginTop:16}}>
                <TouchableOpacity style={d.cancelBtn} onPress={()=>setModalOpen(false)}><Text style={{color:C.muted,fontWeight:'700'}}>İptal</Text></TouchableOpacity>
                <TouchableOpacity style={d.saveBtn} onPress={save}><Text style={{color:C.bg,fontWeight:'900'}}>Kaydet ✓</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── Ana ─────────────────────────────────────────────────────────────────────
export default function DetailsScreen() {
  const [activeTab, setActiveTab] = useState('Tansiyon');
  const components = { 'Tansiyon': Tansiyon, 'Kan Şekeri': KanSekeri, Beslenme, Su, Vitamin, Detoks, Uyku, 'Vücut': Vucut };
  const ActiveComp = components[activeTab];
  return (
    <View style={d.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={d.tabBar} contentContainerStyle={d.tabBarContent}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[d.tab, activeTab===tab&&d.tabActive]} onPress={()=>setActiveTab(tab)}>
            <Text style={[d.tabText, activeTab===tab&&d.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ActiveComp />
    </View>
  );
}

const d = StyleSheet.create({
  root:          { flex:1, backgroundColor:C.bg },
  tabBar:        { backgroundColor:C.s1, borderBottomWidth:1, borderBottomColor:C.border, maxHeight:46, flexGrow:0 },
  tabBarContent: { paddingHorizontal:12, paddingVertical:6, gap:6, alignItems:'center' },
  tab:           { paddingHorizontal:14, paddingVertical:6, borderRadius:100, borderWidth:1, borderColor:C.border },
  tabActive:     { backgroundColor:C.orchid, borderColor:C.orchid },
  tabText:       { color:C.muted, fontSize:12, fontWeight:'700' },
  tabTextActive: { color:C.bg },

  card:          { backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderRadius:14, padding:14, marginBottom:12 },
  cardTitle:     { color:C.text, fontSize:13, fontWeight:'800' },
  mealBadge:     { borderWidth:1, borderColor:C.border, borderRadius:6, paddingHorizontal:8, paddingVertical:3 },

  infoCard:      { backgroundColor:'rgba(232,244,74,0.06)', borderWidth:1, borderColor:'rgba(232,244,74,0.2)', borderRadius:14, padding:14, marginBottom:14 },
  infoTitle:     { color:C.orchid, fontSize:14, fontWeight:'800', marginBottom:6 },
  infoText:      { color:C.muted, fontSize:13, lineHeight:20 },

  mealCard:      { backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderRadius:14, padding:14, marginBottom:10, overflow:'hidden' },
  mealBar:       { position:'absolute', top:0, left:0, bottom:0, width:3 },
  mealTitle:     { color:C.text, fontSize:14, fontWeight:'800', marginBottom:2 },
  mealTime:      { color:C.muted, fontSize:12, marginBottom:4 },
  mealDesc:      { color:C.muted, fontSize:12, marginTop:4 },
  mealNote:      { backgroundColor:'rgba(62,207,255,0.07)', borderRadius:8, padding:10, marginTop:8 },
  mealNoteText:  { color:C.blue, fontSize:12 },
  macroRow:      { flexDirection:'row', gap:8, marginTop:8 },
  macroBox:      { flex:1, alignItems:'center', backgroundColor:C.s2, borderRadius:8, paddingVertical:8 },
  macroVal:      { fontSize:13, fontWeight:'800' },
  macroKey:      { color:C.muted, fontSize:10, marginTop:2 },
  besinCard:     { backgroundColor:C.s2, borderRadius:10, padding:12, marginBottom:8, borderWidth:1, borderColor:C.border },
  besinIsim:     { color:C.text, fontSize:13, fontWeight:'700', marginBottom:6 },
  besinTag:      { backgroundColor:'rgba(232,244,74,0.1)', borderRadius:6, paddingHorizontal:8, paddingVertical:3 },
  besinTagText:  { color:C.orchid, fontSize:11, fontWeight:'600' },
  besinMakro:    { color:C.blue, fontSize:11, marginBottom:4, fontWeight:'600' },
  besinNot:      { color:C.muted, fontSize:12, lineHeight:18 },
  totalCard:     { backgroundColor:C.s2, borderRadius:12, padding:14, marginTop:8 },
  totalTitle:    { color:C.text, fontSize:13, fontWeight:'800' },
  suRow:         { flexDirection:'row', alignItems:'center', backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderRadius:10, padding:12, marginBottom:6, gap:10 },
  suTime:        { fontWeight:'800', fontSize:14, width:46 },
  suLabel:       { flex:1, color:C.muted, fontSize:13 },
  suMiktar:      { fontWeight:'700', fontSize:13, width:52, textAlign:'right' },
  sectionTitle:  { color:C.muted, fontSize:11, letterSpacing:2, fontWeight:'800' },
  vitaminRow:    { flexDirection:'row', gap:12, backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderRadius:10, padding:12, marginBottom:6 },
  vitaminDot:    { width:8, height:8, borderRadius:4, marginTop:5, flexShrink:0 },
  vitaminName:   { color:C.text, fontSize:13, fontWeight:'700' },
  vitaminDoz:    { color:C.orchid, fontSize:12, marginTop:2 },
  vitaminNot:    { color:C.muted, fontSize:11, marginTop:2, lineHeight:16 },

  tipCard:       { flexDirection:'row', alignItems:'flex-start', backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderLeftWidth:3, borderRadius:10, padding:12, marginBottom:8 },
  vitStockRow:   { flexDirection:'row', alignItems:'center', backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderRadius:10, padding:12, marginBottom:6 },

  startBtn:      { backgroundColor:C.orchid, borderRadius:12, padding:16, alignItems:'center' },

  sleepRow:      { backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderLeftWidth:3, borderLeftColor:C.emerald, borderRadius:10, padding:12, marginBottom:8, flexDirection:'row', alignItems:'center' },

  addMeasBtn:    { backgroundColor:C.emerald, borderRadius:10, paddingHorizontal:12, paddingVertical:8 },
  measBox:       { backgroundColor:C.s2, borderRadius:10, padding:10, alignItems:'center', borderWidth:1, borderColor:C.border, minWidth:72 },
  measVal:       { color:C.text, fontSize:16, fontWeight:'900' },
  measLabel:     { color:C.muted, fontSize:10, marginTop:2 },
  measHistRow:   { flexDirection:'row', backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderRadius:10, padding:12, marginBottom:6, gap:8, alignItems:'flex-start' },
  overlay:       { flex:1, backgroundColor:'rgba(0,0,0,0.8)', justifyContent:'center', alignItems:'center', padding:24 },
  measModal:     { backgroundColor:C.s1, borderRadius:20, padding:20, borderWidth:1, borderColor:C.border, width:'100%', maxWidth:400 },
  measModalTitle:{ color:C.text, fontSize:16, fontWeight:'900', marginBottom:16, textAlign:'center' },
  measInputRow:  { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  measInputLabel:{ color:C.muted, fontSize:13, flex:1 },
  measInput:     { width:100, height:40, backgroundColor:C.s2, borderRadius:10, borderWidth:1, borderColor:C.border, color:C.text, textAlign:'center', fontSize:14, fontWeight:'700' },
  smallModal:    { backgroundColor:C.s1, borderRadius:20, padding:20, borderWidth:1, borderColor:C.border, width:'85%', maxWidth:340 },
  cancelBtn:     { flex:1, height:44, borderRadius:12, borderWidth:1, borderColor:C.border, alignItems:'center', justifyContent:'center' },
  saveBtn:       { flex:2, height:44, borderRadius:12, backgroundColor:C.orchid, alignItems:'center', justifyContent:'center' },
});
