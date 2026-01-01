import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminQuestionsScreen() {
  const { questions, lessons, addQuestion } = useProgress();
  const [prompt, setPrompt] = useState('');
  const [lessonId, setLessonId] = useState(lessons[0]?.id || '');
  const [type, setType] = useState('reading');
  const [optionsInput, setOptionsInput] = useState('');
  const [answerIndex, setAnswerIndex] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [message, setMessage] = useState('');

  const handleCreate = () => {
    if (!prompt || !lessonId || !type) {
      setMessage('Completa prompt, tipo y leccion.');
      return;
    }

    const basePayload = { lessonId, type, prompt };

    if (type === 'writing') {
      if (!answerText.trim()) {
        setMessage('Ingresa la respuesta escrita.');
        return;
      }
      addQuestion({ ...basePayload, answerText: answerText.trim() });
      setMessage('Pregunta creada (escritura).');
    } else {
      const options = optionsInput
        .split(',')
        .map((opt) => opt.trim())
        .filter(Boolean);
      const answerIdx = Number(answerIndex);
      if (!options.length || Number.isNaN(answerIdx)) {
        setMessage('Define opciones y un indice de respuesta.');
        return;
      }
      addQuestion({ ...basePayload, options, answerIndex: answerIdx });
      setMessage('Pregunta creada.');
    }

    setPrompt('');
    setOptionsInput('');
    setAnswerIndex('');
    setAnswerText('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>Gestionar preguntas</Text>
      <Text style={styles.sub}>Asocia preguntas a una leccion.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Leccion ID</Text>
        <TextInput value={lessonId} onChangeText={setLessonId} style={styles.input} placeholder="ls1" />

        <Text style={styles.label}>Tipo (reading/writing/listening)</Text>
        <TextInput value={type} onChangeText={setType} style={styles.input} placeholder="reading" />

        <Text style={styles.label}>Prompt</Text>
        <TextInput value={prompt} onChangeText={setPrompt} style={styles.input} placeholder="Selecciona la opcion correcta" />

        {type === 'writing' ? (
          <>
            <Text style={styles.label}>Respuesta correcta (texto)</Text>
            <TextInput value={answerText} onChangeText={setAnswerText} style={styles.input} placeholder="respuesta" />
          </>
        ) : (
          <>
            <Text style={styles.label}>Opciones (separadas por coma)</Text>
            <TextInput
              value={optionsInput}
              onChangeText={setOptionsInput}
              style={styles.input}
              placeholder="Opcion A, Opcion B, Opcion C"
            />
            <Text style={styles.label}>Indice de respuesta (0 basado)</Text>
            <TextInput
              value={answerIndex}
              onChangeText={setAnswerIndex}
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
            />
          </>
        )}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Crear pregunta</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sub}>Preguntas existentes</Text>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.prompt}</Text>
            <Text style={styles.cardMeta}>Leccion: {item.lessonId} · Tipo: {item.type}</Text>
          </View>
        )}
        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16
  },
  scrollContent: {
    paddingBottom: 24,
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
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  label: {
    fontSize: 13,
    color: '#555'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e5d8',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  },
  message: {
    color: colors.primary,
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  cardMeta: {
    fontSize: 13,
    color: '#555'
  }
});
