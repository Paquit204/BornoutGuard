 import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import TopBar from '../components/TopBar';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

export default function CheckinListScreen() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setCheckins(data || []);
    }
    setLoading(false);
  };

  const handleAdd = (item: DailyCheckin) => {
    router.push({
      pathname: '/checkin',
      params: {
        studyHours: String(item.study_hours),
        sleepHours: String(item.sleep_hours),
        assignments: String(item.assignments),
        stressLevel: String(item.stress_level),
      },
    });
  };

  const handleEdit = (checkin: DailyCheckin) => {
    router.push({
      pathname: '/checkin-edit',
      params: { checkin: JSON.stringify(checkin) },
    });
  };

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
            const { error } = await supabase
              .from('daily_checkins')
              .delete()
              .eq('id', id);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Success', 'Check-in deleted.');
              fetchCheckins();
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: DailyCheckin }) => {
    const date = new Date(item.created_at).toLocaleDateString();
    const riskColor =
      item.risk_level === 'Low' ? Colors.success : item.risk_level === 'Moderate' ? Colors.warning : Colors.danger;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{date}</Text>
          <Text style={[styles.cardRisk, { color: riskColor }]}>{item.risk_level} Risk</Text>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.detail}>📚 {item.study_hours}h</Text>
          <Text style={styles.detail}>🛌 {item.sleep_hours}h</Text>
          <Text style={styles.detail}>📝 {item.assignments}</Text>
          <Text style={styles.detail}>⚡ {item.stress_level}/10</Text>
          <Text style={styles.detail}>🎭 {item.mood}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.addBtn]} onPress={() => handleAdd(item)}>
            <Text style={styles.actionText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleEdit(item)}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TopBar showBack />
      <View style={styles.container}>
        <Text style={styles.heading}>Manage Check-ins</Text>
        {checkins.length === 0 ? (
          <Text style={styles.noData}>No check-ins found. Tap Add on any card to duplicate.</Text>
        ) : (
          <FlatList
            data={checkins}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl },
  heading: { ...Typography.heading, marginTop: Spacing.sm, marginBottom: Spacing.lg },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardDate: { ...Typography.body, fontWeight: '600' },
  cardRisk: { ...Typography.body, fontWeight: '600' },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  detail: {
    ...Typography.small,
    color: Colors.textSecondary,
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: Spacing.sm,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtn: { backgroundColor: Colors.primary },
  editBtn: { backgroundColor: '#2563EB' },
  deleteBtn: { backgroundColor: Colors.danger },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  noData: {
    textAlign: 'center',
    marginTop: 40,
    ...Typography.body,
  },
});