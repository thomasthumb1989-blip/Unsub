import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../../src/utils/theme';
import { saveSettings } from '../../src/utils/storage';
import { services } from '../../src/data/services';

const { width } = Dimensions.get('window');
const FREE_TRIAL_LIMIT = 3;

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

  return (
    <Text style={styles.moneyCounter}>£{count}</Text>
  );
}

function Screen1() {
  return (
    <View style={styles.slide}>
      <Text style={styles.emoji}>💸</Text>
      <MoneyCounter />
      <Text style={styles.title}>You've probably wasted hundreds on forgotten free trials</Text>
      <Text style={styles.subtitle}>
        That Netflix trial you forgot. The gym app. That meditation app.
        They all add up.
      </Text>
    </View>
  );
}

function Screen2() {
  return (
    <View style={styles.slide}>
      <Text style={styles.emoji}>📊</Text>
      <Text style={styles.bigStat}>£170</Text>
      <Text style={styles.statLabel}>lost per year</Text>
      <Text style={styles.title}>The average person loses £170/year to subscription traps</Text>
      <Text style={styles.subtitle}>
        Free trials are designed to be forgotten. Companies count on it.
      </Text>
    </View>
  );
}

function Screen3({ onSelect }: { onSelect: (v: string) => void }) {
  const [selected, setSelected] = useState('');
  const options = ['1-2', '3-5', '6+'];

  return (
    <View style={styles.slide}>
      <Text style={styles.emoji}>🤔</Text>
      <Text style={styles.title}>How many free trials have you forgotten to cancel?</Text>
      <View style={styles.optionRow}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            style={[styles.optionButton, selected === opt && styles.optionSelected]}
            onPress={() => { setSelected(opt); onSelect(opt); }}
          >
            <Text style={[styles.optionText, selected === opt && styles.optionTextSelected]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
      {selected === '6+' && (
        <Text style={styles.highlight}>That could be over £500 wasted! 😱</Text>
      )}
      {selected === '3-5' && (
        <Text style={styles.highlight}>That's roughly £200-400 gone! 😬</Text>
      )}
      {selected === '1-2' && (
        <Text style={styles.highlight}>Even 1-2 can cost you £100+</Text>
      )}
    </View>
  );
}

function Screen4() {
  const steps = [
    { icon: '➕', title: 'Log your trial', desc: 'Add it in seconds' },
    { icon: '🔔', title: 'Get reminded', desc: '3 days, 1 day, 2 hours before' },
    { icon: '✅', title: 'Cancel on time', desc: 'One tap to cancel. Money saved.' },
  ];

  return (
    <View style={styles.slide}>
      <Text style={styles.title}>Unsub watches your trials so you don't have to</Text>
      {steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <Text style={styles.stepIcon}>{step.icon}</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDesc}>{step.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function Screen5({ onSelect }: { onSelect: (names: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const topServices = services.slice(0, 30);

  const toggle = (name: string) => {
    const next = selected.includes(name)
      ? selected.filter((s) => s !== name)
      : [...selected, name];
    setSelected(next);
    onSelect(next);
  };

  return (
    <View style={styles.slide}>
      <Text style={styles.title}>Which services do you use?</Text>
      <Text style={styles.subtitle}>We'll help you track trials for these</Text>
      <View style={styles.serviceGrid}>
        {topServices.map((s) => (
          <Pressable
            key={s.name}
            style={[styles.serviceChip, selected.includes(s.name) && styles.serviceChipSelected]}
            onPress={() => toggle(s.name)}
          >
            <Text style={styles.serviceIcon}>{s.icon}</Text>
            <Text style={[styles.serviceName, selected.includes(s.name) && styles.serviceNameSelected]} numberOfLines={1}>
              {s.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function PaywallScreen() {
  const plans = [
    { id: 'weekly', label: 'Weekly', price: '£1.99/week', note: 'Cancel anytime' },
    { id: 'yearly', label: 'Yearly', price: '£19.99/year', note: 'Save 81%' },
    { id: 'lifetime', label: 'Lifetime', price: '£2.99 once', note: 'Best value ⭐', best: true },
  ];
  const [selectedPlan, setSelectedPlan] = useState('lifetime');

  const handlePurchase = async () => {
    await saveSettings({ onboardingComplete: true });
    router.replace('/(tabs)');
  };

  const handleFree = async () => {
    await saveSettings({ onboardingComplete: true });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.slide}>
      <Text style={styles.paywallTitle}>Unlock Unlimited Tracking</Text>
      <Text style={styles.paywallSubtitle}>Join 10,000+ people saving money</Text>

      <View style={styles.featureList}>
        {['Unlimited trial tracking', 'Smart notifications', 'Savings history', 'Share savings cards'].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureCheck}>✅</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {plans.map((plan) => (
        <Pressable
          key={plan.id}
          style={[
            styles.planCard,
            selectedPlan === plan.id && styles.planCardSelected,
            plan.best && styles.planCardBest,
          ]}
          onPress={() => setSelectedPlan(plan.id)}
        >
          <View style={styles.planLeft}>
            <View style={[styles.radio, selectedPlan === plan.id && styles.radioSelected]} />
            <View>
              <Text style={styles.planLabel}>{plan.label}</Text>
              <Text style={styles.planNote}>{plan.note}</Text>
            </View>
          </View>
          <Text style={styles.planPrice}>{plan.price}</Text>
        </Pressable>
      ))}

      <Pressable style={styles.purchaseButton} onPress={handlePurchase}>
        <Text style={styles.purchaseButtonText}>Continue</Text>
      </Pressable>

      <Pressable onPress={handleFree}>
        <Text style={styles.freeText}>Start free with {FREE_TRIAL_LIMIT} trials</Text>
      </Pressable>

      <Text style={styles.legalText}>
        Recurring billing. Cancel anytime. Restore purchases available in Settings.
      </Text>
    </View>
  );
}

export default function Onboarding() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const screens = [
    { key: '1', component: <Screen1 /> },
    { key: '2', component: <Screen2 /> },
    { key: '3', component: <Screen3 onSelect={() => {}} /> },
    { key: '4', component: <Screen4 /> },
    { key: '5', component: <Screen5 onSelect={() => {}} /> },
    { key: '6', component: <PaywallScreen /> },
  ];

  const goNext = () => {
    if (currentIndex < screens.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={screens}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
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
            <Text style={styles.nextButtonText}>Continue</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    alignItems: 'center',
  },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  moneyCounter: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.red,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bigStat: {
    fontSize: 80,
    fontWeight: '800',
    color: colors.amber,
    marginBottom: 0,
  },
  statLabel: {
    fontSize: 20,
    color: colors.amber,
    marginBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  optionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDark + '30',
  },
  optionText: { fontSize: 20, fontWeight: '600', color: colors.text },
  optionTextSelected: { color: colors.accent },
  highlight: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.amber,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  stepIcon: { fontSize: 36, marginRight: spacing.md },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  stepDesc: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    gap: 6,
  },
  serviceChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDark + '30',
  },
  serviceIcon: { fontSize: 16 },
  serviceName: { fontSize: 13, color: colors.text },
  serviceNameSelected: { color: colors.accent },
  paywallTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  featureList: { width: '100%', marginBottom: spacing.lg },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureCheck: { fontSize: 16 },
  featureText: { fontSize: 16, color: colors.text },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  planCardSelected: { borderColor: colors.accent },
  planCardBest: { borderColor: colors.accent, borderWidth: 2.5 },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  planLabel: { fontSize: 17, fontWeight: '600', color: colors.text },
  planNote: { fontSize: 13, color: colors.textSecondary },
  planPrice: { fontSize: 17, fontWeight: '700', color: colors.accent },
  purchaseButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  purchaseButtonText: { fontSize: 18, fontWeight: '700', color: colors.white },
  freeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBorder,
  },
  dotActive: { backgroundColor: colors.accent, width: 24 },
  nextButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: { fontSize: 18, fontWeight: '700', color: colors.white },
});
