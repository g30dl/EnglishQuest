import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';
import { theme } from '../../../lib/theme';
import { LessonCard, LevelCard } from '../../../components';

const colors = theme.colors;
const s = theme.spacing;

// Lista de niveles y lecciones del area de vocabulario.
export default function VocabularioScreen() {
  const router = useRouter();
  const { levels, lessons, levelNumber, loadingLessons, loadingQuestions, completedLessons } = useProgress();

  const areaId = 'vocabulario';
  const levelsByArea = levels
    .filter((lvl) => lvl.areaId === areaId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Agrupa lecciones por nivel y marca cuales estan desbloqueadas para el usuario.
  const groupedByLevel = levelsByArea.map((lvl) => {
    const lessonList = lessons.filter((ls) => ls.areaId === areaId && ls.level === (lvl.order || lvl.level));
    const unlocked = (lvl.order || 1) <= levelNumber;
    return { ...lvl, unlocked, lessons: lessonList };
  });

  // Navega a la pantalla de la leccion si esta disponible.
  const goToLesson = (lessonId, unlocked) => {
    if (!unlocked) return;
    router.push(`/lesson/${areaId}/${lessonId}`);
  };

  return (
    <View style={styles.container}>
      {(loadingLessons || loadingQuestions) && (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {groupedByLevel.map((item) => (
          <LevelCard
            key={item.id}
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
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: s.xl,
    gap: s.md
  }
});
