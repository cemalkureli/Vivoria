import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { signUp } from '../../lib/supabase';
import { C } from '../../utils/theme';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';
import LangToggle from '../../components/LangToggle';

export default function RegisterScreen({ onSuccess, onGoLogin }) {
  const { lang }  = useLang();
  const [fullName, setFullName]   = useState('');
  const [email,    setEmail]      = useState('');
  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const [done,     setDone]       = useState(false);
  const emailRef   = useRef(null);
  const passRef    = useRef(null);
  const confirmRef = useRef(null);

  const handleRegister = async () => {
    if (!fullName.trim())           { setError(t('nameRequired', lang));    return; }
    if (!email.trim() || !password) { setError(t('emailRequired', lang));   return; }
    if (password.length < 6)        { setError(t('passwordShort', lang));   return; }
    if (password !== confirm)       { setError(t('passwordMismatch', lang)); return; }
    setError(''); setLoading(true);
    try {
      await signUp({ email: email.trim(), password, fullName: fullName.trim() });
      setDone(true);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (done) return (
    <LinearGradient colors={['#060d24', '#0d1638', '#060d24']} style={s.fill}>
      <Animated.View entering={FadeIn.duration(600)} style={s.successBox}>
        <LinearGradient colors={['#d946a8', '#9333ea']} style={s.successIcon}>
          <Ionicons name="checkmark" size={40} color={C.bg} />
        </LinearGradient>
        <Text style={s.successTitle}>{t('accountCreated', lang)}</Text>
        <Text style={s.successSub}>{t('verifyEmail', lang)}</Text>
        <TouchableOpacity onPress={onGoLogin} activeOpacity={0.85}>
          <LinearGradient colors={['#d946a8', '#9333ea']} style={s.btn}>
            <Text style={s.btnText}>{t('login', lang)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={['#060d24', '#0d1638', '#060d24']} style={s.fill}>
      <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'flex-end', marginBottom: 8 }}>
            <LangToggle />
          </Animated.View>

          <Animated.View entering={FadeIn.duration(700)} style={s.logoBlock}>
            <View style={s.iconWrap}>
              <LinearGradient colors={['#d946a8', '#9333ea']} style={s.iconGrad}>
                <Ionicons name="person-add-outline" size={30} color="#060d24" />
              </LinearGradient>
            </View>
            <Text style={s.logoText}>VIV<Text style={s.logoDim}>O</Text>RIA</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(500).springify()} style={s.card}>
            <Text style={s.cardTitle}>{t('createAccount', lang)}</Text>

            {/* Ad Soyad */}
            <Animated.View entering={FadeInDown.delay(180).duration(400)} style={s.inputWrap}>
              <Ionicons name="person-outline" size={18} color={C.dim} style={s.icon} />
              <TextInput
                style={s.input} value={fullName} onChangeText={setFullName}
                placeholder={t('fullName', lang)} placeholderTextColor={C.muted}
                returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
              />
            </Animated.View>

            {/* E-posta */}
            <Animated.View entering={FadeInDown.delay(230).duration(400)} style={s.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={C.dim} style={s.icon} />
              <TextInput
                ref={emailRef} style={s.input} value={email} onChangeText={setEmail}
                placeholder={t('email', lang)} placeholderTextColor={C.muted}
                autoCapitalize="none" keyboardType="email-address"
                returnKeyType="next" onSubmitEditing={() => passRef.current?.focus()}
              />
            </Animated.View>

            {/* Şifre */}
            <Animated.View entering={FadeInDown.delay(280).duration(400)} style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={C.dim} style={s.icon} />
              <TextInput
                ref={passRef} style={[s.input, { paddingRight: 44 }]}
                value={password} onChangeText={setPassword}
                placeholder={t('password', lang)} placeholderTextColor={C.muted}
                secureTextEntry={!showPass} returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.muted} />
              </TouchableOpacity>
            </Animated.View>

            {/* Şifre tekrar */}
            <Animated.View entering={FadeInDown.delay(330).duration(400)} style={s.inputWrap}>
              <Ionicons name="shield-checkmark-outline" size={18} color={C.dim} style={s.icon} />
              <TextInput
                ref={confirmRef} style={s.input} value={confirm} onChangeText={setConfirm}
                placeholder={t('passwordConfirm', lang)} placeholderTextColor={C.muted}
                secureTextEntry={!showPass} returnKeyType="done" onSubmitEditing={handleRegister}
              />
            </Animated.View>

            {error ? (
              <Animated.Text entering={FadeIn.duration(250)} style={s.error}>{error}</Animated.Text>
            ) : null}

            <Animated.View entering={FadeInDown.delay(380).duration(400)}>
              <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={['#d946a8', '#9333ea']} style={s.btn}>
                  {loading
                    ? <ActivityIndicator color={C.bg} size="small" />
                    : <Text style={s.btnText}>{t('createAccount', lang)}</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(440).duration(400)} style={s.switchRow}>
              <Text style={s.switchTxt}>{t('hasAccount', lang)}</Text>
              <TouchableOpacity onPress={onGoLogin}>
                <Text style={s.switchLink}>{t('login', lang)}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill:         { flex: 1 },
  scroll:       { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoBlock:    { alignItems: 'center', marginBottom: 32 },
  iconWrap:     { marginBottom: 14 },
  iconGrad:     { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  logoText:     { color: C.orchid, fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  logoDim:      { color: C.muted },
  card:         { backgroundColor: C.s1, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border },
  cardTitle:    { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 22 },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.s2, borderRadius: 14, borderWidth: 1, borderColor: C.border2, marginBottom: 12, paddingHorizontal: 14 },
  icon:         { marginRight: 10 },
  input:        { flex: 1, height: 50, color: C.text, fontSize: 15, fontWeight: '500' },
  eyeBtn:       { position: 'absolute', right: 14, padding: 4 },
  error:        { color: C.rose, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn:          { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText:      { color: C.bg, fontSize: 16, fontWeight: '900' },
  switchRow:    { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  switchTxt:    { color: C.muted, fontSize: 14 },
  switchLink:   { color: C.orchid, fontSize: 14, fontWeight: '700' },
  successBox:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successIcon:  { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { color: C.text, fontSize: 26, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  successSub:   { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
