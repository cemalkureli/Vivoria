import AsyncStorage from '@react-native-async-storage/async-storage';

export const PROJECT_START = new Date('2025-03-24');

const KEY_DONE          = 'mylife_done';
const KEY_DAY           = 'mylife_day';
const KEY_NAMAZ         = 'mylife_namaz';
const KEY_STREAK        = 'mylife_streak';
const KEY_WORKOUT       = 'mylife_workout';
const KEY_BODY          = 'mylife_body';
const KEY_SLEEP         = 'mylife_sleep';
const KEY_SLEEP_PENDING = 'mylife_sleep_pending';

export const SPOR_GUNLERI = [2, 3, 4, 6, 0];

export function isSporGunu(date = new Date()) {
  return SPOR_GUNLERI.includes(date.getDay());
}

export function getBarfiksHaftasi() {
  const dayOfMonth = new Date().getDate();
  return Math.min(Math.ceil(dayOfMonth / 7), 4);
}

export function getBarfiksReps() {
  const h = getBarfiksHaftasi();
  if (h === 1) return { sets: 3, reps: 3, label: '3×3', total: 72  };
  if (h === 2) return { sets: 3, reps: 4, label: '3×4', total: 96  };
  if (h === 3) return { sets: 3, reps: 5, label: '3×5', total: 120 };
  return             { sets: 3, reps: 6, label: '3×6', total: 144 };
}

// ─── Tamamlanan görevler ──────────────────────────────────────────────────────
export async function getDoneToday() {
  const today = new Date().toDateString();
  const savedDay = await AsyncStorage.getItem(KEY_DAY);
  if (savedDay !== today) {
    await AsyncStorage.setItem(KEY_DAY, today);
    await AsyncStorage.setItem(KEY_DONE, '{}');
    return {};
  }
  const raw = await AsyncStorage.getItem(KEY_DONE);
  return raw ? JSON.parse(raw) : {};
}

export async function markDone(taskId) {
  const done = await getDoneToday();
  done[taskId] = true;
  await AsyncStorage.setItem(KEY_DONE, JSON.stringify(done));
}

export async function unmarkDone(taskId) {
  const done = await getDoneToday();
  delete done[taskId];
  await AsyncStorage.setItem(KEY_DONE, JSON.stringify(done));
}

// ─── Namaz ───────────────────────────────────────────────────────────────────
export async function getNamazTimes() {
  const raw = await AsyncStorage.getItem(KEY_NAMAZ);
  return raw ? JSON.parse(raw) : null;
}

export async function setNamazTimes(times) {
  await AsyncStorage.setItem(KEY_NAMAZ, JSON.stringify(times));
}

export async function deleteNamazTimes() {
  await AsyncStorage.removeItem(KEY_NAMAZ);
}

// ─── Streak & Liga ────────────────────────────────────────────────────────────
export const TIERS = [
  { label:'Bronz IV',    league:'Bronz',      color:'#cd7f32', emoji:'🥉' },
  { label:'Bronz III',   league:'Bronz',      color:'#cd7f32', emoji:'🥉' },
  { label:'Bronz II',    league:'Bronz',      color:'#cd7f32', emoji:'🥉' },
  { label:'Bronz I',     league:'Bronz',      color:'#cd7f32', emoji:'🥉' },
  { label:'Gümüş IV',   league:'Gümüş',     color:'#94a3b8', emoji:'🥈' },
  { label:'Gümüş III',  league:'Gümüş',     color:'#94a3b8', emoji:'🥈' },
  { label:'Gümüş II',   league:'Gümüş',     color:'#94a3b8', emoji:'🥈' },
  { label:'Gümüş I',    league:'Gümüş',     color:'#94a3b8', emoji:'🥈' },
  { label:'Altın IV',   league:'Altın',     color:'#f59e0b', emoji:'🥇' },
  { label:'Altın III',  league:'Altın',     color:'#f59e0b', emoji:'🥇' },
  { label:'Altın II',   league:'Altın',     color:'#f59e0b', emoji:'🥇' },
  { label:'Altın I',    league:'Altın',     color:'#f59e0b', emoji:'🥇' },
  { label:'Challenger',  league:'Challenger', color:'#06b6d4', emoji:'👑' },
];

export async function getStreakData() {
  const raw = await AsyncStorage.getItem(KEY_STREAK);
  if (!raw) return { streak: 0, tierIndex: 0, lastUpdated: null };
  return JSON.parse(raw);
}

export async function updateStreakForDay(allTasksDone) {
  const data = await getStreakData();
  const today = new Date().toDateString();
  if (data.lastUpdated === today) return data;

  let { streak, tierIndex } = data;
  if (allTasksDone) {
    streak++;
    tierIndex = Math.min(tierIndex + 1, TIERS.length - 1);
  } else {
    streak = 0;
    tierIndex = Math.max(tierIndex - 1, 0);
  }

  const updated = { streak, tierIndex, lastUpdated: today };
  await AsyncStorage.setItem(KEY_STREAK, JSON.stringify(updated));
  return updated;
}

// ─── Antrenman Logu ──────────────────────────────────────────────────────────
export async function saveWorkoutSession(exerciseName, sets) {
  const raw = await AsyncStorage.getItem(KEY_WORKOUT);
  const logs = raw ? JSON.parse(raw) : {};
  if (!logs[exerciseName]) logs[exerciseName] = [];
  logs[exerciseName].unshift({ date: new Date().toISOString(), sets });
  if (logs[exerciseName].length > 20) logs[exerciseName].length = 20;
  await AsyncStorage.setItem(KEY_WORKOUT, JSON.stringify(logs));
}

export async function getAllWorkoutLogs() {
  const raw = await AsyncStorage.getItem(KEY_WORKOUT);
  return raw ? JSON.parse(raw) : {};
}

// ─── Vücut Ölçümleri ─────────────────────────────────────────────────────────
export async function saveBodyMeasurement(data) {
  const raw = await AsyncStorage.getItem(KEY_BODY);
  const logs = raw ? JSON.parse(raw) : [];
  logs.unshift({ ...data, date: new Date().toISOString() });
  if (logs.length > 50) logs.length = 50;
  await AsyncStorage.setItem(KEY_BODY, JSON.stringify(logs));
}

export async function getBodyMeasurements() {
  const raw = await AsyncStorage.getItem(KEY_BODY);
  return raw ? JSON.parse(raw) : [];
}

// ─── Uyku Takibi ─────────────────────────────────────────────────────────────
export async function recordSleepStart() {
  await AsyncStorage.setItem(KEY_SLEEP_PENDING, new Date().toISOString());
}

export async function recordWakeTime() {
  const startRaw = await AsyncStorage.getItem(KEY_SLEEP_PENDING);
  if (!startRaw) return null;
  const start = new Date(startRaw);
  const wake  = new Date();
  const durationMins = Math.round((wake - start) / 60000);
  if (durationMins < 120 || durationMins > 720) {
    await AsyncStorage.removeItem(KEY_SLEEP_PENDING);
    return null;
  }
  const raw  = await AsyncStorage.getItem(KEY_SLEEP);
  const logs = raw ? JSON.parse(raw) : [];
  const entry = {
    date: wake.toDateString(),
    sleepISO: startRaw,
    wakeISO: wake.toISOString(),
    durationMins,
  };
  logs.unshift(entry);
  if (logs.length > 30) logs.length = 30;
  await AsyncStorage.setItem(KEY_SLEEP, JSON.stringify(logs));
  await AsyncStorage.removeItem(KEY_SLEEP_PENDING);
  return entry;
}

export async function getSleepLogs() {
  const raw = await AsyncStorage.getItem(KEY_SLEEP);
  return raw ? JSON.parse(raw) : [];
}

// ─── Vitamin Stok ─────────────────────────────────────────────────────────────
const KEY_VITAMIN_STOCK = 'mylife_vitamin_stock';

export async function getVitaminStock() {
  const raw = await AsyncStorage.getItem(KEY_VITAMIN_STOCK);
  return raw ? JSON.parse(raw) : {};
}

export async function saveVitaminStock(data) {
  await AsyncStorage.setItem(KEY_VITAMIN_STOCK, JSON.stringify(data));
}

// ─── Tansiyon (Blood Pressure) ────────────────────────────────────────────────
const KEY_BP = 'vivoria_bp_logs';

export async function saveBPRecord({ sys, dia, pulse, note = '' }) {
  const raw  = await AsyncStorage.getItem(KEY_BP);
  const logs = raw ? JSON.parse(raw) : [];
  logs.unshift({ sys, dia, pulse, note, date: new Date().toISOString() });
  if (logs.length > 100) logs.length = 100;
  await AsyncStorage.setItem(KEY_BP, JSON.stringify(logs));
}

export async function getBPLogs() {
  const raw = await AsyncStorage.getItem(KEY_BP);
  return raw ? JSON.parse(raw) : [];
}

export async function getLatestBP() {
  const logs = await getBPLogs();
  return logs[0] ?? null;
}

export function classifyBP(sys, dia) {
  if (sys < 90 || dia < 60)                              return { label: 'Hipotansiyon',     color: '#4a80e8', short: 'Hypo'   };
  if (sys <= 119 && dia <= 79)                           return { label: 'Normal',            color: '#10b981', short: 'Normal' };
  if ((sys >= 120 && sys <= 129) && dia < 80)            return { label: 'Yüksek',            color: '#f59e0b', short: 'Elev.'  };
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { label: 'HT Evre 1',   color: '#f97316', short: 'HT-1'   };
  if (sys >= 140 && sys <= 179 || dia >= 90 && dia <= 119)    return { label: 'HT Evre 2',   color: '#ea580c', short: 'HT-2'   };
  return                                                      { label: 'Hipertansif Kriz',   color: '#f43f5e', short: 'Kriz'   };
}

// ─── Kan Şekeri (Blood Sugar) ─────────────────────────────────────────────────
const KEY_BS = 'vivoria_bs_logs';

export async function saveBSRecord({ value, unit = 'mg/dL', type = 'Açken', note = '' }) {
  const raw  = await AsyncStorage.getItem(KEY_BS);
  const logs = raw ? JSON.parse(raw) : [];
  logs.unshift({ value, unit, type, note, date: new Date().toISOString() });
  if (logs.length > 100) logs.length = 100;
  await AsyncStorage.setItem(KEY_BS, JSON.stringify(logs));
}

export async function getBSLogs() {
  const raw = await AsyncStorage.getItem(KEY_BS);
  return raw ? JSON.parse(raw) : [];
}

export async function getLatestBS() {
  const logs = await getBSLogs();
  return logs[0] ?? null;
}

export function classifyBS(value, type = 'Açken') {
  if (type === 'Açken') {
    if (value < 70)           return { label: 'Düşük',   color: '#4a80e8' };
    if (value <= 99)          return { label: 'Normal',  color: '#10b981' };
    if (value <= 125)         return { label: 'Riskli',  color: '#f59e0b' };
    return                           { label: 'Yüksek',  color: '#f43f5e' };
  }
  if (value < 140)            return { label: 'Normal',  color: '#10b981' };
  if (value <= 199)           return { label: 'Riskli',  color: '#f59e0b' };
  return                             { label: 'Yüksek',  color: '#f43f5e' };
}

// ─── Su takibi ────────────────────────────────────────────────────────────────
const KEY_WATER = 'vivoria_water_';

function waterKey() { return KEY_WATER + new Date().toISOString().split('T')[0]; }

export async function getTodayWaterMl() {
  const raw = await AsyncStorage.getItem(waterKey());
  return raw ? parseInt(raw, 10) : 0;
}

export async function addWaterMl(ml) {
  const cur = await getTodayWaterMl();
  await AsyncStorage.setItem(waterKey(), String(cur + ml));
  return cur + ml;
}

export async function setTodayWaterMl(ml) {
  await AsyncStorage.setItem(waterKey(), String(ml));
}
