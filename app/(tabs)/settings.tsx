import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Linking, Switch, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Settings, getSettings, saveSettings } from '../../src/utils/storage';
import { restorePurchases } from '../../src/utils/purchases';
import { colors, spacing } from '../../src/utils/theme';

function SettingRow({ icon, label, right, onPress }: {
  icon: string;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {right}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await getSettings();
        setSettings(s);
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationsEnabled(status === 'granted');
      })();
    }, [])
  );

  if (!settings) return null;

  const currencies = ['GBP', 'USD', 'EUR'];

  const handleCurrency = (c: string) => {
    saveSettings({ currency: c });
    setSettings({ ...settings, currency: c });
  };

  const handleNotifications = async (val: boolean) => {
    if (val) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
      } else {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in your device settings to receive trial reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      setNotificationsEnabled(false);
      Alert.alert(
        'Disable Notifications',
        'To fully disable notifications, go to your device settings.',
        [
          { text: 'OK' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      saveSettings({ isPremium: true });
      setSettings({ ...settings, isPremium: true });
      Alert.alert('Restored', 'Premium access restored!');
    } else {
      Alert.alert('No purchases found', 'No previous purchases found.');
    }
  };

  const handleDarkMode = (val: boolean) => {
    saveSettings({ darkMode: val });
    setSettings({ ...settings, darkMode: val });
    if (!val) {
      Alert.alert('Light Mode', 'Light mode will be fully supported in a future update. Your preference has been saved.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.brandLogo}>Unsub</Text>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(settings.userName || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                autoFocus
                onSubmitEditing={() => {
                  if (nameInput.trim()) {
                    saveSettings({ userName: nameInput.trim() });
                    setSettings({ ...settings, userName: nameInput.trim() });
                  }
                  setEditingName(false);
                }}
              />
            </View>
          ) : (
            <Pressable onPress={() => { setNameInput(settings.userName || ''); setEditingName(true); }}>
              <Text style={styles.profileName}>{settings.userName || 'Tap to set name'}</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="👤"
            label="Profile Info"
            right={<Text style={styles.rowValue}>{settings.isPremium ? 'Premium' : 'Free Plan'}</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="💳"
            label="Currency"
            right={
              <View style={styles.currencyRow}>
                {currencies.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.currencyChip, settings.currency === c && styles.currencyChipActive]}
                    onPress={() => handleCurrency(c)}
                  >
                    <Text style={[styles.currencyText, settings.currency === c && styles.currencyTextActive]}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />
        </View>

        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="🔔"
            label="Notifications"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotifications}
                trackColor={{ false: '#333', true: colors.accent }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🌙"
            label="Dark Mode"
            right={
              <Switch
                value={settings.darkMode}
                onValueChange={handleDarkMode}
                trackColor={{ false: '#333', true: colors.accent }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🔒"
            label="Privacy & Security"
            right={<Text style={styles.rowArrow}>›</Text>}
            onPress={() => router.push('/privacy')}
          />
        </View>

        <Text style={styles.sectionHeader}>SUPPORT</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="❓"
            label="Help Center"
            right={<Text style={styles.rowArrow}>›</Text>}
            onPress={() => router.push('/help')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🔄"
            label="Restore Purchases"
            onPress={handleRestore}
          />
          <View style={styles.divider} />
          {!settings.isPremium && (
            <>
              <SettingRow
                icon="⭐"
                label="Upgrade to Premium"
                onPress={() => router.push('/paywall')}
              />
              <View style={styles.divider} />
            </>
          )}
          <Pressable style={styles.row} onPress={() => Linking.openURL('https://apps.apple.com')}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>⭐</Text>
              <Text style={styles.rowLabel}>Rate Unsub</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.version}>Unsub v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 100 },
  brandLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -1,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.accent },
  profileName: { fontSize: 20, fontWeight: '700', color: colors.white, textAlign: 'center' },
  nameEditRow: { marginTop: 4 },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: 4,
    minWidth: 200,
  },
  profileEmail: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sectionHeader,
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: 16, fontWeight: '500', color: colors.white, flexShrink: 1 },
  rowValue: { fontSize: 14, color: colors.textSecondary, flexShrink: 0 },
  rowArrow: { fontSize: 20, color: colors.textSecondary },
  divider: {
    height: 0.5,
    backgroundColor: colors.cardBorder,
    marginLeft: 48,
  },
  currencyRow: { flexDirection: 'row', gap: 6 },
  currencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  currencyChipActive: { backgroundColor: colors.accent },
  currencyText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  currencyTextActive: { color: colors.white },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xl,
  },
});
