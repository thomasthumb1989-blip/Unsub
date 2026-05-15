import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, getSettings, saveSettings } from '../../src/utils/storage';
import { restorePurchases } from '../../src/utils/purchases';
import { colors, spacing, cardStyle, bodyText, buttonBase } from '../../src/utils/theme';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(setSettings);
    }, [])
  );

  if (!settings) return null;

  const currencies = ['GBP', 'USD', 'EUR'];

  const handleCurrency = (c: string) => {
    saveSettings({ currency: c });
    setSettings({ ...settings, currency: c });
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      saveSettings({ isPremium: true });
      setSettings({ ...settings, isPremium: true });
      Alert.alert('Restored', 'Premium access restored!');
    } else {
      Alert.alert('No purchases found', 'We couldn\'t find any previous purchases.');
    }
  };

  const handleDarkMode = () => {
    const next = !settings.darkMode;
    saveSettings({ darkMode: next });
    setSettings({ ...settings, darkMode: next });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>unsub</Text>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <View style={styles.currencyRow}>
            {currencies.map((c) => (
              <Pressable
                key={c}
                style={[styles.currencyButton, settings.currency === c && styles.currencySelected]}
                onPress={() => handleCurrency(c)}
              >
                <Text style={[styles.currencyText, settings.currency === c && styles.currencyTextSelected]}>
                  {c === 'GBP' ? '£ GBP' : c === 'EUR' ? '€ EUR' : '$ USD'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          {settings.isPremium ? (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium Active</Text>
            </View>
          ) : (
            <Pressable style={styles.upgradeButton} onPress={() => Alert.alert('Upgrade', 'Purchase flow coming soon')}>
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </Pressable>
          )}
          <Pressable style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <Pressable style={styles.row} onPress={handleDarkMode}>
            <Text style={styles.rowText}>Dark Mode</Text>
            <Text style={styles.rowValue}>{settings.darkMode ? 'On' : 'Off'}</Text>
          </Pressable>
          <View style={{ height: 12 }} />
          <Pressable style={styles.row} onPress={() => Linking.openURL('https://apps.apple.com')}>
            <Text style={styles.rowText}>Rate Unsub</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>Unsub v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  currencyRow: { flexDirection: 'row', gap: spacing.sm },
  currencyButton: {
    flex: 1,
    ...buttonBase,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  currencySelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDark + '30',
  },
  currencyText: { fontSize: 15, fontWeight: '600', color: colors.text },
  currencyTextSelected: { color: colors.accent },
  premiumBadge: {
    ...cardStyle,
    backgroundColor: colors.accentDark + '20',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  upgradeButton: {
    backgroundColor: colors.accent,
    ...buttonBase,
    marginBottom: 12,
  },
  upgradeText: { fontSize: 16, fontWeight: '700', color: colors.white },
  restoreButton: {
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    ...buttonBase,
  },
  restoreText: { fontSize: 15, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...cardStyle,
  },
  rowText: { fontSize: 16, color: colors.text, ...bodyText },
  rowValue: { fontSize: 16, color: colors.textSecondary },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xl,
  },
});
