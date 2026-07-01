// components/DeleteModal.tsx
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';

interface DeleteModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  itemDate?: string;
  loading?: boolean;
}

export default function DeleteModal({ 
  visible, 
  onCancel, 
  onConfirm, 
  itemDate,
  loading = false 
}: DeleteModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>🗑️ Delete Check‑in</Text>
          <Text style={styles.message}>
            Are you sure you want to permanently delete this check‑in?
            {itemDate && `\nDate: ${itemDate}`}
          </Text>
          <Text style={styles.warning}>This action cannot be undone.</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.xl,
    width: '85%',
    ...Shadows.card,
  },
  title: {
    ...Typography.heading,
    fontSize: 20,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    color: Colors.textSecondary,
  },
  warning: {
    ...Typography.small,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});