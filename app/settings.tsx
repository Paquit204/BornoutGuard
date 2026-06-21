 import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
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
      <TopBar showBack={true} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 90 }]}
      >
        <Text style={styles.heading}>Settings</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile')}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>About BurnoutGuard</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
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
  root: { flex: 1, backgroundColor: '#F8F5F0' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B4332',
    marginTop: 8,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1B4332',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 18,
    color: '#A8A098',
  },
  signOutItem: {
    marginTop: 10,
    borderColor: '#FEE2E2',
  },
  signOutText: {
    color: '#D9534F',
  },
});