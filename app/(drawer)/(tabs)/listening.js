import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../../../lib/theme';

const colors = theme.colors;
const t = theme.typography;
const s = theme.spacing;

export default function ListeningScreen() {
  const router = useRouter();
  const { areas, levels, lessons, levelNumber, loadingLessons, loadingQuestions, completedLessons } = useProgress();

  const areaId = 'listening';
  const area = areas.find((a) => a.id === areaId);
  const levelsByArea = levels
    .filter((lvl) => lvl.areaId === areaId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const groupedByLevel = levelsByArea.map((lvl) => {
    const lessonList = lessons.filter((ls) => ls.areaId === areaId && ls.level === (lvl.order || lvl.level));
    const unlocked = (lvl.order || 1) <= levelNumber;
    return { ...lvl, unlocked, lessons: lessonList };
  });

  const goToLesson = (lessonId, unlocked) => {
    if (!unlocked) return;
    router.push(`/lesson/${areaId}/${lessonId}`);
  };

  return (
    <View style={styles.container}>
      {(loadingLessons || loadingQuestions) && (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      )}

      <FlatList
        data={groupedByLevel}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.levelCard, !item.unlocked && styles.levelCardLocked]}>
            <View style={styles.levelHeader}>
              <Text style={[styles.levelTitle, !item.unlocked && styles.lockedText]}>{item.name}</Text>
              {!item.unlocked && (
                <Text style={styles.lockedBadge}>Se desbloquea en nivel {item.order || item.level}</Text>
              )}
            </View>
            {item.lessons.length === 0 ? (
              <Text style={styles.empty}>
                {loadingLessons ? 'Cargando lecciones...' : 'Sin lecciones disponibles en este nivel.'}
              </Text>
            ) : (
              item.lessons.map((lesson) => (
                <Pressable
                  key={lesson.id}
                  style={({ pressed }) => [
                    styles.lessonRow,
                    !item.unlocked && styles.lessonRowLocked,
                    pressed && styles.cardPressed
                  ]}
                  onPress={() => goToLesson(lesson.id, item.unlocked)}
                  disabled={!item.unlocked}
                >
                  <View style={[styles.dot, !item.unlocked && styles.dotLocked]} />
                  <View style={{ flex: 1 }}>
                      <Text style={[styles.lessonTitle, !item.unlocked && styles.lockedText]}>{lesson.title}</Text>
                      <View style={styles.metaRowWrap}>
                        <View style={styles.metaRow}>
                          <Ionicons
                            name={
                              lesson.type === 'writing'
                                ? 'create-outline'
                                : lesson.type === 'listening'
                                  ? 'headset-outline'
                                  : 'book-outline'
                            }
                            size={18}
                            color={
                              lesson.type === 'listening'
                                ? colors.area.listening
                                : lesson.type === 'writing'
                                  ? colors.area.gramatica
                                  : colors.area.vocabulario
                            }
                          />
                          <Text style={[styles.lessonMeta, !item.unlocked && styles.lockedText]}>{lesson.type}</Text>
                        </View>
                        <View style={styles.xpPill}>
                          <Text style={styles.xpText}>+{lesson.xp_reward ?? lesson.xp ?? 0} XP</Text>
                        </View>
                      </View>
                  </View>
                  {item.unlocked ? (
                    completedLessons.includes(lesson.id) ? (
                      <View style={styles.badgeDone}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    ) : null
                  ) : (
                    <Ionicons name="lock-closed" size={18} color="#888" />
                  )}
                  <Text style={[styles.start, !item.unlocked && styles.lockedText]}>
                    {item.unlocked ? 'Iniciar' : 'Bloqueado'}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
      />
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
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: s.xl,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    gap: s.md
  },
  levelTitle: {
    ...t.h3,
    color: colors.textPrimary
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s.sm
  },
  levelCardLocked: {
    backgroundColor: '#f4f4f4',
    borderColor: colors.border
  },
  lockedBadge: {
    ...t.small,
    color: colors.textHint
  },
  lockedText: {
    color: colors.textHint
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.md,
    paddingVertical: s.md,
    paddingHorizontal: s.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm
  },
  lessonRowLocked: {
    opacity: 0.6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent
  },
  dotLocked: {
    backgroundColor: colors.textHint
  },
  lessonTitle: {
    ...t.h3,
    color: colors.primary
  },
  lessonMeta: {
    ...t.caption,
    color: colors.textSecondary
  },
  metaRowWrap: {
    marginTop: s.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s.md
  },
  start: {
    color: colors.accent,
    fontWeight: '700'
  },
  xpPill: {
    backgroundColor: colors.accent,
    paddingVertical: s.xs,
    paddingHorizontal: s.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  xpText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11
  },
  badgeDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  empty: {
    ...t.caption,
    color: colors.textSecondary
  }
});
