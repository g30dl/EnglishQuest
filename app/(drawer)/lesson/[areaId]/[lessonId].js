import { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProgress } from '../../../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function LessonRunnerScreen() {
  const { areaId, lessonId } = useLocalSearchParams();
  const router = useRouter();
  const { lessons, questions, lessonById, answerQuestion, completeLesson } = useProgress();

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

  const total = lessonQuestions.length;
  const currentQuestion = lessonQuestions[index];

  const percent = total === 0 ? 0 : Math.round(((index) / total) * 100);

  const resetSelection = () => {
    setSelectedOption(null);
    setWrittenAnswer('');
  };

  const handleAnswer = () => {
    if (!currentQuestion) return;

    let isCorrect = false;
    if (currentQuestion.type === 'writing') {
      isCorrect = writtenAnswer.trim().toLowerCase() === (currentQuestion.answerText || '').trim().toLowerCase();
    } else {
      if (selectedOption === null) return;
      isCorrect = selectedOption === currentQuestion.answerIndex;
    }

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      answerQuestion();
    }

    const nextIndex = index + 1;
    if (nextIndex < total) {
      setIndex(nextIndex);
      resetSelection();
    } else {
      setFinished(true);
      if (!completedRef.current) {
        completeLesson(lessonId);
        completedRef.current = true;
      }
    }
  };

  const scorePercent = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const passed = scorePercent >= 60;

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
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Resultado</Text>
        <Text style={styles.sub}>Correctas: {correctCount} de {total}</Text>
        <Text style={[styles.score, { color: passed ? colors.accent : '#d32f2f' }]}>{scorePercent}%</Text>
        <Text style={styles.result}>{passed ? 'Aprobado (minimo 60%)' : 'No aprobado'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{lesson.title}</Text>
      <Text style={styles.sub}>Tipo: {lesson.type}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.meta}>Pregunta {index + 1} de {total}</Text>

      <View style={styles.card}>
        <Text style={styles.prompt}>{currentQuestion.prompt}</Text>

        {currentQuestion.type === 'writing' ? (
          <TextInput
            style={styles.input}
            placeholder="Escribe tu respuesta"
            value={writtenAnswer}
            onChangeText={setWrittenAnswer}
          />
        ) : (
          currentQuestion.options?.map((opt, optIndex) => (
            <TouchableOpacity
              key={optIndex}
              style={[styles.option, selectedOption === optIndex && styles.optionSelected]}
              onPress={() => setSelectedOption(optIndex)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAnswer}>
        <Text style={styles.buttonText}>{index + 1 === total ? 'Finalizar' : 'Siguiente'}</Text>
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
    color: '#555'
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#cfe9cf',
    borderRadius: 8,
    overflow: 'hidden'
  },
  progressFill: {
    height: 10,
    backgroundColor: colors.accent
  },
  meta: {
    fontSize: 13,
    color: '#555'
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
    gap: 10
  },
  prompt: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e2e2e'
  },
  option: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d8e5d8'
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: '#e0f6e7'
  },
  optionText: {
    color: '#2e2e2e'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e5d8',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff'
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
  score: {
    fontSize: 32,
    fontWeight: '800'
  },
  result: {
    fontSize: 16,
    color: '#2e2e2e'
  }
});
