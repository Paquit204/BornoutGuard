 // components/TopBar.tsx
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

interface TopBarProps {
  showBack?: boolean;
  profile?: { name: string };
  showProfile?: boolean;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

export default function TopBar({
  showBack = false,
  profile,
  showProfile = false,
  onSearchPress,
  onNotificationPress,
}: TopBarProps) {
  const router = useRouter();
  const { profile: userProfile } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const avatarUrl = userProfile?.avatar_url;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          {showProfile && profile && (
            <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
                </View>
              )}
              <Text style={styles.nameText} numberOfLines={1}>
                {profile.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.right}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchPress || (() => {})}
            activeOpacity={0.7}
          >
            <Feather name="search" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationPress || (() => {})}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingTop: 56,        // ✅ restored – proper status bar spacing
    paddingBottom: 12,     // slightly more padding below
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    ...Shadows.card,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.card,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameText: {
    ...Typography.body,
    color: Colors.textPrimary,
    maxWidth: 100,
    fontWeight: '600',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  avatarText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});