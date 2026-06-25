 // app/welcome.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/login');   // ✅ go to Login screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Image
            source={require('../assets/images/logo.jpg')}
            style={styles.logo}
            resizeMode="cover" // 👈 Binago ito para mapuno ang buong box at matakpan ang mga puting gilid
            onError={() => console.log('Welcome logo not found')}
          />
        </View>

        <Text style={styles.title}>BurnoutGuard</Text>
        <Text style={styles.subtitle}>Academic Stress Monitor</Text>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.card,
    overflow: 'hidden', // Pinupunasan nito ang sumobrang image sa rounded corner
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...Typography.heading,
    fontSize: 34,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.subheading,
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: 48,
    alignItems: 'center',
    ...Shadows.button,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});