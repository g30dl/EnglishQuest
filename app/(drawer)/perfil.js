import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../lib/userService';
import { theme } from '../../lib/theme';

const colors = theme.colors;
const t = theme.typography;
const s = theme.spacing;

const areaPalette = {
  gramatica: '#7C3AED',
  grammar: '#7C3AED',
  vocabulario: '#2563EB',
  listening: '#F97316',
  speak: '#A78BFA'
};

export default function PerfilDrawerScreen() {
  const router = useRouter();
  const { lessons, completedLessons, loading } = useProgress();
  const [profile, setProfile] = useState({ total_xp: 0, current_level: 1, streak_days: 0, joined_at: null, full_name: '' });
  const [fetching, setFetching] = useState(false);
  const avatarSource = profile?.avatar_url ? { uri: profile.avatar_url } : require('../../assets/logo/logo.png');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    const { user } = await userService.getCurrentUser();
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('total_xp, current_level, streak_days, last_activity_date, full_name, created_at')
        .eq('id', user.id)
        .maybeSingle();
      if (!error && data) {
        setProfile({
          total_xp: data.total_xp || 0,
          current_level: data.current_level || 1,
          streak_days: data.streak_days || 0,
          joined_at: data.created_at,
          full_name: data.full_name || user.email || ''
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

    const areasOrdered = ['gramatica', 'vocabulario', 'listening', 'speak'];
    return areasOrdered
      .filter((key) => totals[key])
      .map((areaKey) => {
        const val = totals[areaKey];
        return {
          areaKey,
          percent: val.total ? Math.round((val.completed / val.total) * 100) : 0,
          total: val.total,
          completed: val.completed
        };
      });
  }, [lessons, completedLessons]);

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const isLoading = loading || fetching;
  const lessonsCompleted = completedLessons.length;
  const memberSince =
    profile.joined_at ? new Date(profile.joined_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '-';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity onPress={() => router.push('/(drawer)/configuracion')} style={styles.iconButton} hitSlop={10}>
          <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.identityCard}>
            <View style={styles.avatarWrap}>
              <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
              <View style={styles.badgeVerified}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name}>{profile.full_name || 'Estudiante'}</Text>
              <Text style={styles.levelXp}>
                Nivel: {profile.current_level} · {profile.total_xp} GANADOS
              </Text>
              <Text style={styles.memberSince}>Miembro desde {memberSince}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="flash-outline" size={22} color="#fbbf24" />
              <Text style={styles.statNumber}>{profile.total_xp.toLocaleString('es-ES')}</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="book-outline" size={22} color="#2563EB" />
              <Text style={styles.statNumber}>{lessonsCompleted}</Text>
              <Text style={styles.statLabel}>Lecciones</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="flame-outline" size={22} color="#F97316" />
              <Text style={styles.statNumber}>{profile.streak_days} dias</Text>
              <Text style={styles.statLabel}>Racha</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progreso por habilidad</Text>
          </View>
          <View style={styles.progressList}>
            {areaProgress.map((area) => (
              <View key={area.areaKey} style={styles.progressItem}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{area.areaKey}</Text>
                  <Text style={styles.progressPercent}>{area.percent}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${area.percent}%`,
                        backgroundColor: areaPalette[area.areaKey] || colors.accent
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: 24,
    gap: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  headerTitle: {
    ...t.h2,
    color: colors.textPrimary
  },
  iconButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 6,
    borderRadius: 10
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  badgeVerified: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  identityText: {
    flex: 1,
    gap: 4
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary
  },
  levelXp: {
    color: colors.accent,
    fontWeight: '700'
  },
  memberSince: {
    ...t.caption,
    color: colors.textSecondary
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  statLabel: {
    ...t.caption,
    color: colors.textSecondary
  },
  sectionHeader: {
    marginTop: 4
  },
  sectionTitle: {
    ...t.h3,
    color: colors.textPrimary
  },
  progressList: {
    gap: 12
  },
  progressItem: {
    gap: 6
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressLabel: {
    ...t.caption,
    color: colors.textPrimary,
    textTransform: 'capitalize'
  },
  progressPercent: {
    ...t.caption,
    fontWeight: '700',
    color: colors.textSecondary
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: 8,
    borderRadius: 4
  },
  logoutCard: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoutText: {
    color: colors.error,
    fontWeight: '800'
  }
});
