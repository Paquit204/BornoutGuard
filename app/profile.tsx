 import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const router = useRouter();

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';

  return (
    <View style={styles.root}>
      <TopBar showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 90 }]}
      >
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
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

        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/checkin-list')}>
          <View style={[styles.navIconWrapper, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.navIcon}>📋</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Manage Historical Check-ins</Text>
            <Text style={styles.navDesc}>View, edit, or delete past check-ins</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>

        {/* Risk Levels Section */}
        <Text style={styles.sectionTitle}>Risk Assessment Guide</Text>
        <View style={styles.riskCard}>
          <View style={styles.riskItem}>
            <View style={[styles.riskDot, { backgroundColor: '#2D6A4F' }]} />
            <View>
              <Text style={styles.riskTitle}>Low 0-33</Text>
              <Text style={styles.riskDesc}>Healthy balance maintained.</Text>
            </View>
          </View>
          <View style={styles.riskItem}>
            <View style={[styles.riskDot, { backgroundColor: '#E8A838' }]} />
            <View>
              <Text style={styles.riskTitle}>Moderate 34-66</Text>
              <Text style={styles.riskDesc}>Watch for warning signs.</Text>
            </View>
          </View>
          <View style={styles.riskItem}>
            <View style={[styles.riskDot, { backgroundColor: '#D9534F' }]} />
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
  root: { flex: 1, backgroundColor: '#F8F5F0' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },

  userSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E0D8',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B4332',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#5C6B6A',
    marginTop: 2,
  },

  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E0D8',
  },
  navIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  navIcon: {
    fontSize: 22,
  },
  navContent: {
    flex: 1,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B4332',
  },
  navDesc: {
    fontSize: 12,
    color: '#5C6B6A',
    marginTop: 2,
  },
  navArrow: {
    fontSize: 20,
    color: '#A8A098',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4332',
    marginTop: 16,
    marginBottom: 10,
  },
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E0D8',
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
    marginRight: 12,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4332',
  },
  riskDesc: {
    fontSize: 13,
    color: '#5C6B6A',
  },
});