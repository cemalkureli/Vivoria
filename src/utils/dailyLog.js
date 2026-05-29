// src/utils/dailyLog.js
// Her gece 23:59'da o günün görev tamamlama oranını kaydeder.
// AsyncStorage'da saklanır. 1 ay = ~31 kayıt, çok az yer kaplar.

import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_KEY = 'mylife_daily_log'; // { "2026-03-29": { done: 24, total: 38, pct: 63, tasks: {...} } }

// Bugünün logunu kaydet
// done = { taskId: true, ... }
// tasks = bugünün görev listesi
export async function saveDailyLog(done, tasks) {
  try {
    const today = new Date().toISOString().split('T')[0]; // "2026-03-29"
    const total = tasks.length;
    const doneCount = tasks.filter(t => done[t.id]).length;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    // Tamamlanmayan görevlerin listesi
    const missed = tasks
      .filter(t => !done[t.id])
      .map(t => ({ id: t.id, label: t.label, time: t.time }));

    // Tamamlanan görevlerin listesi
    const completed = tasks
      .filter(t => done[t.id])
      .map(t => ({ id: t.id, label: t.label, time: t.time }));

    const entry = {
      date:      today,
      total,
      done:      doneCount,
      pct,
      missed,
      completed,
      savedAt:   new Date().toISOString(),
    };

    // Mevcut logu oku
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const log = raw ? JSON.parse(raw) : {};

    // Bugünü ekle/güncelle
    log[today] = entry;

    // Son 60 günü tut — daha eskiyi sil
    const keys = Object.keys(log).sort();
    if (keys.length > 60) {
      const toDelete = keys.slice(0, keys.length - 60);
      toDelete.forEach(k => delete log[k]);
    }

    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log));
    return entry;
  } catch (err) {
    console.error('saveDailyLog error:', err);
    return null;
  }
}

// Tüm logu oku — { "2026-03-29": {...}, ... }
export async function getDailyLog() {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

// Son N günün logunu oku
export async function getRecentLog(days = 30) {
  const log = await getDailyLog();
  const keys = Object.keys(log).sort().slice(-days);
  return keys.map(k => log[k]);
}

// Belirli bir günün logunu oku
export async function getDayLog(dateStr) {
  const log = await getDailyLog();
  return log[dateStr] || null;
}

// Log istatistikleri — ortalama tamamlama oranı, en kötü gün vb.
export async function getLogStats(days = 30) {
  const entries = await getRecentLog(days);
  if (entries.length === 0) return null;

  const avgPct  = Math.round(entries.reduce((s, e) => s + e.pct, 0) / entries.length);
  const best    = entries.reduce((a, b) => a.pct >= b.pct ? a : b);
  const worst   = entries.reduce((a, b) => a.pct <= b.pct ? a : b);
  const perfect = entries.filter(e => e.pct === 100).length;

  // En çok kaçırılan görevler
  const missedCounts = {};
  entries.forEach(e => {
    (e.missed || []).forEach(t => {
      missedCounts[t.label] = (missedCounts[t.label] || 0) + 1;
    });
  });
  const topMissed = Object.entries(missedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  return {
    days:      entries.length,
    avgPct,
    best:      { date: best.date, pct: best.pct },
    worst:     { date: worst.date, pct: worst.pct },
    perfect,
    topMissed,
  };
}