 import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#F8F5F0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E0D8',
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E0D8',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  lang: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C6B6A',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  langActive: {
    color: '#FFFFFF',
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#5C6B6A',
    fontWeight: '500',
  },
});