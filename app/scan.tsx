import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { v4 as uuidv4 } from 'uuid';
import { colors, spacing } from '../src/utils/theme';
import { useTheme } from '../src/contexts/ThemeContext';
import { addTrial, getSettings } from '../src/utils/storage';
import { ServiceLogo } from '../src/components/ServiceLogo';
import {
  DiscoveredSubscription,
  scanGmailForSubscriptions,
  isGmailConfigured,
  saveToken,
  getStoredToken,
  clearToken,
} from '../src/utils/gmailScan';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = ''; // Set your client ID here too

type ScanState = 'idle' | 'authenticating' | 'scanning' | 'results' | 'error';

export default function ScanScreen() {
  const [state, setState] = useState<ScanState>('idle');
  const [results, setResults] = useState<DiscoveredSubscription[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [addedCount, setAddedCount] = useState(0);
  const { colors: tc } = useTheme();

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'unsub' }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      handleScanWithToken(response.authentication.accessToken);
    } else if (response?.type === 'error') {
      setState('error');
      setError('Authentication failed. Please try again.');
    }
  }, [response]);

  const handleConnect = async () => {
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert(
        'Setup Required',
        'Gmail scanning requires a Google Cloud project. See the setup guide in Settings > Help.',
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState('authenticating');

    // Check for stored token first
    const storedToken = await getStoredToken();
    if (storedToken) {
      handleScanWithToken(storedToken);
      return;
    }

    promptAsync();
  };

  const handleScanWithToken = async (token: string) => {
    setState('scanning');
    try {
      await saveToken(token);
      const subs = await scanGmailForSubscriptions(token);
      setResults(subs);
      // Auto-select high confidence results
      const autoSelect = new Set(
        subs.filter((s) => s.confidence === 'high').map((s) => s.name)
      );
      setSelected(autoSelect);
      setState('results');
    } catch (e: any) {
      // Token may be expired
      if (e.message?.includes('401') || e.message?.includes('403')) {
        await clearToken();
        setState('idle');
        Alert.alert('Session expired', 'Please sign in again.');
      } else {
        setState('error');
        setError(e.message || 'Scan failed');
      }
    }
  };

  const toggleSelect = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  };

  const handleAddSelected = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const settings = await getSettings();
    let count = 0;

    for (const sub of results) {
      if (!selected.has(sub.name)) continue;

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await addTrial({
        id: uuidv4(),
        serviceName: sub.name,
        serviceIcon: sub.name.charAt(0),
        trialEndDate: endDate.toISOString(),
        chargeAmount: sub.amount || 0,
        currency: sub.currency || settings.currency,
        cancelUrl: sub.domain ? `https://${sub.domain}` : '',
        category: 'other',
        cycle: 'monthly',
        reminders: { '3day': true, '1day': true, '2hour': false },
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      count++;
    }

    setAddedCount(count);
    Alert.alert(
      'Subscriptions Added',
      `${count} subscription${count !== 1 ? 's' : ''} added to Unsub. You can edit prices and dates in each subscription's detail page.`,
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  const handleDisconnect = async () => {
    await clearToken();
    setState('idle');
    setResults([]);
    setSelected(new Set());
  };

  const confidenceIcon = (c: string) => {
    switch (c) {
      case 'high': return { name: 'checkmark-circle' as const, color: '#10B981' };
      case 'medium': return { name: 'alert-circle' as const, color: '#F59E0B' };
      default: return { name: 'help-circle' as const, color: colors.textSecondary };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.title}>Email Scan</Text>
          <View style={{ width: 36 }} />
        </View>

        {state === 'idle' && (
          <Animated.View entering={FadeInDown.duration(500)}>
            <View style={styles.heroSection}>
              <LinearGradient
                colors={['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.05)']}
                style={styles.heroIcon}
              >
                <Ionicons name="mail-outline" size={48} color="#3B82F6" />
              </LinearGradient>
              <Text style={styles.heroTitle}>Find Hidden Subscriptions</Text>
              <Text style={styles.heroDesc}>
                We'll scan your email for subscription receipts and billing notifications.
                Only email subjects and senders are read — never email content.
              </Text>
            </View>

            <View style={styles.privacyCard}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
              <View style={styles.privacyText}>
                <Text style={styles.privacyTitle}>Privacy First</Text>
                <Text style={styles.privacyDesc}>
                  Read-only access. We only check subject lines and sender names. No email bodies are read. You can disconnect anytime.
                </Text>
              </View>
            </View>

            <Pressable style={styles.connectBtn} onPress={handleConnect}>
              <LinearGradient
                colors={['#4285F4', '#3367D6']}
                style={styles.connectGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="logo-google" size={20} color="#fff" />
                <Text style={styles.connectText}>Connect Gmail</Text>
              </LinearGradient>
            </Pressable>

            <Text style={styles.disclaimer}>
              Uses Google's secure OAuth. We never see your password.
            </Text>
          </Animated.View>
        )}

        {(state === 'authenticating' || state === 'scanning') && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>
              {state === 'authenticating' ? 'Connecting to Gmail...' : 'Scanning emails for subscriptions...'}
            </Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        )}

        {state === 'results' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Found {results.length} subscription{results.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.resultsSubtitle}>
                {selected.size} selected to add
              </Text>
            </View>

            {results.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No subscriptions found in your emails</Text>
                <Text style={styles.emptySubtext}>Try adding subscriptions manually</Text>
              </View>
            ) : (
              <>
                {results.map((sub, index) => {
                  const ci = confidenceIcon(sub.confidence);
                  const isSelected = selected.has(sub.name);
                  return (
                    <Animated.View key={sub.name} entering={FadeInDown.duration(300).delay(index * 60)}>
                      <Pressable
                        style={[styles.resultCard, isSelected && styles.resultCardSelected]}
                        onPress={() => toggleSelect(sub.name)}
                      >
                        <View style={styles.resultLeft}>
                          <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                          </View>
                          <ServiceLogo name={sub.name} color="#3B82F6" size={36} />
                          <View style={styles.resultInfo}>
                            <View style={styles.resultNameRow}>
                              <Text style={styles.resultName}>{sub.name}</Text>
                              <Ionicons name={ci.name} size={14} color={ci.color} />
                            </View>
                            <Text style={styles.resultMeta} numberOfLines={1}>
                              {sub.amount ? `${sub.currency === 'GBP' ? '£' : sub.currency === 'EUR' ? '€' : '$'}${sub.amount.toFixed(2)}/mo` : 'Price unknown'}
                              {' · '}
                              {sub.confidence === 'high' ? 'Confirmed' : 'Likely'}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}

                <View style={styles.actionRow}>
                  <Pressable style={styles.selectAllBtn} onPress={() => {
                    if (selected.size === results.length) setSelected(new Set());
                    else setSelected(new Set(results.map(r => r.name)));
                  }}>
                    <Text style={styles.selectAllText}>
                      {selected.size === results.length ? 'Deselect All' : 'Select All'}
                    </Text>
                  </Pressable>
                </View>

                {selected.size > 0 && (
                  <Pressable style={styles.addBtn} onPress={handleAddSelected}>
                    <LinearGradient
                      colors={['#F59E0B', '#D97706']}
                      style={styles.addGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.addText}>
                        Add {selected.size} Subscription{selected.size !== 1 ? 's' : ''}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </>
            )}

            <Pressable style={styles.disconnectBtn} onPress={handleDisconnect}>
              <Ionicons name="log-out-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.disconnectText}>Disconnect Gmail</Text>
            </Pressable>
          </Animated.View>
        )}

        {state === 'error' && (
          <View style={styles.errorSection}>
            <Ionicons name="warning-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => setState('idle')}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
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

  // Hero
  heroSection: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
  },
  heroTitle: { fontSize: 24, fontWeight: '700', color: colors.white, textAlign: 'center', marginBottom: 12 },
  heroDesc: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },

  // Privacy
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: spacing.lg,
    marginTop: 24,
    gap: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  privacyText: { flex: 1 },
  privacyTitle: { fontSize: 14, fontWeight: '600', color: '#10B981', marginBottom: 4 },
  privacyDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

  // Connect
  connectBtn: { marginHorizontal: spacing.lg, marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  connectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  connectText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  disclaimer: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 12, opacity: 0.7 },

  // Loading
  loadingSection: { alignItems: 'center', paddingTop: 100, gap: 16 },
  loadingText: { fontSize: 16, fontWeight: '600', color: colors.white },
  loadingSubtext: { fontSize: 14, color: colors.textSecondary },

  // Results
  resultsHeader: { paddingHorizontal: spacing.lg, marginBottom: 16 },
  resultsTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  resultsSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: spacing.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  resultCardSelected: { borderColor: colors.accent, backgroundColor: 'rgba(245,158,11,0.05)' },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  resultInfo: { flex: 1 },
  resultNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultName: { fontSize: 15, fontWeight: '600', color: colors.white },
  resultMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Actions
  actionRow: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  selectAllBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  selectAllText: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  addBtn: { marginHorizontal: spacing.lg, borderRadius: 16, overflow: 'hidden' },
  addGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  addText: { fontSize: 17, fontWeight: '700', color: '#000' },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    paddingVertical: 12,
  },
  disconnectText: { fontSize: 14, color: colors.textSecondary },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.white },
  emptySubtext: { fontSize: 14, color: colors.textSecondary },

  // Error
  errorSection: { alignItems: 'center', paddingTop: 80, gap: 16, paddingHorizontal: spacing.lg },
  errorText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  retryText: { fontSize: 15, fontWeight: '600', color: colors.white },
});
