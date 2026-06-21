 import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The AuthSession already handles the redirect, so we just go to welcome.
    router.replace('/welcome');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D6A4F" />
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
});