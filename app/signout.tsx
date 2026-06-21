import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
        // Redirect to login after a short delay
        setTimeout(() => {
          router.replace('/login');
        }, 500);
      } catch (error: any) {
        setStatus('Error signing out. Please try again.');
        // Still navigate after a delay
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      }
    };

    performSignOut();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D6A4F" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5F0',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#5C6B6A',
  },
});