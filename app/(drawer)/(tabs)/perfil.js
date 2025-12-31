import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';
import { supabase } from '../../../lib/supabaseClient';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function PerfilScreen() {
  const router = useRouter();
  const { xp, levelNumber, completedLessons, unlockedLevels, areas } = useProgress();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Perfil del estudiante</Text>
      <Text style={styles.sub}>Configura tus metas y revisa tu avance</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Nivel</Text>
        <Text style={styles.cardValue}>{levelNumber}</Text>
        <Text style={styles.cardHint}>{xp} XP acumulados</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Progreso</Text>
        <Text style={styles.cardValue}>{completedLessons.length} lecciones</Text>
        <Text style={styles.cardHint}>Niveles desbloqueados: {unlockedLevels.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Areas disponibles</Text>
        {areas.map((area) => (
          <Text key={area.id} style={styles.areaItem}>
            {area.name} - {area.description}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 10
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary
  },
  sub: {
    fontSize: 14,
    color: '#555'
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
    gap: 6
  },
  cardLabel: {
    fontSize: 14,
    color: '#555'
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent
  },
  cardHint: {
    fontSize: 13,
    color: '#666'
  },
  areaItem: {
    fontSize: 13,
    color: '#2e2e2e'
  },
  logout: {
    marginTop: 8,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700'
  }
});
