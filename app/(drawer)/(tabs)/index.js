import { StyleSheet, View, Text } from 'react-native';
import { useProgress } from '../../_context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

const XP_PER_LEVEL = 500;

export default function HomeScreen() {
  const { xp, levelNumber, xpToNextLevel, completedLessons } = useProgress();
  const progressWithinLevel = xp % XP_PER_LEVEL;
  const progressPercentage = Math.min(1, progressWithinLevel / XP_PER_LEVEL);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Bienvenido a EnglishQuest</Text>
      <Text style={styles.sub}>Tu panel personal para seguir avanzando</Text>

      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>Nivel actual</Text>
          <Text style={styles.heroLevel}>{levelNumber}</Text>
        </View>
        <Text style={styles.heroXp}>{xp} XP acumulados</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercentage * 100}%` }]} />
        </View>
        <Text style={styles.progressHint}>{xpToNextLevel} XP para llegar al siguiente nivel</Text>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Lecciones completadas</Text>
          <Text style={styles.cardValue}>{completedLessons.length}</Text>
          <Text style={styles.cardHint}>Ganas 50 XP por cada leccion finalizada</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>XP por respuesta</Text>
          <Text style={styles.cardValue}>+10 XP</Text>
          <Text style={styles.cardHint}>Las respuestas correctas suman rapido</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    gap: 14
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary
  },
  sub: {
    fontSize: 16,
    color: '#2e2e2e'
  },
  hero: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 8
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  heroLabel: {
    fontSize: 14,
    color: '#555'
  },
  heroLevel: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.accent
  },
  heroXp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e2e2e'
  },
  progressTrack: {
    height: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden'
  },
  progressFill: {
    height: 10,
    backgroundColor: colors.accent
  },
  progressHint: {
    fontSize: 13,
    color: '#555'
  },
  cardsRow: {
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
    color: colors.primary,
    marginVertical: 4
  },
  cardHint: {
    fontSize: 12,
    color: '#666'
  }
});
