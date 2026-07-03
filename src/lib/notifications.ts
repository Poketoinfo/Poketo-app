import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Demande la permission d'envoyer des notifications.
 * Sur le web, les notifications programmées ne sont pas supportées par Expo :
 * on retourne simplement false sans bloquer le reste de l'app.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Programme deux rappels pour une transaction ayant une date d'échéance :
 * - J-5 : notification de prévision
 * - Jour J : notification finale
 * Retourne les identifiants des notifications programmées (à sauvegarder
 * si on veut pouvoir les annuler plus tard lors d'une modification/suppression).
 */
export async function scheduleDueDateReminders(params: {
  contactName: string;
  amount: number;
  type: 'pret' | 'dette';
  dueDateISO: string; // "YYYY-MM-DD"
}): Promise<{ reminderId: string | null; dueId: string | null }> {
  if (Platform.OS === 'web') {
    return { reminderId: null, dueId: null };
  }

  const granted = await ensureNotificationPermission();
  if (!granted) return { reminderId: null, dueId: null };

  const dueDate = new Date(`${params.dueDateISO}T09:00:00`);
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 5);

  const verbe = params.type === 'pret' ? 'doit te rembourser' : 'dois rembourser';
  const now = new Date();

  let reminderId: string | null = null;
  let dueId: string | null = null;

  if (reminderDate > now) {
    reminderId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Échéance dans 5 jours',
        body: `${params.contactName} ${verbe} bientôt.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });
  }

  if (dueDate > now) {
    dueId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "C'est aujourd'hui",
        body: `${params.contactName} ${verbe} aujourd'hui.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dueDate,
      },
    });
  }

  return { reminderId, dueId };
}

export async function cancelReminder(notificationId: string | null) {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // notification déjà passée ou inexistante, on ignore
  }
}
