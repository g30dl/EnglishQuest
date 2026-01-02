import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../../../lib/theme';

const colors = theme.colors;
const t = theme.typography;
const s = theme.spacing;

const LessonRow = memo(function LessonRow({ lesson, unlocked, completed, onPress, xpValue }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.lessonRow,
        !unlocked && styles.lessonRowLocked,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(lesson.id, unlocked)}
      disabled={!unlocked}
    >
      <View style={[styles.dot, !unlocked && styles.dotLocked]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>{lesson.title}</Text>
        <View style={styles.metaRowWrap}>
          <View style={styles.metaRow}>
            <Ionicons
              name={
                lesson.type === 'writing'
                  ? 'create-outline'
                  : lesson.type === 'listening'
                    ? 'headset-outline'
                    : 'book-outline'
              }
              size={18}
              color={
                lesson.type === 'listening'
                  ? colors.area.listening
                  : lesson.type === 'writing'
                    ? colors.area.gramatica
                    : colors.area.vocabulario
              }
            />
            <Text style={[styles.lessonMeta, !unlocked && styles.lockedText]}>{lesson.type}</Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpText}>+{xpValue} XP</Text>
          </View>
        </View>
      </View>
      {unlocked ? (
        completed ? (
          <View style={styles.badgeDone}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        ) : null
      ) : (
        <Ionicons name="lock-closed" size={18} color="#888" />
      )}
      <Text style={[styles.start, !unlocked && styles.lockedText]}>{unlocked ? 'Iniciar' : 'Bloqueado'}</Text>
    </Pressable>
  );
});

const LevelCard = memo(function LevelCard({ item, goToLesson, completedLessons, loadingLessons, xpGetter }) {
  return (
    <View style={[styles.levelCard, !item.unlocked && styles.levelCardLocked]}>
      <View style={styles.levelHeader}>
        <Text style={[styles.levelTitle, !item.unlocked && styles.lockedText]}>{item.name}</Text>
        {!item.unlocked && <Text style={styles.lockedBadge}>Se desbloquea en nivel {item.order || item.level}</Text>}
      </View>
      {item.lessons.length === 0 ? (
        <Text style={styles.empty}>{loadingLessons ? 'Cargando lecciones...' : 'Sin lecciones disponibles en este nivel.'}</Text>
      ) : (
        item.lessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            unlocked={item.unlocked}
            completed={completedLessons.includes(lesson.id)}
            onPress={goToLesson}
            xpValue={xpGetter ? xpGetter(lesson) : 0}
          />
        ))
      )}
    </View>
  );
});

export default function GramaticaScreen() {
  const router = useRouter();
  const { areas, levels, lessons, levelNumber, loadingLessons, loadingQuestions, completedLessons } = useProgress();

  const areaId = 'gramatica';
  const area = areas.find((a) => a.id === areaId);
  const levelsByArea = levels.filter((lvl) => lvl.areaId === areaId).sort((a, b) => (a.order || 0) - (b.order || 0));

  const groupedByLevel = levelsByArea.map((lvl) => {
    const lessonList = lessons.filter(
      (ls) => ls.areaId === areaId && ((ls.level || ls.order) === (lvl.order || lvl.level))
    );
    const unlocked = (lvl.order || 1) <= levelNumber;
    return { ...lvl, unlocked, lessons: lessonList };
  });

  const goToLesson = useCallback(
    (lessonId, unlocked) => {
      if (!unlocked) return;
      router.push(`/lesson/${areaId}/${lessonId}`);
    },
    [router]
  );

  const renderLevel = useCallback(
    ({ item }) => (
      <LevelCard
        item={item}
        goToLesson={goToLesson}
        completedLessons={completedLessons}
        loadingLessons={loadingLessons}
        colors={colors}
        t={t}
        s={s}
        xpGetter={(lesson) => lesson.xp_reward ?? lesson.xp ?? 0}
      />
    ),
    [completedLessons, goToLesson, loadingLessons]
  );

  return (
    <View style={styles.container}>
      {(loadingLessons || loadingQuestions) && (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      )}

      <FlatList
        data={groupedByLevel}
        keyExtractor={(item) => item.id}
        renderItem={renderLevel}
        extraData={completedLessons}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: s.xl,
    gap: s.md
  },
  heading: {
    ...t.h1,
    color: colors.primary
  },
  sub: {
    ...t.caption,
    color: colors.textSecondary
  },
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
  levelTitle: {
    ...t.h3,
    color: colors.textPrimary
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s.sm
  },
  levelCardLocked: {
    backgroundColor: '#f4f4f4',
    borderColor: colors.border
  },
  lockedBadge: {
    ...t.small,
    color: colors.textHint
  },
  lockedText: {
    color: colors.textHint
  },
  lessonRow: {
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm
  },
  lessonRowLocked: {
    opacity: 0.6
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
  lessonTitle: {
    ...t.h3,
    color: colors.primary
  },
  lessonMeta: {
    ...t.caption,
    color: colors.textSecondary
  },
  metaRowWrap: {
    marginTop: s.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s.md
  },
  start: {
    color: colors.accent,
    fontWeight: '700'
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
    fontSize: 11
  },
  badgeDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  empty: {
    ...t.caption,
    color: colors.textSecondary
  }
});
