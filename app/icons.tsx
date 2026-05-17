import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing } from '../src/utils/theme';
import { useTheme } from '../src/contexts/ThemeContext';

let alternateIcons: any = null;
try {
  alternateIcons = require('expo-alternate-app-icons');
} catch {}

type IconVariant = {
  key: string | null;
  name: string;
  style: string;
  color: string;
  bg: string;
  image: any;
};

const ICON_VARIANTS: IconVariant[] = [
  { key: null, name: 'Default', style: 'Lettermark', color: 'Amber', bg: 'Dark', image: require('../assets/icons/icon-lettermark-amber-dark.png') },
  { key: 'Ocean', name: 'Ocean', style: 'Lettermark', color: 'Blue', bg: 'Dark', image: require('../assets/icons/icon-lettermark-blue-dark.png') },
  { key: 'Rose', name: 'Rose', style: 'Lettermark', color: 'Red', bg: 'Dark', image: require('../assets/icons/icon-lettermark-red-dark.png') },
  { key: 'Mint', name: 'Mint', style: 'Lettermark', color: 'Green', bg: 'Dark', image: require('../assets/icons/icon-lettermark-green-dark.png') },
  { key: 'Violet', name: 'Violet', style: 'Lettermark', color: 'Purple', bg: 'Dark', image: require('../assets/icons/icon-lettermark-purple-dark.png') },
  { key: 'Minimal', name: 'Minimal', style: 'Minimal', color: 'Amber', bg: 'Dark', image: require('../assets/icons/icon-minimal-amber-dark.png') },
  { key: 'Badge', name: 'Badge', style: 'Badge', color: 'Amber', bg: 'Dark', image: require('../assets/icons/icon-badge-amber-dark.png') },
  { key: 'Outline', name: 'Outline', style: 'Outline', color: 'Amber', bg: 'Dark', image: require('../assets/icons/icon-outline-amber-dark.png') },
  { key: 'Light', name: 'Light', style: 'Lettermark', color: 'Amber', bg: 'Light', image: require('../assets/icons/icon-lettermark-amber-light.png') },
  { key: 'LightBadge', name: 'Light Badge', style: 'Badge', color: 'Blue', bg: 'Light', image: require('../assets/icons/icon-badge-blue-light.png') },
];

export default function IconPickerScreen() {
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const { colors: tc } = useTheme();

  useEffect(() => {
    if (alternateIcons) {
      const current = alternateIcons.getAppIconName();
      setActiveIcon(current);
    }
  }, []);

  const handleSelect = async (variant: IconVariant) => {
    if (!alternateIcons) {
      Alert.alert('Not supported', 'App icon changing requires a native build.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await alternateIcons.setAlternateAppIcon(variant.key);
      setActiveIcon(variant.key);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not change icon.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            style={[styles.backBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
          >
            <Ionicons name="arrow-back" size={22} color={tc.white} />
          </Pressable>
          <Text style={[styles.title, { color: tc.white }]}>App Icon</Text>
          <View style={{ width: 36 }} />
        </View>

        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.previewSection}>
            <View style={styles.previewIcon}>
              <Image
                source={ICON_VARIANTS.find(v => v.key === activeIcon)?.image || ICON_VARIANTS[0].image}
                style={styles.previewImage}
              />
            </View>
            <Text style={[styles.previewName, { color: tc.white }]}>
              {ICON_VARIANTS.find(v => v.key === activeIcon)?.name || 'Default'}
            </Text>
            <Text style={[styles.previewHint, { color: tc.textSecondary }]}>Choose your app icon below</Text>
          </View>
        </Animated.View>

        <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>COLORS</Text>
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.grid}>
          {ICON_VARIANTS.filter(v => v.style === 'Lettermark' && v.bg === 'Dark').map((variant) => (
            <Pressable
              key={variant.key ?? 'default'}
              style={[styles.iconCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }, activeIcon === variant.key && styles.iconCardActive]}
              onPress={() => handleSelect(variant)}
            >
              <Image source={variant.image} style={styles.iconImage} />
              <Text style={[styles.iconName, { color: tc.textSecondary }, activeIcon === variant.key && styles.iconNameActive]}>
                {variant.name}
              </Text>
              {activeIcon === variant.key && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
          ))}
        </Animated.View>

        <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>STYLES</Text>
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.grid}>
          {ICON_VARIANTS.filter(v => v.style !== 'Lettermark' || v.bg === 'Light').map((variant) => (
            <Pressable
              key={variant.key ?? 'default-style'}
              style={[styles.iconCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }, activeIcon === variant.key && styles.iconCardActive]}
              onPress={() => handleSelect(variant)}
            >
              <Image source={variant.image} style={styles.iconImage} />
              <Text style={[styles.iconName, { color: tc.textSecondary }, activeIcon === variant.key && styles.iconNameActive]}>
                {variant.name}
              </Text>
              {activeIcon === variant.key && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
          ))}
        </Animated.View>

        {Platform.OS === 'web' && (
          <Text style={[styles.webNote, { color: tc.textSecondary }]}>
            Icon switching only works on iOS and Android native builds.
          </Text>
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
  previewSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  previewIcon: {
    width: 100,
    height: 100,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  previewImage: {
    width: 100,
    height: 100,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  previewHint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sectionHeader,
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginTop: 24,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  iconCard: {
    width: '29%',
    aspectRatio: 0.85,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
  },
  iconCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '15',
  },
  iconImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginBottom: 8,
  },
  iconName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  iconNameActive: {
    color: colors.accent,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webNote: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
