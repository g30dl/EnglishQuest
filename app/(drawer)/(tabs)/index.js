import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';
import { userService } from '../../../lib/userService';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#F5F7F4',
  card: '#FFFFFF'
};

const XP_PER_LEVEL = 500;

export default function HomeScreen() {
  const router = useRouter();
  const { xp, levelNumber, xpToNextLevel, completedLessons } = useProgress();
  const progressWithinLevel = xp % XP_PER_LEVEL;
  const progressPercentage = Math.min(1, progressWithinLevel / XP_PER_LEVEL);
  const formattedXp = xp.toLocaleString('es-ES');
  const [displayName, setDisplayName] = useState('Estudiante');
  const [roleLabel, setRoleLabel] = useState('Explorador');

  useEffect(() => {
    let mounted = true;
    userService.getCurrentUser().then(({ user, profile, role }) => {
      if (!mounted) return;
      const name = profile?.full_name || user?.email || 'Estudiante';
      setDisplayName(name);
      setRoleLabel(role === 'admin' ? 'Administrador' : 'Explorador');
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoDot} />
          <Text style={styles.brandText}>EnglishQuest</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(drawer)/(tabs)/perfil')}>
          <Ionicons name="settings-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

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

      <TouchableOpacity style={styles.cta} onPress={() => router.push('/(drawer)/(tabs)/vocabulario')}>
        <View style={styles.ctaLeft}>
          <View style={styles.ctaIcon}>
            <Ionicons name="rocket-outline" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.ctaText}>EMPEZAR A APRENDER</Text>
            <Text style={styles.ctaSub}>Continua tu racha de 3 dias</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Areas de estudio</Text>
        <TouchableOpacity onPress={() => router.push('/(drawer)/(tabs)/vocabulario')}>
          <Text style={styles.sectionLink}>Ver todo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.areaCard}>
        <View style={styles.areaIconBlue}>
          <Ionicons name="book-outline" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.areaTitle}>Vocabulario</Text>
          <Text style={styles.areaStat}>12,750 palabras nuevas</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#1B5E20" />
      </View>

      <View style={styles.miniRow}>
        <View style={[styles.miniCard, { backgroundColor: '#F3E8FF' }]}>
          <View style={[styles.miniIcon, { backgroundColor: '#A855F7' }]}>
            <Ionicons name="pencil-outline" size={18} color="#fff" />
          </View>
          <Text style={styles.miniTitle}>Gramatica</Text>
          <Text style={styles.miniStat}>{completedLessons.length} temas</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: '#FFF4D6' }]}>
          <View style={[styles.miniIcon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="headset-outline" size={18} color="#fff" />
          </View>
          <Text style={styles.miniTitle}>Listening</Text>
          <Text style={styles.miniStat}>Sesiones activas</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logoDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1B1B'
  },
  role: {
    fontSize: 14,
    color: '#5b5b5b'
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  xpText: {
    color: colors.primary,
    fontWeight: '700'
  },
  progressBlock: {
    gap: 8
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressTitle: {
    fontSize: 14,
    color: '#555'
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#E6EDE4',
    borderRadius: 10,
    overflow: 'hidden'
  },
  progressFill: {
    height: 12,
    backgroundColor: colors.accent,
    borderRadius: 10
  },
  progressHint: {
    fontSize: 13,
    color: '#555'
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0f3f16',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16
  },
  ctaSub: {
    color: '#d4f8dd',
    fontSize: 13
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1B1B'
  },
  sectionLink: {
    color: colors.primary,
    fontWeight: '700'
  },
  areaCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  areaIconBlue: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B1B1B'
  },
  areaStat: {
    fontSize: 13,
    color: '#4B5563'
  },
  miniRow: {
    flexDirection: 'row',
    gap: 12
  },
  miniCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8
  },
  miniIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B1B1B'
  },
  miniStat: {
    fontSize: 13,
    color: '#4B5563'
  }
});
