import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useProgress } from '../../_context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  background: '#E8F5E9'
};

export default function PreguntasScreen() {
  const { questions, lessons } = useProgress();

  const renderQuestion = ({ item }) => {
    const lessonTitle = lessons.find((ls) => ls.id === item.lessonId)?.title || 'Leccion';
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{item.prompt}</Text>
        <Text style={styles.meta}>Tipo: {item.type}</Text>
        <Text style={styles.meta}>Leccion: {lessonTitle}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Preguntas</Text>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={renderQuestion}
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
