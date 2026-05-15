import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getSettings } from '../src/utils/storage';
import { colors } from '../src/utils/theme';

export default function Index() {
  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      if (settings.onboardingComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
