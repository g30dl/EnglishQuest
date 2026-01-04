import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../lib/theme';

const { colors, spacing: s, typography: t } = theme;

/**
 * @param {Object} props
 * @param {boolean} props.visible
 * @param {string} props.title
 * @param {() => void} props.onClose
 * @param {() => void} props.onSave
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.saveDisabled]
 */
// Modal generico para formularios de creacion/edicion con acciones de guardar/cancelar.
export function FormModal({ visible, title, onClose, onSave, children, saveDisabled = false }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar modal" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable hitSlop={10} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.content}>{children}</View>

          <View style={styles.footer}>
            <Pressable style={[styles.button, styles.secondary]} onPress={onClose} hitSlop={6}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.primary, saveDisabled && styles.disabled]}
              onPress={onSave}
              disabled={saveDisabled}
              hitSlop={6}
            >
              <Text style={styles.primaryText}>{saveDisabled ? 'Guardando...' : 'Guardar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: s.xl,
    gap: s.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    ...t.h3,
    color: colors.textPrimary
  },
  content: {
    gap: s.sm
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: s.md
  },
  button: {
    paddingVertical: s.sm,
    paddingHorizontal: s.lg,
    borderRadius: 12
  },
  primary: {
    backgroundColor: colors.accent
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800'
  },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  secondaryText: {
    color: colors.textPrimary,
    fontWeight: '700'
  },
  disabled: {
    opacity: 0.6
  }
});
