 import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password';
    const isAuthCallback = segments[0] === 'auth-callback';

    // On auth-callback, wait for session to be set
    if (isAuthCallback) return;

    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/welcome');
    } else if (session && segments[0] === undefined) {
      router.replace('/dashboard');
    }
  }, [session, loading, segments]);

  if (loading) return <LoadingSpinner message="Starting BurnoutGuard..." />;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="signout" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="auth-callback" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="report" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="checkin-list" />
        <Stack.Screen name="checkin-edit" />
        <Stack.Screen name="edit-profile" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F5F0' },
});