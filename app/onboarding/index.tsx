import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { colors, spacing } from '../../src/utils/theme';
import { saveSettings } from '../../src/utils/storage';
import { purchaseLifetime, restorePurchases, isConfigured } from '../../src/utils/purchases';

const { width } = Dimensions.get('window');
const FREE_TRIAL_LIMIT = 4;

function MoneyCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = 847;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      setCount((c) => {
        if (c + step >= target) {
          clearInterval(interval);
          return target;
        }
        return c + step;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return <Text style={styles.moneyCounter}>£{count}</Text>;
}

function IconCircle({ name, color, size = 80 }: { name: keyof typeof Ionicons.glyphMap; color: string; size?: number }) {
  return (
    <Animated.View entering={ZoomIn.duration(500).delay(200)}>
      <LinearGradient
        colors={[`${color}30`, `${color}10`]}
        style={[styles.iconCircle, { width: size, height: size, borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={name} size={size * 0.45} color={color} />
      </LinearGradient>
    </Animated.View>
  );
}

function Screen1() {
  return (
    <View style={styles.slide}>
      <IconCircle name="wallet-outline" color="#EF4444" size={100} />
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <MoneyCounter />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(400)}>
        <Text style={styles.title}>You've probably wasted hundreds on forgotten free trials</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(500)}>
        <Text style={styles.subtitle}>
          That Netflix trial you forgot. The gym app. That meditation app.{'\n'}They all add up.
        </Text>
      </Animated.View>
    </View>
  );
}

function Screen2() {
  return (
    <View style={styles.slide}>
      <IconCircle name="trending-up-outline" color="#F59E0B" size={100} />
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <Text style={styles.bigStat}>£170</Text>
        <Text style={styles.statLabel}>lost per year</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(400)}>
        <Text style={styles.title}>The average person loses £170/year to subscription traps</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(500)}>
        <Text style={styles.subtitle}>
          Free trials are designed to be forgotten. Companies count on it.
        </Text>
      </Animated.View>
    </View>
  );
}

function Screen3({ onSelect }: { onSelect: (v: string) => void }) {
  const [selected, setSelected] = useState('');
  const options = ['1-2', '3-5', '6+'];

  return (
    <View style={styles.slide}>
      <IconCircle name="help-circle-outline" color="#8B5CF6" size={100} />
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <Text style={styles.title}>How many free trials have you forgotten to cancel?</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.optionRow}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            style={[styles.optionButton, selected === opt && styles.optionSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelected(opt);
              onSelect(opt);
            }}
          >
            <Text style={[styles.optionText, selected === opt && styles.optionTextSelected]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
      {selected !== '' && (
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.highlight}>
            {selected === '6+' ? "That could be over £500 wasted!" :
             selected === '3-5' ? "That's roughly £200-400 gone!" :
             "Even 1-2 can cost you £100+"}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

function Screen4() {
  const steps = [
    { icon: 'add-circle-outline' as const, title: 'Log your trial', desc: 'Add it in seconds' },
    { icon: 'notifications-outline' as const, title: 'Get reminded', desc: '3 days, 1 day, 2 hours before' },
    { icon: 'checkmark-circle-outline' as const, title: 'Cancel on time', desc: 'One tap to cancel. Money saved.' },
  ];

  return (
    <View style={styles.slide}>
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <Text style={styles.title}>Unsub watches your trials so you don't have to</Text>
      </Animated.View>
      {steps.map((step, i) => (
        <Animated.View key={i} entering={FadeInDown.duration(400).delay(300 + i * 150)} style={styles.stepRow}>
          <LinearGradient
            colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.05)']}
            style={styles.stepIconWrap}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={step.icon} size={24} color={colors.accent} />
          </LinearGradient>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDesc}>{step.desc}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function Screen5({ onSelect }: { onSelect: (names: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const popular = [
    { name: 'Netflix', icon: 'tv-outline' },
    { name: 'Spotify', icon: 'musical-notes-outline' },
    { name: 'Amazon Prime', icon: 'bag-outline' },
    { name: 'Disney+', icon: 'film-outline' },
    { name: 'YouTube Premium', icon: 'play-outline' },
    { name: 'Apple Music', icon: 'headset-outline' },
    { name: 'Xbox Game Pass', icon: 'game-controller-outline' },
    { name: 'Adobe CC', icon: 'color-palette-outline' },
    { name: 'ChatGPT Plus', icon: 'chatbubble-outline' },
    { name: 'Gym', icon: 'fitness-outline' },
    { name: 'NordVPN', icon: 'shield-outline' },
    { name: 'iCloud', icon: 'cloud-outline' },
    { name: 'Notion', icon: 'document-outline' },
    { name: 'Audible', icon: 'book-outline' },
    { name: 'Duolingo', icon: 'language-outline' },
  ];

  const toggle = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = selected.includes(name)
      ? selected.filter((s) => s !== name)
      : [...selected, name];
    setSelected(next);
    onSelect(next);
  };

  return (
    <View style={styles.slide}>
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <Text style={styles.title}>Which services do you use?</Text>
        <Text style={styles.subtitle}>We'll help you track these</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.serviceGrid}>
        {popular.map((s) => (
          <Pressable
            key={s.name}
            style={[styles.serviceChip, selected.includes(s.name) && styles.serviceChipSelected]}
            onPress={() => toggle(s.name)}
          >
            <Ionicons
              name={s.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={selected.includes(s.name) ? colors.accent : colors.textSecondary}
            />
            <Text style={[styles.serviceName, selected.includes(s.name) && styles.serviceNameSelected]} numberOfLines={1}>
              {s.name}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

function PaywallScreen() {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!isConfigured()) {
        // Dev mode — skip purchase, just unlock
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await saveSettings({ onboardingComplete: true, isPremium: true });
        router.replace('/(tabs)');
        return;
      }
      const success = await purchaseLifetime();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await saveSettings({ onboardingComplete: true, isPremium: true });
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (e?.message === 'NO_PACKAGE') {
        Alert.alert('Unavailable', 'Purchase not available right now. Please try again later.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFree = async () => {
    await saveSettings({ onboardingComplete: true });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.slide}>
      <Animated.View entering={ZoomIn.duration(400).delay(200)}>
        <LinearGradient
          colors={['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)']}
          style={styles.crownCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="diamond" size={36} color={colors.accent} />
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <Text style={styles.paywallTitle}>Unlock Unlimited Tracking</Text>
        <Text style={styles.paywallSubtitle}>One payment. Yours forever.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.featureList}>
        {[
          { icon: 'infinite-outline', text: 'Unlimited subscription tracking' },
          { icon: 'mail-outline', text: 'Email scanning for subscriptions' },
          { icon: 'analytics-outline', text: 'Full spending analytics' },
          { icon: 'calendar-outline', text: 'Calendar view & custom categories' },
          { icon: 'download-outline', text: 'CSV export & multi-currency' },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.success} />
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={[styles.planCard, styles.planCardSelected]}>
        <View style={styles.bestBadge}><Text style={styles.bestBadgeText}>ONE-TIME</Text></View>
        <View style={styles.planLeft}>
          <Ionicons name="diamond" size={22} color={colors.accent} />
          <View>
            <Text style={styles.planLabel}>Premium Lifetime</Text>
            <Text style={styles.planNote}>Pay once, own forever</Text>
          </View>
        </View>
        <Text style={styles.planPrice}>£3.99</Text>
      </View>

      <Pressable style={[styles.purchaseButton, loading && { opacity: 0.7 }]} onPress={handlePurchase} disabled={loading}>
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.purchaseGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.purchaseButtonText}>Unlock Premium — £3.99</Text>
          )}
        </LinearGradient>
      </Pressable>

      <Pressable onPress={handleFree}>
        <Text style={styles.freeText}>Start free with {FREE_TRIAL_LIMIT} subscriptions</Text>
      </Pressable>

      <Text style={styles.legalText}>
        One-time purchase. No subscription. No hidden fees.
      </Text>
    </View>
  );
}

export default function Onboarding() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const screens = [
    { key: '1', component: <Screen1 /> },
    { key: '2', component: <Screen2 /> },
    { key: '3', component: <Screen3 onSelect={() => {}} /> },
    { key: '4', component: <Screen4 /> },
    { key: '5', component: <Screen5 onSelect={() => {}} /> },
    { key: '6', component: <PaywallScreen /> },
  ];

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentIndex < screens.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={screens}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={{ width }}>{item.component}</View>
        )}
        keyExtractor={(item) => item.key}
      />

      {currentIndex < screens.length - 1 && (
        <View style={styles.bottomBar}>
          <View style={styles.dots}>
            {screens.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable style={styles.nextButton} onPress={goNext}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.nextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    alignItems: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  moneyCounter: {
    fontSize: 72,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bigStat: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.accent,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 18,
    color: colors.accentLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  optionButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  optionText: { fontSize: 20, fontWeight: '700', color: colors.white },
  optionTextSelected: { color: colors.accent },
  highlight: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  stepIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 17, fontWeight: '600', color: colors.white },
  stepDesc: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.lg,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    gap: 6,
  },
  serviceChipSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  serviceName: { fontSize: 13, fontWeight: '500', color: colors.white },
  serviceNameSelected: { color: colors.accent },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  paywallTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  paywallSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  featureList: { width: '100%', marginBottom: spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureText: { fontSize: 15, color: colors.white },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: { borderColor: colors.accent },
  bestBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  bestBadgeText: { fontSize: 9, fontWeight: '700', color: '#000', letterSpacing: 0.5 },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planLabel: { fontSize: 16, fontWeight: '600', color: colors.white },
  planNote: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  planPrice: { fontSize: 16, fontWeight: '700', color: colors.accent },
  purchaseButton: {
    width: '100%',
    marginTop: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  purchaseButtonText: { fontSize: 18, fontWeight: '700', color: '#000' },
  freeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 14,
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: { backgroundColor: colors.accent, width: 24 },
  nextButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderRadius: 16,
  },
  nextButtonText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
