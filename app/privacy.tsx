import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../src/utils/theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 32 }} />
        </View>

        <Section title="Your Data Stays On Device">
          <Text style={styles.body}>
            Unsub does not use cloud servers, user accounts, or analytics tracking.
            All your subscription data is stored locally on your device using
            AsyncStorage. We never collect, transmit, or sell your personal information.
          </Text>
        </Section>

        <Section title="What We Store">
          <Text style={styles.body}>
            Unsub stores the following data locally on your device only:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>Subscription names, prices, and end dates</Text>
            <Text style={styles.bullet}>Your currency preference</Text>
            <Text style={styles.bullet}>Notification reminder settings</Text>
            <Text style={styles.bullet}>Premium status (if purchased)</Text>
            <Text style={styles.bullet}>Dark mode preference</Text>
          </View>
          <Text style={styles.body}>
            Deleting the app removes all stored data permanently.
          </Text>
        </Section>

        <Section title="Permissions">
          <Text style={styles.body}>
            Unsub requests only one permission:
          </Text>
          <View style={styles.permissionCard}>
            <Text style={styles.permissionIcon}>🔔</Text>
            <View style={styles.permissionContent}>
              <Text style={styles.permissionTitle}>Notifications</Text>
              <Text style={styles.permissionDesc}>
                Used to send trial expiry reminders. You can disable this at any
                time in your device settings.
              </Text>
            </View>
          </View>
        </Section>

        <Section title="Third-Party Services">
          <Text style={styles.body}>
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
  scroll: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: colors.textSecondary },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletList: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 28,
    paddingLeft: 8,
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
  },
  permissionIcon: { fontSize: 24 },
  permissionContent: { flex: 1 },
  permissionTitle: { fontSize: 16, fontWeight: '600', color: colors.white, marginBottom: 4 },
  permissionDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
