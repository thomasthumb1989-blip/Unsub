import AsyncStorage from '@react-native-async-storage/async-storage';

export type Trial = {
  id: string;
  serviceName: string;
  serviceIcon: string;
  trialEndDate: string;
  chargeAmount: number;
  currency: string;
  cancelUrl: string;
  category?: string;
  cycle?: 'monthly' | 'yearly' | 'one-time';
  reminders: { '3day': boolean; '1day': boolean; '2hour': boolean };
  status: 'active' | 'cancelled' | 'charged';
  createdAt: string;
};

export type Settings = {
  currency: string;
  isPremium: boolean;
  totalSaved: number;
  onboardingComplete: boolean;
  darkMode: boolean;
  userName: string;
};

const TRIALS_KEY = '@unsub_trials';
const SETTINGS_KEY = '@unsub_settings';

const DEFAULT_SETTINGS: Settings = {
  currency: 'GBP',
  isPremium: false,
  totalSaved: 0,
  onboardingComplete: false,
  darkMode: true,
  userName: '',
};

export async function getTrials(): Promise<Trial[]> {
  const raw = await AsyncStorage.getItem(TRIALS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveTrials(trials: Trial[]) {
  await AsyncStorage.setItem(TRIALS_KEY, JSON.stringify(trials));
}

export async function addTrial(trial: Trial) {
  const trials = await getTrials();
  trials.push(trial);
  await saveTrials(trials);
}

export async function updateTrial(id: string, updates: Partial<Trial>) {
  const trials = await getTrials();
  const idx = trials.findIndex((t) => t.id === id);
  if (idx !== -1) {
    trials[idx] = { ...trials[idx], ...updates };
    await saveTrials(trials);
  }
  return trials;
}

export async function deleteTrial(id: string) {
  const trials = await getTrials();
  await saveTrials(trials.filter((t) => t.id !== id));
}

export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<Settings>) {
  const current = await getSettings();
  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ ...current, ...settings })
  );
}
