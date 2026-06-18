 import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Footer from '../components/Footer';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleOpenApp = () => {
    router.replace('/dashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>BurnoutGuard</Text>
        <Text style={styles.subtitle}>FOR STUDENTS, BY DESIGN</Text>

        <View style={styles.divider} />

        <Text style={styles.heading}>Notice burnout before it notices you.</Text>
        <Text style={styles.description}>
          A two-minute daily check-in turns into a clear burnout score, gentle recommendations, and trend lines you'll actually read.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleOpenApp}>
          <Text style={styles.buttonText}>Open the app →</Text>
        </TouchableOpacity>

        <View style={styles.factorsContainer}>
          <View style={styles.factorRow}>
            <Text style={styles.factorLabel}>STRESS FACTOR</Text>
            <Text style={styles.factorPercent}>30%</Text>
          </View>
          <View style={styles.factorRow}>
            <Text style={styles.factorLabel}>SLEEP FACTOR</Text>
            <Text style={styles.factorPercent}>25%</Text>
          </View>
          <View style={styles.factorRow}>
            <Text style={styles.factorLabel}>STUDY FACTOR</Text>
            <Text style={styles.factorPercent}>25%</Text>
          </View>
          <View style={[styles.factorRow, styles.factorRowLast]}>
            <Text style={styles.factorLabel}>WORKLOAD</Text>
            <Text style={styles.factorPercent}>20%</Text>
          </View>
        </View>

        <Text style={styles.privacy}>
          No accounts. No tracking. Your check-ins live on your device.
        </Text>
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1B4332',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D6A4F',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E0D8',
    marginVertical: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B4332',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#5C6B6A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  factorsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    marginBottom: 20,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D8',
  },
  factorRowLast: {
    borderBottomWidth: 0,
  },
  factorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4332',
  },
  factorPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  privacy: {
    fontSize: 13,
    color: '#A8A098',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});