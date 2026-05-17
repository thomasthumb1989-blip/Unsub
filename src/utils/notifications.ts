import * as Notifications from 'expo-notifications';
import { Trial } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTrialReminders(trial: Trial) {
  await cancelTrialReminders(trial.id);

  const endDate = new Date(trial.trialEndDate).getTime();
  const currencySymbol = trial.currency === 'GBP' ? '£' : trial.currency === 'EUR' ? '€' : '$';
  const amount = `${currencySymbol}${trial.chargeAmount.toFixed(2)}`;

  const reminders = [
    {
      key: '3day',
      offset: 3 * 24 * 60 * 60 * 1000,
      title: `⏰ ${trial.serviceName} renews in 3 days`,
      body: `You'll be charged ${amount}/${trial.cycle || 'month'}. Cancel now or keep it — your call.`,
    },
    {
      key: '1day',
      offset: 1 * 24 * 60 * 60 * 1000,
      title: `⚠️ ${trial.serviceName} charges ${amount} TOMORROW`,
      body: `Last chance to cancel before you're charged. Tap for cancel guide.`,
    },
    {
      key: '2hour',
      offset: 2 * 60 * 60 * 1000,
      title: `🚨 ${trial.serviceName} charges in 2 HOURS`,
      body: `${amount} charge incoming. This is your final reminder — act now or you'll be billed.`,
    },
  ];

  for (const reminder of reminders) {
    if (!trial.reminders[reminder.key as keyof typeof trial.reminders]) continue;

    const triggerTime = endDate - reminder.offset;
    if (triggerTime <= Date.now()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        data: { trialId: trial.id },
        sound: reminder.key === '2hour' ? 'default' : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerTime),
      },
      identifier: `${trial.id}_${reminder.key}`,
    });
  }
}

export async function cancelTrialReminders(trialId: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier.startsWith(trialId)) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function scheduleWeeklyDigest(trials: Trial[]) {
  await Notifications.cancelScheduledNotificationAsync('weekly_digest').catch(() => {});

  if (trials.length === 0) return;

  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  nextSunday.setHours(10, 0, 0, 0);

  const weekEnd = new Date(nextSunday);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const upcoming = trials.filter((t) => {
    const end = new Date(t.trialEndDate).getTime();
    return end >= nextSunday.getTime() && end <= weekEnd.getTime();
  });

  if (upcoming.length === 0) return;

  const totalAtRisk = upcoming.reduce((sum, t) => sum + t.chargeAmount, 0);
  const sym = upcoming[0]?.currency === 'GBP' ? '£' : upcoming[0]?.currency === 'EUR' ? '€' : '$';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${upcoming.length} renewal${upcoming.length > 1 ? 's' : ''} this week`,
      body: `${sym}${totalAtRisk.toFixed(2)} in upcoming charges. Review in Unsub.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextSunday,
    },
    identifier: 'weekly_digest',
  });
}

export async function scheduleMonthlyDigest(totalMonthly: number, currency: string, subCount: number) {
  await Notifications.cancelScheduledNotificationAsync('monthly_digest').catch(() => {});

  if (subCount === 0) return;

  const now = new Date();
  const firstOfNext = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
  const sym = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Monthly recap: ${sym}${totalMonthly.toFixed(2)} in subscriptions`,
      body: `You have ${subCount} active subscription${subCount > 1 ? 's' : ''}. Time to review?`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: firstOfNext,
    },
    identifier: 'monthly_digest',
  });
}
