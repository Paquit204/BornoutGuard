 import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabs = [
  { name: 'Home', path: '/dashboard', icon: '🏠' },
  { name: 'Check-in', path: '/checkin', icon: '📋' },
  { name: 'Trends', path: '/analytics', icon: '📊' },
  { name: 'Profile', path: '/profile', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 0 }]}>
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
                <Text style={[styles.icon, isActive && styles.iconActive]}>
                  {tab.icon}
                </Text>
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EDE8',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 0,
    width: '100%',
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
  },
  activeIconWrapper: {
    backgroundColor: '#E8F5E9', // light green circle
  },
  icon: {
    fontSize: 22,
    color: '#A8A098', // monochrome gray
  },
  iconActive: {
    color: '#2D6A4F',
  },
});