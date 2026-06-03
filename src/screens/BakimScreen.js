import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { C, GRAD } from '../utils/theme';

const W = Dimensions.get('window').width;

// ─── LifeStyle içerik verisi ──────────────────────────────────────────────────
const CATEGORIES = ['Tümü', 'Daha İyi Uyku', 'Testler', 'Tarifler', 'Sağlık'];

const BETTER_SLEEP_VIDEOS = [
  { title: 'Sirkadiyen Ritim',     emoji: '🌙', duration: '8 dk',  color: C.purple },
  { title: 'Mükemmel Anlar',       emoji: '✨', duration: '5 dk',  color: C.cyan   },
  { title: 'Uyku Faz Döngüleri',   emoji: '💤', duration: '12 dk', color: C.blue   },
  { title: 'Nefes Teknikleri',     emoji: '🌬️', duration: '6 dk',  color: C.teal   },
];

const HEALTH_TESTS = [
  { title: 'Kalp Sağlığı Öz Değerlendirme', emoji: '❤️', sub: '8 soruluk test', color: C.rose   },
  { title: 'Aritmi Öz Testi',               emoji: '💓', sub: '5 soruluk test', color: C.orchid },
  { title: 'Stres Seviyesi Analizi',         emoji: '🧠', sub: '10 soruluk test', color: C.purple },
  { title: 'Uyku Kalitesi Değerlendirmesi',  emoji: '😴', sub: '7 soruluk test', color: C.blue   },
];

const HEALTH_TIPS = [
  { title: 'Kalp Sağlığı',     emoji: '❤️‍🔥', color: C.rose,   sub: '12 ipucu'  },
  { title: 'Stresi Azalt',     emoji: '🧘',   color: C.blue,   sub: '9 ipucu'   },
  { title: 'Bağışıklık Güçlendir', emoji: '🛡️', color: C.emerald, sub: '15 ipucu' },
  { title: 'Beslenme Dengesi', emoji: '🥗',   color: C.teal,   sub: '11 ipucu'  },
];

const ARTICLES = [
  { title: 'Kan basıncı ve uyku ilişkisi',        emoji: '🩺', read: '4 dk' },
  { title: 'Hipertansiyona yol açan faktörler',   emoji: '⚠️', read: '6 dk' },
  { title: 'Tansiyonu doğal yollarla düşürmek',   emoji: '🌿', read: '5 dk' },
  { title: 'Akdeniz diyeti ve kalp sağlığı',      emoji: '🫒', read: '7 dk' },
];

const RECIPES = [
  { title: 'Sonbahar meyveli yulaf ezmesi', time: '15 dk', kcal: 417, emoji: '🥣' },
  { title: 'Güneybatı burritos',            time: '30 dk', kcal: 600, emoji: '🌯' },
  { title: 'Keto peynirli omlet',           time: '10 dk', kcal: 350, emoji: '🍳' },
  { title: 'Avokadolu ton balığı salatası', time: '12 dk', kcal: 380, emoji: '🥗' },
];

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

// ─── LifeStyle screen ─────────────────────────────────────────────────────────
function LifeStyleScreen() {
  const [cat, setCat] = useState('Tümü');
  return (
    <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} onPress={() => setCat(c)}
              style={[st.catChip, cat === c && { backgroundColor: C.orchid, borderColor: C.orchid }]}
              activeOpacity={0.8}>
              <Text style={[st.catChipTxt, cat === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Better Sleep videos */}
      {(cat === 'Tümü' || cat === 'Daha İyi Uyku') && (
        <>
          <View style={st.rowHeader}>
            <Text style={st.rowTitle}>Daha İyi Uyku</Text>
            <Text style={st.rowMore}>Daha Fazla ›</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingRight: 16 }}>
              {BETTER_SLEEP_VIDEOS.map((v, i) => (
                <Animated.View key={i} entering={FadeInRight.delay(i * 60).duration(350)}>
                  <LinearGradient colors={[v.color + '30', v.color + '10']} style={st.videoCard}>
                    <View style={[st.playCircle, { backgroundColor: v.color + '40', borderColor: v.color + '80' }]}>
                      <Ionicons name="play" size={18} color={v.color} />
                    </View>
                    <Text style={st.videoTitle}>{v.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Ionicons name="time-outline" size={11} color={C.muted} />
                      <Text style={st.videoSub}>{v.duration}</Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {/* Health Tips */}
      {(cat === 'Tümü' || cat === 'Sağlık') && (
        <>
          <View style={st.rowHeader}>
            <Text style={st.rowTitle}>Sağlık İpuçları</Text>
            <Text style={st.rowMore}>Daha Fazla ›</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingRight: 16 }}>
              {HEALTH_TIPS.map((tip, i) => (
                <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(350)}>
                  <LinearGradient colors={[tip.color + '28', tip.color + '10']} style={st.tipBigCard}>
                    <Text style={{ fontSize: 32, marginBottom: 6 }}>{tip.emoji}</Text>
                    <Text style={[st.tipBigTitle, { color: tip.color }]}>{tip.title}</Text>
                    <Text style={st.videoSub}>{tip.sub}</Text>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {/* Health Tests */}
      {(cat === 'Tümü' || cat === 'Testler') && (
        <>
          <View style={st.rowHeader}>
            <Text style={st.rowTitle}>Sağlık Testleri</Text>
            <Text style={st.rowMore}>Daha Fazla ›</Text>
          </View>
          {HEALTH_TESTS.map((test, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(350)} style={[st.testCard, { borderLeftColor: test.color }]}>
              <View style={[st.testEmoji, { backgroundColor: test.color + '20' }]}>
                <Text style={{ fontSize: 22 }}>{test.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.testTitle}>{test.title}</Text>
                <Text style={st.videoSub}>{test.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.dim} />
            </Animated.View>
          ))}
        </>
      )}

      {/* Articles */}
      {(cat === 'Tümü' || cat === 'Sağlık') && (
        <>
          <View style={[st.rowHeader, { marginTop: 8 }]}>
            <Text style={st.rowTitle}>Makaleler</Text>
            <Text style={st.rowMore}>Daha Fazla ›</Text>
          </View>
          {ARTICLES.map((a, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 50).duration(350)} style={st.articleRow}>
              <View style={st.articleEmoji}>
                <Text style={{ fontSize: 24 }}>{a.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.testTitle}>{a.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="time-outline" size={10} color={C.muted} />
                  <Text style={st.videoSub}>{a.read} okuma</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={14} color={C.dim} />
            </Animated.View>
          ))}
        </>
      )}

      {/* Recipes */}
      {(cat === 'Tümü' || cat === 'Tarifler') && (
        <>
          <View style={[st.rowHeader, { marginTop: 8 }]}>
            <Text style={st.rowTitle}>Tarifler</Text>
            <Text style={st.rowMore}>Daha Fazla ›</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10, paddingRight: 16 }}>
              {RECIPES.map((r, i) => (
                <Animated.View key={i} entering={FadeInRight.delay(i * 60).duration(350)} style={st.recipeCard}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>{r.emoji}</Text>
                  <Text style={st.testTitle}>{r.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="time-outline" size={11} color={C.muted} />
                      <Text style={st.videoSub}>{r.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="flame-outline" size={11} color={C.orange} />
                      <Text style={[st.videoSub, { color: C.orange }]}>{r.kcal} kcal</Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function BakimScreen() {
  const [mainTab, setMainTab] = useState('bakim');
  const [tab, setTab] = useState('morning');
  const routine = ROUTINES[tab];

  return (
    <View style={st.root}>
      {/* ── MAIN TOP TABS ── */}
      <View style={st.mainTabRow}>
        <TouchableOpacity onPress={() => setMainTab('bakim')} activeOpacity={0.8}
          style={[st.mainTabBtn, mainTab === 'bakim' && { borderBottomColor: C.cyan, borderBottomWidth: 2 }]}>
          <Ionicons name="flask-outline" size={14} color={mainTab === 'bakim' ? C.cyan : C.dim} />
          <Text style={[st.mainTabTxt, { color: mainTab === 'bakim' ? C.cyan : C.dim }]}>BAKIM</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMainTab('lifestyle')} activeOpacity={0.8}
          style={[st.mainTabBtn, mainTab === 'lifestyle' && { borderBottomColor: C.orchid, borderBottomWidth: 2 }]}>
          <Ionicons name="leaf-outline" size={14} color={mainTab === 'lifestyle' ? C.orchid : C.dim} />
          <Text style={[st.mainTabTxt, { color: mainTab === 'lifestyle' ? C.orchid : C.dim }]}>YAŞAM</Text>
        </TouchableOpacity>
      </View>

      {mainTab === 'lifestyle' ? <LifeStyleScreen /> : (
      <>
      {/* ── ROUTINE TAB ROW ── */}
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
      </>
      )}
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

  // Main tab row
  mainTabRow:  { flexDirection: 'row', backgroundColor: C.s1, borderBottomWidth: 1, borderBottomColor: C.border2 },
  mainTabBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  mainTabTxt:  { fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  // LifeStyle
  catChip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.border2, backgroundColor: C.s1 },
  catChipTxt:  { color: C.muted, fontSize: 12, fontWeight: '700' },
  rowHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rowTitle:    { color: C.text, fontSize: 15, fontWeight: '800' },
  rowMore:     { color: C.muted, fontSize: 12 },

  videoCard:   { width: (W - 64) / 2.2, borderRadius: 16, padding: 14, gap: 6, borderWidth: 1, borderColor: C.border2 },
  playCircle:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 4 },
  videoTitle:  { color: C.text, fontSize: 12, fontWeight: '700' },
  videoSub:    { color: C.muted, fontSize: 10 },

  tipBigCard:  { width: (W - 64) / 2.2, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border2, minHeight: 110, justifyContent: 'center' },
  tipBigTitle: { fontSize: 13, fontWeight: '800', textAlign: 'center', marginBottom: 4 },

  testCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.s1, borderWidth: 1, borderColor: C.border2, borderLeftWidth: 3, borderRadius: 12, padding: 12, marginBottom: 8 },
  testEmoji:   { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  testTitle:   { color: C.text, fontSize: 13, fontWeight: '700' },

  articleRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.s1, borderWidth: 1, borderColor: C.border2, borderRadius: 12, padding: 12, marginBottom: 8 },
  articleEmoji:{ width: 52, height: 52, borderRadius: 13, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },

  recipeCard:  { width: (W - 64) / 1.8, backgroundColor: C.s1, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border2, marginRight: 10 },
});
