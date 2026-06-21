 import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
          {/* Fallback emoji (always visible) */}
          <Text style={styles.fallbackIcon}>🧠</Text>
          {/* Your custom logo – shows on top of emoji when loaded */}
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
    backgroundColor: '#F8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center' },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative', // needed for absolute positioning of emoji
    overflow: 'hidden',
    padding: 12,
  },
  fallbackIcon: {
    fontSize: 60,
    position: 'absolute',
    color: '#2D6A4F',
  },
  logo: {
    width: 80,
    height: 80,
    zIndex: 1, // image stays on top of emoji
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B4332',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C6B6A',
    letterSpacing: 1,
  },
});