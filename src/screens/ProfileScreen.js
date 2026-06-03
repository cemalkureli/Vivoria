import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { C, GRAD } from '../utils/theme';
import { supabase, getProfile, signOut } from '../lib/supabase';
import { useLang } from '../context/LanguageContext';
import { t } from '../utils/i18n';

const GOALS = ['goalSkinCare', 'goalHydration', 'goalAntiAging', 'goalAcneCare', 'goalBrightening'];

// ─── Settings row ────────────────────────────────────────────────────────────
function SettingsRow({ icon, iconColor, label, value, onPress, last, toggle, toggleValue, onToggle }) {
  return (
    <TouchableOpacity
      style={[r.row, last && r.rowLast]}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      <View style={[r.rowIcon, { backgroundColor: (iconColor || C.orchid) + '18' }]}>
        <Ionicons name={icon} size={18} color={iconColor || C.orchid} />
      </View>
      <Text style={r.rowLabel}>{label}</Text>
      <View style={r.rowRight}>
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: C.dim, true: C.orchid + '90' }}
            thumbColor={toggleValue ? C.orchid : C.muted}
            style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
          />
        ) : (
          <>
            {value ? <Text style={r.rowValue}>{value}</Text> : null}
            {onPress ? <Ionicons name="chevron-forward" size={14} color={C.dim} /> : null}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, children, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={r.section}>
      <Text style={r.sectionTitle}>{title}</Text>
      {children}
    </Animated.View>
  );
}

// ─── Stat pill ───────────────────────────────────────────────────────────────
function StatPill({ icon, value, label, color }) {
  return (
    <View style={[r.statPill, { borderColor: color + '40' }]}>
      <LinearGradient colors={[color + '25', color + '10']} style={r.statPillBg}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[r.statValue, { color }]}>{value}</Text>
        <Text style={r.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ onSignOut }) {
  const { lang, setLang } = useLang();
  const [profile, setProfile]       = useState(null);
  const [user,    setUser]          = useState(null);
  const [notifOn, setNotifOn]       = useState(true);

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  async function loadProfile() {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        const p = await getProfile(data.user.id);
        setProfile(p);
      }
    } catch (_) {}
  }

  function confirmSignOut() {
    Alert.alert(t('signOut', lang), t('signOutConfirm', lang), [
      { text: t('cancel', lang), style: 'cancel' },
      { text: t('signOut', lang), style: 'destructive', onPress: async () => {
        await signOut();
        onSignOut?.();
      }},
    ]);
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('user', lang);
  const email       = user?.email ?? '—';
  const initials    = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <ScrollView style={r.fill} contentContainerStyle={r.content} showsVerticalScrollIndicator={false}>

      {/* ── PROFILE CARD ── */}
      <Animated.View entering={FadeInDown.duration(450)} style={r.profileCard}>
        <LinearGradient colors={['#1a0050', '#0d1638']} style={r.profileGrad}>
          {/* Avatar */}
          <LinearGradient colors={GRAD.orchid} style={r.avatar}>
            <Text style={r.initials}>{initials}</Text>
          </LinearGradient>

          <Text style={r.displayName}>{displayName}</Text>
          <Text style={r.emailTxt}>{email}</Text>

          {/* Health goal tag */}
          <View style={r.goalTag}>
            <Ionicons name="leaf-outline" size={11} color={C.orchid} />
            <Text style={r.goalTagTxt}>{t(profile?.health_goal ?? 'goalSkinCare', lang)}</Text>
          </View>

          {/* Body stats row */}
          <View style={r.statsRow}>
            <StatPill icon="body-outline"   value={profile?.height_cm ? `${profile.height_cm}` : '—'} label="cm"  color={C.cyan}  />
            <StatPill icon="scale-outline"  value={profile?.weight_kg ? `${profile.weight_kg}` : '—'} label="kg"  color={C.orchid}/>
            <StatPill icon="calendar-outline" value={profile?.age ? `${profile.age}` : '—'}           label="yaş" color={C.amber} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── HEALTH GOAL ── */}
      <Section title={t('healthGoal', lang)} delay={100}>
        <View style={r.goalGrid}>
          {GOALS.map(goal => {
            const active = (profile?.health_goal ?? 'goalSkinCare') === goal;
            return (
              <View
                key={goal}
                style={[r.goalOption, active && { borderColor: C.orchid, backgroundColor: C.orchid + '14' }]}
              >
                <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={active ? C.orchid : C.dim} />
                <Text style={[r.goalOptionTxt, active && { color: C.orchid }]}>{t(goal, lang)}</Text>
              </View>
            );
          })}
        </View>
      </Section>

      {/* ── BODY INFO ── */}
      <Section title={t('bodyInfo', lang)} delay={160}>
        <SettingsRow icon="body-outline"     iconColor={C.emerald} label={t('height', lang)} value={profile?.height_cm ? `${profile.height_cm} cm` : t('notSet', lang)} />
        <SettingsRow icon="scale-outline"    iconColor={C.cyan}    label={t('weight', lang)} value={profile?.weight_kg ? `${profile.weight_kg} kg` : t('notSet', lang)} />
        <SettingsRow icon="calendar-outline" iconColor={C.amber}   label={t('age', lang)}    value={profile?.age ? `${profile.age}` : t('notSet', lang)} />
        <SettingsRow icon="person-outline"   iconColor={C.purple}  label={t('gender', lang)} value={profile?.gender ? t(profile.gender, lang) : t('notSet', lang)} last />
      </Section>

      {/* ── HATIRLATICI & BİLDİRİM ── */}
      <Section title="Hatırlatıcı" delay={200}>
        <SettingsRow icon="alarm-outline"         iconColor={C.amber}   label="Rutin Hatırlatıcısı"   onPress={() => {}} />
        <SettingsRow icon="notifications-outline" iconColor={C.orchid}  label="Bildirim"               toggle toggleValue={notifOn} onToggle={setNotifOn} last />
      </Section>

      {/* ── UYGULAMA ── */}
      <Section title={t('app', lang)} delay={260}>
        <SettingsRow
          icon="language-outline" iconColor={C.cyan}
          label={t('language', lang)}
          value={lang === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
          onPress={() => setLang(lang === 'tr' ? 'en' : 'tr')}
        />
        <SettingsRow icon="share-outline"  iconColor={C.blue}    label="Verilerini Dışa Aktar" onPress={() => {}} />
        <SettingsRow icon="shield-outline" iconColor={C.purple}  label={t('privacy', lang)}    onPress={() => {}} />
        <SettingsRow icon="star-outline"   iconColor={C.amber}   label={t('rateApp', lang)}    onPress={() => {}} />
        <SettingsRow icon="mail-outline"   iconColor={C.orchid}  label={t('contactUs', lang)}  onPress={() => {}} last />
      </Section>

      {/* ── VERSION ── */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={r.versionRow}>
        <LinearGradient colors={GRAD.orchid} style={r.versionIcon}>
          <Ionicons name="heart" size={12} color="#fff" />
        </LinearGradient>
        <Text style={r.versionApp}>VIVORIA</Text>
        <Text style={r.versionNum}>v1.0.0</Text>
      </Animated.View>

      {/* ── SIGN OUT ── */}
      <Animated.View entering={FadeInDown.delay(340).duration(400)}>
        <TouchableOpacity onPress={confirmSignOut} activeOpacity={0.85}>
          <LinearGradient colors={[C.rose + '20', C.rose + '08']} style={r.signOutBtn}>
            <Ionicons name="log-out-outline" size={18} color={C.rose} />
            <Text style={r.signOutTxt}>{t('signOut', lang)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

    </ScrollView>
  );
}

const r = StyleSheet.create({
  fill:    { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 48, gap: 12 },

  // Profile card
  profileCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: C.orchid + '30' },
  profileGrad: { padding: 24, alignItems: 'center' },
  avatar:      { width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  initials:    { color: '#fff', fontSize: 30, fontWeight: '900' },
  displayName: { color: C.text, fontSize: 20, fontWeight: '900', marginBottom: 4 },
  emailTxt:    { color: C.muted, fontSize: 12, marginBottom: 12 },
  goalTag:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.orchid + '18', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: C.orchid + '35', marginBottom: 16 },
  goalTagTxt:  { color: C.orchid, fontSize: 11, fontWeight: '700' },

  statsRow:    { flexDirection: 'row', gap: 10 },
  statPill:    { flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  statPillBg:  { padding: 10, alignItems: 'center', gap: 3 },
  statValue:   { fontSize: 18, fontWeight: '900' },
  statLabel:   { color: C.muted, fontSize: 10, fontWeight: '600' },

  // Section
  section:      { backgroundColor: C.s1, borderRadius: 18, padding: 6, borderWidth: 1, borderColor: C.border2 },
  sectionTitle: { color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4, textTransform: 'uppercase' },

  // Row
  row:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: C.border2 },
  rowLast:   { borderBottomWidth: 0 },
  rowIcon:   { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowLabel:  { flex: 1, color: C.text, fontSize: 14, fontWeight: '600' },
  rowRight:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue:  { color: C.muted, fontSize: 12 },

  // Health goal grid
  goalGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 10 },
  goalOption:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.border2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  goalOptionTxt: { color: C.dim, fontSize: 12, fontWeight: '600' },

  // Version
  versionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 4 },
  versionIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  versionApp:  { color: C.muted, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  versionNum:  { color: C.dim, fontSize: 12, fontWeight: '600' },

  // Sign out
  signOutBtn: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: C.rose + '30' },
  signOutTxt: { color: C.rose, fontSize: 15, fontWeight: '700' },
});
