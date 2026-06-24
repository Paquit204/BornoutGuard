 // components/Footer.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '../constants/theme';

export default function Footer() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.langToggle}>
        <Text style={[styles.lang, styles.langActive]}>ENG</Text>
        <Text style={styles.lang}>INTL</Text>
      </View>
      <Text style={styles.timestamp}>
        {timeStr} · {dateStr}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  lang: {
    ...Typography.small,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  langActive: {
    color: '#FFFFFF',
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  timestamp: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});