import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
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

  return (
    <View style={{ position: 'relative' }}>
      <View style={{ position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center', zIndex: 999 }}>
        <TouchableOpacity
          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          onPress={() => router.push('/trial/add')}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: '600', marginTop: -2 }}>+</Text>
        </TouchableOpacity>
      </View>
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
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
            >
              <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
                {icon}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
});
