 import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TopBarProps {
  showBack?: boolean;
}

export default function TopBar({ showBack = false }: TopBarProps) {
  const router = useRouter();
  const now = new Date();
  const dateStr = now
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.date}>{dateStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#F8F5F0',
    // ❌ Removed borderBottomWidth and borderBottomColor
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 10 },
  backText: { fontSize: 20, color: '#2D6A4F' },
  date: { fontSize: 14, fontWeight: '600', color: '#1B4332', letterSpacing: 0.5 },
});