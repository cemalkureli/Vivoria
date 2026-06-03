import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { C, GRAD } from '../utils/theme';

// ─── Routine data ─────────────────────────────────────────────────────────────
const ROUTINES = {
  morning: {
    label: 'Sabah',
    icon:  'sunny',
    color: C.amber,
    grad:  GRAD.amber,
    steps: [
      {
        n: 1, ikon: 'water-outline', renk: C.cyan, zorunlu: true,
        isim: 'COSRX Low pH Gel Cleanser',
        sure: '30 sn',
        notlar: ['Islak yüze · 1 nohut', 'PAT PAT kuru', 'Yüz tamamen KURU olsun'],
      },
      {
        n: 2, ikon: 'flask-outline', renk: C.blue, zorunlu: false,
        isim: 'Hyaluronic Acid 2% + B5',
        sure: 'Emer',
        notlar: ['3 damla · hafif nemli cilt', 'Bastırarak uygula', '⚠️ Kuru yüze değil!'],
      },
      {
        n: 3, ikon: 'flask-outline', renk: C.purple, zorunlu: false,
        isim: 'Niacinamide 10% + Zinc 1%',
        sure: 'Emer',
        notlar: ['2 damla · hafif nemli cilt', 'Bastırarak uygula'],
      },
      {
        n: 4, ikon: 'sunny-outline', renk: C.amber, zorunlu: true,
        isim: 'Isntree SPF50+ Sun Gel',
        sure: 'Son adım',
        notlar: ['2 parmak · kuru cilt', 'Bastırarak yay', '🚫 ATLANMAZ — her gün'],
      },
    ],
    tips: [
      { ikon: 'alert-circle-outline', renk: C.amber, txt: 'SPF her gün, ister güneşli ister bulutlu — atlanmaz.' },
      { ikon: 'water-outline',        renk: C.cyan,  txt: 'HA, hafif nemli ciltte çalışır — kuru yüze sürme.' },
    ],
  },

  night: {
    label: 'Gece',
    icon:  'moon',
    color: C.cyan,
    grad:  GRAD.cyan,
    steps: [
      {
        n: 1, ikon: 'leaf-outline', renk: C.muted, zorunlu: false,
        isim: 'ANUA Heartleaf Cleansing Oil',
        sure: '1 dk',
        notlar: ['2 pompa · kuru yüze', 'Masaj yap · az su ekle → beyazlaşır', 'Durula · ⚠️ Islak yüze değil!'],
      },
      {
        n: 2, ikon: 'water-outline', renk: C.cyan, zorunlu: true,
        isim: 'COSRX Low pH Gel Cleanser',
        sure: '30 sn',
        notlar: ['1 nohut · ıslak yüze', 'PAT PAT kuru → Yüz KURU'],
      },
      {
        n: 3, ikon: 'sparkles-outline', renk: C.orchid, zorunlu: false,
        isim: 'Some By Mi AHA BHA Toner',
        sure: 'Emer',
        notlar: ['Birkaç damla · PAT PAT', 'Temizlik sonrası ilk adım', '⚠️ Doğrudan kuru cilde uygula'],
      },
      {
        n: 4, ikon: 'flask-outline', renk: C.blue, zorunlu: false,
        isim: 'Hyaluronic Acid 2% + B5',
        sure: 'Emer',
        notlar: ['3 damla · hafif nemli cilt', 'Bastırarak uygula'],
      },
      {
        n: 5, ikon: 'flask-outline', renk: C.purple, zorunlu: true,
        isim: 'Niacinamide 10% + Zinc 1%',
        sure: 'Son adım',
        notlar: ['2 damla · hafif nemli cilt', 'Bastırarak uygula'],
      },
    ],
    tips: [
      { ikon: 'moon-outline',   renk: C.cyan,   txt: 'Gece rutini cildin onarım sürecini destekler. Atlamazsın.' },
      { ikon: 'leaf-outline',   renk: C.emerald, txt: 'Oil cleanser çift temizlik için — makyap/güneş kremini tam siler.' },
    ],
  },

  sport: {
    label: 'Spor Sonrası',
    icon:  'barbell',
    color: C.emerald,
    grad:  GRAD.emerald,
    steps: [
      {
        n: 1, ikon: 'leaf-outline', renk: C.muted, zorunlu: false,
        isim: 'ANUA Cleansing Oil',
        sure: '1 dk',
        notlar: ['2 pompa · kuru yüze · masaj · durula'],
      },
      {
        n: 2, ikon: 'water-outline', renk: C.cyan, zorunlu: true,
        isim: 'COSRX Gel Cleanser',
        sure: '30 sn',
        notlar: ['1 nohut · 30sn · PAT PAT kuru'],
      },
      {
        n: 3, ikon: 'sparkles-outline', renk: C.orchid, zorunlu: false,
        isim: 'Some By Mi AHA BHA',
        sure: 'Emer',
        notlar: ['Birkaç damla · PAT PAT · eksfoliye + tonerla'],
      },
      {
        n: 4, ikon: 'flask-outline', renk: C.blue, zorunlu: false,
        isim: 'Hyaluronic Acid',
        sure: 'Emer',
        notlar: ['3 damla · hafif nemli cilt'],
      },
      {
        n: 5, ikon: 'flask-outline', renk: C.purple, zorunlu: true,
        isim: 'Niacinamide',
        sure: 'Son adım',
        notlar: ['2 damla · hafif nemli cilt'],
      },
    ],
    tips: [
      { ikon: 'fitness-outline', renk: C.emerald, txt: 'Spor sonrası tam gece rutini uygula — ter + tuz birikimi cilde zarar verir.' },
      { ikon: 'body-outline',    renk: C.orange,  txt: 'Haftada 2-3 kez: Village 11 Factory AHA Body Peeling · temiz kuru cilde, durulama yok.' },
    ],
  },
};

// ─── Ürün listesi (tümü) ─────────────────────────────────────────────────────
const PRODUCTS = [
  { isim: 'ANUA Heartleaf Cleansing Oil',    aciklama: 'Yüz · Akşam şart, sabah opsiyonel · 2 pompa',         renk: C.muted   },
  { isim: 'COSRX Low pH Gel Cleanser',       aciklama: 'Yüz · Sabah + akşam + spor · 1 nohut',                renk: C.cyan    },
  { isim: 'Hyaluronic Acid 2% + B5',         aciklama: 'Yüz · Sabah + akşam · 3 damla · hafif nemli cilt',    renk: C.blue    },
  { isim: 'Niacinamide 10% + Zinc 1%',       aciklama: 'Yüz · Sabah + akşam · 2 damla · hafif nemli cilt',    renk: C.purple  },
  { isim: 'Isntree SPF50+ Sun Gel',          aciklama: 'Yüz · Sabah şart · 2 parmak · bastırarak yay',        renk: C.amber   },
  { isim: 'Some By Mi AHA BHA Toner',        aciklama: 'Yüz · Akşam · Hafif eksfoliye · Birkaç damla',        renk: C.orchid  },
  { isim: 'Village 11 Factory AHA Body',     aciklama: 'Vücut · Haftada 2-3 kez · 2-3 pompa · durulama yok',  renk: C.emerald },
];

// ─── Diş rutini ──────────────────────────────────────────────────────────────
const DIS = [
  { saat: '08:10', ne: 'Parodontax + Su Püskürtücü + Gargara',    not: 'Sal+Cum: +H₂O₂ gargara (1:1, 60sn)' },
  { saat: '16:05', ne: 'Parodontax + Gargara',                    not: 'Tavuk öğünü sonrası' },
  { saat: '19:55', ne: 'Parodontax + Gargara',                    not: 'Yulaf+Shake sonrası' },
];

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ step, index }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(380)} style={st.stepCard}>
      {/* Numbered strip on left */}
      <View style={[st.stepNumCol, { backgroundColor: step.renk + '18' }]}>
        <Text style={[st.stepNum, { color: step.renk }]}>{step.n}</Text>
        {!step.zorunlu && (
          <Text style={[st.stepOpt, { color: step.renk }]}>opsiyonel</Text>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={st.stepHeader}>
          <View style={[st.stepIconBg, { backgroundColor: step.renk + '20' }]}>
            <Ionicons name={step.ikon} size={16} color={step.renk} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.stepName}>{step.isim}</Text>
            <View style={[st.stepTimePill, { backgroundColor: step.renk + '20', borderColor: step.renk + '40' }]}>
              <Ionicons name="time-outline" size={10} color={step.renk} />
              <Text style={[st.stepTimeTxt, { color: step.renk }]}>{step.sure}</Text>
            </View>
          </View>
        </View>
        {step.notlar.map((n, i) => (
          <View key={i} style={st.noteRow}>
            <View style={[st.noteBullet, { backgroundColor: step.renk }]} />
            <Text style={st.noteText}>{n}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function BakimScreen() {
  const [tab, setTab] = useState('morning');
  const routine = ROUTINES[tab];

  return (
    <View style={st.root}>
      {/* ── TAB ROW ── */}
      <View style={st.tabRow}>
        {Object.entries(ROUTINES).map(([key, r]) => {
          const active = tab === key;
          return (
            <TouchableOpacity
              key={key}
              style={[st.tabBtn, active && { borderColor: r.color + '80', backgroundColor: r.color + '18' }]}
              onPress={() => setTab(key)}
              activeOpacity={0.8}
            >
              <Ionicons name={active ? r.icon : r.icon + '-outline'} size={15} color={active ? r.color : C.dim} />
              <Text style={[st.tabLabel, { color: active ? r.color : C.dim }]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

        {/* ── ROUTINE HEADER ── */}
        <Animated.View entering={FadeInDown.duration(350)} key={tab}>
          <LinearGradient colors={[routine.color + '22', routine.color + '08']} style={st.routineHeader}>
            <View style={[st.routineHeaderIcon, { backgroundColor: routine.color + '25' }]}>
              <Ionicons name={routine.icon} size={24} color={routine.color} />
            </View>
            <View>
              <Text style={[st.routineHeaderTitle, { color: routine.color }]}>{routine.label} Rutini</Text>
              <Text style={st.routineHeaderSub}>{routine.steps.length} adım · Sırayla uygula</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── STEPS ── */}
        <Text style={st.sectionTitle}>ADIMLAR</Text>
        {routine.steps.map((step, i) => (
          <StepCard key={step.n} step={step} index={i} />
        ))}

        {/* ── TIPS ── */}
        <Text style={[st.sectionTitle, { marginTop: 12 }]}>İPUÇLARI</Text>
        {routine.tips.map((tip, i) => (
          <Animated.View
            key={i}
            entering={FadeInRight.delay(i * 80).duration(350)}
            style={[st.tipCard, { borderLeftColor: tip.renk }]}
          >
            <View style={[st.tipIcon, { backgroundColor: tip.renk + '20' }]}>
              <Ionicons name={tip.ikon} size={16} color={tip.renk} />
            </View>
            <Text style={st.tipText}>{tip.txt}</Text>
          </Animated.View>
        ))}

        {/* ── PRODUCTS (only on morning tab) ── */}
        {tab === 'morning' && (
          <>
            <Text style={[st.sectionTitle, { marginTop: 14 }]}>TÜM ÜRÜNLER</Text>
            {PRODUCTS.map((p, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 50).duration(350)}
                style={st.productRow}
              >
                <View style={[st.productDot, { backgroundColor: p.renk }]} />
                <View style={{ flex: 1 }}>
                  <Text style={st.productName}>{p.isim}</Text>
                  <Text style={st.productDesc}>{p.aciklama}</Text>
                </View>
              </Animated.View>
            ))}
          </>
        )}

        {/* ── DIS RUTINI (always) ── */}
        <Text style={[st.sectionTitle, { marginTop: 14 }]}>DİŞ RUTİNİ · Günde 3 Kez</Text>
        {DIS.map((d, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.delay(i * 70).duration(350)}
            style={st.disRow}
          >
            <LinearGradient colors={[C.orchid + '20', C.orchid + '06']} style={st.disTime}>
              <Text style={st.disTimeTxt}>{d.saat}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={st.disName}>{d.ne}</Text>
              {d.not ? <Text style={st.disNote}>{d.not}</Text> : null}
            </View>
          </Animated.View>
        ))}

      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },

  // Tab row
  tabRow:  { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.s1, borderBottomWidth: 1, borderBottomColor: C.border2 },
  tabBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: C.border2 },
  tabLabel:{ fontSize: 11, fontWeight: '800' },

  // Routine header
  routineHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border2 },
  routineHeaderIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  routineHeaderTitle:{ fontSize: 16, fontWeight: '900' },
  routineHeaderSub:  { color: C.muted, fontSize: 11, marginTop: 2 },

  sectionTitle: { color: C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },

  // Step card
  stepCard:   { flexDirection: 'row', backgroundColor: C.s1, borderRadius: 14, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: C.border2 },
  stepNumCol: { width: 40, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 4 },
  stepNum:    { fontSize: 17, fontWeight: '900' },
  stepOpt:    { fontSize: 7, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.8 },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, paddingBottom: 6 },
  stepIconBg: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  stepName:   { color: C.text, fontSize: 13, fontWeight: '700', marginBottom: 5 },
  stepTimePill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  stepTimeTxt: { fontSize: 10, fontWeight: '700' },
  noteRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: 12, paddingVertical: 2 },
  noteBullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 5, flexShrink: 0 },
  noteText:   { color: C.muted, fontSize: 11, flex: 1, lineHeight: 16, paddingBottom: 2 },

  // Tips
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.s1, borderWidth: 1, borderColor: C.border2, borderLeftWidth: 3, borderRadius: 12, padding: 12, marginBottom: 8 },
  tipIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipText: { color: C.muted, fontSize: 12, flex: 1, lineHeight: 18 },

  // Products
  productRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.s1, borderWidth: 1, borderColor: C.border2, borderRadius: 12, padding: 12, marginBottom: 6 },
  productDot:  { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
  productName: { color: C.text, fontSize: 12, fontWeight: '700' },
  productDesc: { color: C.muted, fontSize: 11, marginTop: 2 },

  // Diş
  disRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.s1, borderWidth: 1, borderColor: C.border2, borderRadius: 12, padding: 12, marginBottom: 6 },
  disTime:     { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', minWidth: 52 },
  disTimeTxt:  { color: C.orchid, fontSize: 13, fontWeight: '900' },
  disName:     { color: C.text, fontSize: 12, fontWeight: '700' },
  disNote:     { color: C.muted, fontSize: 11, marginTop: 2 },
});
