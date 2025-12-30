import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  background: '#E8F5E9'
};

export default function LeccionesScreen() {
  const { lessons, levels } = useProgress();

  const renderLesson = ({ item }) => {
    const levelName = levels.find((lvl) => lvl.id === item.levelId)?.name || 'Nivel';
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>Tipo: {item.type}</Text>
        <Text style={styles.meta}>Nivel: {levelName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Lecciones</Text>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 10
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e2e2e'
  },
  meta: {
    fontSize: 13,
    color: '#555'
  }
});
