import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../lib/theme';

const { colors, spacing: s, typography: t } = theme;

/**
 * @param {Object} props
 * @param {string} props.icon
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.actionText]
 * @param {() => void} [props.onAction]
 */
export function EmptyState({ icon = 'information-circle-outline', title, message, actionText, onAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <Pressable style={styles.button} onPress={onAction} hitSlop={8}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: s.sm,
    padding: s.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  title: {
    ...t.h3,
    color: colors.textPrimary,
    textAlign: 'center'
  },
  message: {
    ...t.caption,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  button: {
    marginTop: s.xs,
    paddingHorizontal: s.lg,
    paddingVertical: s.sm,
    borderRadius: 12,
    backgroundColor: colors.accent
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800'
  }
});

