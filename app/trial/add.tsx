import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { v4 as uuidv4 } from 'uuid';
import { addTrial, getSettings, getTrials } from '../../src/utils/storage';
import { scheduleTrialReminders } from '../../src/utils/notifications';
import { searchServices, ServiceInfo } from '../../src/data/services';
import { colors, spacing, getCurrencySymbol } from '../../src/utils/theme';

const FREE_LIMIT = 3;
const DISPLAY_CATEGORIES = ['Music', 'Video', 'Cloud', 'Gaming', 'Software', 'Entertainment', 'Lifestyle', 'Other'];

type Mode = 'trial' | 'subscription';

export default function AddTrial() {
  const [mode, setMode] = useState<Mode>('trial');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ServiceInfo[]>([]);
  const [serviceName, setServiceName] = useState('');
  const [serviceIcon, setServiceIcon] = useState('📱');
  const [chargeAmount, setChargeAmount] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [trialDays, setTrialDays] = useState(30);
  const [category, setCategory] = useState('Other');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [reminders, setReminders] = useState({ '3day': true, '1day': true, '2hour': true });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nextBillDate, setNextBillDate] = useState('');

  const handleSearch = (text: string) => {
    setQuery(text);
    setServiceName(text);
    if (text.length > 0) {
      setSuggestions(searchServices(text).slice(0, 6));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectService = (s: ServiceInfo) => {
    setServiceName(s.name);
    setServiceIcon(s.icon);
    setChargeAmount(s.chargeAmount.toString());
    setCancelUrl(s.cancelUrl);
    setTrialDays(s.trialDays);
    setCategory(s.category);
    setQuery(s.name);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!serviceName) return;

    const settings = await getSettings();
    const trials = await getTrials();
    const activeCount = trials.filter((t) => t.status === 'active').length;

    if (!settings.isPremium && activeCount >= FREE_LIMIT) {
      router.push('/paywall');
      return;
    }

    let endDate: Date;
    if (mode === 'trial') {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + trialDays);
    } else {
      if (nextBillDate) {
        endDate = new Date(nextBillDate);
      } else {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (cycle === 'yearly' ? 12 : 1));
      }
    }

    const trial = {
      id: uuidv4(),
      serviceName,
      serviceIcon,
      trialEndDate: endDate.toISOString(),
      chargeAmount: parseFloat(chargeAmount) || 0,
      currency: settings.currency,
      cancelUrl,
      category: category.toLowerCase(),
      cycle,
      reminders: mode === 'trial' ? reminders : { '3day': true, '1day': true, '2hour': false },
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    };

    await addTrial(trial);
    if (mode === 'trial') {
      await scheduleTrialReminders(trial);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </Pressable>
            <Text style={styles.title}>Add Subscription</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeBtn, mode === 'trial' && styles.modeBtnActive]}
              onPress={() => setMode('trial')}
            >
              <Text style={[styles.modeText, mode === 'trial' && styles.modeTextActive]}>
                Free Trial
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, mode === 'subscription' && styles.modeBtnActive]}
              onPress={() => setMode('subscription')}
            >
              <Text style={[styles.modeText, mode === 'subscription' && styles.modeTextActive]}>
                Active Subscription
              </Text>
            </Pressable>
          </View>

          <View style={styles.iconPicker}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconPlus}>+</Text>
            </View>
            <Text style={styles.iconHint}>Tap to choose icon</Text>
          </View>

          <Text style={styles.label}>SUBSCRIPTION NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Netflix, Spotify..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
          />

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              {suggestions.map((s) => (
                <Pressable
                  key={s.name}
                  style={styles.suggestionRow}
                  onPress={() => selectService(s)}
                >
                  <Text style={styles.suggestionName}>{s.name}</Text>
                  <Text style={styles.suggestionDetail}>
                    £{s.chargeAmount} monthly
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>
            {mode === 'trial' ? 'PRICE AFTER TRIAL' : 'MONTHLY PRICE'}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceSymbol}>£</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={chargeAmount}
              onChangeText={setChargeAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {DISPLAY_CATEGORIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.categoryChip, category === c && styles.categoryChipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>CYCLE</Text>
              <Pressable
                style={styles.selectBox}
                onPress={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
              >
                <Text style={styles.selectText}>
                  {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.colHalf}>
              {mode === 'trial' ? (
                <>
                  <Text style={styles.label}>TRIAL DAYS</Text>
                  <View style={styles.selectBox}>
                    <TextInput
                      style={styles.selectText}
                      value={trialDays.toString()}
                      onChangeText={(t) => setTrialDays(parseInt(t) || 0)}
                      keyboardType="number-pad"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.label}>NEXT BILL (DD/MM)</Text>
                  <View style={styles.selectBox}>
                    <TextInput
                      style={styles.selectText}
                      value={nextBillDate}
                      onChangeText={setNextBillDate}
                      placeholder="2026-06-15"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </>
              )}
            </View>
          </View>

          <Text style={styles.label}>CANCEL URL (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor={colors.textSecondary}
            value={cancelUrl}
            onChangeText={setCancelUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          {mode === 'trial' && (
            <>
              <Text style={styles.label}>REMINDERS</Text>
              {(['3day', '1day', '2hour'] as const).map((key, index) => {
                const labels = { '3day': '3 days before', '1day': '1 day before', '2hour': '2 hours before' };
                return (
                  <Pressable
                    key={key}
                    style={[styles.reminderRow, index > 0 && { marginTop: 8 }]}
                    onPress={() => setReminders({ ...reminders, [key]: !reminders[key] })}
                  >
                    <Text style={styles.reminderText}>{labels[key]}</Text>
                    <View style={[styles.checkbox, reminders[key] && styles.checkboxActive]}>
                      {reminders[key] && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}

          <Pressable
            style={[styles.saveButton, !serviceName && styles.saveDisabled]}
            onPress={handleSave}
            disabled={!serviceName}
          >
            <Text style={styles.saveText}>
              {mode === 'trial' ? 'Add Free Trial' : 'Add Subscription'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.white },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.accent,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.white,
  },
  iconPicker: { alignItems: 'center', marginBottom: spacing.xl },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconPlus: { fontSize: 28, color: colors.textSecondary },
  iconHint: { fontSize: 13, color: colors.accent },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.sectionHeader,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.white,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  suggestionsBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.cardBorder,
  },
  suggestionName: { fontSize: 15, fontWeight: '500', color: colors.white },
  suggestionDetail: { fontSize: 13, color: colors.textSecondary },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
  },
  priceSymbol: { fontSize: 16, color: colors.textSecondary, marginRight: 4 },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.white,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  categoryChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '20',
  },
  categoryText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  categoryTextActive: { color: colors.accent },
  twoCol: { flexDirection: 'row', gap: 12 },
  colHalf: { flex: 1 },
  selectBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  selectText: { fontSize: 15, color: colors.white },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  reminderText: { fontSize: 15, color: colors.white },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkMark: { fontSize: 14, color: colors.white, fontWeight: '700' },
  saveButton: {
    backgroundColor: colors.white,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  saveDisabled: { opacity: 0.4 },
  saveText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
