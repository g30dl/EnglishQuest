import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function GramaticaScreen() {
  const router = useRouter();
  const { areas, levels, lessons, levelNumber, loadingLessons, loadingQuestions } = useProgress();

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

  const goToLesson = (lessonId, unlocked) => {
    if (!unlocked) return;
    router.push(`/lesson/${areaId}/${lessonId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Gramatica</Text>
      <Text style={styles.sub}>{area?.description || 'Refuerza estructuras y tiempos verbales.'}</Text>

      {(loadingLessons || loadingQuestions) && (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      )}

      <FlatList
        data={groupedByLevel}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.levelCard, !item.unlocked && styles.levelCardLocked]}>
            <View style={styles.levelHeader}>
              <Text style={[styles.levelTitle, !item.unlocked && styles.lockedText]}>{item.name}</Text>
              {!item.unlocked && (
                <Text style={styles.lockedBadge}>Se desbloquea en nivel {item.order || item.level}</Text>
              )}
            </View>
            {item.lessons.length === 0 ? (
              <Text style={styles.empty}>
                {loadingLessons ? 'Cargando lecciones...' : 'Sin lecciones disponibles en este nivel.'}
              </Text>
            ) : (
              item.lessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[styles.lessonRow, !item.unlocked && styles.lessonRowLocked]}
                  onPress={() => goToLesson(lesson.id, item.unlocked)}
                  disabled={!item.unlocked}
                >
                  <View style={[styles.dot, !item.unlocked && styles.dotLocked]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lessonTitle, !item.unlocked && styles.lockedText]}>{lesson.title}</Text>
                    <Text style={[styles.lessonMeta, !item.unlocked && styles.lockedText]}>
                      Tipo: {lesson.type}
                    </Text>
                  </View>
                  <Text style={[styles.start, !item.unlocked && styles.lockedText]}>
                    {item.unlocked ? 'Iniciar' : 'Bloqueado'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 10
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary
  },
  sub: {
    fontSize: 14,
    color: '#555'
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 8
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e2e2e'
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  levelCardLocked: {
    backgroundColor: '#f4f4f4',
    borderColor: '#d0d0d0'
  },
  lockedBadge: {
    fontSize: 12,
    color: '#777'
  },
  lockedText: {
    color: '#888'
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8
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
    backgroundColor: '#aaa'
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary
  },
  lessonMeta: {
    fontSize: 13,
    color: '#555'
  },
  start: {
    color: colors.accent,
    fontWeight: '700'
  },
  empty: {
    fontSize: 13,
    color: '#666'
  }
});
