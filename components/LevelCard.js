import React, { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../lib/theme';
import { LessonCard } from './LessonCard';

const { colors, typography: t, spacing: s } = theme;

/**
 * @param {Object} props
 * @param {{ id: string, name: string, order?: number, level?: number, unlocked?: boolean }} props.level
 * @param {Array} [props.lessons]
 * @param {(lesson: any, unlocked: boolean) => React.ReactNode} [props.renderLesson]
 * @param {boolean} [props.loading]
 * @param {string} [props.emptyMessage]
 * @param {React.ReactNode} [props.children]
 * @param {() => void} [props.onToggle]
 * @param {boolean} [props.isExpanded]
 * @param {(lessonId: string, unlocked: boolean) => void} [props.onLessonPress]
 * @param {string[]} [props.completedLessonIds]
 */
export const LevelCard = memo(function LevelCard({
  level,
  lessons = [],
  renderLesson,
  loading = false,
  emptyMessage = 'Sin lecciones disponibles en este nivel.',
  children,
  onToggle,
  isExpanded = true,
  onLessonPress,
  completedLessonIds = []
}) {
  const unlocked = level?.unlocked;
  const renderChevron = Boolean(onToggle);
  const showBody = isExpanded ?? true;

  return (
    <View style={[styles.levelCard, !unlocked && styles.levelCardLocked]}>
      <Pressable
        onPress={onToggle}
        disabled={!onToggle}
        hitSlop={6}
        style={styles.levelHeader}
      >
        <View style={styles.titleRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Nivel {level?.order || level?.level || '-'}</Text>
          </View>
          <Text style={[styles.levelTitle, !unlocked && styles.lockedText]}>{level?.name}</Text>
        </View>
        <View style={styles.headerRight}>
          {!unlocked && (
            <Text style={styles.lockedBadge}>Se desbloquea en nivel {level?.order || level?.level}</Text>
          )}
          {renderChevron && (
            <Ionicons
              name={showBody ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          )}
        </View>
      </Pressable>

      {showBody && (
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.loadingText}>Cargando lecciones...</Text>
            </View>
          ) : lessons.length === 0 ? (
            <Text style={styles.empty}>{emptyMessage}</Text>
          ) : (
            lessons.map((lesson) =>
              renderLesson ? (
                <React.Fragment key={lesson.id}>{renderLesson(lesson, Boolean(unlocked))}</React.Fragment>
              ) : (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  unlocked={Boolean(unlocked)}
                  completed={completedLessonIds.includes(lesson.id)}
                  onPress={(lessonId) => onLessonPress && onLessonPress(lessonId, Boolean(unlocked))}
                />
              )
            )
          )}
          {children}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: s.xl,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: s.sm
  },
  levelCardLocked: {
    backgroundColor: '#f4f4f4',
    borderColor: colors.border
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s.sm
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm
  },
  levelTitle: {
    ...t.h3,
    color: colors.textPrimary
  },
  levelBadge: {
    paddingHorizontal: s.md,
    paddingVertical: s.xs,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  levelBadgeText: {
    ...t.small,
    color: colors.textSecondary,
    fontWeight: '700'
  },
  lockedBadge: {
    ...t.small,
    color: colors.textHint
  },
  lockedText: {
    color: colors.textHint
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm
  },
  body: {
    gap: s.sm
  },
  empty: {
    ...t.caption,
    color: colors.textSecondary
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm
  },
  loadingText: {
    ...t.caption,
    color: colors.textSecondary
  }
});
