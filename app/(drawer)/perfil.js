import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../lib/userService';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function PerfilDrawerScreen() {
  const router = useRouter();
  const { lessons, completedLessons, loading } = useProgress();
  const [profile, setProfile] = useState({ total_xp: 0, current_level: 1, streak_days: 0 });
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    const { user } = await userService.getCurrentUser();
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('total_xp, current_level, streak_days, last_activity_date')
        .eq('id', user.id)
        .maybeSingle();
      if (!error && data) {
        setProfile({
          total_xp: data.total_xp || 0,
          current_level: data.current_level || 1,
          streak_days: data.streak_days || 0
        });
      }
    }
    setFetching(false);
  };

  const areaProgress = useMemo(() => {
    const totals = lessons.reduce((acc, ls) => {
      const key = ls.area || ls.areaId || 'area';
      acc[key] = acc[key] || { total: 0, completed: 0 };
      acc[key].total += 1;
      if (completedLessons.includes(ls.id)) acc[key].completed += 1;
      return acc;
    }, {});
    return Object.entries(totals).map(([areaKey, val]) => ({
      areaKey,
      percent: val.total ? Math.round((val.completed / val.total) * 100) : 0,
      total: val.total,
      completed: val.completed
    }));
  }, [lessons, completedLessons]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const isLoading = loading || fetching;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Perfil del estudiante</Text>
      <Text style={styles.sub}>Datos en vivo desde Supabase.</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Nivel actual</Text>
            <Text style={styles.cardValue}>{profile.current_level}</Text>
            <Text style={styles.cardHint}>{profile.total_xp} XP acumulados</Text>
            <Text style={styles.cardHint}>Racha: {profile.streak_days} dias</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Progreso por area</Text>
            {areaProgress.map((item) => (
              <Text key={item.areaKey} style={styles.areaItem}>
                {item.areaKey}: {item.completed}/{item.total} ({item.percent}%)
              </Text>
            ))}
          </View>
        </>
      )}

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
