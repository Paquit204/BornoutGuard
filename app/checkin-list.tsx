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
      item.risk_level === 'Low' ? '#10B981' : item.risk_level === 'Moderate' ? '#F59E0B' : '#EF4444';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{date}</Text>
          <Text style={[styles.cardRisk, { color: riskColor }]}>{item.risk_level} Risk</Text>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.detail}>📚 {item.study_hours}h</Text>
          <Text style={styles.detail}>😴 {item.sleep_hours}h</Text>
          <Text style={styles.detail}>📋 {item.assignments}</Text>
          <Text style={styles.detail}>😰 {item.stress_level}/10</Text>
          <Text style={styles.detail}>😊 {item.mood}</Text>
        </View>
        <View style={styles.cardActions}>
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
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TopBar showBack={true} />
      <View style={styles.container}>
        <Text style={styles.heading}>Manage Check-ins</Text>
        {checkins.length === 0 ? (
          <Text style={styles.noData}>No check-ins found.</Text>
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
  root: { flex: 1, backgroundColor: '#F8F5F0' },
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1B4332', marginTop: 8, marginBottom: 16 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#1B4332' },
  cardRisk: { fontSize: 14, fontWeight: '600' },
  cardDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  detail: { fontSize: 13, color: '#5C6B6A', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  editBtn: { backgroundColor: '#2D6A4F' },
  deleteBtn: { backgroundColor: '#D9534F' },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F5F0' },
  noData: { textAlign: 'center', color: '#5C6B6A', marginTop: 40 },
});