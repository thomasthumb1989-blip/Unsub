import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const REVIEW_KEY = '@unsub_review_prompted';
const SUB_COUNT_KEY = '@unsub_total_added';
const REVIEW_THRESHOLD = 3;

/**
 * Track subscription adds and prompt for App Store review on the 3rd one.
 * Only prompts once ever.
 */
export async function maybeRequestReview(): Promise<void> {
  try {
    // Check if already prompted
    const prompted = await AsyncStorage.getItem(REVIEW_KEY);
    if (prompted === 'true') return;

    // Increment count
    const raw = await AsyncStorage.getItem(SUB_COUNT_KEY);
    const count = (parseInt(raw || '0', 10) || 0) + 1;
    await AsyncStorage.setItem(SUB_COUNT_KEY, count.toString());

    if (count >= REVIEW_THRESHOLD) {
      // Mark as prompted before requesting (prevent double prompts)
      await AsyncStorage.setItem(REVIEW_KEY, 'true');

      if (Platform.OS === 'ios') {
        const StoreReview = require('expo-store-review');
        if (await StoreReview.hasAction()) {
          // Small delay so user sees the success state first
          setTimeout(() => {
            StoreReview.requestReview();
          }, 1500);
        }
      }
    }
  } catch {
    // Silent fail — review prompt is non-critical
  }
}
