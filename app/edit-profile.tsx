import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!profile) return;
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name cannot be empty.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile.id);

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully.');
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar showBack={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Edit Profile</Text>
        <Text style={styles.subheading}>Update your personal information.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profile?.email || ''}
            editable={false}
          />
          <Text style={styles.hint}>Email cannot be changed.</Text>
        </View>

        <CustomButton title="Save Changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F5F0' },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1B4332', marginTop: 8 },
  subheading: { fontSize: 14, color: '#5C6B6A', marginTop: 4, marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#1B4332', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    color: '#1B4332',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E0D8',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  hint: {
    fontSize: 12,
    color: '#A8A098',
    marginTop: 4,
  },
});