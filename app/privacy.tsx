import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing } from '../src/utils/theme';
import { useTheme } from '../src/contexts/ThemeContext';

function Section({ title, icon, children, delay = 0 }: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  delay?: number;
}) {
  const { colors: tc } = useTheme();
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={tc.accent} />
        <Text style={[styles.sectionTitle, { color: tc.white }]}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

export default function PrivacyScreen() {
  const { colors: tc } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            style={[styles.backBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
          >
            <Ionicons name="arrow-back" size={22} color={tc.white} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: tc.white }]}>Privacy & Security</Text>
          <View style={{ width: 36 }} />
        </View>

        <Section title="Your Data Stays On Device" icon="phone-portrait-outline" delay={100}>
          <Text style={[styles.body, { color: tc.textSecondary }]}>
            Unsub does not use cloud servers, user accounts, or analytics tracking.
            All your subscription data is stored locally on your device. We never collect,
            transmit, or sell your personal information.
          </Text>
        </Section>

        <Section title="What We Store" icon="server-outline" delay={200}>
          <Text style={[styles.body, { color: tc.textSecondary }]}>
            Unsub stores the following data locally on your device only:
          </Text>
          <View style={styles.bulletList}>
            {[
              'Subscription names, prices, and end dates',
              'Your currency preference',
              'Notification reminder settings',
              'Premium status (if purchased)',
              'Dark mode preference',
            ].map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={16} color={tc.success} />
                <Text style={[styles.bulletText, { color: tc.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.body, { color: tc.textSecondary }]}>
            Deleting the app removes all stored data permanently.
          </Text>
        </Section>

        <Section title="Permissions" icon="key-outline" delay={300}>
          <Text style={[styles.body, { color: tc.textSecondary }]}>
            Unsub requests only one permission:
          </Text>
          <View style={[styles.permissionCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
            <Ionicons name="notifications-outline" size={22} color={tc.accent} />
            <View style={styles.permissionContent}>
              <Text style={[styles.permissionTitle, { color: tc.white }]}>Notifications</Text>
              <Text style={[styles.permissionDesc, { color: tc.textSecondary }]}>
                Used to send trial expiry reminders. You can disable this at any
                time in your device settings.
              </Text>
            </View>
          </View>
        </Section>

        <Section title="Third-Party Services" icon="globe-outline" delay={400}>
          <Text style={[styles.body, { color: tc.textSecondary }]}>
            If you purchase Premium, the transaction is handled by Apple or Google
            via their respective app stores. Unsub does not process or store
            payment information.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 60 },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginVertical: 8,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  permissionCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    gap: 12,
    alignItems: 'flex-start',
  },
  permissionContent: { flex: 1 },
  permissionTitle: { fontSize: 15, fontWeight: '600', color: colors.white, marginBottom: 4 },
  permissionDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});
