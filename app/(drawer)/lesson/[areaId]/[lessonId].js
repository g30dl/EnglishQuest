import { useMemo, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator, Animated, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useProgress } from '../../../../context/ProgressContext';
import * as Speech from 'expo-speech';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../../../../lib/theme';

const colors = theme.colors;
const t = theme.typography;

// Convierte segundos a formato mm:ss para mostrar tiempos.
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

// Pantalla que ejecuta una leccion: muestra preguntas, anima feedback y guarda progreso.
export default function LessonRunnerScreen() {
  const { areaId, lessonId } = useLocalSearchParams();
  const router = useRouter();
  const { lessons, questions, lessonById, answerQuestion, completeLesson, loading } = useProgress();
  const navigation = useNavigation();

  const lesson = lessonById(lessonId);
  const lessonQuestions = useMemo(
    () => questions.filter((q) => q.lessonId === lessonId),
    [questions, lessonId]
  );

  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const completedRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState({ status: null, message: '', correctAnswer: null });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const startTimeRef = useRef(Date.now());

  const total = lessonQuestions.length;
  const currentQuestion = lessonQuestions[index];

  const percent = total === 0 ? 0 : Math.round(((index) / total) * 100);

  const progressAnim = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    if (lesson?.title) {
      navigation.setOptions({ title: lesson.title });
    } else {
      navigation.setOptions({ title: 'Leccion' });
    }
  }, [lesson?.title, navigation]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setIndex(0);
    setCorrectCount(0);
    setFinished(false);
    completedRef.current = false;
    resetSelection();
    setSubmitting(false);
  }, [lessonId]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percent,
      duration: 400,
      useNativeDriver: false
    }).start(() => {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 120, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: false })
      ]).start();
    });
  }, [percent, progressAnim, pulseAnim]);

  // Limpia selecciones y estados de feedback entre preguntas.
  const resetSelection = () => {
    setSelectedOption(null);
    setWrittenAnswer('');
    setFeedback({ status: null, message: '', correctAnswer: null });
    scaleAnim.setValue(0);
    shakeAnim.setValue(0);
    bgAnim.setValue(0);
  };

  // Evalua la respuesta, muestra feedback y avanza de manera segura.
  const handleAnswer = async () => {
    if (!currentQuestion) return;
    if (submitting) return;
    setSubmitting(true);

    let isCorrect = false;
    if (currentQuestion.type === 'writing') {
      isCorrect = writtenAnswer.trim().toLowerCase() === (currentQuestion.answerText || '').trim().toLowerCase();
    } else {
      if (selectedOption === null) {
        setSubmitting(false);
        return;
      }
      isCorrect = selectedOption === currentQuestion.answerIndex;
    }

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      const messages = ['Excelente', 'Perfecto', 'Bien hecho'];
      const pick = messages[Math.floor(Math.random() * messages.length)];
      setFeedback({ status: 'correct', message: pick, correctAnswer: null });
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 1, duration: 200, useNativeDriver: false })
      ]).start();
    }
    if (!isCorrect) {
      const correctText =
        currentQuestion.type === 'writing'
          ? currentQuestion.answerText
          : currentQuestion.options?.[currentQuestion.answerIndex] || '';
      setFeedback({ status: 'wrong', message: 'Respuesta incorrecta', correctAnswer: correctText });
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: false })
      ]).start();
      Animated.timing(bgAnim, { toValue: -1, duration: 200, useNativeDriver: false }).start();
    }

    await answerQuestion({
      questionId: currentQuestion.id,
      userAnswer: currentQuestion.type === 'writing' ? writtenAnswer : currentQuestion.options?.[selectedOption],
      isCorrect
    });

    // Pausa breve para mostrar feedback
    // Espera breve para que el usuario vea el feedback antes de avanzar.
    setTimeout(async () => {
      const nextIndex = index + 1;
      if (nextIndex < total) {
        setIndex(nextIndex);
        resetSelection();
      } else {
        setFinished(true);
        if (!completedRef.current) {
          const scorePercent = total === 0 ? 0 : Math.round((correctCount + (isCorrect ? 1 : 0)) / total * 100);
          if (scorePercent >= 60) {
            await completeLesson(lessonId, scorePercent);
          }
          completedRef.current = true;
        }
      }
      setSubmitting(false);
    }, 1200);
  };

  // Reproduce el texto en voz para preguntas de listening.
  const handleSpeak = () => {
    if (!currentQuestion) return;
    const text = currentQuestion.audioText || currentQuestion.prompt || '';
    if (!text) return;
    setSpeaking(true);
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.95,
      pitch: 1.0,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
  };

  const scorePercent = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const passed = scorePercent >= 60;
  const incorrectCount = total - correctCount;
  const lessonXp = lesson?.xp_reward || 50;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Leccion no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Sin preguntas</Text>
        <Text style={styles.sub}>Esta leccion aun no tiene preguntas.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    const outcome =
      scorePercent >= 90
        ? 'Excelente!'
        : scorePercent >= 70
          ? 'Muy bien'
          : scorePercent >= 60
            ? 'Aprobado!'
            : 'Intenta de nuevo';
    const motivacion =
      scorePercent >= 90
        ? 'Fantastico trabajo, sigue asi.'
        : scorePercent >= 70
          ? 'Vas genial, continua.'
          : scorePercent >= 60
            ? 'Buen trabajo, sigue subiendo.'
            : 'Vuelve a intentarlo para mejorar.';
    const xpEarned = passed ? (lesson?.xp_reward ?? lesson?.xp ?? 0) : 0;
    const durationSeconds = Math.max(Math.round((Date.now() - startTimeRef.current) / 1000), 1);
    const correctTotal = correctCount;

    return (
      <View style={styles.container}>
        <View style={[styles.resultCard, { borderColor: passed ? colors.accent : colors.error }]}>
          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.percentTitle}>{outcome}</Text>
              <Text style={[styles.percentValue, { color: passed ? colors.accent : colors.error }]}>{scorePercent}%</Text>
            </View>
            <View style={styles.progressTrackBig}>
              <View
                style={[
                  styles.progressFillBig,
                  {
                    width: `${Math.min(scorePercent, 100)}%`,
                    backgroundColor: passed ? colors.accent : colors.error
                  }
                ]}
              />
            </View>
            <Text style={styles.percentSub}>{motivacion}</Text>
          </View>

          <View style={styles.performanceGrid}>
            <View style={styles.statCard}>
              <Ionicons name="flash-outline" size={20} color={passed ? colors.accent : colors.error} />
              <Text style={styles.statTitle}>XP ganado</Text>
              <Text style={styles.statValue}>+{xpEarned}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.statTitle}>Tiempo</Text>
              <Text style={styles.statValue}>{formatTime(durationSeconds)}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.statTitle}>Aciertos</Text>
              <Text style={styles.statValue}>
                {correctTotal}/{total}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame-outline" size={20} color={colors.primary} />
              <Text style={styles.statTitle}>Racha</Text>
              <Text style={styles.statValue}>5 dias</Text>
            </View>
          </View>

          {passed && (
            <View style={styles.xpBadge}>
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={styles.xpBadgeText}>+{xpEarned} XP</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, passed ? styles.primarySuccess : styles.primaryError]}
              onPress={() => router.replace('/(drawer)/(tabs)')}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryText}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setFinished(false);
                setIndex(0);
                setCorrectCount(0);
                completedRef.current = false;
                resetSelection();
                startTimeRef.current = Date.now();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryText}>Repetir leccion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.progressTitle}>Pregunta {index + 1} de {total}</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: progressAnim.interpolate({
                  inputRange: [0, 33, 66, 100],
                  outputRange: [colors.info, colors.info, colors.success, colors.gold]
                }),
                transform: [{ scaleY: pulseAnim }]
              }
            ]}
          />
        </View>
        <Text style={styles.meta}>Progreso {percent}%</Text>

        <Animated.View
          style={[
            styles.card,
            feedback.status === 'correct' && { backgroundColor: colors.background, borderColor: colors.success, borderWidth: 1 },
            feedback.status === 'wrong' && { backgroundColor: colors.background, borderColor: colors.error, borderWidth: 1 },
            {
              transform: [
                {
                  translateX: feedback.status === 'wrong' ? shakeAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-6, 6]
                  }) : 0
                }
              ]
            }
          ]}
        >
          <Text style={styles.prompt}>{currentQuestion.prompt}</Text>

          {currentQuestion.type === 'listening' && (
            <View style={styles.audioCard}>
              <TouchableOpacity style={styles.playButton} onPress={handleSpeak}>
                <Ionicons
                  name={speaking ? 'pause' : 'play'}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
              <View style={styles.waveRow}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      { height: 6 + ((i % 4) + 1) * 4, opacity: speaking ? 1 : 0.6 }
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.audioTimer}>{speaking ? 'Reproduciendo...' : '00:00'}</Text>
            </View>
          )}

          {currentQuestion.type === 'writing' ? (
            <TextInput
              style={styles.input}
              placeholder="Escribe tu respuesta"
              value={writtenAnswer}
              onChangeText={setWrittenAnswer}
            />
          ) : (
            currentQuestion.options?.map((opt, optIndex) => {
              const active = selectedOption === optIndex;
              return (
                <TouchableOpacity
                  key={optIndex}
                  style={[styles.option, active && styles.optionSelected]}
                  onPress={() => setSelectedOption(optIndex)}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={[styles.optionText, active && { color: colors.primary }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })
          )}
          {feedback.status === 'correct' && (
            <Animated.View style={[styles.feedbackRow, { transform: [{ scale: scaleAnim }] }]}>
              <Ionicons name="checkmark-circle-outline" size={34} color={colors.accent} />
              <Text style={[styles.feedbackText, { color: colors.accent }]}>{feedback.message}</Text>
            </Animated.View>
          )}
          {feedback.status === 'wrong' && (
            <View style={styles.feedbackRow}>
              <Ionicons name="close-circle-outline" size={34} color={colors.error} />
              <Text style={[styles.feedbackText, { color: colors.error }]}>{feedback.message}</Text>
            </View>
          )}
          {feedback.status === 'wrong' && feedback.correctAnswer ? (
            <Text style={styles.correctAnswer}>Respuesta correcta: {feedback.correctAnswer}</Text>
          ) : null}
        </Animated.View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleAnswer} disabled={submitting}>
        <Text style={styles.buttonText}>
          {submitting ? 'Guardando...' : index + 1 === total ? 'Finalizar' : 'Siguiente'}
        </Text>
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
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 12
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary
  },
  progressTrack: {
    height: 16,
    backgroundColor: colors.background,
    borderRadius: 10,
    overflow: 'hidden'
  },
  progressFill: {
    height: 16,
    backgroundColor: colors.accent,
    borderRadius: 10
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 10
  },
  prompt: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '800'
  },
  correctAnswer: {
    marginTop: 6,
    color: colors.error,
    fontWeight: '700'
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.background
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: 16
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioActive: {
    borderColor: colors.accent
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent
  },
  audioCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 12
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 40
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.accent
  },
  audioTimer: {
    fontSize: 12,
    color: colors.textSecondary
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.surface
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  progressBlock: {
    width: '100%',
    gap: 8,
    alignItems: 'center'
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center'
  },
  percentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  percentValue: {
    fontSize: 22,
    fontWeight: '900'
  },
  percentSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%'
  },
  progressTrackBig: {
    height: 16,
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden'
  },
  progressFillBig: {
    height: 16,
    borderRadius: 12
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%'
  },
  statCard: {
    flexBasis: '48%',
    maxWidth: '48%',
    marginBottom: 12,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  statTitle: {
    ...t.caption,
    color: colors.textSecondary
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  actions: {
    width: '100%',
    gap: 10
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center'
  },
  primarySuccess: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  primaryError: {
    backgroundColor: colors.error
  },
  primaryText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 15
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.4
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: colors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  }
});
