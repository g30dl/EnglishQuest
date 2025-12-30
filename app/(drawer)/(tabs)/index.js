import { StyleSheet, View, Text } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

export default function HomeScreen() {
  const { xp, levelNumber, xpToNextLevel, completedLessons } = useProgress();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Bienvenido a EnglishQuest</Text>
      <Text style={styles.sub}>Tu progreso</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nivel</Text>
        <Text style={styles.value}>{levelNumber}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>XP actual</Text>
        <Text style={styles.value}>{xp}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>XP para siguiente nivel</Text>
        <Text style={styles.value}>{xpToNextLevel}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Lecciones completadas</Text>
        <Text style={styles.value}>{completedLessons.length}</Text>
      </View>
    </View>
  );
}

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    gap: 12
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary
  },
  sub: {
    fontSize: 16,
    color: '#2e2e2e',
    marginBottom: 8
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  label: {
    fontSize: 14,
    color: '#555'
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 4
  }
});
