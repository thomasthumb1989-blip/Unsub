import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '../../src/utils/theme';

const TAB_ICONS: Record<string, string> = {
  index: '⊞',
  subscriptions: '☰',
  calendar: '📅',
  settings: '⚙',
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);
  const tabNames = state.routes.map((r: any) => r.name);

  const midpoint = Math.floor(tabNames.length / 2);

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPad }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const icon = TAB_ICONS[route.name] || '•';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={route.key} style={styles.tabItemWrapper}>
            {index === midpoint && (
              <Pressable
                style={styles.addButton}
                onPress={() => router.push('/trial/add')}
              >
                <Text style={styles.addButtonText}>+</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
            >
              <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
                {icon}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="subscriptions" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.tabActive,
  },
  tabIcon: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  tabIconActive: {
    color: colors.white,
  },
  addButton: {
    position: 'absolute',
    top: -30,
    left: '50%',
    transform: [{ translateX: -26 }],
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginTop: -2,
  },
});
