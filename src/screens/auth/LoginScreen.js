import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { signIn } from '../../lib/supabase';
import { C } from '../../utils/theme';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';
import LangToggle from '../../components/LangToggle';

export default function LoginScreen({ onSuccess, onGoRegister }) {
  const { lang } = useLang();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const passRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('lastEmail').then(v => { if (v) setEmail(v); });
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError(t('emailRequired', lang)); return; }
    setError(''); setLoading(true);
    try {
      const trimmed = email.trim().toLowerCase();
      await signIn({ email: trimmed, password });
      AsyncStorage.setItem('lastEmail', trimmed);
      onSuccess?.();
    } catch (e) {
      setError(e.message === 'Invalid login credentials' ? t('wrongCreds', lang) : e.message);
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={['#060d24', '#0d1638', '#060d24']} style={s.fill}>
      <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Dil seçimi */}
          <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'flex-end', marginBottom: 8 }}>
            <LangToggle />
          </Animated.View>

          {/* Logo + İkon */}
          <Animated.View entering={FadeIn.duration(700)} style={s.logoBlock}>
            <View style={s.iconWrap}>
              <LinearGradient colors={['#d946a8', '#9333ea']} style={s.iconGrad}>
                <Ionicons name="heart-outline" size={32} color="#060d24" />
              </LinearGradient>
            </View>
            <Text style={s.logoText}>HEALTH<Text style={s.logoDim}>/CARE</Text></Text>
            <Text style={s.tagline}>{t('welcome', lang)}</Text>
          </Animated.View>

          {/* Kart */}
          <Animated.View entering={FadeInDown.delay(150).duration(500).springify()} style={s.card}>
            <Text style={s.cardTitle}>{t('login', lang)}</Text>

            <Animated.View entering={FadeInDown.delay(220).duration(400)} style={s.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={C.dim} style={s.icon} />
              <TextInput
                style={s.input} value={email} onChangeText={setEmail}
                placeholder={t('email', lang)} placeholderTextColor={C.muted}
                autoCapitalize="none" keyboardType="email-address"
                returnKeyType="next" onSubmitEditing={() => passRef.current?.focus()}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(290).duration(400)} style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={C.dim} style={s.icon} />
              <TextInput
                ref={passRef} style={[s.input, { paddingRight: 44 }]}
                value={password} onChangeText={setPassword}
                placeholder={t('passwordSimple', lang)} placeholderTextColor={C.muted}
                secureTextEntry={!showPass} returnKeyType="done" onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.muted} />
              </TouchableOpacity>
            </Animated.View>

            {error ? (
              <Animated.Text entering={FadeIn.duration(250)} style={s.error}>{error}</Animated.Text>
            ) : null}

            <Animated.View entering={FadeInDown.delay(360).duration(400)}>
              <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={['#d946a8', '#9333ea']} style={s.btn}>
                  {loading
                    ? <ActivityIndicator color={C.bg} size="small" />
                    : <Text style={s.btnText}>{t('login', lang)}</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(420).duration(400)} style={s.switchRow}>
              <Text style={s.switchTxt}>{t('noAccount', lang)}</Text>
              <TouchableOpacity onPress={onGoRegister}>
                <Text style={s.switchLink}>{t('register', lang)}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Alt dekorasyon */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={s.bottomHints}>
            {['Cilt Bakımı', 'Sağlık Takibi', 'Günlük Rutin'].map((hint, i) => (
              <View key={i} style={s.hint}>
                <Ionicons name="checkmark-circle" size={13} color={C.orchid} />
                <Text style={s.hintTxt}>{hint}</Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill:       { flex: 1 },
  scroll:     { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoBlock:  { alignItems: 'center', marginBottom: 40 },
  iconWrap:   { marginBottom: 16 },
  iconGrad:   { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  logoText:   { color: C.orchid, fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  logoDim:    { color: C.muted },
  tagline:    { color: C.muted, fontSize: 13, marginTop: 6, letterSpacing: 0.4, textAlign: 'center' },
  card:       { backgroundColor: C.s1, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border },
  cardTitle:  { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 24 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.s2, borderRadius: 14, borderWidth: 1, borderColor: C.border2, marginBottom: 14, paddingHorizontal: 14 },
  icon:       { marginRight: 10 },
  input:      { flex: 1, height: 52, color: C.text, fontSize: 15, fontWeight: '500' },
  eyeBtn:     { position: 'absolute', right: 14, padding: 4 },
  error:      { color: C.rose, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn:        { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText:    { color: C.bg, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  switchRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchTxt:  { color: C.muted, fontSize: 14 },
  switchLink: { color: C.orchid, fontSize: 14, fontWeight: '700' },
  bottomHints:{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 32 },
  hint:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hintTxt:    { color: C.dim, fontSize: 11, fontWeight: '600' },
});
