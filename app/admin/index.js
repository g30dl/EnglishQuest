import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminHome() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    lessons: 0,
    questions: 0,
    completed: 0,
    avgScore: 0
  });
  const [topFailed, setTopFailed] = useState([]);
  const [topActiveUsers, setTopActiveUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [
        { count: usersCount },
        { count: lessonsCount },
        { count: questionsCount },
        { data: progressData, error: progressError },
        { data: progressAll }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('user_progress').select('score, is_completed'),
        supabase.from('user_progress').select('lesson_id, score, is_completed, user_id')
      ]);

      if (progressError) {
        setMessage('No se pudo cargar progreso');
      }

      const completed = (progressData || []).filter((row) => row.is_completed).length;
      const avgScoreRaw =
        (progressData || []).reduce((sum, row) => sum + (row.score || 0), 0) / Math.max((progressData || []).length, 1);

      setStats({
        users: usersCount || 0,
        lessons: lessonsCount || 0,
        questions: questionsCount || 0,
        completed,
        avgScore: Math.round(avgScoreRaw || 0)
      });

      const failureMap = {};
      (progressAll || []).forEach((row) => {
        const key = row.lesson_id;
        failureMap[key] = failureMap[key] || { lesson_id: key, attempts: 0, fails: 0 };
        failureMap[key].attempts += 1;
        if (!row.is_completed) failureMap[key].fails += 1;
      });
      const sortedFailures = Object.values(failureMap)
        .map((entry) => ({
          ...entry,
          failRate: entry.attempts ? Math.round((entry.fails / entry.attempts) * 100) : 0
        }))
        .sort((a, b) => b.failRate - a.failRate)
        .slice(0, 5);
      setTopFailed(sortedFailures);

      const userActivity = {};
      (progressAll || []).forEach((row) => {
        const key = row.user_id;
        userActivity[key] = userActivity[key] || { user_id: key, completed: 0 };
        if (row.is_completed) userActivity[key].completed += 1;
      });
      const activeUsers = Object.values(userActivity)
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 5);
      setTopActiveUsers(activeUsers);
    } catch (err) {
      setMessage('Error cargando estadisticas');
    } finally {
      setLoading(false);
    }
  };

  const cards = useMemo(
    () => [
      { label: 'Usuarios', value: stats.users },
      { label: 'Lecciones', value: stats.lessons },
      { label: 'Preguntas', value: stats.questions },
      { label: 'Lecciones completadas', value: stats.completed },
      { label: 'Promedio de aciertos', value: `${stats.avgScore}%` }
    ],
    [stats]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Admin</Text>
      <Text style={styles.text}>Datos en tiempo real desde Supabase.</Text>
      {message ? <Text style={styles.error}>{message}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <>
          <View style={styles.cards}>
            {cards.map((item) => (
              <View key={item.label} style={styles.card}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Top 5 lecciones con mayor reprobacion</Text>
            {topFailed.length === 0 ? (
              <Text style={styles.panelText}>Sin datos de reprobacion.</Text>
            ) : (
              topFailed.map((row) => (
                <Text key={row.lesson_id} style={styles.panelText}>
                  {row.lesson_id} - {row.failRate}% reprobacion (intentos {row.attempts})
                </Text>
              ))
            )}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Top 5 usuarios mas activos</Text>
            {topActiveUsers.length === 0 ? (
              <Text style={styles.panelText}>Sin datos.</Text>
            ) : (
              topActiveUsers.map((row) => (
                <Text key={row.user_id} style={styles.panelText}>
                  {row.user_id} - {row.completed} lecciones completadas
                </Text>
              ))
            )}
          </View>
        </>
      )}
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
  error: {
    color: '#d32f2f',
    fontSize: 13
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
    elevation: 1
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
  panel: {
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
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  panelText: {
    fontSize: 13,
    color: '#555'
  }
});
