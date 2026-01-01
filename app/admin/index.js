import { StyleSheet, View, Text } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminHome() {
  const { levels, lessons, questions, completedLessons, xp, users } = useProgress();

  const stats = [
    { label: 'Niveles', value: levels.length },
    { label: 'Lecciones', value: lessons.length },
    { label: 'Preguntas', value: questions.length },
    { label: 'Lecciones completadas', value: completedLessons.length }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Admin</Text>
      <Text style={styles.text}>Resumen rapido del contenido y progreso.</Text>

      <View style={styles.cards}>
        {stats.map((item) => (
          <View key={item.label} style={styles.card}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Accesos rapidos</Text>
        <Text style={styles.panelText}>Usa las pestañas inferiores para gestionar Niveles, Lecciones y Preguntas.</Text>
        <Text style={styles.panelText}>El rol admin puede ver y editar todo el contenido.</Text>
      </View>
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
    color: '#2e2e2e',
    marginBottom: 4
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
  panel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 6
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  panelText: {
    fontSize: 13,
    color: '#555'
  }
});
