 // app/signout.tsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export default function SignOutScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('Signing out...');

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut();
        setStatus('Signed out successfully');
        setTimeout(() => {
          router.replace('/login');
        }, 500);
      } catch (error: any) {
        setStatus('Error signing out. Please try again.');
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      }
    };

    performSignOut();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    marginTop: Spacing.lg,
    ...Typography.body,
    color: Colors.textSecondary,
  },
});