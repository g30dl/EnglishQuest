import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'expo-router';
import { userService } from '../../lib/userService';
import { useEffect, useState } from 'react';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

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
    topUsers: [],
    lessonTotals: []
  });

  useEffect(() => {
    userService.getCurrentUser().then(({ user, role }) => {
      setEmail(user?.email || '');
      setRole(role || 'admin');
    });

    const fetchStats = async () => {
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
        const avgScore =
          (progressData || []).reduce((sum, p) => sum + (p.score || 0), 0) /
          Math.max((progressData || []).length, 1);

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

        setStats({
          users: usersCount || 0,
          lessonsCompleted: completed,
          avgScore: Math.round(avgScore),
          topFailures,
          topUsers,
          lessonTotals
        });
      } catch (err) {
        console.warn('No se pudieron cargar estadisticas', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil admin</Text>
      <Text style={styles.text}>Gestiona tu cuenta y sesion.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{email}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{role}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Usuarios registrados</Text>
        <Text style={styles.value}>{stats.users}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Lecciones completadas</Text>
        <Text style={styles.value}>{stats.lessonsCompleted}</Text>
        <Text style={styles.label}>Promedio aciertos</Text>
        <Text style={styles.value}>{stats.avgScore}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Top reprobacion</Text>
        {loading ? (
          <Text style={styles.label}>Cargando...</Text>
        ) : stats.topFailures.length === 0 ? (
          <Text style={styles.label}>Sin datos</Text>
        ) : (
          stats.topFailures.map((item) => (
            <Text key={item.lessonId} style={styles.value}>
              {item.title}: {item.failRate}% fallos (intentos {item.attempts}
              {typeof item.accuracy === 'number' ? `, aciertos ${item.accuracy}%` : ''})
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Usuarios mas activos</Text>
        {loading ? (
          <Text style={styles.label}>Cargando...</Text>
        ) : stats.topUsers.length === 0 ? (
          <Text style={styles.label}>Sin datos</Text>
        ) : (
          stats.topUsers.map((item) => (
            <Text key={item.userId} style={styles.value}>
              {item.userId}: {item.completed} completadas
            </Text>
          ))
        )}
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
    gap: 12
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
  label: {
    fontSize: 13,
    color: '#555'
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  logout: {
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
