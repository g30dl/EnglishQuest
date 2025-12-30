import { StyleSheet, View, Text } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminHome() {
  const { areas, levels, lessons, questions } = useProgress();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel administrativo</Text>
      <Text style={styles.text}>Gestiona niveles, lecciones y preguntas.</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Areas</Text>
          <Text style={styles.cardValue}>{areas.length}</Text>
          <Text style={styles.cardHint}>Definen el enfoque de aprendizaje</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Niveles</Text>
          <Text style={styles.cardValue}>{levels.length}</Text>
          <Text style={styles.cardHint}>Desbloqueo progresivo</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Lecciones</Text>
          <Text style={styles.cardValue}>{lessons.length}</Text>
          <Text style={styles.cardHint}>Reading, Writing o Listening</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Preguntas</Text>
          <Text style={styles.cardValue}>{questions.length}</Text>
          <Text style={styles.cardHint}>Evalua y otorga XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
    gap: 12
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary
  },
  text: {
    fontSize: 14,
    color: '#2e2e2e'
  },
  grid: {
    flexDirection: 'row',
    gap: 12
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  cardLabel: {
    fontSize: 14,
    color: '#555'
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.accent,
    marginVertical: 4
  },
  cardHint: {
    fontSize: 12,
    color: '#666'
  }
});
