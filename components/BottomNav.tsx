 // components/BottomNav.tsx
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';

type FeatherIconName = keyof typeof Feather.glyphMap;

const tabs: { name: string; path: string; icon: FeatherIconName }[] = [
  { name: 'Home', path: '/dashboard', icon: 'home' },
  { name: 'Check-in', path: '/checkin', icon: 'clipboard' },
  { name: 'Analytics', path: '/analytics', icon: 'bar-chart-2' },
  { name: 'Profile', path: '/profile', icon: 'user' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (['/login', '/signup', '/forgot-password', '/welcome', '/index', '/signout'].includes(pathname)) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => router.push(tab.path)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                <Feather
                  name={tab.icon}
                  size={22}
                  color={isActive ? Colors.primary : Colors.textMuted}
                />
                {isActive && <View style={styles.activeDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.pill,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(159,232,112,0.12)',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
});