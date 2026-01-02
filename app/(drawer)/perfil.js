import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../lib/userService';
import { theme } from '../../lib/theme';

const colors = theme.colors;
const t = theme.typography;
const s = theme.spacing;

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
            <View style={styles.row}>
              <Ionicons name="trophy" size={22} color={colors.accent} />
              <Text style={styles.cardLabel}>Nivel actual</Text>
            </View>
            <Text style={styles.cardValue}>{profile.current_level}</Text>
            <View style={styles.row}>
              <Ionicons name="star" size={20} color={colors.accent} />
              <Text style={styles.cardHint}>{profile.total_xp} XP acumulados</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="flame" size={20} color="#F57C00" />
              <Text style={styles.cardHint}>Racha: {profile.streak_days} dias</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="library" size={20} color={colors.primary} />
              <Text style={styles.cardHint}>
                Lecciones completadas: {completedLessons.length}/{lessons.length}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="bar-chart" size={20} color={colors.primary} />
              <Text style={styles.cardLabel}>Progreso por area</Text>
            </View>
            {areaProgress.map((item) => (
              <View key={item.areaKey} style={styles.row}>
                <Ionicons name="checkmark-done-circle" size={18} color={colors.accent} />
                <Text style={styles.areaItem}>
                  {item.areaKey}: {item.completed}/{item.total} ({item.percent}%)
                </Text>
              </View>
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
    padding: s.xl,
    gap: s.md
  },
  heading: {
    ...t.h1,
    color: colors.primary
  },
  sub: {
    ...t.caption,
    color: colors.textSecondary
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: s.xl,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: s.sm
  },
  cardLabel: {
    ...t.caption,
    color: colors.textSecondary
  },
  cardValue: {
    ...t.h2,
    color: colors.accent
  },
  cardHint: {
    ...t.small,
    color: colors.textHint
  },
  areaItem: {
    ...t.caption,
    color: colors.textPrimary
  },
  logout: {
    marginTop: s.sm,
    backgroundColor: colors.error,
    paddingVertical: s.md,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700'
  }
});
