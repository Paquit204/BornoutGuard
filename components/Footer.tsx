 import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Footer() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
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
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E0D8',
  },
  text: {
    fontSize: 12,
    color: '#5C6B6A',
    fontWeight: '500',
  },
});