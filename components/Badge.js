import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../lib/theme';

const { colors, spacing: s, typography: t } = theme;

const variants = {
  primary: { backgroundColor: colors.primary, color: '#fff' },
  accent: { backgroundColor: colors.accent, color: '#fff' },
  neutral: { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border, bordered: true },
  success: { backgroundColor: '#E8F5E9', color: colors.success, borderColor: colors.success, bordered: true },
  error: { backgroundColor: '#FDECEA', color: colors.error, borderColor: colors.error, bordered: true }
};

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'accent'|'neutral'|'success'|'error'} props.variant
 * @param {string} [props.icon]
 * @param {() => void} [props.onPress]
 */
export function Badge({ children, variant = 'neutral', icon, onPress }) {
  const palette = variants[variant] || variants.neutral;
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      style={[
        styles.badge,
        { backgroundColor: palette.backgroundColor || palette.color },
        palette.bordered && { borderWidth: 1, borderColor: palette.borderColor }
      ]}
      hitSlop={onPress ? 6 : undefined}
      onPress={onPress}
    >
      {icon ? <Ionicons name={icon} size={14} color={palette.color} /> : null}
      <Text style={[styles.text, { color: palette.color }]}>{children}</Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: s.md,
    paddingVertical: s.xs,
    borderRadius: 999
  },
  text: {
    ...t.small,
    fontWeight: '700'
  }
});

