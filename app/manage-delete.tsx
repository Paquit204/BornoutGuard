 // app/manage-delete.tsx
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
import DeleteModal from '../components/DeleteModal';
import TopBar from '../components/TopBar';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

export default function ManageDeleteScreen() {
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
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('❌ Fetch error:', error);
      Alert.alert('Error', error.message);
    } else {
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
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not logged in');

      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', selectedId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDeleteModalVisible(false);
      setSelectedId(null);
      await fetchCheckins();
      Alert.alert('Success', 'Check-in deleted.');
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setDeleting(false);
    }
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
        <Text style={styles.pageTitle}>🗑️ Manage Deletions</Text>
        <Text style={styles.subText}>Select a check‑in to delete permanently.</Text>

        <FlatList
          data={checkins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>✅</Text>
              <Text style={styles.emptyTitle}>No check‑ins to delete</Text>
              <Text style={styles.emptySub}>You have no check‑ins yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const date = new Date(item.created_at).toLocaleDateString();
            return (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <View>
                    <Text style={styles.cardDate}>{date}</Text>
                    <Text style={styles.cardScore}>Score: {Math.round(item.burnout_score)}</Text>
                    <Text style={styles.cardDetail}>📚 {item.study_hours}h  🛌 {item.sleep_hours}h  ⚡ {item.stress_level}/10</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(item.id, date)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl },
  pageTitle: { ...Typography.heading, marginTop: Spacing.sm, marginBottom: 4 },
  subText: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  list: { paddingBottom: 80 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: { ...Typography.body, fontWeight: '600' },
  cardScore: { ...Typography.small, color: Colors.textSecondary },
  cardDetail: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  deleteButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButtonText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.heading, marginBottom: Spacing.sm },
  emptySub: { ...Typography.body, color: Colors.textSecondary },
});