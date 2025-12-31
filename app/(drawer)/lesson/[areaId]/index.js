import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProgress } from '../../../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AreaDetailScreen() {
  const { areaId } = useLocalSearchParams();
  const router = useRouter();
  const { areas, levels, lessons, unlockedLevels } = useProgress();

  const area = areas.find((a) => a.id === areaId);
  const availableLevels = unlockedLevels.filter((lvl) => lvl.areaId === areaId);
  const availableLessons = lessons.filter((ls) => availableLevels.some((lvl) => lvl.id === ls.levelId));

  const groupedByLevel = availableLevels.map((lvl) => ({
    ...lvl,
    lessons: availableLessons.filter((ls) => ls.levelId === lvl.id)
  }));

  const goToLesson = (lessonId) => {
    router.push(`/lesson/${areaId}/${lessonId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{area?.name || 'Area'} - Lecciones</Text>
      <Text style={styles.sub}>Selecciona un nivel desbloqueado para empezar.</Text>

      <FlatList
        data={groupedByLevel}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.levelCard}>
            <Text style={styles.levelTitle}>{item.name}</Text>
            {item.lessons.length === 0 ? (
              <Text style={styles.empty}>Sin lecciones disponibles en este nivel.</Text>
            ) : (
              item.lessons.map((lesson) => (
                <TouchableOpacity key={lesson.id} style={styles.lessonRow} onPress={() => goToLesson(lesson.id)}>
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonMeta}>Tipo: {lesson.type}</Text>
                  </View>
                  <Text style={styles.start}>Iniciar</Text>
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
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent
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
