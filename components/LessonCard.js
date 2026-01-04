import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../lib/theme';

const { colors, typography: t, spacing: s } = theme;

/**
 * @param {Object} props
 * @param {{ id: string, title: string, type: string, xp_reward?: number, xp?: number, areaId?: string, level?: number }} props.lesson
 * @param {boolean} props.unlocked
 * @param {boolean} props.completed
 * @param {(lessonId: string) => void} props.onPress
 * @param {boolean} [props.showXP]
 */
// Tarjeta individual de leccion; muestra tipo, XP y estado de bloqueo/completado.
export const LessonCard = memo(function LessonCard({ lesson, unlocked, completed, onPress, showXP = true }) {
  const xpValue = lesson?.xp_reward ?? lesson?.xp ?? 0;
  const typeColor = useMemo(() => {
    if (lesson?.type === 'listening') return colors.area?.listening || colors.warning;
    if (lesson?.type === 'writing') return colors.area?.gramatica || colors.primary;
    return colors.area?.vocabulario || colors.primary;
  }, [lesson?.type]);

  const iconName = lesson?.type === 'writing'
    ? 'create-outline'
    : lesson?.type === 'listening'
      ? 'headset-outline'
      : 'book-outline';

  const handlePress = () => {
    if (!unlocked) return;
    if (onPress) onPress(lesson?.id);
  };

  return (
    <Pressable
      accessibilityLabel={lesson?.title}
      hitSlop={6}
      onPress={handlePress}
      disabled={!unlocked}
      style={({ pressed }) => [
        styles.card,
        !unlocked && styles.cardLocked,
        completed && styles.cardCompleted,
        pressed && styles.cardPressed
      ]}
    >
      <View style={[styles.dot, !unlocked && styles.dotLocked]} />

      <View style={styles.content}>
        <Text style={[styles.title, !unlocked && styles.lockedText]} numberOfLines={2}>
          {lesson?.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.typeRow}>
            <Ionicons name={iconName} size={18} color={typeColor} />
            <Text style={[styles.metaText, !unlocked && styles.lockedText]}>{lesson?.type}</Text>
          </View>
          {showXP && (
            <View style={styles.xpPill}>
              <Text style={styles.xpText}>+{xpValue} XP</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.trailing}>
        {unlocked ? (
          completed ? (
            <View style={styles.badgeDone}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          ) : null
        ) : (
          <Ionicons name="lock-closed" size={18} color={colors.textHint} />
        )}
        <Text style={[styles.actionText, !unlocked && styles.lockedText]}>
          {unlocked ? 'Iniciar' : 'Bloqueado'}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.md,
    paddingVertical: s.md,
    paddingHorizontal: s.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface
  },
  cardLocked: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5'
  },
  cardCompleted: {
    borderColor: colors.accent,
    borderWidth: 1.5,
    backgroundColor: '#E8F5E9'
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  content: {
    flex: 1,
    gap: s.xs
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent
  },
  dotLocked: {
    backgroundColor: colors.textHint
  },
  title: {
    ...t.h3,
    color: colors.primary
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s.md
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm
  },
  metaText: {
    ...t.caption,
    color: colors.textSecondary
  },
  xpPill: {
    backgroundColor: colors.accent,
    paddingVertical: s.xs,
    paddingHorizontal: s.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  xpText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 10
  },
  trailing: {
    alignItems: 'center',
    gap: s.xs
  },
  actionText: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 15
  },
  badgeDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lockedText: {
    color: colors.textHint
  }
});
