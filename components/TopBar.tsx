 import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TopBarProps {
  showBack?: boolean;
  profile?: {
    name: string;
  };
  showProfile?: boolean;
}

export default function TopBar({ showBack = false, profile, showProfile = false }: TopBarProps) {
  const router = useRouter();
  const now = new Date();
  const dateStr = now
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

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

      {showProfile && profile && (
        <TouchableOpacity style={styles.right} onPress={handleProfilePress}>
          <Text style={styles.nameText} numberOfLines={1}>
            {profile.name}
          </Text>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
          </View>
        </TouchableOpacity>
      )}
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
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 10 },
  backText: { fontSize: 20, color: '#2D6A4F' },
  date: { fontSize: 14, fontWeight: '600', color: '#1B4332', letterSpacing: 0.5 },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4332',
  },
});