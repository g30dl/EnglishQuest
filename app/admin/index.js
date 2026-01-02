import { StyleSheet, View, Text } from 'react-native';
import { useProgress } from '../../context/ProgressContext';
import { AREAS } from '../../lib/constants';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminHome() {
  const { levels, lessons, questions } = useProgress();

  const stats = [
    { label: 'Areas', value: AREAS.length },
    { label: 'Niveles', value: levels.length },
    { label: 'Lecciones', value: lessons.length },
    { label: 'Preguntas', value: questions.length }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contenido</Text>
      <Text style={styles.text}>Administra areas, niveles, lecciones y preguntas.</Text>

      <View style={styles.cards}>
        {stats.map((item) => (
          <View key={item.label} style={styles.card}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Usa la vista unificada para CRUD en /admin/levels.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
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
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  card: {
    flexBasis: '48%',
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
    fontSize: 13,
    color: '#555'
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary
  },
  hint: {
    marginTop: 8,
    color: '#555'
  }
});

