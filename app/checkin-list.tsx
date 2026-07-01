 // app/checkin-list.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from '../components/BottomNav';
import DeleteModal from '../components/DeleteModal';
import TopBar from '../components/TopBar';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

export default function CheckinListScreen() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const TABLE_NAME = 'daily_checkins';

  const fetchCheckins = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user found');
      router.replace('/login');
      return;
    }
    console.log('🔍 Fetching for user:', user.id);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('❌ Fetch error:', error);
      Alert.alert('Error', error.message);
    } else {
      console.log(`✅ Fetched ${data?.length || 0} check-ins`);
      setCheckins(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCheckins();
    }, [])
  );

  const confirmDelete = (id: string, date: string) => {
    setSelectedId(id);
    setSelectedDate(date);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    console.log('🟢 Deleting ID:', selectedId);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not logged in');

      // ✅ Gamitin ang id at user_id para sigurado
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', selectedId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Delete success');
      setDeleteModalVisible(false);
      setSelectedId(null);
      await fetchCheckins(); // Refresh
      Alert.alert('Success', 'Check-in deleted.');
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date().toDateString();
    const itemDate = new Date(dateString).toDateString();
    return today === itemDate;
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TopBar showBack />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>My Check-ins</Text>
          <TouchableOpacity 
            style={styles.manageButton} 
            onPress={() => router.push('/manage-delete')}
          >
            <Text style={styles.manageButtonText}>🗑️ Manage</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={checkins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No check-ins found</Text>
              <Text style={styles.emptySub}>Start by adding one!</Text>
              <TouchableOpacity 
                style={styles.emptyButton} 
                onPress={() => router.push('/checkin')}
              >
                <Text style={styles.emptyButtonText}>+ New Check-in</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const date = new Date(item.created_at).toLocaleDateString();
            const riskColor = item.risk_level === 'Low' ? Colors.success : item.risk_level === 'Moderate' ? Colors.warning : '#EF4444';
            const todayEntry = isToday(item.created_at);
            
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardDate}>{date}</Text>
                  <Text style={[styles.cardRisk, { color: riskColor }]}>{item.risk_level} Risk</Text>
                </View>
                
                <View style={styles.cardDetails}>
                  <Text style={styles.detail}>📚 {item.study_hours}h</Text>
                  <Text style={styles.detail}>🛌 {item.sleep_hours}h</Text>
                  <Text style={styles.detail}>⚡ {item.stress_level}/10</Text>
                </View>

                <View style={styles.cardActions}>
                  {todayEntry ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.editBtn]} 
                        onPress={() => router.push({ pathname: '/checkin-edit', params: { checkin: JSON.stringify(item) } })}
                      >
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.deleteBtn]} 
                        onPress={() => confirmDelete(item.id, date)}
                      >
                        <Text style={styles.actionText}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.viewBtn]} 
                        onPress={() => router.push({ pathname: '/checkin-view', params: { checkin: JSON.stringify(item) } })}
                      >
                        <Text style={styles.actionText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.deleteBtn]} 
                        onPress={() => confirmDelete(item.id, date)}
                      >
                        <Text style={styles.actionText}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* ✅ Delete Modal */}
      <DeleteModal
        visible={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedId(null);
        }}
        onConfirm={handleDelete}
        itemDate={selectedDate}
        loading={deleting}
      />

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  pageTitle: { 
    ...Typography.heading, 
    marginTop: Spacing.sm,
  },
  manageButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  list: { paddingBottom: 80 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  cardDate: { ...Typography.body, fontWeight: '600' },
  cardRisk: { ...Typography.body, fontWeight: '600' },
  cardDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  detail: { ...Typography.small, color: Colors.textSecondary, backgroundColor: Colors.border, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-start', gap: Spacing.sm },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  editBtn: { backgroundColor: '#2563EB' },
  deleteBtn: { backgroundColor: '#EF4444' },
  viewBtn: { backgroundColor: Colors.primary },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.heading, marginBottom: Spacing.sm },
  emptySub: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  emptyButton: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});