import { Platform } from 'react-native';

let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch {}

export type { PurchasesPackage } from 'react-native-purchases';

const API_KEYS = {
  ios: 'YOUR_REVENUECAT_IOS_KEY',
  android: 'YOUR_REVENUECAT_ANDROID_KEY',
};

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

export async function purchasePackage(pkg: any): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}
