 // app/profile.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export default function ProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';

  return (
    <View style={styles.root}>
      <TopBar showBack />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 90 }]}
      >
        {/* User Info */}
        <View style={styles.userSection}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarLarge} />
          ) : (
            <View style={styles.avatarLargePlaceholder}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>
        </View>

        {/* Navigation Cards */}
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/settings')}>
          <View style={[styles.navIconWrapper, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.navIcon}>⚙️</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Settings</Text>
            <Text style={styles.navDesc}>Account, about, and sign out</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/report')}>
          <View style={[styles.navIconWrapper, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.navIcon}>📊</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Export Wellness Data</Text>
            <Text style={styles.navDesc}>Download your check-in history as CSV</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>

        {/* Risk Levels Section */}
        <Text style={styles.sectionTitle}>Risk Assessment Guide</Text>
        <View style={styles.riskCard}>
          <View style={styles.riskItem}>
            <View style={[styles.riskDot, { backgroundColor: Colors.success }]} />
            <View>
              <Text style={styles.riskTitle}>Low 0-33</Text>
              <Text style={styles.riskDesc}>Healthy balance maintained.</Text>
            </View>
          </View>
          <View style={styles.riskItem}>
            <View style={[styles.riskDot, { backgroundColor: Colors.warning }]} />
            <View>
              <Text style={styles.riskTitle}>Moderate 34-66</Text>
              <Text style={styles.riskDesc}>Watch for warning signs.</Text>
            </View>
          </View>
          <View style={styles.riskItem}>
            <View style={[styles.riskDot, { backgroundColor: Colors.danger }]} />
            <View>
              <Text style={styles.riskTitle}>High 67-100</Text>
              <Text style={styles.riskDesc}>Immediate action recommended.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 20 },

  userSection: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarLargePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    ...Typography.heading,
    marginTop: Spacing.md,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  navIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  navIcon: { fontSize: 22 },
  navContent: { flex: 1 },
  navTitle: { ...Typography.body, fontWeight: '600' },
  navDesc: { ...Typography.small, marginTop: 2 },
  navArrow: { fontSize: 20, color: Colors.textMuted },

  sectionTitle: { ...Typography.subheading, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  riskCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  riskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  riskTitle: { ...Typography.body, fontWeight: '600' },
  riskDesc: { ...Typography.small, color: Colors.textSecondary },
});