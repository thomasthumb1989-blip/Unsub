import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getCustomCategories, addCustomCategory, removeCustomCategory } from '../src/utils/storage';
import { colors, spacing, categoryColors, getCategoryColor } from '../src/utils/theme';
import { useTheme } from '../src/contexts/ThemeContext';

const DEFAULT_CATEGORIES = Object.keys(categoryColors);

export default function CategoriesScreen() {
  const { colors: tc } = useTheme();
  const [custom, setCustom] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const cats = await getCustomCategories();
        setCustom(cats);
      })();
    }, [])
  );

  const handleAdd = async () => {
    const name = newCat.trim().toLowerCase();
    if (!name) return;
    if (DEFAULT_CATEGORIES.includes(name) || custom.includes(name)) {
      Alert.alert('Exists', 'This category already exists.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addCustomCategory(name);
    setCustom([...custom, name]);
    setNewCat('');
    setShowAdd(false);
  };

  const handleDelete = (cat: string) => {
    Alert.alert('Remove category?', `Delete "${cat}"? Subscriptions using it will show as "Other".`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await removeCustomCategory(cat);
          setCustom(custom.filter((c) => c !== cat));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={[styles.backBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
            <Ionicons name="arrow-back" size={22} color={tc.white} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: tc.white }]}>Categories</Text>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAdd(!showAdd); }} style={[styles.addBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
            <Ionicons name={showAdd ? 'close' : 'add'} size={22} color={colors.accent} />
          </Pressable>
        </View>

        {showAdd && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.addRow}>
            <TextInput
              style={[styles.addInput, { backgroundColor: tc.card, borderColor: tc.cardBorder, color: tc.white }]}
              placeholder="New category name..."
              placeholderTextColor={tc.textSecondary}
              value={newCat}
              onChangeText={setNewCat}
              autoFocus
              onSubmitEditing={handleAdd}
            />
            <Pressable style={styles.addConfirmBtn} onPress={handleAdd}>
              <Ionicons name="checkmark" size={20} color={tc.white} />
            </Pressable>
          </Animated.View>
        )}

        <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>DEFAULT CATEGORIES</Text>
        <View style={[styles.sectionCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          {DEFAULT_CATEGORIES.map((cat, i) => (
            <View key={cat}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.catRow}>
                <View style={styles.catLeft}>
                  <View style={[styles.catDot, { backgroundColor: getCategoryColor(cat) }]} />
                  <Text style={[styles.catName, { color: tc.white }]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                </View>
                <Ionicons name="lock-closed-outline" size={14} color={tc.textSecondary} />
              </View>
            </View>
          ))}
        </View>

        {custom.length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>CUSTOM CATEGORIES</Text>
            <View style={[styles.sectionCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
              {custom.map((cat, i) => (
                <Animated.View key={cat} entering={FadeInDown.duration(300).delay(i * 50)}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.catRow}>
                    <View style={styles.catLeft}>
                      <View style={[styles.catDot, { backgroundColor: colors.accent }]} />
                      <Text style={[styles.catName, { color: tc.white }]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                    </View>
                    <Pressable onPress={() => handleDelete(cat)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.red} />
                    </Pressable>
                  </View>
                </Animated.View>
              ))}
            </View>
          </>
        )}

        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={16} color={tc.textSecondary} />
          <Text style={[styles.hintText, { color: tc.textSecondary }]}>Custom categories appear when adding subscriptions</Text>
        </View>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  addRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.white,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  addConfirmBtn: {
    width: 48,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sectionHeader,
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginTop: 20,
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
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 15, fontWeight: '500', color: colors.white },
  divider: { height: 0.5, backgroundColor: colors.cardBorder, marginLeft: 42 },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  hintText: { fontSize: 13, color: colors.textSecondary },
});
