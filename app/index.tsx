 import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function SplashScreen() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const router = useRouter();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withTiming(1, { duration: 800 });

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.iconContainer}>
          <Text style={styles.fallbackIcon}>🧠</Text>
          <Image
            source={require('../assets/images/BornoutGuard.png')}
            style={styles.logo}
            resizeMode="contain"
            onError={() => console.log('Splash logo not found')}
          />
        </View>
        <Text style={styles.title}>BurnoutGuard</Text>
        <Text style={styles.subtitle}>Academic Stress Monitor</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center' },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.card,
    position: 'relative',
    overflow: 'hidden',
    padding: Spacing.md,
  },
  fallbackIcon: {
    fontSize: 60,
    position: 'absolute',
    color: Colors.primary,
  },
  logo: {
    width: 80,
    height: 80,
    zIndex: 1,
  },
  title: {
    ...Typography.heading,
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.subheading,
    letterSpacing: 1,
  },
});