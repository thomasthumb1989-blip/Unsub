import AsyncStorage from '@react-native-async-storage/async-storage';

export type PriceChange = {
  date: string;
  oldAmount: number;
  newAmount: number;
};

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
  priceHistory?: PriceChange[];
};

export type Settings = {
  currency: string;
  isPremium: boolean;
  totalSaved: number;
  onboardingComplete: boolean;
  darkMode: boolean;
  userName: string;
  biometricLock: boolean;
  customCategories?: string[];
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
  biometricLock: false,
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

export async function updateTrialPrice(id: string, newAmount: number) {
  const trials = await getTrials();
  const idx = trials.findIndex((t) => t.id === id);
  if (idx === -1) return trials;

  const trial = trials[idx];
  if (trial.chargeAmount !== newAmount) {
    const change: PriceChange = {
      date: new Date().toISOString(),
      oldAmount: trial.chargeAmount,
      newAmount,
    };
    trial.priceHistory = [...(trial.priceHistory || []), change];
    trial.chargeAmount = newAmount;
    await saveTrials(trials);
  }
  return trials;
}

export async function getCustomCategories(): Promise<string[]> {
  const settings = await getSettings();
  return settings.customCategories || [];
}

export async function addCustomCategory(category: string) {
  const settings = await getSettings();
  const cats = settings.customCategories || [];
  if (!cats.includes(category.toLowerCase())) {
    await saveSettings({ customCategories: [...cats, category.toLowerCase()] });
  }
}

export async function removeCustomCategory(category: string) {
  const settings = await getSettings();
  const cats = settings.customCategories || [];
  await saveSettings({ customCategories: cats.filter((c) => c !== category) });
}

export function trialsToShareText(trials: Trial[], currency: string): string {
  const active = trials.filter((t) => t.status === 'active');
  const sym = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  const monthly = active.reduce((sum, t) => sum + t.chargeAmount, 0);
  const yearly = monthly * 12;

  let text = `📊 My Subscription Summary\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `${active.length} active subscriptions\n`;
  text += `${sym}${monthly.toFixed(2)}/month · ${sym}${yearly.toFixed(2)}/year\n\n`;

  const byCategory = new Map<string, Trial[]>();
  active.forEach((t) => {
    const cat = (t.category || 'other');
    byCategory.set(cat, [...(byCategory.get(cat) || []), t]);
  });

  for (const [cat, subs] of byCategory) {
    const catTotal = subs.reduce((s, t) => s + t.chargeAmount, 0);
    text += `${cat.charAt(0).toUpperCase() + cat.slice(1)} — ${sym}${catTotal.toFixed(2)}/mo\n`;
    subs.forEach((t) => {
      text += `  • ${t.serviceName} ${sym}${t.chargeAmount.toFixed(2)}\n`;
    });
    text += `\n`;
  }

  text += `Tracked with Unsub 📱`;
  return text;
}

export function trialsToCSV(trials: Trial[]): string {
  const headers = ['Service', 'Amount', 'Currency', 'Category', 'Cycle', 'End Date', 'Status', 'Created'];
  const rows = trials.map((t) => [
    t.serviceName,
    t.chargeAmount.toFixed(2),
    t.currency,
    t.category || 'other',
    t.cycle || 'monthly',
    t.trialEndDate,
    t.status,
    t.createdAt,
  ].map((v) => `"${v}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
}
