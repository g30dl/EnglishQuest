import React, { useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';
import { theme } from '../../../lib/theme';
import { LessonCard, LevelCard } from '../../../components';

const colors = theme.colors;
const s = theme.spacing;

export default function GramaticaScreen() {
  const router = useRouter();
  const { areas, levels, lessons, levelNumber, loadingLessons, loadingQuestions, completedLessons } = useProgress();

  const areaId = 'gramatica';
  const area = areas.find((a) => a.id === areaId);
  const levelsByArea = levels
    .filter((lvl) => lvl.areaId === areaId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const groupedByLevel = levelsByArea.map((lvl) => {
    const lessonList = lessons.filter((ls) => ls.areaId === areaId && ls.level === (lvl.order || lvl.level));
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
        level={item}
        lessons={item.lessons}
        loading={loadingLessons}
        completedLessonIds={completedLessons}
        onLessonPress={goToLesson}
        renderLesson={(lesson, unlocked) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            unlocked={unlocked}
            completed={completedLessons.includes(lesson.id)}
            onPress={(lessonId) => goToLesson(lessonId, unlocked)}
          />
        )}
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
  }
});
