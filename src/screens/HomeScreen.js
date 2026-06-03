import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, GRAD } from '../utils/theme';
import { supabase } from '../lib/supabase';
import { useLang } from '../context/LanguageContext';
import { t, DAYS_SHORT, MONTHS_SHORT } from '../utils/i18n';
import {
  getLatestBP, classifyBP,
  getLatestBS, classifyBS,
  getBodyMeasurements,
  getTodayWaterMl,
} from '../utils/storage';

const { width: W } = Dimensions.get('window');

const ROUTINE_KEYS = {
  morning:     'routine_morning_',
  night:       'routine_night_',
  postWorkout: 'routine_post_',
};

function todayKey(prefix) {
  return prefix + new Date().toISOString().split('T')[0];
}

function greeting(lang) {
  const h = new Date().getHours();
  if (h < 6)  return t('greeting_night', lang);
  if (h < 12) return t('greeting_morning', lang);
  if (h < 17) return t('greeting_noon', lang);
  if (h < 21) return t('greeting_evening', lang);
  return t('greeting_late', lang);
}

function calcHealthScore(done, streak, logDays) {
  let s = 0;
  s += Math.min(done * 22, 45);
  s += streak >= 7 ? 30 : streak >= 3 ? 20 : streak >= 1 ? 10 : 0;
  s += logDays >= 14 ? 25 : logDays >= 7 ? 15 : logDays >= 3 ? 8 : 0;
  return Math.min(s, 100);
}

function scoreLabel(score, lang) {
  if (score >= 85) return { label: 'Mükemmel', color: C.emerald };
  if (score >= 65) return { label: 'İyi',       color: C.cyan    };
  if (score >= 40) return { label: 'Orta',      color: C.amber   };
  return                  { label: 'Başlıyor',  color: C.muted   };
}

// ─── Hero banner ──────────────────────────────────────────────────────────────
function HeroBanner({ name, score, doneCount, lang }) {
  const sl = scoreLabel(score);
  const greet = greeting(lang);
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={s.heroWrap}>
      <LinearGradient colors={['#1a0050', '#0d1638', '#060d24']} style={s.heroGrad}>

        {/* Top row: score + dna icon */}
        <View style={s.heroTopRow}>
          {/* Left: greeting + name */}
          <View style={{ flex: 1 }}>
            <Text style={s.heroGreet}>{greet}</Text>
            <Text style={s.heroName}>{name}</Text>
          </View>

          {/* Right: health score ring */}
          <View style={s.scoreRing}>
            <LinearGradient colors={GRAD.orchid} style={s.scoreRingGrad}>
              <View style={s.scoreInner}>
                <Text style={s.scoreNum}>{score}</Text>
                <Text style={s.scoreLbl}>PUAN</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Status pill */}
        <View style={[s.statusPill, { borderColor: sl.color + '50', backgroundColor: sl.color + '15' }]}>
          <View style={[s.statusDot, { backgroundColor: sl.color }]} />
          <Text style={[s.statusTxt, { color: sl.color }]}>{sl.label} durumdasın</Text>
        </View>

        {/* Progress bar */}
        <View style={s.heroProgressWrap}>
          <View style={s.heroProgressBg}>
            <LinearGradient
              colors={GRAD.orchid}
              style={[s.heroProgressFill, { width: `${(doneCount / 3) * 100}%` }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={s.heroProgressLbl}>{doneCount}/3 rutin tamamlandı</Text>
        </View>

        {/* Decorative DNA dots */}
        <View style={s.dnaDots}>
          {[C.orchid, C.cyan, C.gold, C.pink, C.emerald].map((c, i) => (
            <View key={i} style={[s.dnaDot, { backgroundColor: c, opacity: 0.3 + i * 0.1 }]} />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Metric card (2×2 grid) ───────────────────────────────────────────────────
function MetricCard({ icon, value, label, color, sublabel, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={s.metricCardWrap}>
      <LinearGradient colors={[color + '20', color + '06']} style={s.metricCard}>
        <View style={[s.metricIconBg, { backgroundColor: color + '25' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[s.metricValue, { color }]}>{value}</Text>
        <Text style={s.metricLabel}>{label}</Text>
        {sublabel ? <Text style={s.metricSub}>{sublabel}</Text> : null}
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Routine card ────────────────────────────────────────────────────────────
function RoutineCard({ icon, title, subtitle, color, done, onToggle, delay }) {
  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(400)}>
      <TouchableOpacity activeOpacity={0.82} onPress={onToggle}>
        <View style={[s.routineCard, done && { borderColor: color + '60' }]}>
          <View style={[s.routineStrip, { backgroundColor: done ? color : C.dim }]} />
          <LinearGradient
            colors={done ? [color + '18', color + '06'] : [C.s1, C.s2]}
            style={s.routineInner}
          >
            <View style={[s.routineIconBg, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.routineTitle, done && { color }]}>{title}</Text>
              <Text style={s.routineSub}>{subtitle}</Text>
            </View>
            <View style={[s.routineCheck, done && { backgroundColor: color, borderColor: color }]}>
              <Ionicons name="checkmark" size={14} color={done ? '#fff' : 'transparent'} />
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Health Diary card ────────────────────────────────────────────────────────
function DiaryCard({ icon, title, value, unit, sub, color, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(380)} style={[s.diaryCard, { borderColor: color + '35' }]}>
      <LinearGradient colors={[color + '18', color + '06']} style={s.diaryGrad}>
        <View style={[s.diaryIconBg, { backgroundColor: color + '25' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={s.diaryTitle}>{title}</Text>
        <Text style={[s.diaryValue, { color }]}>
          {value ?? '—'}
          {value && unit ? <Text style={s.diaryUnit}> {unit}</Text> : null}
        </Text>
        {sub ? <Text style={s.diarySub}>{sub}</Text> : null}
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Weekly heatmap ──────────────────────────────────────────────────────────
function WeekHeatmap({ completedDays, lang }) {
  const days  = DAYS_SHORT[lang] ?? DAYS_SHORT.tr;
  const today = new Date();
  const week  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 6 + i);
    return d;
  });
  return (
    <View style={s.heatmapRow}>
      {week.map((d, i) => {
        const key     = d.toISOString().split('T')[0];
        const active  = completedDays.has(key);
        const isToday = d.toDateString() === today.toDateString();
        return (
          <View key={i} style={s.heatDay}>
            <LinearGradient
              colors={active ? GRAD.orchid : isToday ? [C.s3, C.s3] : [C.s2, C.s2]}
              style={[
                s.heatDot,
                isToday && !active && { borderWidth: 1.5, borderColor: C.orchid },
              ]}
            >
              {active
                ? <Ionicons name="checkmark" size={13} color="#fff" />
                : <Ionicons name={isToday ? 'today-outline' : 'ellipse-outline'} size={11} color={isToday ? C.orchid : C.dim} />}
            </LinearGradient>
            <Text style={[s.heatLabel, isToday && { color: C.orchid }]}>
              {days[d.getDay()]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { lang } = useLang();
  const [profile,       setProfile]       = useState(null);
  const [routines,      setRoutines]      = useState({ morning: false, night: false, postWorkout: false });
  const [streak,        setStreak]        = useState(0);
  const [completedDays, setCompletedDays] = useState(new Set());
  const [latestBP,      setLatestBP]      = useState(null);
  const [latestBS,      setLatestBS]      = useState(null);
  const [latestBody,    setLatestBody]    = useState(null);
  const [waterMl,       setWaterMl]       = useState(0);

  useFocusEffect(useCallback(() => {
    loadRoutineState();
    loadProfile();
    loadHealthData();
  }, []));

  async function loadHealthData() {
    try {
      const [bp, bs, body, water] = await Promise.all([
        getLatestBP(),
        getLatestBS(),
        getBodyMeasurements(),
        getTodayWaterMl(),
      ]);
      setLatestBP(bp);
      setLatestBS(bs);
      setLatestBody(body[0] ?? null);
      setWaterMl(water);
    } catch (_) {}
  }

  async function loadProfile() {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const meta = data.user.user_metadata;
        setProfile({ name: meta?.full_name || data.user.email?.split('@')[0] || t('user', lang) });
      }
    } catch (_) {}
  }

  async function loadRoutineState() {
    try {
      const [m, n, p] = await Promise.all([
        AsyncStorage.getItem(todayKey(ROUTINE_KEYS.morning)),
        AsyncStorage.getItem(todayKey(ROUTINE_KEYS.night)),
        AsyncStorage.getItem(todayKey(ROUTINE_KEYS.postWorkout)),
      ]);
      setRoutines({ morning: m === '1', night: n === '1', postWorkout: p === '1' });

      let s = 0;
      const days = new Set();
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const mk = await AsyncStorage.getItem(ROUTINE_KEYS.morning + key);
        const nk = await AsyncStorage.getItem(ROUTINE_KEYS.night   + key);
        if (mk === '1' || nk === '1') {
          days.add(key);
          if (i === s) s++;
        } else if (i > 0) break;
      }
      setStreak(s);
      setCompletedDays(days);
    } catch (_) {}
  }

  async function toggleRoutine(type) {
    const key = todayKey(ROUTINE_KEYS[type]);
    const next = !routines[type];
    await AsyncStorage.setItem(key, next ? '1' : '0');
    setRoutines(prev => ({ ...prev, [type]: next }));
    if (next) {
      const today = new Date().toISOString().split('T')[0];
      setCompletedDays(prev => new Set([...prev, today]));
    }
  }

  const doneCount  = Object.values(routines).filter(Boolean).length;
  const score      = calcHealthScore(doneCount, streak, completedDays.size);
  const months     = MONTHS_SHORT[lang] ?? MONTHS_SHORT.tr;
  const days       = DAYS_SHORT[lang]   ?? DAYS_SHORT.tr;
  const now        = new Date();
  const dateStr    = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;

  return (
    <ScrollView style={s.fill} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ── HERO ── */}
      <HeroBanner
        name={profile?.name ?? t('user', lang)}
        score={score}
        doneCount={doneCount}
        lang={lang}
      />

      {/* ── DATE CHIP ── */}
      <Animated.View entering={FadeIn.delay(150).duration(300)} style={s.dateChipRow}>
        <View style={s.dateChip}>
          <Ionicons name="calendar-outline" size={12} color={C.orchid} />
          <Text style={s.dateChipTxt}>{dateStr}</Text>
        </View>
        <View style={s.dateChip}>
          <Ionicons name="flame-outline" size={12} color={C.amber} />
          <Text style={[s.dateChipTxt, { color: C.amber }]}>{streak} gün seri</Text>
        </View>
      </Animated.View>

      {/* ── METRICS 2×2 ── */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)}>
        <Text style={s.sectionHeading}>Günlük Durum</Text>
      </Animated.View>
      <View style={s.metricsGrid}>
        <MetricCard icon="flame-outline"          value={streak}              label="Seri"       sublabel="gün" color={C.amber}   delay={140} />
        <MetricCard icon="checkmark-done-outline"  value={`${doneCount}/3`}   label="Rutin"      sublabel="bugün" color={C.orchid} delay={190} />
        <MetricCard icon="calendar-outline"        value={completedDays.size} label="Toplam"     sublabel="aktif gün" color={C.cyan} delay={240} />
        <MetricCard icon="water-outline"           value="—"                  label="Su"         sublabel="yakında" color={C.blue} delay={290} />
      </View>

      {/* ── ROUTINES ── */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Text style={s.sectionHeading}>{t('todayRoutine', lang)}</Text>
      </Animated.View>

      <RoutineCard
        icon="sunny-outline"
        title={t('morningCare', lang)}
        subtitle="Temizleyici · SPF · Serum · 4 adım"
        color={C.amber}
        done={routines.morning}
        onToggle={() => toggleRoutine('morning')}
        delay={220}
      />
      <RoutineCard
        icon="moon-outline"
        title={t('nightCare', lang)}
        subtitle="Çift temizlik · Toner · Niacinamide · 5 adım"
        color={C.cyan}
        done={routines.night}
        onToggle={() => toggleRoutine('night')}
        delay={270}
      />
      <RoutineCard
        icon="fitness-outline"
        title={t('postWorkoutCare', lang)}
        subtitle="Spor sonrası temizlik · 5 adım"
        color={C.emerald}
        done={routines.postWorkout}
        onToggle={() => toggleRoutine('postWorkout')}
        delay={320}
      />

      {/* ── HEALTH DIARY ── */}
      <Animated.View entering={FadeInDown.delay(340).duration(400)}>
        <Text style={s.sectionHeading}>Sağlık Günlüğü</Text>
      </Animated.View>
      <View style={s.diaryGrid}>
        {(() => {
          const bpClass = latestBP ? classifyBP(latestBP.sys, latestBP.dia) : null;
          const bsClass = latestBS ? classifyBS(latestBS.value, latestBS.type) : null;
          const bmi = latestBody?.kilo && latestBody?.boy
            ? (latestBody.kilo / ((latestBody.boy / 100) ** 2)).toFixed(1)
            : null;
          return (
            <>
              <DiaryCard
                icon="fitness-outline" title="Tansiyon"
                value={latestBP ? `${latestBP.sys}/${latestBP.dia}` : null}
                unit="mmHg"
                sub={bpClass?.label}
                color={bpClass?.color ?? C.blue}
                delay={350}
              />
              <DiaryCard
                icon="water-outline" title="Kan Şekeri"
                value={latestBS?.value ?? null}
                unit={latestBS?.unit ?? 'mg/dL'}
                sub={bsClass?.label}
                color={bsClass?.color ?? C.orchid}
                delay={390}
              />
              <DiaryCard
                icon="scale-outline" title="Kilo & BMI"
                value={latestBody?.kilo ?? null}
                unit="kg"
                sub={bmi ? `BMI ${bmi}` : null}
                color={C.cyan}
                delay={430}
              />
              <DiaryCard
                icon="water" title="Su"
                value={waterMl > 0 ? waterMl : null}
                unit="ml"
                sub={`Hedef: 2300ml`}
                color={C.blue}
                delay={470}
              />
            </>
          );
        })()}
      </View>

      {/* ── WEEKLY HEATMAP ── */}
      <Animated.View entering={FadeInDown.delay(360).duration(400)} style={s.weekCard}>
        <View style={s.weekCardHeader}>
          <Text style={s.sectionHeading} >{t('thisWeek', lang)}</Text>
          <Text style={s.weekBadge}>{completedDays.size} / 30 gün</Text>
        </View>
        <WeekHeatmap completedDays={completedDays} lang={lang} />
        <View style={s.weekLegend}>
          <View style={s.legendItem}>
            <LinearGradient colors={GRAD.orchid} style={s.legendDot} />
            <Text style={s.legendTxt}>Tamamlandı</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: C.s3, borderWidth: 1, borderColor: C.orchid }]} />
            <Text style={s.legendTxt}>Bugün</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: C.s2 }]} />
            <Text style={s.legendTxt}>Boş</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── VIVORIA TIP ── */}
      <Animated.View entering={FadeInDown.delay(420).duration(400)}>
        <LinearGradient colors={['#1a0050', '#0d1638']} style={s.tipCard}>
          <View style={s.tipIconWrap}>
            <LinearGradient colors={GRAD.orchid} style={s.tipIconBg}>
              <Ionicons name="sparkles-outline" size={18} color="#fff" />
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.tipTitle}>Vivoria İpucu</Text>
            <Text style={s.tipTxt}>
              {doneCount === 3
                ? 'Harika! Tüm rutinleri tamamladın. Cilt sağlığın zirveye ulaşıyor.'
                : doneCount === 2
                ? 'Neredeyse tamam! Son rutin seni bekliyor.'
                : doneCount === 1
                ? 'Güzel başlangıç. Tutarlılık en büyük güç.'
                : 'Yeni bir güne merhaba. İlk rutinle başla!'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

    </ScrollView>
  );
}

const CARD_W = (W - 48) / 2;

const s = StyleSheet.create({
  fill:    { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40, gap: 4 },

  // ─ Hero ─
  heroWrap: { borderRadius: 24, overflow: 'hidden', marginBottom: 14 },
  heroGrad: { padding: 20, paddingBottom: 18, overflow: 'hidden' },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heroGreet: { color: C.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  heroName:  { color: C.text,  fontSize: 24, fontWeight: '900', marginTop: 2 },

  scoreRing:     { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', padding: 3 },
  scoreRingGrad: { flex: 1, borderRadius: 33, padding: 3 },
  scoreInner:    { flex: 1, backgroundColor: '#0d1638', borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  scoreNum:      { color: C.text, fontSize: 22, fontWeight: '900', lineHeight: 24 },
  scoreLbl:      { color: C.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 14 },
  statusDot:  { width: 7, height: 7, borderRadius: 3.5 },
  statusTxt:  { fontSize: 12, fontWeight: '700' },

  heroProgressWrap: { gap: 6 },
  heroProgressBg:   { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  heroProgressFill: { height: 6, borderRadius: 3 },
  heroProgressLbl:  { color: C.muted, fontSize: 11, fontWeight: '600' },

  dnaDots: { position: 'absolute', top: 14, right: 100, flexDirection: 'row', gap: 6 },
  dnaDot:  { width: 6, height: 6, borderRadius: 3 },

  // ─ Date chips ─
  dateChipRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  dateChip:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.s1, borderWidth: 1, borderColor: C.border2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  dateChipTxt: { color: C.orchid, fontSize: 11, fontWeight: '700' },

  // ─ Section heading ─
  sectionHeading: { color: C.text, fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 6 },

  // ─ Metrics ─
  metricsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  metricCardWrap:  { width: CARD_W },
  metricCard:      { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border2, gap: 6 },
  metricIconBg:    { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metricValue:     { fontSize: 26, fontWeight: '900', lineHeight: 30 },
  metricLabel:     { color: C.text, fontSize: 12, fontWeight: '700' },
  metricSub:       { color: C.muted, fontSize: 10 },

  // ─ Routines ─
  routineCard:   { borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 8 },
  routineStrip:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  routineInner:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingLeft: 18 },
  routineIconBg: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  routineTitle:  { color: C.text, fontSize: 14, fontWeight: '800' },
  routineSub:    { color: C.muted, fontSize: 11, marginTop: 2 },
  routineCheck:  { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: C.dim, alignItems: 'center', justifyContent: 'center' },

  // ─ Weekly heatmap ─
  weekCard:       { backgroundColor: C.s1, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border2, marginBottom: 10, marginTop: 8 },
  weekCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  weekBadge:      { color: C.muted, fontSize: 11, fontWeight: '700' },

  heatmapRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  heatDay:    { alignItems: 'center', gap: 5 },
  heatDot:    { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  heatLabel:  { color: C.dim, fontSize: 10, fontWeight: '600' },

  weekLegend: { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 12, height: 12, borderRadius: 4 },
  legendTxt:  { color: C.muted, fontSize: 10 },

  // ─ Health Diary ─
  diaryGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  diaryCard:    { width: CARD_W, borderRadius: 18, overflow: 'hidden', borderWidth: 1 },
  diaryGrad:    { padding: 14, gap: 4, minHeight: 110 },
  diaryIconBg:  { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  diaryTitle:   { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  diaryValue:   { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  diaryUnit:    { fontSize: 12, fontWeight: '500', color: C.muted },
  diarySub:     { color: C.muted, fontSize: 10, marginTop: 2 },

  // ─ Tip card ─
  tipCard:    { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: C.orchid + '30', marginTop: 8 },
  tipIconWrap:{ flexShrink: 0 },
  tipIconBg:  { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tipTitle:   { color: C.orchid, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  tipTxt:     { color: C.muted, fontSize: 12, lineHeight: 18 },
});
