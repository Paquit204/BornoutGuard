import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../hooks/useAuth';

const RISK_GUIDE = [
  { level: 'Low (0–33)', color: '#10B981', desc: 'You\'re managing well. Keep your healthy habits going.' },
  { level: 'Moderate (34–66)', color: '#F59E0B', desc: 'Some stress is present. Consider adjusting your schedule.' },
  { level: 'High (67–100)', color: '#EF4444', desc: 'Burnout risk is high. Take immediate steps to reduce pressure.' },
];

const FEATURE_GUIDE = [
  { icon: '📝', title: 'Daily Check-In', desc: 'Log your study hours, sleep, assignments, stress and mood each day.' },
  { icon: '📊', title: 'Analytics', desc: 'View 14-day trends, sleep vs study comparisons, and risk distribution.' },
  { icon: '🧠', title: 'Burnout Score', desc: 'A 0–100 score calculated from stress, sleep, study, and workload.' },
  { icon: '💡', title: 'Recommendations', desc: 'Personalized tips based on your current burnout risk level.' },
];

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

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

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <LinearGradient colors={['#1E1040', '#000000']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile?.full_name || 'Student'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Account Info */}
        <Text style={styles.sectionTitle}>Account Information</Text>
        <GlassCard>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{profile?.full_name || 'Not set'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : '—'}
            </Text>
          </View>
        </GlassCard>

        {/* How It Works */}
        <Text style={styles.sectionTitle}>How BurnoutGuard Works</Text>
        <GlassCard>
          <Text style={styles.algorithmText}>
            Your Burnout Score (0–100) is calculated using:{'\n\n'}
            • <Text style={styles.bold}>Stress Level</Text> — 30% weight{'\n'}
            • <Text style={styles.bold}>Sleep Deprivation</Text> — 25% weight{'\n'}
            • <Text style={styles.bold}>Excessive Study</Text> — 25% weight{'\n'}
            • <Text style={styles.bold}>Workload Pressure</Text> — 20% weight
          </Text>
        </GlassCard>

        {/* Risk Guide */}
        <Text style={styles.sectionTitle}>Risk Level Guide</Text>
        {RISK_GUIDE.map((g) => (
          <GlassCard key={g.level} style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <View style={[styles.riskDot, { backgroundColor: g.color }]} />
              <Text style={[styles.riskLevel, { color: g.color }]}>{g.level}</Text>
            </View>
            <Text style={styles.riskDesc}>{g.desc}</Text>
          </GlassCard>
        ))}

        {/* Feature Guide */}
        <Text style={styles.sectionTitle}>Feature Guide</Text>
        {FEATURE_GUIDE.map((f) => (
          <GlassCard key={f.title} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </GlassCard>
        ))}

        {/* Sign Out */}
        <CustomButton
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          style={styles.signOutBtn}
        />

        <Text style={styles.version}>BurnoutGuard v1.0.0 · Built with ❤️ for Students</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingBottom: 40 },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backBtn: { marginBottom: 20 },
  backText: { color: '#3B82F6', fontSize: 15 },
  avatarContainer: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  email: { color: '#9CA3AF', fontSize: 13 },
  body: { padding: 20, gap: 12 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: { color: '#9CA3AF', fontSize: 13 },
  infoValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 10 },
  algorithmText: { color: '#D1D5DB', fontSize: 14, lineHeight: 22 },
  bold: { fontWeight: '700', color: '#FFFFFF' },
  riskCard: { marginBottom: 2 },
  riskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  riskDot: { width: 10, height: 10, borderRadius: 5 },
  riskLevel: { fontSize: 14, fontWeight: '600' },
  riskDesc: { color: '#9CA3AF', fontSize: 13, lineHeight: 20 },
  featureCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  featureIcon: { fontSize: 24, marginTop: 2 },
  featureContent: { flex: 1 },
  featureTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  featureDesc: { color: '#9CA3AF', fontSize: 13, lineHeight: 20 },
  signOutBtn: { marginTop: 12 },
  version: { color: '#374151', fontSize: 11, textAlign: 'center', marginTop: 16 },
});