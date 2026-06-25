 // app/edit.tsx
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import TopBar from '../components/TopBar';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function EditScreen() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  React.useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile?.full_name]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your gallery to upload a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!profile) return;
    setUploading(true);

    try {
      const fileExt = uri.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      Alert.alert('Success', 'Profile photo updated!');
    } catch (error: any) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setUploading(false);
    }
  };

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
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Edit Profile</Text>
        <Text style={styles.subheading}>Update your personal information.</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={pickImage}
            disabled={uploading}
            activeOpacity={0.7}
          >
            <Feather name="camera" size={18} color={Colors.primary} />
            <Text style={styles.changePhotoText}>
              {uploading ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor={Colors.textMuted}
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
        </View>

        <CustomButton title="Save Changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  heading: { ...Typography.heading, marginTop: Spacing.sm },
  subheading: { ...Typography.subheading, marginTop: Spacing.xs, marginBottom: Spacing.xl },

  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.limeGlow,
    ...Shadows.card,
    gap: 8,
  },
  changePhotoText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.limeGlow,
    ...Shadows.card,
  },

  inputGroup: { marginBottom: Spacing.lg },
  label: { ...Typography.body, fontWeight: '500', marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledInput: {
    backgroundColor: Colors.border,
    color: Colors.textMuted,
  },
  hint: {
    ...Typography.small,
    marginTop: Spacing.xs,
  },
});