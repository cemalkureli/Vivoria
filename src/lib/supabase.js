import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? Constants.expoConfig?.extra?.supabaseUrl      ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? Constants.expoConfig?.extra?.supabaseAnonKey  ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});

// ─── Auth helpers ──────────────────────────────────────────────────────────────

export async function signUp({ email, password, fullName }) {
  const clean = email.trim().toLowerCase();
  if (!clean || !password || password.length < 6) throw new Error('Geçersiz giriş bilgileri.');
  const { data, error } = await supabase.auth.signUp({
    email: clean, password,
    options: { data: { full_name: fullName?.trim() } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(), password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Profile helpers ───────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ─── Health log helpers ────────────────────────────────────────────────────────

export async function logHealthEntry(userId, entry) {
  const { error } = await supabase
    .from('health_logs')
    .insert({ user_id: userId, ...entry, logged_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getHealthLogs(userId, limit = 30) {
  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ─── Skincare routine helpers ──────────────────────────────────────────────────

export async function logRoutineCompletion(userId, routineType) {
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase
    .from('routine_logs')
    .upsert(
      { user_id: userId, routine_type: routineType, date: today, completed: true },
      { onConflict: 'user_id,routine_type,date' }
    );
  if (error) throw error;
}

export async function getRoutineLogs(userId, days = 7) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const { data, error } = await supabase
    .from('routine_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from.toISOString().split('T')[0])
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
