import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getSettings } from '../src/utils/storage';
import { requestPermissions } from '../src/utils/notifications';
import { initPurchases } from '../src/utils/purchases';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await requestPermissions();
      await initPurchases();
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F172A' },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
