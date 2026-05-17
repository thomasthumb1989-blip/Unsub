import AsyncStorage from '@react-native-async-storage/async-storage';

const RATES_KEY = '@unsub_exchange_rates';
const RATES_UPDATED_KEY = '@unsub_rates_updated';

// Fallback rates (approximate, updated May 2026)
const FALLBACK_RATES: Record<string, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  CAD: 1.74,
  AUD: 1.95,
  JPY: 196.5,
  CHF: 1.13,
  SEK: 13.2,
  NOK: 13.7,
  DKK: 8.72,
  NZD: 2.11,
  INR: 107.5,
  BRL: 6.45,
  ZAR: 23.4,
  PLN: 5.15,
  TRY: 41.2,
};

export const SUPPORTED_CURRENCIES = Object.keys(FALLBACK_RATES);

export const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  NZD: 'NZ$',
  INR: '₹',
  BRL: 'R$',
  ZAR: 'R',
  PLN: 'zł',
  TRY: '₺',
};

export type ExchangeRates = Record<string, number>;

/**
 * Get stored exchange rates. Falls back to hardcoded rates if none stored.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const raw = await AsyncStorage.getItem(RATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return FALLBACK_RATES;
}

/**
 * Fetch latest rates from free API and cache them.
 * Uses frankfurter.app (free, no API key needed).
 */
export async function refreshExchangeRates(): Promise<ExchangeRates> {
  try {
    const targets = SUPPORTED_CURRENCIES.filter(c => c !== 'GBP').join(',');
    const res = await fetch(`https://api.frankfurter.app/latest?from=GBP&to=${targets}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const rates: ExchangeRates = { GBP: 1, ...data.rates };
    await AsyncStorage.setItem(RATES_KEY, JSON.stringify(rates));
    await AsyncStorage.setItem(RATES_UPDATED_KEY, new Date().toISOString());
    return rates;
  } catch {
    return getExchangeRates();
  }
}

/**
 * Get when rates were last updated.
 */
export async function getRatesLastUpdated(): Promise<string | null> {
  return AsyncStorage.getItem(RATES_UPDATED_KEY);
}

/**
 * Convert amount from one currency to another.
 * Rates are relative to GBP (base).
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  // Convert to GBP first, then to target
  const inGBP = amount / fromRate;
  return inGBP * toRate;
}

/**
 * Check if rates are stale (older than 24 hours).
 */
export async function areRatesStale(): Promise<boolean> {
  const updated = await getRatesLastUpdated();
  if (!updated) return true;
  const diff = Date.now() - new Date(updated).getTime();
  return diff > 24 * 60 * 60 * 1000;
}
