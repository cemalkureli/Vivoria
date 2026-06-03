import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, TextInput, Modal, FlatList, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { C, GRAD } from '../utils/theme';
import { supabase } from '../lib/supabase';
import { useLang } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import {
  getProducts, getRoutineTemplates, getTemplateWithSteps,
  getUserRoutines, getActiveRoutine, activateRoutine,
  createRoutineFromTemplate, createCustomRoutine, deleteUserRoutine,
  logRoutineComplete, getSkinProfile,
} from '../lib/supabase';

const W = Dimensions.get('window').width;

// ─── Constants ────────────────────────────────────────────────────────────────
const SKIN_TYPES = [
  { key: 'tum',    label: 'Tüm',     icon: 'star-outline',     color: C.orchid  },
  { key: 'yagli',  label: 'Yağlı',   icon: 'water-outline',    color: C.blue    },
  { key: 'kuru',   label: 'Kuru',    icon: 'leaf-outline',     color: C.amber   },
  { key: 'karma',  label: 'Karma',   icon: 'git-branch-outline',color: C.cyan   },
  { key: 'hassas', label: 'Hassas',  icon: 'heart-outline',    color: C.rose    },
  { key: 'normal', label: 'Normal',  icon: 'checkmark-circle-outline', color: C.emerald },
];

const CATEGORIES = [
  { key: '',              label: 'Tümü'        },
  { key: 'temizleyici',   label: 'Temizleyici'  },
  { key: 'yuz-yagi',      label: 'Yüz Yağı'    },
  { key: 'tonik',         label: 'Tonik'        },
  { key: 'serum',         label: 'Serum'        },
  { key: 'nemlendirici',  label: 'Nemlendirici' },
  { key: 'spf',           label: 'SPF'          },
  { key: 'eksfolian',     label: 'Eksfolian'    },
  { key: 'vucut-bakim',   label: 'Vücut'        },
];

const TIMINGS = [
  { key: '',       label: 'Tümü',         icon: 'apps-outline'      },
  { key: 'morning',label: 'Sabah',        icon: 'sunny-outline'     },
  { key: 'night',  label: 'Gece',         icon: 'moon-outline'      },
  { key: 'sport',  label: 'Spor Sonrası', icon: 'barbell-outline'   },
  { key: 'weekly', label: 'Haftalık',     icon: 'calendar-outline'  },
];

const TIMING_COLORS = { morning: C.amber, night: C.cyan, sport: C.emerald, weekly: C.purple, '': C.orchid };

// ─── LifeStyle content data ───────────────────────────────────────────────────
const LIFESTYLE_CATS = ['Tümü', 'Daha İyi Uyku', 'Testler', 'Tarifler', 'Sağlık'];

const SLEEP_VIDEOS = [
  { title: 'Sirkadiyen Ritim',   emoji: '🌙', dur: '8 dk',  color: C.purple },
  { title: 'Mükemmel Anlar',     emoji: '✨', dur: '5 dk',  color: C.cyan   },
  { title: 'Uyku Faz Döngüleri', emoji: '💤', dur: '12 dk', color: C.blue   },
  { title: 'Nefes Teknikleri',   emoji: '🌬️', dur: '6 dk',  color: C.teal   },
];

const HEALTH_TESTS = [
  { title: 'Kalp Sağlığı Öz Değerlendirme', emoji: '❤️',  sub: '8 soru', color: C.rose    },
  { title: 'Aritmi Öz Testi',               emoji: '💓',  sub: '5 soru', color: C.orchid  },
  { title: 'Stres Seviyesi Analizi',         emoji: '🧠',  sub: '10 soru',color: C.purple  },
  { title: 'Uyku Kalitesi Değerlendirmesi',  emoji: '😴',  sub: '7 soru', color: C.blue    },
];

const HEALTH_TIPS = [
  { title: 'Kalp Sağlığı',       emoji: '❤️‍🔥', color: C.rose,    sub: '12 ipucu'  },
  { title: 'Stresi Azalt',       emoji: '🧘',   color: C.blue,    sub: '9 ipucu'   },
  { title: 'Bağışıklık Güçlendir',emoji: '🛡️',  color: C.emerald, sub: '15 ipucu'  },
  { title: 'Beslenme Dengesi',    emoji: '🥗',   color: C.teal,    sub: '11 ipucu'  },
];

const ARTICLES = [
  { title: 'Kan basıncı ve uyku ilişkisi',      emoji: '🩺', read: '4 dk' },
  { title: 'Hipertansiyona yol açan faktörler', emoji: '⚠️', read: '6 dk' },
  { title: 'Tansiyonu doğal yollarla düşürmek', emoji: '🌿', read: '5 dk' },
  { title: 'Akdeniz diyeti ve kalp sağlığı',    emoji: '🫒', read: '7 dk' },
];

const RECIPES = [
  { title: 'Sonbahar meyveli yulaf',     time: '15 dk', kcal: 417, emoji: '🥣' },
  { title: 'Güneybatı burritos',         time: '30 dk', kcal: 600, emoji: '🌯' },
  { title: 'Keto peynirli omlet',        time: '10 dk', kcal: 350, emoji: '🍳' },
  { title: 'Avokadolu ton salatası',     time: '12 dk', kcal: 380, emoji: '🥗' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timingLabel(key) { return TIMINGS.find(t => t.key === key)?.label ?? key; }
function timingColor(key) { return TIMING_COLORS[key] ?? C.orchid; }
function skinLabel(key)   { return SKIN_TYPES.find(s => s.key === key)?.label ?? key; }

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ step, index, color }) {
  const name = step.products?.name ?? step.custom_product_name ?? '—';
  const brand = step.products?.brand;
  return (
    <Animated.View entering={FadeInDown.delay(index * 55).duration(350)} style={st.stepCard}>
      <View style={[st.stepNumCol, { backgroundColor: color + '18' }]}>
        <Text style={[st.stepNum, { color }]}>{step.order_index}</Text>
        {step.is_optional && <Text style={[st.stepOpt, { color }]}>opt</Text>}
      </View>
      <View style={{ flex: 1, paddingVertical: 12, paddingRight: 12 }}>
        <Text style={st.stepName}>{name}</Text>
        {brand && <Text style={st.stepBrand}>{brand}</Text>}
        {step.amount && (
          <View style={[st.amtPill, { borderColor: color + '40', backgroundColor: color + '12' }]}>
            <Text style={[st.amtTxt, { color }]}>{step.amount}</Text>
          </View>
        )}
        {step.notes && <Text style={st.stepNote}>{step.notes}</Text>}
      </View>
    </Animated.View>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ item, index }) {
  const [open, setOpen] = useState(false);
  const catColor = { temizleyici: C.cyan, serum: C.orchid, nemlendirici: C.blue, spf: C.amber, tonik: C.purple, 'yuz-yagi': C.emerald, eksfolian: C.orange, 'vucut-bakim': C.teal }[item.category] ?? C.muted;
  return (
    <Animated.View entering={FadeInDown.delay(index * 45).duration(350)}>
      <TouchableOpacity onPress={() => setOpen(v => !v)} activeOpacity={0.8} style={[st.productCard, open && { borderColor: catColor + '60' }]}>
        <View style={[st.productCatDot, { backgroundColor: catColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={st.productName}>{item.name}</Text>
          <Text style={st.productBrand}>{item.brand} · {item.category}</Text>
        </View>
        {item.amount && <Text style={st.productAmt}>{item.amount}</Text>}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={C.dim} />
      </TouchableOpacity>
      {open && (
        <View style={st.productDetail}>
          {item.instructions && <Text style={st.productInst}>{item.instructions}</Text>}
          {item.key_ingredients?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {item.key_ingredients.map((ing, i) => (
                <View key={i} style={[st.ingTag, { backgroundColor: catColor + '18', borderColor: catColor + '40' }]}>
                  <Text style={[st.ingTxt, { color: catColor }]}>{ing}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

// ─── ═══════════════ TABS ═══════════════ ────────────────────────────────────

// Tab 0: Ürünler
function UrunlerTab({ skinType }) {
  const [products, setProducts] = useState([]);
  const [cat, setCat]           = useState('');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useFocusEffect(useCallback(() => { load(); }, [skinType, cat]));

  async function load() {
    setLoading(true);
    try { setProducts(await getProducts({ category: cat || undefined, skinType })); }
    catch (_) {}
    setLoading(false);
  }

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand ?? '').toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <ScrollView contentContainerStyle={st.tabContent} showsVerticalScrollIndicator={false}>
      {/* Search */}
      <View style={st.searchRow}>
        <Ionicons name="search-outline" size={16} color={C.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={st.searchInput}
          value={search} onChangeText={setSearch}
          placeholder="Ürün veya marka ara..." placeholderTextColor={C.dim}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={C.muted} /></TouchableOpacity> : null}
      </View>
      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c.key} onPress={() => setCat(c.key)} activeOpacity={0.8}
              style={[st.chip, cat === c.key && { backgroundColor: C.orchid, borderColor: C.orchid }]}>
              <Text style={[st.chipTxt, cat === c.key && { color: '#fff' }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Product list */}
      {loading
        ? <Text style={st.emptyTxt}>Yükleniyor...</Text>
        : filtered.length === 0
          ? <Text style={st.emptyTxt}>Ürün bulunamadı</Text>
          : filtered.map((p, i) => <ProductCard key={p.id} item={p} index={i} />)
      }
    </ScrollView>
  );
}

// Tab 1: Rutinlerim
function RutinlerimTab({ userId }) {
  const [routines, setRoutines]   = useState([]);
  const [expanded, setExpanded]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [newModal, setNewModal]   = useState(false);
  const [newTitle, setNewTitle]   = useState('');
  const [newTiming, setNewTiming] = useState('morning');

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    try { setRoutines(await getUserRoutines(userId)); }
    catch (_) {}
    setLoading(false);
  }

  async function handleActivate(routine) {
    if (routine.is_active) return;
    Alert.alert('Aktif Rutin', `"${routine.title}" aktif rutin olarak ayarlansın mı?`, [
      { text: 'Hayır', style: 'cancel' },
      { text: 'Evet', onPress: async () => { await activateRoutine(userId, routine.id); load(); } },
    ]);
  }

  async function handleDelete(routine) {
    Alert.alert('Sil', `"${routine.title}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => { await deleteUserRoutine(routine.id); load(); } },
    ]);
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    await createCustomRoutine(userId, { title: newTitle.trim(), timing: newTiming, steps: [] });
    setNewModal(false); setNewTitle('');
    load();
  }

  return (
    <ScrollView contentContainerStyle={st.tabContent} showsVerticalScrollIndicator={false}>
      {loading
        ? <Text style={st.emptyTxt}>Yükleniyor...</Text>
        : routines.length === 0
          ? (
            <View style={st.emptyCard}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💆</Text>
              <Text style={st.emptyTitle}>Henüz rutin yok</Text>
              <Text style={st.emptyDesc}>Şablondan seç veya yeni oluştur</Text>
            </View>
          )
          : routines.map((r, i) => {
            const color = timingColor(r.timing);
            const isOpen = expanded === r.id;
            return (
              <Animated.View key={r.id} entering={FadeInDown.delay(i * 60).duration(350)}>
                <TouchableOpacity onPress={() => setExpanded(isOpen ? null : r.id)} activeOpacity={0.8}>
                  <View style={[st.routineRow, r.is_active && { borderColor: color + '70', backgroundColor: color + '08' }]}>
                    <View style={[st.routineStrip, { backgroundColor: color }]} />
                    <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[st.routineTitle, r.is_active && { color }]}>{r.title}</Text>
                        {r.is_active && (
                          <View style={[st.activeBadge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
                            <Text style={[st.activeTxt, { color }]}>Aktif</Text>
                          </View>
                        )}
                      </View>
                      <Text style={st.routineMeta}>{timingLabel(r.timing)} · {r.user_routine_steps?.length ?? 0} adım</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 12 }}>
                      {!r.is_active && (
                        <TouchableOpacity onPress={() => handleActivate(r)} style={[st.iconBtn, { backgroundColor: color + '18' }]}>
                          <Ionicons name="play-circle-outline" size={20} color={color} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => handleDelete(r)} style={[st.iconBtn, { backgroundColor: C.rose + '18' }]}>
                        <Ionicons name="trash-outline" size={18} color={C.rose} />
                      </TouchableOpacity>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} color={C.dim} />
                    </View>
                  </View>
                </TouchableOpacity>
                {isOpen && r.user_routine_steps?.length > 0 && (
                  <View style={{ paddingHorizontal: 12, paddingBottom: 8, backgroundColor: C.s1 }}>
                    {[...r.user_routine_steps].sort((a, b) => a.order_index - b.order_index)
                      .map((step, si) => <StepCard key={step.id} step={step} index={si} color={color} />)}
                    {r.is_active && (
                      <TouchableOpacity
                        onPress={() => logRoutineComplete(userId, r.id)}
                        style={{ marginTop: 8 }}
                        activeOpacity={0.85}
                      >
                        <LinearGradient colors={GRAD.orchid} style={st.completeBtn}>
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                          <Text style={st.completeBtnTxt}>Tamamlandı</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Animated.View>
            );
          })
      }

      {/* New routine FAB */}
      <TouchableOpacity onPress={() => setNewModal(true)} activeOpacity={0.85} style={{ marginTop: 16 }}>
        <LinearGradient colors={GRAD.orchid} style={st.fabBtn}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={st.fabTxt}>Yeni Rutin Oluştur</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* New routine modal */}
      <Modal visible={newModal} transparent animationType="slide" onRequestClose={() => setNewModal(false)}>
        <TouchableOpacity style={st.overlay} activeOpacity={1} onPress={() => setNewModal(false)}>
          <TouchableOpacity activeOpacity={1} style={st.modal} onPress={() => {}}>
            <Text style={st.modalTitle}>Yeni Rutin</Text>
            <TextInput
              style={st.modalInput}
              value={newTitle} onChangeText={setNewTitle}
              placeholder="Rutin adı..." placeholderTextColor={C.muted}
              autoFocus
            />
            <Text style={[st.routineMeta, { marginBottom: 8 }]}>Zamanlama</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {TIMINGS.filter(t => t.key).map(tm => (
                <TouchableOpacity key={tm.key} onPress={() => setNewTiming(tm.key)}
                  style={[st.chip, newTiming === tm.key && { backgroundColor: timingColor(tm.key), borderColor: timingColor(tm.key) }]}>
                  <Text style={[st.chipTxt, newTiming === tm.key && { color: '#fff' }]}>{tm.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={st.cancelBtn} onPress={() => setNewModal(false)}>
                <Text style={{ color: C.muted, fontWeight: '700' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.saveBtn} onPress={handleCreate}>
                <Text style={{ color: C.bg, fontWeight: '900' }}>Oluştur ✓</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

// Tab 2: Şablonlar
function SablonlarTab({ userId, skinType }) {
  const [templates, setTemplates] = useState([]);
  const [expanded, setExpanded]   = useState(null);
  const [detail,   setDetail]     = useState(null);
  const [timing,   setTiming]     = useState('');
  const [loading,  setLoading]    = useState(true);

  useFocusEffect(useCallback(() => { load(); }, [skinType, timing]));

  async function load() {
    setLoading(true);
    try { setTemplates(await getRoutineTemplates({ skinType, timing: timing || undefined })); }
    catch (_) {}
    setLoading(false);
  }

  async function loadDetail(tmpl) {
    try {
      const full = await getTemplateWithSteps(tmpl.id);
      setDetail(full);
    } catch (_) {}
  }

  async function handleActivate(tmpl) {
    Alert.alert('Şablonu Uygula', `"${tmpl.title}" rutine eklensin ve aktif yapılsın mı?`, [
      { text: 'Hayır', style: 'cancel' },
      { text: 'Evet', onPress: async () => {
        try {
          const full = detail ?? await getTemplateWithSteps(tmpl.id);
          const routine = await createRoutineFromTemplate(userId, full);
          await activateRoutine(userId, routine.id);
          Alert.alert('Başarılı', `"${tmpl.title}" aktif rutin olarak ayarlandı.`);
        } catch (e) { Alert.alert('Hata', e.message); }
      }},
    ]);
  }

  return (
    <ScrollView contentContainerStyle={st.tabContent} showsVerticalScrollIndicator={false}>
      {/* Timing filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
          {TIMINGS.map(tm => (
            <TouchableOpacity key={tm.key} onPress={() => setTiming(tm.key)} activeOpacity={0.8}
              style={[st.chip, timing === tm.key && { backgroundColor: timingColor(tm.key), borderColor: timingColor(tm.key) }]}>
              <Ionicons name={tm.icon} size={12} color={timing === tm.key ? '#fff' : C.muted} />
              <Text style={[st.chipTxt, timing === tm.key && { color: '#fff' }]}>{tm.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading
        ? <Text style={st.emptyTxt}>Yükleniyor...</Text>
        : templates.length === 0
          ? <Text style={st.emptyTxt}>Bu filtreler için şablon bulunamadı</Text>
          : templates.map((tmpl, i) => {
            const color = timingColor(tmpl.timing);
            const isOpen = expanded === tmpl.id;
            return (
              <Animated.View key={tmpl.id} entering={FadeInDown.delay(i * 55).duration(350)}>
                <TouchableOpacity activeOpacity={0.8} onPress={async () => {
                  if (!isOpen) { await loadDetail(tmpl); }
                  setExpanded(isOpen ? null : tmpl.id);
                }}>
                  <View style={[st.tmplCard, { borderColor: isOpen ? color + '60' : C.border2 }]}>
                    <LinearGradient colors={[color + '20', color + '08']} style={st.tmplGrad}>
                      <View style={{ flex: 1 }}>
                        <Text style={[st.routineTitle, { color }]}>{tmpl.title}</Text>
                        <Text style={st.routineMeta}>
                          {timingLabel(tmpl.timing)} · {tmpl.step_count} adım · {skinLabel(tmpl.skin_type)} cilt
                        </Text>
                        {tmpl.description && !isOpen && (
                          <Text style={st.tmplDesc} numberOfLines={2}>{tmpl.description}</Text>
                        )}
                      </View>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-forward'} size={16} color={C.dim} />
                    </LinearGradient>
                  </View>
                </TouchableOpacity>

                {isOpen && detail?.id === tmpl.id && (
                  <View style={{ backgroundColor: C.s1, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, paddingBottom: 12, borderWidth: 1, borderTopWidth: 0, borderColor: color + '40' }}>
                    {tmpl.description && (
                      <Text style={[st.tmplDesc, { paddingHorizontal: 14, paddingTop: 10 }]}>{tmpl.description}</Text>
                    )}
                    {detail.steps?.map((step, si) => (
                      <StepCard key={step.id} step={step} index={si} color={color} />
                    ))}
                    <TouchableOpacity onPress={() => handleActivate(tmpl)} activeOpacity={0.85} style={{ paddingHorizontal: 12, marginTop: 8 }}>
                      <LinearGradient colors={GRAD.orchid} style={st.fabBtn}>
                        <Ionicons name="play-circle-outline" size={18} color="#fff" />
                        <Text style={st.fabTxt}>Aktif Rutin Yap</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            );
          })
      }
    </ScrollView>
  );
}

// ─── LifeStyle tab ────────────────────────────────────────────────────────────
function YasamTab() {
  const [cat, setCat] = useState('Tümü');
  return (
    <ScrollView contentContainerStyle={st.tabContent} showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
          {LIFESTYLE_CATS.map(c => (
            <TouchableOpacity key={c} onPress={() => setCat(c)} activeOpacity={0.8}
              style={[st.chip, cat === c && { backgroundColor: C.orchid, borderColor: C.orchid }]}>
              <Text style={[st.chipTxt, cat === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {(cat === 'Tümü' || cat === 'Daha İyi Uyku') && (
        <>
          <View style={st.rowHdr}><Text style={st.rowTitle}>Daha İyi Uyku</Text><Text style={st.rowMore}>Daha Fazla ›</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingRight: 16 }}>
              {SLEEP_VIDEOS.map((v, i) => (
                <Animated.View key={i} entering={FadeInRight.delay(i * 60).duration(350)}>
                  <LinearGradient colors={[v.color + '30', v.color + '10']} style={st.videoCard}>
                    <View style={[st.playCircle, { backgroundColor: v.color + '40', borderColor: v.color + '80' }]}>
                      <Ionicons name="play" size={18} color={v.color} />
                    </View>
                    <Text style={st.videoTitle}>{v.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Ionicons name="time-outline" size={11} color={C.muted} />
                      <Text style={st.videoSub}>{v.dur}</Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {(cat === 'Tümü' || cat === 'Sağlık') && (
        <>
          <View style={st.rowHdr}><Text style={st.rowTitle}>Sağlık İpuçları</Text><Text style={st.rowMore}>Daha Fazla ›</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingRight: 16 }}>
              {HEALTH_TIPS.map((tip, i) => (
                <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(350)}>
                  <LinearGradient colors={[tip.color + '28', tip.color + '10']} style={st.tipCard}>
                    <Text style={{ fontSize: 32, marginBottom: 6 }}>{tip.emoji}</Text>
                    <Text style={[st.videoTitle, { color: tip.color }]}>{tip.title}</Text>
                    <Text style={st.videoSub}>{tip.sub}</Text>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {(cat === 'Tümü' || cat === 'Testler') && (
        <>
          <View style={st.rowHdr}><Text style={st.rowTitle}>Sağlık Testleri</Text><Text style={st.rowMore}>Daha Fazla ›</Text></View>
          {HEALTH_TESTS.map((test, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 55).duration(350)} style={[st.testCard, { borderLeftColor: test.color }]}>
              <View style={[st.testEmoji, { backgroundColor: test.color + '20' }]}>
                <Text style={{ fontSize: 22 }}>{test.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.videoTitle}>{test.title}</Text>
                <Text style={st.videoSub}>{test.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.dim} />
            </Animated.View>
          ))}
        </>
      )}

      {(cat === 'Tümü' || cat === 'Sağlık') && (
        <>
          <View style={[st.rowHdr, { marginTop: 8 }]}><Text style={st.rowTitle}>Makaleler</Text><Text style={st.rowMore}>Daha Fazla ›</Text></View>
          {ARTICLES.map((a, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 45).duration(350)} style={st.articleRow}>
              <View style={st.articleEmoji}><Text style={{ fontSize: 24 }}>{a.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={st.videoTitle}>{a.title}</Text>
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

      {(cat === 'Tümü' || cat === 'Tarifler') && (
        <>
          <View style={[st.rowHdr, { marginTop: 8 }]}><Text style={st.rowTitle}>Tarifler</Text><Text style={st.rowMore}>Daha Fazla ›</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10, paddingRight: 16 }}>
              {RECIPES.map((r, i) => (
                <Animated.View key={i} entering={FadeInRight.delay(i * 60).duration(350)} style={st.recipeCard}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>{r.emoji}</Text>
                  <Text style={st.videoTitle}>{r.title}</Text>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BakimScreen() {
  const { lang }           = useLang();
  const [userId, setUserId] = useState(null);
  const [mainTab, setMainTab] = useState('bakim');
  const [subTab,  setSubTab]  = useState('urunler');
  const [skinType, setSkinType] = useState('tum');
  const [showSkinFilter, setShowSkinFilter] = useState(false);

  useFocusEffect(useCallback(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
        getSkinProfile(data.user.id).then(p => {
          if (p?.skin_type) setSkinType(p.skin_type);
        }).catch(() => {});
      }
    });
  }, []));

  const skinInfo = SKIN_TYPES.find(s => s.key === skinType) ?? SKIN_TYPES[0];

  const BAKIM_TABS = [
    { key: 'urunler',  label: 'Ürünler',   icon: 'flask-outline'       },
    { key: 'rutinler', label: 'Rutinlerim', icon: 'list-outline'        },
    { key: 'sablonlar',label: 'Şablonlar',  icon: 'copy-outline'        },
  ];

  return (
    <View style={st.root}>
      {/* ── MAIN TOP TABS ── */}
      <View style={st.mainTabRow}>
        {[['bakim','flask-outline','BAKIM',C.cyan],['yasam','leaf-outline','YAŞAM',C.orchid]].map(([key, icon, lbl, color]) => (
          <TouchableOpacity key={key} onPress={() => setMainTab(key)} activeOpacity={0.8}
            style={[st.mainTabBtn, mainTab === key && { borderBottomColor: color, borderBottomWidth: 2 }]}>
            <Ionicons name={icon} size={14} color={mainTab === key ? color : C.dim} />
            <Text style={[st.mainTabTxt, { color: mainTab === key ? color : C.dim }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mainTab === 'yasam' ? <YasamTab /> : (
        <>
          {/* Skin type filter bar */}
          <View style={st.skinBar}>
            <TouchableOpacity onPress={() => setShowSkinFilter(v => !v)} activeOpacity={0.8}
              style={[st.skinChip, { borderColor: skinInfo.color + '60', backgroundColor: skinInfo.color + '15' }]}>
              <Ionicons name={skinInfo.icon} size={13} color={skinInfo.color} />
              <Text style={[st.skinChipTxt, { color: skinInfo.color }]}>{skinInfo.label} Cilt</Text>
              <Ionicons name={showSkinFilter ? 'chevron-up' : 'chevron-down'} size={12} color={skinInfo.color} />
            </TouchableOpacity>
            <Text style={st.skinHint}>Cilt tipine göre filtrele</Text>
          </View>

          {showSkinFilter && (
            <Animated.View entering={FadeIn.duration(200)} style={st.skinFilterRow}>
              {SKIN_TYPES.map(s => (
                <TouchableOpacity key={s.key} onPress={() => { setSkinType(s.key); setShowSkinFilter(false); }} activeOpacity={0.8}
                  style={[st.skinOption, skinType === s.key && { borderColor: s.color, backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon} size={14} color={skinType === s.key ? s.color : C.muted} />
                  <Text style={[st.skinOptionTxt, skinType === s.key && { color: s.color }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          {/* Sub-tab row */}
          <View style={st.subTabRow}>
            {BAKIM_TABS.map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setSubTab(tab.key)} activeOpacity={0.8}
                style={[st.subTabBtn, subTab === tab.key && { borderColor: C.cyan + '80', backgroundColor: C.cyan + '18' }]}>
                <Ionicons name={tab.icon} size={13} color={subTab === tab.key ? C.cyan : C.dim} />
                <Text style={[st.subTabTxt, { color: subTab === tab.key ? C.cyan : C.dim }]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {subTab === 'urunler'   && <UrunlerTab skinType={skinType} />}
          {subTab === 'rutinler'  && <RutinlerimTab userId={userId} />}
          {subTab === 'sablonlar' && <SablonlarTab userId={userId} skinType={skinType} />}
        </>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  tabContent: { padding: 16, paddingBottom: 40 },

  // Main tabs
  mainTabRow:  { flexDirection: 'row', backgroundColor: C.s1, borderBottomWidth: 1, borderBottomColor: C.border2 },
  mainTabBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  mainTabTxt:  { fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  // Skin filter
  skinBar:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.s1, borderBottomWidth: 1, borderBottomColor: C.border2 },
  skinChip:      { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  skinChipTxt:   { fontSize: 12, fontWeight: '700' },
  skinHint:      { color: C.dim, fontSize: 11 },
  skinFilterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, backgroundColor: C.s1, borderBottomWidth: 1, borderBottomColor: C.border2 },
  skinOption:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.border2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  skinOptionTxt: { color: C.muted, fontSize: 12, fontWeight: '600' },

  // Sub tabs
  subTabRow:  { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.s1, borderBottomWidth: 1, borderBottomColor: C.border2 },
  subTabBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: C.border2 },
  subTabTxt:  { fontSize: 11, fontWeight: '700' },

  // Chips
  chip:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.border2, backgroundColor: C.s1 },
  chipTxt: { color: C.muted, fontSize: 12, fontWeight: '700' },

  // Search
  searchRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.s1, borderRadius: 14, borderWidth: 1, borderColor: C.border2, paddingHorizontal: 12, marginBottom: 12, height: 44 },
  searchInput: { flex: 1, color: C.text, fontSize: 14, height: 44 },

  // Product card
  productCard:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.s1, borderRadius: 12, borderWidth: 1, borderColor: C.border2, padding: 12, marginBottom: 6 },
  productCatDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  productName:   { color: C.text, fontSize: 13, fontWeight: '700' },
  productBrand:  { color: C.muted, fontSize: 11, marginTop: 1 },
  productAmt:    { color: C.orchid, fontSize: 11, fontWeight: '700' },
  productDetail: { backgroundColor: C.s2, borderRadius: 10, padding: 12, marginBottom: 6, marginTop: -4 },
  productInst:   { color: C.muted, fontSize: 12, lineHeight: 18 },
  ingTag:        { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  ingTxt:        { fontSize: 10, fontWeight: '700' },

  // Step card
  stepCard:    { flexDirection: 'row', backgroundColor: C.s2, borderRadius: 12, overflow: 'hidden', marginBottom: 6, borderWidth: 1, borderColor: C.border2 },
  stepNumCol:  { width: 38, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  stepNum:     { fontSize: 16, fontWeight: '900' },
  stepOpt:     { fontSize: 7, fontWeight: '800', textTransform: 'uppercase', opacity: 0.7, marginTop: 2 },
  stepName:    { color: C.text, fontSize: 12, fontWeight: '700' },
  stepBrand:   { color: C.muted, fontSize: 10, marginTop: 1 },
  amtPill:     { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginTop: 5 },
  amtTxt:      { fontSize: 10, fontWeight: '700' },
  stepNote:    { color: C.muted, fontSize: 11, marginTop: 4, lineHeight: 16 },

  // Routine row
  routineRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.s1, borderRadius: 14, borderWidth: 1, borderColor: C.border2, overflow: 'hidden', marginBottom: 6 },
  routineStrip: { width: 4, alignSelf: 'stretch' },
  routineTitle: { color: C.text, fontSize: 14, fontWeight: '800' },
  routineMeta:  { color: C.muted, fontSize: 11, marginTop: 2 },
  activeBadge:  { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  activeTxt:    { fontSize: 10, fontWeight: '800' },
  iconBtn:      { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Template card
  tmplCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, marginBottom: 2 },
  tmplGrad: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 10 },
  tmplDesc: { color: C.muted, fontSize: 11, marginTop: 6, lineHeight: 16 },

  // Buttons
  completeBtn:    { borderRadius: 12, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  completeBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  fabBtn:         { borderRadius: 14, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  fabTxt:         { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Modal
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end', padding: 16 },
  modal:      { backgroundColor: C.s1, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border2 },
  modalTitle: { color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 16 },
  modalInput: { backgroundColor: C.s2, borderRadius: 12, borderWidth: 1, borderColor: C.border2, color: C.text, paddingHorizontal: 14, height: 48, fontSize: 15, marginBottom: 16 },
  cancelBtn:  { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.border2, alignItems: 'center', justifyContent: 'center' },
  saveBtn:    { flex: 2, height: 44, borderRadius: 12, backgroundColor: C.orchid, alignItems: 'center', justifyContent: 'center' },

  // Empty
  emptyTxt:   { color: C.muted, textAlign: 'center', paddingVertical: 40, fontSize: 14 },
  emptyCard:  { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { color: C.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptyDesc:  { color: C.muted, fontSize: 13 },

  // LifeStyle
  rowHdr:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rowTitle:    { color: C.text, fontSize: 15, fontWeight: '800' },
  rowMore:     { color: C.muted, fontSize: 12 },
  videoCard:   { width: (W - 64) / 2.2, borderRadius: 16, padding: 14, gap: 6, borderWidth: 1, borderColor: C.border2 },
  playCircle:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 4 },
  videoTitle:  { color: C.text, fontSize: 12, fontWeight: '700' },
  videoSub:    { color: C.muted, fontSize: 10 },
  tipCard:     { width: (W - 64) / 2.2, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border2, minHeight: 110, justifyContent: 'center' },
  testCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.s1, borderWidth: 1, borderColor: C.border2, borderLeftWidth: 3, borderRadius: 12, padding: 12, marginBottom: 8 },
  testEmoji:   { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  articleRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.s1, borderWidth: 1, borderColor: C.border2, borderRadius: 12, padding: 12, marginBottom: 8 },
  articleEmoji:{ width: 52, height: 52, borderRadius: 13, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
  recipeCard:  { width: (W - 64) / 1.8, backgroundColor: C.s1, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border2, marginRight: 10 },
});
