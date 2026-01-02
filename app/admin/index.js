import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
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
    { label: 'Areas', value: AREAS.length, icon: 'grid-outline', color: '#7C3AED' },
    { label: 'Niveles', value: levels.length, icon: 'layers-outline', color: '#00BFA6' },
    { label: 'Lecciones', value: lessons.length, icon: 'book-outline', color: '#2563EB' },
    { label: 'Preguntas', value: questions.length, icon: 'help-circle-outline', color: '#F97316' }
  ];

  const avgQuestions = lessons.length ? Math.round(questions.length / lessons.length) : 0;
  const avgLessons = levels.length ? Math.round(lessons.length / levels.length) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroTitle}>Panel administrador</Text>
          <Text style={styles.heroSub}>Gestiona areas, niveles, lecciones y preguntas.</Text>
        </View>
      </View>

      <View style={styles.cards}>
        {stats.map((item) => (
          <View key={item.label} style={styles.card}>
            <View style={[styles.iconBadge, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Promedio de preguntas por leccion</Text>
          <Text style={styles.metricValue}>{avgQuestions} preguntas</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Promedio de lecciones por nivel</Text>
          <Text style={styles.metricValue}>{avgLessons} lecciones</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Accesos rapidos</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Crear nivel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="library-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Crear leccion</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Crear pregunta</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 28
  },
  hero: {
    backgroundColor: '#D3F1E5',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#B7E4CF'
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary
  },
  heroSub: {
    fontSize: 14,
    color: '#2e2e2e'
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
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
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
  grid: {
    flexDirection: 'row',
    gap: 10
  },
  metric: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 4
  },
  metricLabel: {
    fontSize: 13,
    color: '#555'
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  quickActions: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#EEF7EF',
    borderWidth: 1,
    borderColor: '#D7EBDD'
  },
  actionText: {
    fontWeight: '700',
    color: colors.primary
  }
});

