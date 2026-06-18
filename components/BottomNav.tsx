 import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tabs = [
  { name: 'Today', path: '/dashboard', icon: '📊' },
  { name: 'Check-in', path: '/checkin', icon: '✅' },
  { name: 'Trends', path: '/analytics', icon: '📈' },
  { name: 'Profile', path: '/profile', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.path)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E0D8',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  icon: { fontSize: 22, color: '#A8A098', marginBottom: 2 },
  iconActive: { color: '#2D6A4F' },
  label: { fontSize: 11, color: '#A8A098', fontWeight: '500' },
  labelActive: { color: '#2D6A4F', fontWeight: '600' },
});