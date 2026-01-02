import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';
import { userService } from '../../../lib/userService';
import { theme } from '../../../lib/theme';

const colors = {
  primary: theme.colors.primary,
  accent: theme.colors.accent,
  background: theme.colors.background,
  card: theme.colors.surface
};
const t = theme.typography;
const s = theme.spacing;

const XP_PER_LEVEL = 500;

export default function HomeScreen() {
  const router = useRouter();
  const { xp, levelNumber, xpToNextLevel, lessons, completedLessons, loading } = useProgress();
  const progressWithinLevel = xp % XP_PER_LEVEL;
  const progressPercentage = Math.min(1, progressWithinLevel / XP_PER_LEVEL);
  const formattedXp = xp.toLocaleString('es-ES');
  const [displayName, setDisplayName] = useState('Estudiante');
  const [roleLabel, setRoleLabel] = useState('Explorador');
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    let mounted = true;
    userService.getCurrentUser().then(({ user, profile, role }) => {
      if (!mounted) return;
      const name = profile?.full_name || user?.email || 'Estudiante';
      setDisplayName(name);
      setRoleLabel(role === 'admin' ? 'Administrador' : 'Explorador');
      setStreakDays(profile?.streak_days || 0);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const areaStats = useMemo(() => {
    const base = {
      vocabulario: { total: 0, completed: 0 },
      gramatica: { total: 0, completed: 0 },
      listening: { total: 0, completed: 0 }
    };
    lessons.forEach((ls) => {
      const key = ls.areaId || ls.area;
      if (!base[key]) return;
      base[key].total += 1;
      if (completedLessons.includes(ls.id)) base[key].completed += 1;
    });
    Object.keys(base).forEach((key) => {
      const entry = base[key];
      entry.percent = entry.total ? Math.round((entry.completed / entry.total) * 100) : 0;
    });
    return base;
  }, [lessons, completedLessons]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: s.xl }}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoDot} />
          <Text style={styles.brandText}>EnglishQuest</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={32} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>Hola, {displayName}</Text>
                <Text style={styles.role}>{roleLabel}</Text>
              </View>
              <View style={styles.xpPill}>
                <Ionicons name="flash-outline" size={18} color={colors.accent} />
                <Text style={styles.xpText}>{formattedXp} XP</Text>
              </View>
            </View>

            <View style={styles.progressBlock}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Progreso del nivel</Text>
                <Text style={styles.progressLabel}>Level {levelNumber}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercentage * 100}%` }]} />
              </View>
              <Text style={styles.progressHint}>{xpToNextLevel} XP para level {levelNumber + 1}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.cardPressed]}
            onPress={() => router.push('/(drawer)/(tabs)/vocabulario')}
          >
            <View style={styles.ctaLeft}>
              <View style={styles.ctaIcon}>
                <Ionicons name="rocket-outline" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.ctaText}>EMPEZAR A APRENDER</Text>
                <Text style={styles.ctaSub}>Racha: {streakDays} dias</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Areas de estudio</Text>
            <TouchableOpacity onPress={() => router.push('/(drawer)/(tabs)/vocabulario')}>
              <Text style={styles.sectionLink}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          <Pressable
            style={({ pressed }) => [styles.areaCard, pressed && styles.cardPressed]}
            onPress={() => router.push('/(drawer)/(tabs)/vocabulario')}
          >
            <View style={[styles.areaIconBlue, { backgroundColor: theme.colors.area.vocabulario }]}>
              <Ionicons name="book-outline" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.areaTitle}>Vocabulario</Text>
              <Text style={styles.areaStat}>
                {areaStats.vocabulario.completed} lecciones completadas ({areaStats.vocabulario.percent}%)
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {areaStats.vocabulario.completed}/{areaStats.vocabulario.total || 0}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1B5E20" />
          </Pressable>

          <View style={styles.miniRow}>
            <Pressable
              style={({ pressed }) => [
                styles.miniCard,
                { borderColor: theme.colors.area.gramatica },
                pressed && styles.cardPressed
              ]}
              onPress={() => router.push('/(drawer)/(tabs)/gramatica')}
            >
              <View style={[styles.miniIcon, { backgroundColor: theme.colors.area.gramatica }]}>
                <Ionicons name="pencil-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.miniTitle}>Gramatica</Text>
              <Text style={styles.miniStat}>
                {areaStats.gramatica.total} lecciones ({areaStats.gramatica.percent}% completadas)
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {areaStats.gramatica.completed}/{areaStats.gramatica.total || 0}
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.miniCard,
                { borderColor: theme.colors.area.listening },
                pressed && styles.cardPressed
              ]}
              onPress={() => router.push('/(drawer)/(tabs)/listening')}
            >
              <View style={[styles.miniIcon, { backgroundColor: theme.colors.area.listening }]}>
                <Ionicons name="headset-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.miniTitle}>Listening</Text>
              <Text style={styles.miniStat}>
                {areaStats.listening.completed} lecciones completadas ({areaStats.listening.percent}%)
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {areaStats.listening.completed}/{areaStats.listening.total || 0}
                </Text>
              </View>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: s.xl
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm
  },
  logoDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary
  },
  brandText: {
    ...t.h2,
    color: colors.primary
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: s.xl,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: s.md
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.md
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2E9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  greeting: {
    ...t.h3,
    color: theme.colors.textPrimary
  },
  role: {
    ...t.caption,
    color: theme.colors.textSecondary
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingVertical: s.sm,
    paddingHorizontal: s.md
  },
  xpText: {
    color: colors.primary,
    fontWeight: '700'
  },
  progressBlock: {
    gap: s.sm
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressTitle: {
    ...t.caption,
    color: theme.colors.textSecondary
  },
  progressLabel: {
    ...t.caption,
    fontWeight: '700',
    color: colors.primary
  },
  progressTrack: {
    height: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    overflow: 'hidden'
  },
  progressFill: {
    height: 12,
    backgroundColor: colors.accent,
    borderRadius: 10
  },
  progressHint: {
    ...t.small,
    color: theme.colors.textSecondary
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: s.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.md
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaText: {
    color: '#fff',
    ...t.h3
  },
  ctaSub: {
    color: '#d4f8dd',
    ...t.caption
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: s.sm,
    marginBottom: s.md
  },
  sectionTitle: {
    ...t.h2,
    color: theme.colors.textPrimary
  },
  sectionLink: {
    color: colors.primary,
    fontWeight: '700'
  },
  areaCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: s.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  areaIconBlue: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.area.vocabulario,
    alignItems: 'center',
    justifyContent: 'center'
  },
  areaTitle: {
    ...t.h3,
    color: theme.colors.textPrimary
  },
  areaStat: {
    ...t.caption,
    color: theme.colors.textSecondary
  },
  badge: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12
  },
  miniRow: {
    flexDirection: 'row',
    gap: s.md
  },
  miniCard: {
    flex: 1,
    borderRadius: 16,
    padding: s.xl,
    gap: s.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  miniIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  miniTitle: {
    ...t.h3,
    color: theme.colors.textPrimary
  },
  miniStat: {
    ...t.caption,
    color: theme.colors.textSecondary
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2
  }
});
