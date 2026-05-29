import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CHANNEL_ID = 'mylife_tasks';

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Görev Bildirimleri',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#e8f44a',
      sound: 'alarm.mp3',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Her uygulama açılışında çağrılır — AsyncStorage guard YOK.
//
// Neden guard kaldırıldı:
//   Android telefon yeniden başladığında tüm planlanmış bildirimler OS tarafından
//   siliniyor. Önceki kodda "bugün zaten planlandı" guard'ı vardı; restart sonrası
//   guard geçerli kalıyordu ve bir daha planlama yapılmıyordu. Bu yüzden bildirimler
//   hiç gelmiyordu veya uygulama açılınca toplu geliyordu.
export async function scheduleTodayNotifications(tasks) {
  // Önce tüm planlanmış bildirimleri temizle
  await Notifications.cancelAllScheduledNotificationsAsync();

  const nowMs = Date.now();
  let scheduled = 0;

  for (const task of tasks) {
    if (!task.time) continue;

    const [h, m] = task.time.split(':').map(Number);
    const trigger = new Date();
    trigger.setHours(h, m, 0, 0);

    // 30 saniyelik buffer — geçmiş saatleri atla
    if (trigger.getTime() < nowMs + 30_000) continue;

    // Android güvenli limiti: ~50 aktif alarm
    if (scheduled >= 50) break;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: task.label,
          body: task.desc || 'Görevi tamamlamak için dokun.',
          data: { taskId: task.id },
          sound: 'alarm.mp3',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger,
          channelId: CHANNEL_ID,
        },
      });
      scheduled++;
    } catch (_) {
      // Tek bildirim başarısız olsa bile devam et
    }
  }

  return scheduled;
}
