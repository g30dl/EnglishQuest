import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminHome() {
  const router = useRouter();
  const { levels, lessons, questions } = useProgress();

  const navItems = [
    { title: 'Niveles', hint: `${levels.length} creados`, path: '/admin/levels' },
    { title: 'Lecciones', hint: `${lessons.length} creadas`, path: '/admin/lessons' },
    { title: 'Preguntas', hint: `${questions.length} registradas`, path: '/admin/questions' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel administrador</Text>
      <Text style={styles.text}>Gestiona niveles, lecciones y preguntas de EnglishQuest.</Text>

      {navItems.map((item) => (
        <TouchableOpacity key={item.title} style={styles.card} onPress={() => router.push(item.path)}>
          <View>
            <Text style={styles.cardLabel}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.hint}</Text>
          </View>
          <Text style={styles.link}>Abrir</Text>
        </TouchableOpacity>
      ))}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  cardValue: {
    fontSize: 13,
    color: '#4B5563'
  },
  link: {
    color: colors.accent,
    fontWeight: '700'
  }
});
