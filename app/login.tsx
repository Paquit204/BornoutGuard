 import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
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

// Required for AuthSession to work
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (error) {
        const msg = error.message;
        if (
          msg.includes('Email not confirmed') ||
          msg.includes('User not confirmed') ||
          msg.includes('unconfirmed')
        ) {
          Alert.alert(
            'Email Not Confirmed',
            'Please check your Gmail to confirm your account before logging in.'
          );
        } else if (msg.includes('Invalid login credentials')) {
          Alert.alert(
            'No account found',
            'The email or password you entered is incorrect. Please sign up if you don\'t have an account.'
          );
        } else {
          Alert.alert('Login Failed', msg);
        }
        return;
      }

      if (!data.user?.confirmed_at) {
        Alert.alert(
          'Email Not Confirmed',
          'Please check your Gmail to confirm your account before logging in.'
        );
        return;
      }

      router.replace('/welcome');

    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(true);

    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'burnoutguard',
      });

      console.log('🔗 Redirect URI:', redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUri,
          scopes: 'email',
        },
      });

      if (error) {
        if (error.message.includes('provider is not enabled')) {
          Alert.alert(
            'Provider not enabled',
            `The ${provider} login is not yet configured. Please contact the app administrator.`
          );
        } else {
          Alert.alert('Social Login Error', error.message);
        }
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

        if (result.type === 'success') {
          // ✅ Wait a moment for Supabase to set the session
          setTimeout(async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              router.replace('/welcome');
            } else {
              // Try one more time
              setTimeout(async () => {
                const { data: retryData } = await supabase.auth.getSession();
                if (retryData.session) {
                  router.replace('/welcome');
                } else {
                  Alert.alert('Login Failed', 'Could not retrieve session. Please try again.');
                }
              }, 1000);
            }
          }, 500);
        } else if (result.type === 'cancel') {
          Alert.alert('Login Cancelled', 'You cancelled the login.');
        } else {
          Alert.alert('Login Failed', 'Something went wrong. Please try again.');
        }
      } else {
        Alert.alert('Error', 'No login URL returned from Supabase.');
      }

    } catch (err: any) {
      Alert.alert('Social Login Error', err.message || 'An unexpected error occurred.');
    } finally {
      setSocialLoading(false);
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
          <View style={styles.iconBox}>
            <Text style={styles.icon}>🧠</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to monitor your wellness</Text>
        </View>

        <View style={styles.form}>
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
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A8A098"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.socialDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
              onPress={() => handleSocialLogin('google')}
              disabled={socialLoading}
            >
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
              onPress={() => handleSocialLogin('facebook')}
              disabled={socialLoading}
            >
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>
          {socialLoading && <Text style={styles.loadingText}>Opening login...</Text>}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.link}>Sign Up</Text>
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
  header: { alignItems: 'center', marginBottom: 40 },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { fontSize: 36 },
  title: { fontSize: 28, fontWeight: '700', color: '#1B4332', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#5C6B6A' },
  form: { gap: 16 },
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
  forgotLink: { alignSelf: 'flex-end', marginTop: -6 },
  forgotText: { color: '#2D6A4F', fontSize: 13, fontWeight: '600' },
  button: { marginTop: 8 },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E0D8' },
  dividerText: { marginHorizontal: 12, color: '#A8A098', fontSize: 12 },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    color: '#5C6B6A',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: { color: '#5C6B6A', fontSize: 14 },
  link: { color: '#2D6A4F', fontSize: 14, fontWeight: '600' },
});