import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Linking, Switch, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
// expo-notifications lazy-loaded to avoid Expo Go crash on Android
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Settings, getSettings, saveSettings, getTrials, trialsToCSV } from '../../src/utils/storage';
import { restorePurchases } from '../../src/utils/purchases';
import { colors, spacing } from '../../src/utils/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';

function SettingRow({ icon, label, right, onPress, tc }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  tc: any;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={tc.accent} />
        <Text style={[styles.rowLabel, { color: tc.white }]}>{label + '  '}</Text>
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
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await getSettings();
        setSettings(s);
        try {
          const Notifications = require('expo-notifications');
          const { status } = await Notifications.getPermissionsAsync();
          setNotificationsEnabled(status === 'granted');
        } catch (e) {
          setNotificationsEnabled(false);
        }
      })();
    }, [])
  );

  const { toggle: toggleTheme, colors: tc } = useTheme();

  if (!settings) return null;

  const currencies = ['GBP', 'USD', 'EUR', 'CAD', 'AUD'];

  const handleCurrency = (c: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveSettings({ currency: c });
    setSettings({ ...settings, currency: c });
  };

  const handleNotifications = async (val: boolean) => {
    if (val) {
      const Notifications = require('expo-notifications');
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    toggleTheme();
    setSettings({ ...settings, darkMode: val });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.brandLogo}>Unsub</Text>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.profileSection}>
          <View style={[styles.avatarCircle, { backgroundColor: tc.card }]}>
            <Text style={styles.avatarText}>
              {(settings.userName || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={[styles.nameInput, { color: tc.white }]}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter your name"
                placeholderTextColor={tc.textSecondary}
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
              <Text style={[styles.profileName, { color: tc.white }]}>{settings.userName || 'Tap to set name'}</Text>
            </Pressable>
          )}
          <View style={styles.planBadge}>
            <Ionicons name={settings.isPremium ? 'diamond' : 'sparkles-outline'} size={14} color={settings.isPremium ? '#F59E0B' : tc.textSecondary} />
            <Text style={[styles.planText, settings.isPremium && { color: '#F59E0B' }]}>
              {settings.isPremium ? 'Premium' : 'Free Plan'}
            </Text>
          </View>
        </Animated.View>

        <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>ACCOUNT</Text>
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={[styles.sectionCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <SettingRow
            icon="person-outline"
            label="Profile Info"
            right={<Text style={[styles.rowValue, { color: tc.textSecondary }]}>{settings.isPremium ? 'Premium' : 'Free Plan'}</Text>}
            tc={tc}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="card-outline"
            label="Currency"
            right={
              <Pressable
                style={styles.currencySelector}
                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              >
                <Text style={styles.currencySelectorText}>{settings.currency}</Text>
                <Ionicons name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'} size={14} color={tc.textSecondary} />
              </Pressable>
            }
            tc={tc}
          />
          {showCurrencyPicker && (
            <View style={styles.currencyDropdown}>
              {currencies.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.currencyOption, settings.currency === c && styles.currencyOptionActive]}
                  onPress={() => { handleCurrency(c); setShowCurrencyPicker(false); }}
                >
                  <Text style={[styles.currencyOptionText, { color: tc.textSecondary }, settings.currency === c && styles.currencyOptionTextActive]}>
                    {c}
                  </Text>
                  {settings.currency === c && <Ionicons name="checkmark" size={16} color={tc.accent} />}
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>PREFERENCES</Text>
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={[styles.sectionCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotifications}
                trackColor={{ false: tc.cardBorder, true: tc.accent }}
                thumbColor={tc.white}
              />
            }
            tc={tc}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="moon-outline"
            label="Dark Mode"
            right={
              <Switch
                value={settings.darkMode}
                onValueChange={handleDarkMode}
                trackColor={{ false: tc.cardBorder, true: tc.accent }}
                thumbColor={tc.white}
              />
            }
            tc={tc}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="finger-print-outline"
            label="Biometric Lock"
            right={
              <Switch
                value={settings.biometricLock}
                onValueChange={async (val) => {
                  if (val) {
                    const compatible = await LocalAuthentication.hasHardwareAsync();
                    const enrolled = await LocalAuthentication.isEnrolledAsync();
                    if (!compatible || !enrolled) {
                      Alert.alert('Not Available', 'Your device does not support biometric authentication or has none enrolled.');
                      return;
                    }
                  }
                  saveSettings({ biometricLock: val });
                  setSettings({ ...settings, biometricLock: val });
                }}
                trackColor={{ false: tc.cardBorder, true: tc.accent }}
                thumbColor={tc.white}
              />
            }
            tc={tc}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="apps-outline"
            label="App Icon"
            right={<Ionicons name="chevron-forward" size={18} color={tc.textSecondary} />}
            onPress={() => router.push('/icons')}
            tc={tc}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock-closed-outline"
            label="Privacy & Security"
            right={<Ionicons name="chevron-forward" size={18} color={tc.textSecondary} />}
            onPress={() => router.push('/privacy')}
            tc={tc}
          />
        </Animated.View>

        <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>DATA</Text>
        <Animated.View entering={FadeInDown.duration(500).delay(250)} style={[styles.sectionCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <SettingRow
            icon="pricetags-outline"
            label="Manage Categories"
            right={<Ionicons name="chevron-forward" size={18} color={tc.textSecondary} />}
            onPress={() => router.push('/categories')}
            tc={tc}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="mail-outline"
            label="Scan Email for Subscriptions"
            right={<Ionicons name="chevron-forward" size={18} color={tc.textSecondary} />}
            onPress={() => router.push('/scan')}
            tc={tc}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="download-outline"
            label="Export CSV"
            right={<Ionicons name="chevron-forward" size={18} color={tc.textSecondary} />}
            tc={tc}
            onPress={async () => {
              const trials = await getTrials();
              if (trials.length === 0) { Alert.alert('No data', 'Add subscriptions first.'); return; }
              const csv = trialsToCSV(trials);
              const path = `${FileSystem.cacheDirectory}unsub-export.csv`;
              await FileSystem.writeAsStringAsync(path, csv);
              await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Subscriptions' });
            }}
          />
        </Animated.View>

        <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>SUPPORT</Text>
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={[styles.sectionCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <SettingRow
            icon="help-circle-outline"
            label="Help Center"
            right={<Ionicons name="chevron-forward" size={18} color={tc.textSecondary} />}
            onPress={() => router.push('/help')}
            tc={tc}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="refresh-outline"
            label="Restore Purchases"
            onPress={handleRestore}
            tc={tc}
          />
          <View style={styles.divider} />
          {!settings.isPremium && (
            <>
              <SettingRow
                icon="diamond-outline"
                label="Upgrade to Premium"
                onPress={() => router.push('/paywall')}
                tc={tc}
              />
              <View style={styles.divider} />
            </>
          )}
          <SettingRow
            icon="star-outline"
            label="Rate Unsub"
            onPress={() => {
              // TODO: Replace with actual App Store URL once published
              // iOS: https://apps.apple.com/app/idXXXXXXXXXX?action=write-review
              // Android: https://play.google.com/store/apps/details?id=com.unsub.app
              Alert.alert('Coming Soon', 'Rating will be available once the app is published on the App Store.');
            }}
            tc={tc}
          />
        </Animated.View>

        <Text style={[styles.version, { color: tc.textSecondary }]}>Unsub v1.0.0</Text>
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
    color: '#F59E0B',
    letterSpacing: -1,
    paddingHorizontal: spacing.lg,
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
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
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
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  rowLabel: { fontSize: 16, fontWeight: '500', color: colors.white, flexShrink: 1 },
  rowValue: { fontSize: 14, color: colors.textSecondary, flexShrink: 0 },
  divider: {
    height: 0.5,
    backgroundColor: colors.cardBorder,
    marginLeft: 52,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  currencySelectorText: { fontSize: 14, fontWeight: '600', color: colors.accent },
  currencyDropdown: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  currencyOptionActive: { backgroundColor: 'rgba(245,158,11,0.1)' },
  currencyOptionText: { fontSize: 15, color: colors.textSecondary },
  currencyOptionTextActive: { color: colors.accent, fontWeight: '600' },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xl,
  },
});
