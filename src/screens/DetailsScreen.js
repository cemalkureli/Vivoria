import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { C } from '../utils/theme';
import {
  getSleepLogs, getBodyMeasurements, saveBodyMeasurement,
  getDoneToday, getVitaminStock, saveVitaminStock,
} from '../utils/storage';
import { getRecentLog } from '../utils/dailyLog';

const TABS = ['Beslenme', 'Su', 'Vitamin', 'Detoks', 'Uyku', 'Vücut'];

// ─── helpers ─────────────────────────────────────────────────────────────────
function getLast7Dates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}
const GUN_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// ─── Beslenme ─────────────────────────────────────────────────────────────────
function Beslenme() {
  const [openIdx, setOpenIdx] = useState(null);
  const [done, setDone]       = useState({});

  useFocusEffect(useCallback(() => { getDoneToday().then(setDone); }, []));

  const MEAL_MACRO = [
    { ids:['wi_kahvalti','ct_kahvalti','pz_kahvalti'], t:'Öğün 1 — Kahvaltı',      time:'08:00', color:C.emerald,  p:28,  c:27,  y:26, k:458,  desc:'4 yumurta · Mısır patlaması · Roka & Salatalık · Zeytinyağı', detay:[{isim:'🥚 4 Yumurta',miktar:'4 adet',makro:'P:24g C:2g Y:18g 248kcal',not:'Günün en önemli protein kaynağı.'},{isim:'🍿 Tuzsuz Mısır Patlaması',miktar:'25g',makro:'P:3g C:19g Y:2g 95kcal',not:'Düşük kalori, yüksek hacim.'},{isim:'🥗 Yeşillik',miktar:'İstediğin kadar',makro:'~15kcal',not:'Antioksidan, C vitamini, sindirim lifi.'},{isim:'🫒 Zeytinyağı',miktar:'1 tsp',makro:'Y:5g 45kcal',not:'D3 emilimi için.'}] },
    { ids:['wi_ogun_2','ct_ogun_2','pz_ogun_2'],       t:'Öğün 2 — Protein Shake', time:'12:30', color:C.blue,   p:25,  c:4,   y:2,  k:132,  desc:'1 ölçek whey · 300ml su', detay:[{isim:'🥛 Whey Protein',miktar:'~30g',makro:'P:25g C:4g Y:2g 130kcal',not:'Hızlı sindirim.'},{isim:'💧 Su',miktar:'300ml',makro:'0kcal',not:'Shake suyu günlük suya sayılır.'}], note:'ℹ️ Bu öğünden sonra diş fırçalamaya gerek yok.' },
    { ids:['wi_ogun_3','ct_ogun_3','pz_ogun_3'],       t:'Öğün 3 — Tavuk+Makarna', time:'16:00', color:C.emerald,  p:86,  c:130, y:13, k:977,  desc:'300g tavuk · 180g makarna · Sebze · Zeytinyağı', detay:[{isim:'🍗 Tavuk Göğsü',miktar:'300g',makro:'P:75g C:0 Y:6g 360kcal',not:'Izgarada pişir, tuz az.'},{isim:'🍝 Makarna/Pirinç',miktar:'Spor:180g Dinl:120g',makro:'P:22g C:126g Y:2g 620kcal',not:'Al dente pişir, GI düşer.'},{isim:'🥦 Sebze',miktar:'İstediğin kadar',makro:'~50kcal',not:'Buharda pişir.'}] },
    { ids:['wi_ogun_4','ct_ogun_4','pz_ogun_4'],       t:'Öğün 4 — Antrm. Shake',  time:'19:45', color:C.blue,   p:32,  c:64,  y:5,  k:414,  desc:'Whey · Muz · Yulaf · 300ml su', detay:[{isim:'🥛 Whey',miktar:'~30g',makro:'P:25g C:3g Y:1g 120kcal',not:'30-60dk penceresi.'},{isim:'🍌 Muz',miktar:'1 orta',makro:'P:1g C:27g Y:0g 105kcal',not:'Hızlı karbonhidrat.'},{isim:'🌾 Yulaf',miktar:'Spor:50g Dinl:30g',makro:'P:6g C:33g Y:3g 185kcal',not:'Yavaş sindirim.'}], note:'🚿 Shake sonrası duş al.' },
  ];

  const targets = { p:156, c:156, y:47, k:2000 };
  const totals  = { p:0, c:0, y:0, k:0 };
  MEAL_MACRO.forEach(m => {
    if (m.ids.some(id => done[id])) {
      totals.p += m.p; totals.c += m.c; totals.y += m.y; totals.k += m.k;
    }
  });

  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>

      {/* Canlı makro progress */}
      <View style={d.card}>
        <Text style={d.cardTitle}>📊 Bugünkü Makro Durumu</Text>
        <Text style={{ color:C.muted, fontSize:11, marginBottom:12 }}>
          Tamamlanan öğünler otomatik toplanır
        </Text>
        {[
          { label:'Protein', cur:totals.p, max:targets.p, unit:'g', color:C.orchid   },
          { label:'Karbonhidrat', cur:totals.c, max:targets.c, unit:'g', color:C.blue   },
          { label:'Yağ',     cur:totals.y, max:targets.y, unit:'g', color:C.purple },
          { label:'Kalori',  cur:totals.k, max:targets.k, unit:'',  color:C.emerald  },
        ].map(({ label, cur, max, unit, color }) => {
          const pct = Math.min((cur / max) * 100, 100);
          return (
            <View key={label} style={{ marginBottom:10 }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
                <Text style={{ color:C.muted, fontSize:12 }}>{label}</Text>
                <Text style={{ color, fontSize:12, fontWeight:'800' }}>
                  {cur}{unit} / {max}{unit}
                </Text>
              </View>
              <View style={{ height:8, backgroundColor:C.s3, borderRadius:100, overflow:'hidden' }}>
                <View style={{ height:'100%', width:`${pct}%`, backgroundColor: color, borderRadius:100 }} />
              </View>
            </View>
          );
        })}

        {/* Öğün durumu */}
        <View style={{ flexDirection:'row', gap:6, marginTop:8, flexWrap:'wrap' }}>
          {MEAL_MACRO.map((m, i) => {
            const isDone = m.ids.some(id => done[id]);
            return (
              <View key={i} style={[d.mealBadge, isDone && { backgroundColor: m.color + '22', borderColor: m.color }]}>
                <Text style={{ color: isDone ? m.color : C.muted, fontSize:10, fontWeight:'700' }}>
                  {isDone ? '✓ ' : ''}{m.time}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Öğün detayları */}
      {MEAL_MACRO.map((meal, idx) => {
        const isOpen = openIdx === idx;
        const isDone = meal.ids.some(id => done[id]);
        return (
          <View key={idx} style={[d.mealCard, isOpen && { borderColor: meal.color }, isDone && { opacity:0.75 }]}>
            <View style={[d.mealBar, { backgroundColor: meal.color }]} />
            <TouchableOpacity onPress={() => setOpenIdx(isOpen ? null : idx)} activeOpacity={0.8}>
              <View style={{ flexDirection:'row', alignItems:'center', marginBottom: isOpen ? 10 : 0 }}>
                <View style={{ flex:1 }}>
                  <Text style={[d.mealTitle, { color: meal.color }]}>
                    {isDone ? '✓ ' : ''}{meal.t}
                  </Text>
                  <Text style={d.mealTime}>🕐 {meal.time}</Text>
                  {!isOpen && <Text style={d.mealDesc}>{meal.desc}</Text>}
                </View>
                <Text style={{ color:C.muted, fontSize:18, marginLeft:8 }}>{isOpen ? '▲' : '▼'}</Text>
              </View>
              {!isOpen && (
                <View style={d.macroRow}>
                  {[['P',meal.p+'g',C.orchid],['C',meal.c+'g',C.blue],['Y',meal.y+'g',C.purple],['kcal',meal.k,C.emerald]].map(([k,v,c])=>(
                    <View key={k} style={d.macroBox}><Text style={[d.macroVal,{color:c}]}>{v}</Text><Text style={d.macroKey}>{k}</Text></View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
            {isOpen && (
              <View>
                <View style={[d.macroRow,{marginBottom:12}]}>
                  {[['P',meal.p+'g',C.orchid],['C',meal.c+'g',C.blue],['Y',meal.y+'g',C.purple],['kcal',meal.k,C.emerald]].map(([k,v,c])=>(
                    <View key={k} style={d.macroBox}><Text style={[d.macroVal,{color:c}]}>{v}</Text><Text style={d.macroKey}>{k}</Text></View>
                  ))}
                </View>
                {meal.detay.map((item,j) => (
                  <View key={j} style={d.besinCard}>
                    <Text style={d.besinIsim}>{item.isim}</Text>
                    <View style={{flexDirection:'row',gap:8,marginBottom:4}}><View style={d.besinTag}><Text style={d.besinTagText}>⚖️ {item.miktar}</Text></View></View>
                    <Text style={d.besinMakro}>{item.makro}</Text>
                    <Text style={d.besinNot}>{item.not}</Text>
                  </View>
                ))}
                {meal.note && <View style={d.mealNote}><Text style={d.mealNoteText}>{meal.note}</Text></View>}
              </View>
            )}
          </View>
        );
      })}

      <View style={d.totalCard}>
        <Text style={d.totalTitle}>GÜNLÜK HEDEF TOPLAM</Text>
        <View style={{flexDirection:'row',gap:8,marginTop:8}}>
          {[['Protein','156g',C.orchid],['Carb','156g',C.blue],['Yağ','47g',C.purple],['Kalori','~1981',C.emerald]].map(([k,v,c])=>(
            <View key={k} style={[d.macroBox,{flex:1}]}><Text style={[d.macroVal,{color:c,fontSize:15}]}>{v}</Text><Text style={d.macroKey}>{k}</Text></View>
          ))}
        </View>
      </View>
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
function Vitamin() {
  const [stock,      setStock]      = useState({});
  const [editModal,  setEditModal]  = useState(null); // {key, label, current}
  const [editVal,    setEditVal]    = useState('');

  useFocusEffect(useCallback(() => { getVitaminStock().then(setStock); }, []));

  const SUPPLEMENTS = [
    { key:'d3k2',      label:'D3 + K2',          gunlukDoz:1,  birimBaslik:'kapsül', renk:C.orchid   },
    { key:'omega3',    label:'Omega-3',            gunlukDoz:2,  birimBaslik:'kapsül', renk:C.blue   },
    { key:'vitC',      label:'C Vitamini',         gunlukDoz:1,  birimBaslik:'tablet', renk:C.orange },
    { key:'milkTh',    label:'Milk Thistle',        gunlukDoz:1,  birimBaslik:'kapsül', renk:C.emerald  },
    { key:'kreatin',   label:'Kreatin',             gunlukDoz:5,  birimBaslik:'g',      renk:C.rose    },
    { key:'magnesyum', label:'Magnezyum Glisinát', gunlukDoz:1,  birimBaslik:'kapsül', renk:C.purple },
    { key:'psyllium',  label:'Psyllium Husk',      gunlukDoz:5,  birimBaslik:'g',      renk:C.emerald  },
    { key:'preWo',     label:'Pre-Workout',         gunlukDoz:1,  birimBaslik:'porsiyon', renk:C.orange },
    { key:'elektrolit',label:'Elektrolit',          gunlukDoz:1,  birimBaslik:'porsiyon', renk:C.blue },
  ];

  const EMILIM_TIPS = [
    { emoji:'☀️', baslik:'D3 + K2 → Yağlı yemekle al', aciklama:'Yağda çözünen vitamin. Kahvaltı sonrası yumurta yağıyla emilim %30+ artar.', renk:C.orchid },
    { emoji:'🍊', baslik:'C Vitamini → Demiri artırır',   aciklama:'C vitamini bitkisel demirin emilimini 3x artırır. Demir takviyeleri alıyorsan aynı anda iç.', renk:C.orange },
    { emoji:'🌙', baslik:'Magnezyum → Gece yatmadan',     aciklama:'Magnezyum glisinát gevşetici. Uyku kalitesini yükseltmek için yatmadan 30-60dk önce al.', renk:C.purple },
    { emoji:'⏰', baslik:'Kreatin → Her gün aynı saatte', aciklama:'Timing önemsiz, tutarlılık önemli. Spor sonrası almak hafif avantaj sağlar.', renk:C.rose },
    { emoji:'🚫', baslik:'Çinko → Kalsiyumdan uzak tut',  aciklama:'Kalsiyum, çinko emilimini engeller. Pre-workout veya öğün araları tercih et.', renk:C.muted },
  ];

  const openEdit = (sup) => {
    setEditModal(sup);
    setEditVal(stock[sup.key] !== undefined ? String(stock[sup.key]) : '');
  };

  const saveStock = async () => {
    const val = parseFloat(editVal);
    if (!isNaN(val) && val >= 0) {
      const updated = { ...stock, [editModal.key]: val };
      await saveVitaminStock(updated);
      setStock(updated);
    }
    setEditModal(null);
  };

  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>

      {/* Emilim ipuçları */}
      <Text style={[d.sectionTitle, { marginBottom:10 }]}>💡 EMİLİM İPUÇLARI</Text>
      {EMILIM_TIPS.map((tip, i) => (
        <View key={i} style={[d.tipCard, { borderLeftColor: tip.renk }]}>
          <Text style={{ fontSize:18, marginRight:10 }}>{tip.emoji}</Text>
          <View style={{ flex:1 }}>
            <Text style={{ color:C.text, fontSize:12, fontWeight:'800', marginBottom:2 }}>{tip.baslik}</Text>
            <Text style={{ color:C.muted, fontSize:11, lineHeight:16 }}>{tip.aciklama}</Text>
          </View>
        </View>
      ))}

      {/* Stok takibi */}
      <Text style={[d.sectionTitle, { marginTop:16, marginBottom:10 }]}>📦 STOK TAKİBİ — Tıkla, Güncelle</Text>
      {SUPPLEMENTS.map((sup) => {
        const mevcut   = stock[sup.key];
        const gunKaldi = mevcut !== undefined ? Math.floor(mevcut / sup.gunlukDoz) : null;
        const ayKaldi  = gunKaldi !== null ? Math.floor(gunKaldi / 30) : null;
        const dusuk    = gunKaldi !== null && gunKaldi < 10;
        return (
          <TouchableOpacity key={sup.key} style={[d.vitStockRow, dusuk && { borderColor: C.rose + '88' }]}
            onPress={() => openEdit(sup)} activeOpacity={0.75}>
            <View style={{ flex:1 }}>
              <Text style={{ color:C.text, fontSize:13, fontWeight:'700' }}>{sup.label}</Text>
              <Text style={{ color:C.muted, fontSize:11 }}>
                {sup.gunlukDoz} {sup.birimBaslik}/gün
              </Text>
            </View>
            <View style={{ alignItems:'flex-end' }}>
              {gunKaldi !== null ? (
                <>
                  <Text style={{ color: dusuk ? C.rose : sup.renk, fontSize:14, fontWeight:'900' }}>
                    {mevcut} {sup.birimBaslik}
                  </Text>
                  <Text style={{ color: dusuk ? C.rose : C.muted, fontSize:10 }}>
                    {dusuk ? '⚠️ ' : ''}{gunKaldi} gün{ayKaldi > 0 ? ` (~${ayKaldi} ay)` : ''} kaldı
                  </Text>
                </>
              ) : (
                <Text style={{ color:C.muted, fontSize:12 }}>Tap to set</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Aylık maliyet hesabı */}
      <View style={[d.card, { marginTop:16 }]}>
        <Text style={d.cardTitle}>🗓️ Aylık Tüketim Tahmini</Text>
        <View style={{ marginTop:8, gap:4 }}>
          {SUPPLEMENTS.filter(s => ['d3k2','omega3','vitC','milkTh','magnesyum'].includes(s.key)).map(s => (
            <View key={s.key} style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <Text style={{ color:C.muted, fontSize:12 }}>{s.label}</Text>
              <Text style={{ color:s.renk, fontSize:12, fontWeight:'700' }}>
                ~{s.gunlukDoz * 30} {s.birimBaslik}/ay
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stok düzenleme modalı */}
      {editModal && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setEditModal(null)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex:1 }}>
            <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setEditModal(null)}>
              <TouchableOpacity activeOpacity={1} style={d.smallModal} onPress={() => {}}>
                <Text style={d.measModalTitle}>{editModal.label}</Text>
                <Text style={{ color:C.muted, fontSize:12, marginBottom:12, textAlign:'center' }}>
                  Mevcut stok miktarını gir ({editModal.birimBaslik})
                </Text>
                <TextInput
                  style={[d.measInput, { width:'100%', marginBottom:16, fontSize:20, height:52 }]}
                  value={editVal}
                  onChangeText={setEditVal}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  autoFocus
                />
                <View style={{ flexDirection:'row', gap:10 }}>
                  <TouchableOpacity style={d.cancelBtn} onPress={() => setEditModal(null)}>
                    <Text style={{ color:C.muted, fontWeight:'700' }}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={d.saveBtn} onPress={saveStock}>
                    <Text style={{ color:C.bg, fontWeight:'900' }}>Kaydet ✓</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      )}
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
  const [activeTab, setActiveTab] = useState('Beslenme');
  const components = { Beslenme, Su, Vitamin, Detoks, Uyku, 'Vücut': Vucut };
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
