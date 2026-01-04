import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../lib/userService';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

// Perfil del administrador con estadisticas agregadas de la plataforma.
export default function AdminProfile() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    lessonsCompleted: 0,
    avgScore: 0,
    topFailures: [],
    topUsers: []
  });

  // Hidrata datos de usuario y estadisticas de uso; redirige si no es admin.
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { user, role } = await userService.getCurrentUser();
      if (!mounted) return;
      if (role !== 'admin') {
        router.replace('/(drawer)/(tabs)');
        return;
      }
      setEmail(user?.email || '');
      setRole(role || 'admin');

      setLoading(true);
      try {
        const [
          { count: usersCount },
          { data: progressData },
          { data: answersData },
          { data: lessonsData },
          { data: questionsData }
        ] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('user_progress').select('lesson_id,is_completed,score,user_id'),
          supabase.from('user_answers').select('question_id,is_correct,user_id'),
          supabase.from('lessons').select('id,title'),
          supabase.from('questions').select('id,lesson_id')
        ]);

        const completed = (progressData || []).filter((p) => p.is_completed).length;
        const totalAnswers = (answersData || []).length;
        const correctAnswers = (answersData || []).filter((a) => a.is_correct).length;
        const avgScore = totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

        const questionLesson = {};
        (questionsData || []).forEach((q) => {
          if (q?.id) questionLesson[q.id] = q.lesson_id;
        });

        const answerStats = {};
        (answersData || []).forEach((ans) => {
          const lessonId = questionLesson[ans.question_id];
          if (!lessonId) return;
          const entry = answerStats[lessonId] || { attempts: 0, corrects: 0 };
          entry.attempts += 1;
          if (ans.is_correct) entry.corrects += 1;
          answerStats[lessonId] = entry;
        });

        const perLesson = {};
        (progressData || []).forEach((p) => {
          const key = p.lesson_id;
          perLesson[key] = perLesson[key] || { attempts: 0, fails: 0, scores: [] };
          perLesson[key].attempts += 1;
          perLesson[key].scores.push(p.score || 0);
          if (!p.is_completed) perLesson[key].fails += 1;
        });

        const lessonTotals = Object.entries(perLesson).map(([lessonId, obj]) => {
          const lesson = lessonsData?.find((l) => l.id === lessonId);
          const failRate = obj.attempts ? Math.round((obj.fails / obj.attempts) * 100) : 0;
          const avg = obj.scores.length
            ? Math.round(obj.scores.reduce((a, b) => a + b, 0) / obj.scores.length)
            : 0;
          const answerMeta = answerStats[lessonId];
          const accuracy = answerMeta?.attempts
            ? Math.round((answerMeta.corrects / answerMeta.attempts) * 100)
            : null;
          return {
            lessonId,
            title: lesson?.title || lessonId,
            attempts: obj.attempts,
            fails: obj.fails,
            failRate,
            avg,
            accuracy
          };
        });

        const topFailures = [...lessonTotals].sort((a, b) => b.failRate - a.failRate).slice(0, 3);

        const userActivity = {};
        (progressData || []).forEach((p) => {
          const key = p.user_id;
          userActivity[key] = userActivity[key] || { completed: 0 };
          if (p.is_completed) userActivity[key].completed += 1;
        });
        const topUsers = Object.entries(userActivity)
          .map(([userId, obj]) => ({ userId, completed: obj.completed }))
          .sort((a, b) => b.completed - a.completed)
          .slice(0, 5);

        if (!mounted) return;
        setStats({
          users: usersCount || 0,
          lessonsCompleted: completed,
          avgScore: Math.round(avgScore),
          topFailures,
          topUsers
        });
      } catch (err) {
        if (mounted) console.warn('No se pudieron cargar estadisticas', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Cierra sesion y vuelve al login publico.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Perfil admin</Text>
          <Text style={styles.text}>Gestiona cuenta, sesion y rendimiento.</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
          <Text style={styles.badgeText}>Activo</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.label}>Correo</Text>
          </View>
          <Text style={styles.value}>{email}</Text>
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>{role}</Text>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="people-outline" size={18} color={colors.primary} />
            <Text style={styles.label}>Usuarios</Text>
          </View>
          <Text style={styles.value}>{stats.users}</Text>
          <Text style={styles.label}>Promedio aciertos</Text>
          <Text style={styles.value}>{stats.avgScore}%</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="layers-outline" size={20} color={colors.primary} />
          <Text style={styles.metricLabel}>Lecciones completadas</Text>
          <Text style={styles.metricValue}>{stats.lessonsCompleted}</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="analytics-outline" size={20} color={colors.primary} />
          <Text style={styles.metricLabel}>Promedio aciertos</Text>
          <Text style={styles.metricValue}>{stats.avgScore}%</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.labelStrong}>Top reprobacion</Text>
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
        {loading ? (
          <Text style={styles.label}>Cargando...</Text>
        ) : stats.topFailures.length === 0 ? (
          <Text style={styles.label}>Sin datos</Text>
        ) : (
          stats.topFailures.map((item) => (
            <View key={item.lessonId} style={styles.listRow}>
              <View style={styles.bullet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.value}>{item.title}</Text>
                <Text style={styles.label}>
                  {item.failRate}% fallos · {item.attempts} intentos
                  {typeof item.accuracy === 'number' ? ` · aciertos ${item.accuracy}%` : ''}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.labelStrong}>Usuarios mas activos</Text>
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
        {loading ? (
          <Text style={styles.label}>Cargando...</Text>
        ) : stats.topUsers.length === 0 ? (
          <Text style={styles.label}>Sin datos</Text>
        ) : (
          stats.topUsers.map((item) => {
            const maskedId = item.userId ? `${String(item.userId).slice(0, 4)}...${String(item.userId).slice(-4)}` : 'usuario';
            return (
              <View key={item.userId} style={styles.listRow}>
                <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.label}>{maskedId}</Text>
                <Text style={styles.value}>{item.completed} completadas</Text>
              </View>
            );
          })
        )}
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
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
    gap: 14,
    paddingBottom: 28
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700'
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
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
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  label: {
    fontSize: 13,
    color: '#555'
  },
  labelStrong: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent
  },
  logout: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700'
  }
});
