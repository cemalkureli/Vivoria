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

// ─── Skin Profile ─────────────────────────────────────────────────────────────

export async function getSkinProfile(userId) {
  const { data, error } = await supabase
    .from('skin_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertSkinProfile(userId, skinType, concerns = []) {
  const { error } = await supabase
    .from('skin_profiles')
    .upsert({ user_id: userId, skin_type: skinType, concerns, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' });
  if (error) throw error;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts({ category, skinType, search } = {}) {
  let q = supabase.from('products').select('*').order('name');
  if (category) q = q.eq('category', category);
  if (skinType && skinType !== 'tum') q = q.contains('skin_types', [skinType]);
  if (search) q = q.ilike('name', `%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Routine Templates ────────────────────────────────────────────────────────

export async function getRoutineTemplates({ skinType, timing } = {}) {
  let q = supabase.from('routine_templates').select('*').order('title');
  if (skinType && skinType !== 'tum') {
    q = q.or(`skin_type.eq.${skinType},compatible_skin_types.cs.{${skinType}}`);
  }
  if (timing) q = q.eq('timing', timing);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getTemplateWithSteps(templateId) {
  const { data: template, error: te } = await supabase
    .from('routine_templates').select('*').eq('id', templateId).single();
  if (te) throw te;
  const { data: steps, error: se } = await supabase
    .from('template_steps')
    .select('*, products(*)')
    .eq('template_id', templateId)
    .order('order_index');
  if (se) throw se;
  return { ...template, steps: steps ?? [] };
}

// ─── User Routines ────────────────────────────────────────────────────────────

export async function getUserRoutines(userId) {
  const { data, error } = await supabase
    .from('user_routines')
    .select('*, user_routine_steps(*, products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getActiveRoutine(userId) {
  const { data, error } = await supabase
    .from('user_routines')
    .select('*, user_routine_steps(*, products(*))')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('user_routine_steps.order_index')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function activateRoutine(userId, routineId) {
  await supabase.from('user_routines').update({ is_active: false }).eq('user_id', userId);
  const { error } = await supabase.from('user_routines')
    .update({ is_active: true }).eq('id', routineId).eq('user_id', userId);
  if (error) throw error;
}

export async function createRoutineFromTemplate(userId, template) {
  const { data: routine, error: re } = await supabase
    .from('user_routines')
    .insert({ user_id: userId, title: template.title, timing: template.timing, is_active: false, from_template_id: template.id })
    .select().single();
  if (re) throw re;
  if (template.steps?.length) {
    const steps = template.steps.map(s => ({
      routine_id: routine.id,
      order_index: s.order_index,
      product_id: s.product_id,
      custom_product_name: s.custom_product_name,
      amount: s.amount,
      duration_secs: s.duration_secs,
      is_optional: s.is_optional,
      notes: s.notes,
    }));
    const { error: se } = await supabase.from('user_routine_steps').insert(steps);
    if (se) throw se;
  }
  return routine;
}

export async function createCustomRoutine(userId, { title, timing, steps = [] }) {
  const { data: routine, error: re } = await supabase
    .from('user_routines')
    .insert({ user_id: userId, title, timing, is_active: false })
    .select().single();
  if (re) throw re;
  if (steps.length) {
    const { error: se } = await supabase.from('user_routine_steps').insert(
      steps.map((s, i) => ({ routine_id: routine.id, order_index: i + 1, ...s }))
    );
    if (se) throw se;
  }
  return routine;
}

export async function deleteUserRoutine(routineId) {
  const { error } = await supabase.from('user_routines').delete().eq('id', routineId);
  if (error) throw error;
}

export async function logRoutineComplete(userId, routineId) {
  const { error } = await supabase.from('routine_completions').insert({
    user_id: userId, routine_id: routineId, date: new Date().toISOString().split('T')[0],
  });
  if (error && error.code !== '23505') throw error;
}

// ─── Nutrition Goals ─────────────────────────────────────────────────────────

export async function getNutritionGoals(userId) {
  const { data, error } = await supabase
    .from('user_nutrition_goals')
    .select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? { calories: 2000, protein_g: 150, carb_g: 200, fat_g: 60, water_ml: 2500, meal_count: 4 };
}

export async function upsertNutritionGoals(userId, goals) {
  const { error } = await supabase.from('user_nutrition_goals')
    .upsert({ user_id: userId, ...goals, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}

// ─── Meal Templates ───────────────────────────────────────────────────────────

export async function getMealTemplates(userId) {
  const { data, error } = await supabase.from('meal_templates')
    .select('*').eq('user_id', userId).order('order_index');
  if (error) throw error;
  return data ?? [];
}

export async function saveMealTemplate(userId, meal) {
  if (meal.id) {
    const { error } = await supabase.from('meal_templates').update(meal).eq('id', meal.id).eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('meal_templates').insert({ user_id: userId, ...meal });
    if (error) throw error;
  }
}

export async function deleteMealTemplate(mealId) {
  const { error } = await supabase.from('meal_templates').delete().eq('id', mealId);
  if (error) throw error;
}

// ─── Supplement Templates ─────────────────────────────────────────────────────

export async function getSupplements(userId) {
  const { data, error } = await supabase.from('supplement_templates')
    .select('*').eq('user_id', userId).order('order_index');
  if (error) throw error;
  return data ?? [];
}

export async function saveSupplements(userId, supplements) {
  await supabase.from('supplement_templates').delete().eq('user_id', userId);
  if (supplements.length) {
    const { error } = await supabase.from('supplement_templates').insert(
      supplements.map((s, i) => ({ user_id: userId, ...s, order_index: i }))
    );
    if (error) throw error;
  }
}

// ─── Task Templates ───────────────────────────────────────────────────────────

export async function getTaskTemplates(userId) {
  const { data, error } = await supabase.from('task_templates')
    .select('*').eq('user_id', userId).eq('is_active', true).order('time');
  if (error) throw error;
  return data ?? [];
}

export async function saveTaskTemplate(userId, task) {
  if (task.id) {
    const { error } = await supabase.from('task_templates').update(task).eq('id', task.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('task_templates').insert({ user_id: userId, ...task });
    if (error) throw error;
  }
}

export async function deleteTaskTemplate(taskId) {
  const { error } = await supabase.from('task_templates').delete().eq('id', taskId);
  if (error) throw error;
}

// ─── Skincare routine helpers (legacy) ────────────────────────────────────────

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
