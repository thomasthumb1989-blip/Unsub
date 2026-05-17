import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getSettings } from '../src/utils/storage';
import { useTheme } from '../src/contexts/ThemeContext';

export default function Index() {
  const { colors: tc } = useTheme();

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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: tc.bg }}>
      <ActivityIndicator size="large" color={tc.accent} />
    </View>
  );
}
