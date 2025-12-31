import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AreasScreen() {
  const router = useRouter();
  const { areas, unlockedLevels, lessons } = useProgress();

  const renderArea = ({ item }) => {
    const availableLevels = unlockedLevels.filter((lvl) => lvl.areaId === item.id);
    const areaLessons = lessons.filter((ls) => availableLevels.some((lvl) => lvl.id === ls.levelId));

    return (
      <View style={styles.areaCard}>
        <View style={[styles.badge, { backgroundColor: item.color || colors.primary }]} />
        <View style={styles.areaContent}>
          <Text style={styles.areaTitle}>{item.name}</Text>
          <Text style={styles.areaDesc}>{item.description}</Text>
          <Text style={styles.meta}>{availableLevels.length} niveles desbloqueados</Text>
          <Text style={styles.meta}>{areaLessons.length} lecciones disponibles</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push(`/lesson/${item.id}`)}>
            <Text style={styles.buttonText}>Explorar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Areas de aprendizaje</Text>
      <FlatList
        data={areas}
        keyExtractor={(item) => item.id}
        renderItem={renderArea}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12
  },
  areaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  badge: {
    width: 10,
    borderRadius: 6,
    marginVertical: 8
  },
  areaContent: {
    flex: 1,
    gap: 4
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e2e2e'
  },
  areaDesc: {
    fontSize: 14,
    color: '#555'
  },
  meta: {
    fontSize: 13,
    color: colors.primary
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
