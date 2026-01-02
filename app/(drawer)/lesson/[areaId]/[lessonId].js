import { useMemo, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProgress } from '../../../../context/ProgressContext';
import * as Speech from 'expo-speech';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../../../../lib/theme';

const colors = theme.colors;

export default function LessonRunnerScreen() {
  const { areaId, lessonId } = useLocalSearchParams();
  const router = useRouter();
  const { lessons, questions, lessonById, answerQuestion, completeLesson, loading } = useProgress();

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

  const total = lessonQuestions.length;
  const currentQuestion = lessonQuestions[index];

  const percent = total === 0 ? 0 : Math.round(((index) / total) * 100);

  const progressAnim = useRef(new Animated.Value(percent)).current;
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

  const resetSelection = () => {
    setSelectedOption(null);
    setWrittenAnswer('');
    setFeedback({ status: null, message: '', correctAnswer: null });
    scaleAnim.setValue(0);
    shakeAnim.setValue(0);
    bgAnim.setValue(0);
  };

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

  const circleSize = 140;
  const halfCircle = circleSize / 2;
  const resultProgressAnim = useRef(new Animated.Value(0)).current;
  const leftSpin = resultProgressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '0deg', '180deg']
  });
  const rightSpin = resultProgressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg']
  });

  useEffect(() => {
    Animated.timing(resultProgressAnim, {
      toValue: Math.min(scorePercent, 100) / 100,
      duration: 800,
      useNativeDriver: false
    }).start();
  }, [scorePercent, resultProgressAnim]);

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
        ? 'Excelente'
        : scorePercent >= 70
          ? 'Muy bien'
          : scorePercent >= 60
            ? 'Aprobado'
            : 'Intenta de nuevo';
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <View style={styles.circleContainer}>
            <View style={[styles.progressOuter, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
              <View style={[styles.halfCircle, styles.leftWrap]}>
                <Animated.View
                  style={[
                    styles.halfCircleFill,
                    {
                      borderTopLeftRadius: halfCircle,
                      borderBottomLeftRadius: halfCircle,
                      transform: [{ rotate: leftSpin }]
                    }
                  ]}
                />
              </View>
              <View style={[styles.halfCircle, styles.rightWrap]}>
                <Animated.View
                  style={[
                    styles.halfCircleFill,
                    {
                      borderTopRightRadius: halfCircle,
                      borderBottomRightRadius: halfCircle,
                      transform: [{ rotate: rightSpin }]
                    }
                  ]}
                />
              </View>
              <View style={styles.progressInner}>
                <Text style={[styles.score, { color: passed ? colors.accent : '#d32f2f' }]}>{scorePercent}%</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.outcome, passed ? styles.outcomeSuccess : styles.outcomeFail]}>{outcome}</Text>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
              <Text style={styles.breakdownText}>{correctCount} correctas</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Ionicons name="close-circle" size={22} color="#d32f2f" />
              <Text style={styles.breakdownText}>{incorrectCount} incorrectas</Text>
            </View>
          </View>

          <View style={styles.xpBadge}>
            <Ionicons name="flash-outline" size={20} color="#fff" />
            <Text style={styles.xpText}>+{passed ? lessonXp : 0} XP</Text>
          </View>

          {scorePercent > 80 ? (
            <View style={styles.celebration}>
              <Ionicons name="star" size={20} color={colors.accent} />
              <Ionicons name="star-outline" size={20} color={colors.accent} />
              <Ionicons name="star" size={20} color={colors.accent} />
            </View>
          ) : null}
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.button, styles.secondaryBtn]}>
            <Text style={[styles.buttonText, styles.secondaryBtnText]}>Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setFinished(false);
              setIndex(0);
              setCorrectCount(0);
              completedRef.current = false;
              resetSelection();
            }}
            style={[styles.button, styles.primaryBtn]}
          >
            <Text style={styles.buttonText}>Repetir leccion</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  speakButton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  speakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  speakText: {
    color: colors.primary,
    fontWeight: '700'
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
  primaryBtn: {
    backgroundColor: colors.accent
  },
  secondaryBtn: {
    backgroundColor: '#f0f4f0',
    borderWidth: 1,
    borderColor: '#cfe9cf'
  },
  secondaryBtnText: {
    color: colors.primary
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  score: {
    fontSize: 32,
    fontWeight: '800'
  },
  result: {
    fontSize: 16,
    color: colors.textPrimary
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    alignItems: 'center'
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressOuter: {
    borderWidth: 8,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  halfCircle: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    overflow: 'hidden'
  },
  leftWrap: {
    left: 0
  },
  rightWrap: {
    right: 0
  },
  halfCircleFill: {
    position: 'absolute',
    width: '200%',
    height: '100%',
    borderWidth: 8,
    borderColor: colors.accent,
    borderRadius: 1000
  },
  progressInner: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    backgroundColor: colors.surface,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  outcome: {
    fontSize: 20,
    fontWeight: '800'
  },
  outcomeSuccess: {
    color: colors.accent
  },
  outcomeFail: {
    color: colors.error
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 16
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  breakdownText: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16
  },
  xpText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16
  },
  celebration: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center'
  },
  resultActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10
  }
});
