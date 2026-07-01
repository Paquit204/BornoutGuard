 // app/login.tsx
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  Alert,
  Image, // ✅ import Image
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
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (error) {
        const msg = error.message;
        if (msg.includes('Email not confirmed') || msg.includes('User not found')) {
          Alert.alert('Login Failed', msg);
        } else {
          Alert.alert('Authentication Error', msg);
        }
      }
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Unexpected Error', e.message || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header with your logo image */}
        <View style={styles.headerBlock}>
          <View style={styles.brandIcon}>
            <Image
              source={require('../assets/images/logo.jpg')}   // ✅ your logo
              style={styles.logoImage}
              resizeMode="cover" // 👈 Ginawang cover para punan ang buong box nang walang white gaps
            />
          </View>
          <Text style={styles.title}>BurnoutGuard</Text>
          <Text style={styles.subtitle}>Sign in to monitor your wellness metrics</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="name@company.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
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
              variant="primary"
              style={styles.button}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: '#000000', // 👈 Pinalitan ng Black background mula sa Colors.primary
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.premium,
    overflow: 'hidden', // 👈 Tinitiyak na hindi lalagpas ang imahe sa rounded corners
  },
  logoImage: {
    width: '100%',  // 👈 Ginawang 100% para sakop ang buong lapad ng container
    height: '100%', // 👈 Ginawang 100% para sakop ang buong taas ng container
  },
  title: {
    ...Typography.heading,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.subheading,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.bodyBold,
    fontSize: 13,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  signUpText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontWeight: '600',
  },
});