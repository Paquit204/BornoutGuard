 // app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup =
      segments[0] === 'login' ||
      segments[0] === 'signup' ||
      segments[0] === 'forgot-password';

    // ✅ If not logged in and not in auth group → show Welcome
    if (!session && !inAuthGroup) {
      router.replace('/welcome');
    } 
    // ✅ If logged in → go to Dashboard
    else if (session && (inAuthGroup || segments[0] === undefined)) {
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
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="checkin-list" />
        <Stack.Screen name="checkin-edit" />
        <Stack.Screen name="editprofile" />   {/* renamed from edit-profile */}
        <Stack.Screen name="settings" />
        <Stack.Screen name="report" />
        <Stack.Screen name="signout" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}