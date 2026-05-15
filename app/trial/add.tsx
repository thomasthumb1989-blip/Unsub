import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { addTrial, getSettings, getTrials } from '../../src/utils/storage';
import { scheduleTrialReminders } from '../../src/utils/notifications';
import { searchServices, ServiceInfo } from '../../src/data/services';
import { colors, spacing, getCurrencySymbol } from '../../src/utils/theme';

const FREE_LIMIT = 3;

export default function AddTrial() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ServiceInfo[]>([]);
  const [serviceName, setServiceName] = useState('');
  const [serviceIcon, setServiceIcon] = useState('📱');
  const [chargeAmount, setChargeAmount] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [trialDays, setTrialDays] = useState(7);
  const [customDate, setCustomDate] = useState('');
  const [reminders, setReminders] = useState({ '3day': true, '1day': true, '2hour': true });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    setServiceName(text);
    if (text.length > 0) {
      setSuggestions(searchServices(text).slice(0, 8));
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
    setQuery(s.name);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!serviceName) return;

    const settings = await getSettings();
    const trials = await getTrials();
    const activeCount = trials.filter((t) => t.status === 'active').length;

    if (!settings.isPremium && activeCount >= FREE_LIMIT) {
      alert(`Free tier limited to ${FREE_LIMIT} active trials. Upgrade for unlimited.`);
      return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + trialDays);

    const trial = {
      id: uuidv4(),
      serviceName,
      serviceIcon,
      trialEndDate: endDate.toISOString(),
      chargeAmount: parseFloat(chargeAmount) || 0,
      currency: settings.currency,
      cancelUrl,
      reminders,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    };

    await addTrial(trial);
    await scheduleTrialReminders(trial);
    router.back();
  };

  const quickDays = [7, 14, 30];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
            <Text style={styles.title}>Add Trial</Text>
          </View>

          <Text style={styles.label}>Service</Text>
          <TextInput
            style={styles.input}
            placeholder="Search services..."
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
                  <Text style={styles.suggestionIcon}>{s.icon}</Text>
                  <View>
                    <Text style={styles.suggestionName}>{s.name}</Text>
                    <Text style={styles.suggestionDetail}>
                      {s.trialDays} days · £{s.chargeAmount}/mo
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>Trial Length</Text>
          <View style={styles.quickRow}>
            {quickDays.map((d) => (
              <Pressable
                key={d}
                style={[styles.quickButton, trialDays === d && styles.quickSelected]}
                onPress={() => setTrialDays(d)}
              >
                <Text style={[styles.quickText, trialDays === d && styles.quickTextSelected]}>
                  {d} days
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Charge Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={chargeAmount}
            onChangeText={setChargeAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Cancel URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor={colors.textSecondary}
            value={cancelUrl}
            onChangeText={setCancelUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <Text style={styles.label}>Reminders</Text>
          {(['3day', '1day', '2hour'] as const).map((key) => {
            const labels = { '3day': '3 days before', '1day': '1 day before', '2hour': '2 hours before' };
            return (
              <Pressable
                key={key}
                style={styles.reminderRow}
                onPress={() => setReminders({ ...reminders, [key]: !reminders[key] })}
              >
                <Text style={styles.reminderText}>{labels[key]}</Text>
                <View style={[styles.toggle, reminders[key] && styles.toggleOn]}>
                  <View style={[styles.toggleDot, reminders[key] && styles.toggleDotOn]} />
                </View>
              </Pressable>
            );
          })}

          <Pressable
            style={[styles.saveButton, !serviceName && styles.saveDisabled]}
            onPress={handleSave}
            disabled={!serviceName}
          >
            <Text style={styles.saveText}>Save Trial</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  header: { paddingTop: spacing.md, marginBottom: spacing.lg },
  backText: { fontSize: 16, color: colors.accent, marginBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  suggestionsBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: spacing.xs,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  suggestionIcon: { fontSize: 24 },
  suggestionName: { fontSize: 16, fontWeight: '600', color: colors.text },
  suggestionDetail: { fontSize: 13, color: colors.textSecondary },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  quickSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDark + '30',
  },
  quickText: { fontSize: 15, fontWeight: '600', color: colors.text },
  quickTextSelected: { color: colors.accent },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reminderText: { fontSize: 16, color: colors.text },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardBorder,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: colors.accent },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleDotOn: { alignSelf: 'flex-end' },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveDisabled: { opacity: 0.5 },
  saveText: { fontSize: 18, fontWeight: '700', color: colors.white },
});
