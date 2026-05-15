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
      title: `⏰ ${trial.serviceName} trial ends in 3 days`,
      body: `You'll be charged ${amount}. Cancel now to avoid the charge.`,
    },
    {
      key: '1day',
      offset: 1 * 24 * 60 * 60 * 1000,
      title: `🚨 ${trial.serviceName} charges you ${amount} tomorrow!`,
      body: 'Cancel now before it\'s too late.',
    },
    {
      key: '2hour',
      offset: 2 * 60 * 60 * 1000,
      title: `🔴 LAST CHANCE: ${trial.serviceName} charges ${amount} in 2 hours!`,
      body: 'This is your final reminder. Cancel now!',
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

export async function scheduleWeeklyDigest(trialCount: number) {
  await Notifications.cancelScheduledNotificationAsync('weekly_digest').catch(() => {});

  if (trialCount === 0) return;

  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  nextSunday.setHours(10, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Weekly Trial Update',
      body: `You have ${trialCount} trial${trialCount === 1 ? '' : 's'} expiring this week. Check Unsub to stay on top of them.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextSunday,
    },
    identifier: 'weekly_digest',
  });
}
