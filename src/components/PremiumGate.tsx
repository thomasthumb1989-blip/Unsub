import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

interface PremiumGateProps {
  children: React.ReactNode;
  isLocked: boolean;
  /** Short description of what premium unlocks here */
  feature?: string;
}

/**
 * Wraps content with a lock overlay when user is on free plan.
 * Shows the content blurred/dimmed with a CTA to upgrade.
 */
export function PremiumGate({ children, isLocked, feature }: PremiumGateProps) {
  const { colors: tc } = useTheme();

  if (!isLocked) return <>{children}</>;

  return (
    <View style={styles.wrapper}>
      <View style={styles.dimmedContent} pointerEvents="none">
        {children}
      </View>
      <View style={[styles.overlay, { backgroundColor: tc.bg + 'E6' }]}>
        <LinearGradient
          colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.05)']}
          style={styles.iconBg}
        >
          <Ionicons name="diamond" size={32} color="#F59E0B" />
        </LinearGradient>
        <Text style={[styles.title, { color: tc.white }]}>Premium Feature</Text>
        <Text style={[styles.desc, { color: tc.textSecondary }]}>
          {feature || 'Unlock analytics, calendar, CSV export & more with Premium — just £3.99 once.'}
        </Text>
        <Pressable
          style={styles.upgradeBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/paywall');
          }}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.upgradeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="diamond-outline" size={16} color="#000" />
            <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Full-screen premium gate for screens like Calendar and Email Scan.
 * Shows centered lock UI without any dimmed content behind it.
 */
export function PremiumScreen({ feature }: { feature?: string }) {
  const { colors: tc } = useTheme();

  return (
    <View style={[styles.fullScreen, { backgroundColor: tc.bg }]}>
      <LinearGradient
        colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.05)']}
        style={styles.fullIconBg}
      >
        <Ionicons name="diamond" size={48} color="#F59E0B" />
      </LinearGradient>
      <Text style={[styles.fullTitle, { color: tc.white }]}>Premium Feature</Text>
      <Text style={[styles.fullDesc, { color: tc.textSecondary }]}>
        {feature || 'Unlock analytics, calendar, CSV export & more with Premium — just £3.99 once.'}
      </Text>
      <Pressable
        style={styles.fullUpgradeBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/paywall');
        }}
      >
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.fullUpgradeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="diamond-outline" size={18} color="#000" />
          <Text style={styles.fullUpgradeBtnText}>Upgrade to Premium — £3.99</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Inline overlay gate
  wrapper: { position: 'relative', overflow: 'hidden' },
  dimmedContent: { opacity: 0.3 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.15)',
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  upgradeBtn: { borderRadius: 14, overflow: 'hidden' },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  upgradeBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },

  // Full-screen gate
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  fullIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.15)',
  },
  fullTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  fullDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  fullUpgradeBtn: { borderRadius: 16, overflow: 'hidden' },
  fullUpgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  fullUpgradeBtnText: { fontSize: 17, fontWeight: '700', color: '#000' },
});
