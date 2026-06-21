import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
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
import { supabase } from '../lib/supabase';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleSignup = async () => {
    // --- Validation ---
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (cooldown) {
      Alert.alert('Please wait', 'You are trying too many times. Please wait a few minutes and try again.');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Attempting sign-up with:', { email, fullName });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      // Log the full response (check Metro terminal)
      console.log('🔐 Signup response:', JSON.stringify({ data, error }, null, 2));

      if (error) {
        // --- Handle rate-limit specifically ---
        if (
          error.message.includes('rate limit') ||
          error.message.includes('too many requests') ||
          error.message.includes('email rate limit')
        ) {
          Alert.alert(
            'Too many attempts',
            'You are trying too many times. Please wait a few minutes and try again.'
          );
          setCooldown(true);
          if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
          cooldownTimer.current = setTimeout(() => {
            setCooldown(false);
          }, 120000);
          return;
        }

        // Other errors
        let message = error.message;
        if (error.message.includes('User already registered')) {
          message = 'This email is already registered. Please sign in instead.';
        } else if (error.message.includes('Email provider is disabled')) {
          message = 'Email/Password sign-up is currently disabled. Please contact support.';
        } else if (error.message.includes('Invalid email')) {
          message = 'Please enter a valid email address.';
        } else if (error.message.includes('Network request failed')) {
          message = 'Network error. Please check your internet connection.';
        } else {
          message = `Sign-up failed: ${error.message}`;
        }
        Alert.alert('Signup Failed', message);
        return;
      }

      // Check if user was actually created
      if (!data.user) {
        Alert.alert('Signup Error', 'We could not create your account. Please try again.');
        return;
      }

      console.log('✅ User created:', data.user.id);

      // Success – sign out to force email confirmation
      await supabase.auth.signOut();

      Alert.alert(
        'Account created successfully',
        'Please check your Gmail to confirm your account before logging in.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );

    } catch (err: any) {
      console.error('🔥 Unexpected signup error:', err);
      Alert.alert(
        'Signup Error',
        'An unexpected error occurred. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your wellness journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#A8A098"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@university.edu"
              placeholderTextColor="#A8A098"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor="#A8A098"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor="#A8A098"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <CustomButton
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            disabled={cooldown}
            style={styles.button}
          />

          {cooldown && (
            <Text style={styles.cooldownText}>
              Please wait a few minutes before trying again.
            </Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F0' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#1B4332', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#5C6B6A' },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { color: '#1B4332', fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    color: '#1B4332',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E0D8',
  },
  button: { marginTop: 8 },
  cooldownText: {
    textAlign: 'center',
    color: '#D9534F',
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: { color: '#5C6B6A', fontSize: 14 },
  link: { color: '#2D6A4F', fontSize: 14, fontWeight: '600' },
});