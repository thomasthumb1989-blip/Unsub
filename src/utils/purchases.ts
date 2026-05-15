import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

const API_KEYS = {
  ios: 'YOUR_REVENUECAT_IOS_KEY',
  android: 'YOUR_REVENUECAT_ANDROID_KEY',
};

export async function initPurchases() {
  const key = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  if (key.startsWith('YOUR_')) return;
  Purchases.configure({ apiKey: key });
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
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

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}
