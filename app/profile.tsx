 import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
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

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <TopBar />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>ABOUT THIS APP</Text>
        <Text style={styles.appName}>BurnoutGuard</Text>
        <Text style={styles.description}>
          A daily companion for student wellbeing – built quiet, fast, and on-device.
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>You</Text>
          <Text style={styles.infoValue}>Local profile - no account needed</Text>
        </View>

        <Text style={styles.sectionTitle}>HOW THE SCORE WORKS</Text>
        <Text style={styles.sectionDesc}>
          Each day's check-in is weighed across four factors. The result is a single number from 0 to 100.
        </Text>

        <View style={styles.weightRow}>
          <Text style={styles.weightLabel}>Stress</Text>
          <Text style={styles.weightDetail}>1-10 scale - 0-100</Text>
        </View>
        <View style={styles.weightRow}>
          <Text style={styles.weightLabel}>Sleep</Text>
          <Text style={styles.weightDetail}>7-9 hours - less is worse</Text>
        </View>
        <View style={styles.weightRow}>
          <Text style={styles.weightLabel}>Study</Text>
          <Text style={styles.weightDetail}>5-6 hours - studies are better</Text>
        </View>
        <View style={styles.weightRow}>
          <Text style={styles.weightLabel}>Workload</Text>
          <Text style={styles.weightDetail}>Open assignments count</Text>
        </View>

        <Text style={styles.sectionTitle}>RISK LEVELS</Text>
        <View style={styles.riskRow}>
          <View style={[styles.riskDot, { backgroundColor: '#2D6A4F' }]} />
          <Text style={styles.riskLabel}>Low 0-33</Text>
          <Text style={styles.riskDesc}>Healthy balance maintained.</Text>
        </View>
        <View style={styles.riskRow}>
          <View style={[styles.riskDot, { backgroundColor: '#E8A838' }]} />
          <Text style={styles.riskLabel}>Moderate 34-66</Text>
          <Text style={styles.riskDesc}>Watch for warning signs.</Text>
        </View>
        <View style={styles.riskRow}>
          <View style={[styles.riskDot, { backgroundColor: '#D9534F' }]} />
          <Text style={styles.riskLabel}>High 67-100</Text>
          <Text style={styles.riskDesc}>Immediate action recommended.</Text>
        </View>

        <Text style={styles.sectionTitle}>DATA</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
          <Text style={styles.clearButtonText}>Clear all check-ins</Text>
        </TouchableOpacity>
        <Text style={styles.localOnly}>Local only</Text>

        <Text style={styles.footer}>
          BurnoutGuard is an educational wellness tool, not a medical device. If you're struggling, please reach out to a counselor, friend, or family member.
        </Text>
        <Text style={styles.version}>V1.0 - BUILT WITH CARE</Text>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F5F0' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  heading: { fontSize: 12, fontWeight: '600', color: '#5C6B6A', letterSpacing: 0.5, marginTop: 8 },
  appName: { fontSize: 28, fontWeight: '800', color: '#1B4332', marginTop: 2 },
  description: { fontSize: 14, color: '#4A5A58', marginTop: 4, marginBottom: 12 },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  infoLabel: { fontWeight: '600', color: '#1B4332' },
  infoValue: { color: '#5C6B6A' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1B4332', marginTop: 16, marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: '#5C6B6A', marginBottom: 8 },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D8',
  },
  weightLabel: { flex: 1, fontWeight: '500', color: '#1B4332' },
  weightDetail: { flex: 2, color: '#5C6B6A' },
  riskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  riskDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  riskLabel: { fontWeight: '600', color: '#1B4332', width: 90 },
  riskDesc: { color: '#5C6B6A', fontSize: 13, flex: 1 },
  clearButton: {
    backgroundColor: '#D9534F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  clearButtonText: { color: '#FFFFFF', fontWeight: '600' },
  localOnly: { fontSize: 12, color: '#A8A098', textAlign: 'center', marginTop: 4 },
  footer: { fontSize: 13, color: '#5C6B6A', marginTop: 20, lineHeight: 20, fontStyle: 'italic' },
  version: { fontSize: 12, color: '#A8A098', textAlign: 'center', marginTop: 8 },
  signOutButton: {
    marginTop: 24,
    backgroundColor: '#E5E0D8',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: { color: '#1B4332', fontWeight: '600' },
});