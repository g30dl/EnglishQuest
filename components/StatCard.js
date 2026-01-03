import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../lib/theme';

const { colors, spacing: s, typography: t } = theme;

/**
 * @param {Object} props
 * @param {string} props.icon
 * @param {string} props.iconColor
 * @param {string} props.label
 * @param {string|number} props.value
 */
export function StatCard({ icon, iconColor = colors.primary, label, value }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBubble, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingVertical: s.lg,
    paddingHorizontal: s.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: s.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    ...t.caption,
    color: colors.textSecondary
  },
  value: {
    ...t.h2,
    color: colors.textPrimary
  }
});

