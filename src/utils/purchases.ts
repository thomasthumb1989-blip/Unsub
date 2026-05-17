import { Platform } from 'react-native';

let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch {}

export type { PurchasesPackage } from 'react-native-purchases';

const API_KEYS = {
  ios: 'appl_jzZFvtpknQsIonJyFaLzwihWIGQ',
  android: 'test_YCDkkUommGZhtYnSncFmhiVWDMe',
};

const ENTITLEMENT_ID = 'premium';

export async function initPurchases() {
  if (!Purchases) return;
  const key = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  if (key.startsWith('YOUR_')) return;
  Purchases.configure({ apiKey: key });
}

export async function getOfferings(): Promise<any[]> {
  if (!Purchases) return [];
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Get the lifetime package from current offerings.
 * Falls back to first available package if no lifetime found.
 */
export async function getLifetimePackage(): Promise<any | null> {
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    if (!offerings.current) return null;
    const packages = offerings.current.availablePackages;
    // Look for lifetime package type
    const lifetime = packages.find(
      (p: any) => p.packageType === 'LIFETIME' || p.identifier === '$rc_lifetime'
    );
    return lifetime || packages[0] || null;
  } catch {
    return null;
  }
}

export async function purchasePackage(pkg: any): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e: any) {
    // User cancelled — not an error
    if (e?.userCancelled) return false;
    throw e;
  }
}

/**
 * One-call purchase flow: get lifetime package + purchase it.
 * Returns true if purchase succeeded.
 */
export async function purchaseLifetime(): Promise<boolean> {
  const pkg = await getLifetimePackage();
  if (!pkg) {
    throw new Error('NO_PACKAGE');
  }
  return purchasePackage(pkg);
}

export async function restorePurchases(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

/**
 * Check if RevenueCat is configured (API keys set).
 * Used to show placeholder UI during development.
 */
/**
 * Check if RevenueCat has production keys configured.
 * Test keys (test_) work for sandbox but dev-mode bypass stays active.
 * Placeholder keys (YOUR_) mean SDK not configured at all.
 */
export function isConfigured(): boolean {
  if (!Purchases) return false;
  const key = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  if (key.startsWith('YOUR_')) return false;
  // Test keys work with sandbox — treat as configured
  return true;
}

/**
 * Check if using production (non-test) API keys.
 * Use this to gate real money flows vs sandbox testing.
 */
export function isProduction(): boolean {
  if (!isConfigured()) return false;
  const key = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  return !key.startsWith('test_');
}
