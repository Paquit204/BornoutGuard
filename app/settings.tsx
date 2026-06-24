 // app/settings.tsx
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  

  const handleClearData = () => {
    Alert.alert(
      'Clear all check-ins',
      'This will permanently delete all your daily check-in data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('daily_checkins').delete().eq('user_id', user.id);
              Alert.alert('Data cleared', 'All check-ins have been removed.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <TopBar showBack />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Settings</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile')}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>About BurnoutGuard</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/editprofile')}>
          <Text style={styles.menuIcon}>✏️</Text>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleClearData}>
          <Text style={styles.menuIcon}>🗑️</Text>
          <Text style={styles.menuText}>Clear All Data</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.signOutItem]} onPress={() => router.push('/signout')}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 20 },
  heading: { ...Typography.heading, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.limeGlow,     // ✅ lime glow border
    marginBottom: Spacing.sm,
    ...Shadows.card,                 // ✅ dark shadow
  },
  menuIcon: { fontSize: 22, marginRight: Spacing.md },
  menuText: { flex: 1, ...Typography.body, fontWeight: '500' },
  menuArrow: { fontSize: 18, color: Colors.textMuted },
  signOutItem: {
    marginTop: Spacing.sm,
    borderColor: Colors.danger,       // red border for sign-out
  },
  signOutText: { color: Colors.danger },
});