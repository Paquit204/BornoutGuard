 import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
    const inWelcome = segments[0] === 'welcome';

    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/welcome');
    } else if (session && segments[0] === undefined) {
      router.replace('/dashboard');
    }
  }, [session, loading, segments]);

  if (loading) return <LoadingSpinner message="Starting BurnoutGuard..." />;

  const showFooter = session && segments[0] !== 'login' && segments[0] !== 'signup';

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="profile" />
      </Stack>
      {showFooter && <Footer />}
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