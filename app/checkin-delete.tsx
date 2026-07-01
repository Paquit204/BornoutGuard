// app/checkin-delete.tsx
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
import TopBar from '../components/TopBar';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

export default function CheckinDeleteScreen() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Check-in',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('🟢 Deleting ID:', id);
            try {
              const { data: { user }, error: userError } = await supabase.auth.getUser();
              if (userError) throw userError;
              if (!user) throw new Error('Not logged in');
              console.log('👤 Current user:', user.id);

              const { error } = await supabase
                .from(TABLE_NAME)
                .delete()
                .eq('id', id);

              if (error) throw error;

              console.log('✅ Delete success');
              // Refresh list after deletion
              await fetchCheckins();
              Alert.alert('Success', 'Check-in deleted.');
            } catch (err: any) {
              console.error('❌ Delete error:', err);
              Alert.alert('Error', err.message || 'An error occurred.');
            }
          },
        },
      ]
    );
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
        <Text style={styles.pageTitle}>Delete Check-ins</Text>
        <Text style={styles.subText}>Select a check-in to delete (this cannot be undone).</Text>

        <FlatList
          data={checkins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No check-ins to delete</Text>
              <Text style={styles.emptySub}>You have no check-ins yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const date = new Date(item.created_at).toLocaleDateString();
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardDate}>{date}</Text>
                  <Text style={styles.cardScore}>Score: {Math.round(item.burnout_score)}</Text>
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.detail}>📚 {item.study_hours}h</Text>
                  <Text style={styles.detail}>🛌 {item.sleep_hours}h</Text>
                  <Text style={styles.detail}>⚡ {item.stress_level}/10</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl },
  pageTitle: { 
    ...Typography.heading, 
    marginTop: Spacing.sm, 
    marginBottom: Spacing.xs 
  },
  subText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
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
  cardScore: { ...Typography.body, fontWeight: '500', color: Colors.textSecondary },
  cardDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  detail: { ...Typography.small, color: Colors.textSecondary, backgroundColor: Colors.border, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 4 },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.heading, marginBottom: Spacing.sm },
  emptySub: { ...Typography.body, color: Colors.textSecondary },
});