import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

const allowedTypes = ['reading', 'writing', 'listening'];

export default function AdminQuestionsScreen() {
  const [questions, setQuestions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState('');
  const [type, setType] = useState('reading');
  const [prompt, setPrompt] = useState('');
  const [optionsInput, setOptionsInput] = useState('');
  const [answerIndex, setAnswerIndex] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [order, setOrder] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchLessons();
    fetchQuestions();
  }, []);

  const fetchLessons = async () => {
    const { data } = await supabase.from('lessons').select('id, title').order('title', { ascending: true });
    setLessons(data || []);
    if (!lessonId && data?.[0]?.id) {
      setLessonId(data[0].id);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('questions').select('*').order('order_index', { ascending: true });
    if (error) {
      setMessage('No se pudieron cargar preguntas');
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setPrompt('');
    setOptionsInput('');
    setAnswerIndex('');
    setAnswerText('');
    setType('reading');
    setOrder('');
    setEditing(null);
  };

  const handleCreate = async () => {
    if (!lessonId || !prompt || !type) {
      setMessage('Completa leccion, tipo y prompt.');
      return;
    }
    if (!allowedTypes.includes(type)) {
      setMessage('Tipo invalido. Usa reading / writing / listening.');
      return;
    }
    const options = optionsInput
      .split(',')
      .map((opt) => opt.trim())
      .filter(Boolean);
    const payload = {
      lesson_id: lessonId,
      question_type: type,
      question_text: prompt,
      options: type === 'writing' ? null : options,
      correct_answer: type === 'writing' ? answerText.trim() : options[Number(answerIndex)] || '',
      order_index: Number(order) || 0
    };
    const { error } = await supabase.from('questions').insert(payload);
    if (error) {
      setMessage(error.message || 'No se pudo crear la pregunta');
    } else {
      setMessage('Pregunta creada');
      resetForm();
      fetchQuestions();
    }
  };

  const startEdit = (item) => {
    setEditing(item);
    setLessonId(item.lesson_id);
    setType(item.question_type || 'reading');
    setPrompt(item.question_text || '');
    setOptionsInput(Array.isArray(item.options) ? item.options.join(', ') : '');
    setAnswerText(item.correct_answer || '');
    setAnswerIndex(
      Array.isArray(item.options) ? String((item.options || []).findIndex((opt) => opt === item.correct_answer)) : ''
    );
    setOrder(String(item.order_index || ''));
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!allowedTypes.includes(type)) {
      setMessage('Tipo invalido. Usa reading / writing / listening.');
      return;
    }
    const options = optionsInput
      .split(',')
      .map((opt) => opt.trim())
      .filter(Boolean);
    const payload = {
      lesson_id: lessonId,
      question_type: type,
      question_text: prompt,
      options: type === 'writing' ? null : options,
      correct_answer: type === 'writing' ? answerText.trim() : options[Number(answerIndex)] || '',
      order_index: Number(order) || 0
    };
    const { error } = await supabase.from('questions').update(payload).eq('id', editing.id);
    if (error) {
      setMessage(error.message || 'No se pudo editar la pregunta');
    } else {
      setMessage('Pregunta actualizada');
      resetForm();
      fetchQuestions();
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Eliminar pregunta', 'Esta accion es irreversible. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('questions').delete().eq('id', item.id);
          if (error) {
            setMessage('No se pudo eliminar la pregunta');
          } else {
            setMessage('Pregunta eliminada');
            fetchQuestions();
          }
        }
      }
    ]);
  };

  const handleReorder = async (item, delta) => {
    const newOrder = (item.order_index || 0) + delta;
    const { error } = await supabase.from('questions').update({ order_index: newOrder }).eq('id', item.id);
    if (error) {
      setMessage('No se pudo reordenar');
    } else {
      fetchQuestions();
    }
  };

  const filtered = useMemo(() => {
    if (!lessonId) return questions;
    return questions.filter((q) => q.lesson_id === lessonId);
  }, [questions, lessonId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>Gestionar preguntas</Text>
      <Text style={styles.sub}>Asocia preguntas a una leccion y guarda en Supabase.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Leccion</Text>
        <TextInput value={lessonId} onChangeText={setLessonId} style={styles.input} placeholder="UUID leccion" />

        <Text style={styles.label}>Tipo (reading/writing/listening)</Text>
        <View style={styles.chipsRow}>
          {allowedTypes.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, type === opt && styles.chipActive]}
              onPress={() => setType(opt)}
            >
              <Text style={[styles.chipText, type === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Prompt</Text>
        <TextInput value={prompt} onChangeText={setPrompt} style={styles.input} placeholder="Selecciona la opcion correcta" />

        {type === 'writing' ? (
          <>
            <Text style={styles.label}>Respuesta (texto)</Text>
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

        <Text style={styles.label}>Orden</Text>
        <TextInput value={order} onChangeText={setOrder} style={styles.input} placeholder="0" keyboardType="numeric" />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {editing ? (
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Actualizar pregunta</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Crear pregunta</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sub}>Preguntas existentes</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.question_text}</Text>
              <Text style={styles.cardMeta}>Leccion: {item.lesson_id} • Tipo: {item.question_type}</Text>
              <Text style={styles.cardMeta}>Orden: {item.order_index || 0}</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.secondary} onPress={() => handleReorder(item, -1)}>
                  <Text style={styles.secondaryText}>- Orden</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondary} onPress={() => handleReorder(item, 1)}>
                  <Text style={styles.secondaryText}>+ Orden</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.secondary} onPress={() => startEdit(item)}>
                  <Text style={styles.secondaryText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.delete} onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
          scrollEnabled={false}
        />
      )}
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
    elevation: 1,
    gap: 6
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  cardMeta: {
    fontSize: 13,
    color: '#555'
  },
  row: {
    flexDirection: 'row',
    gap: 8
  },
  secondary: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center'
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: '700'
  },
  delete: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
    alignItems: 'center'
  },
  deleteText: {
    color: '#d32f2f',
    fontWeight: '700'
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f1'
  },
  chipActive: {
    backgroundColor: colors.accent
  },
  chipText: {
    color: '#555',
    fontWeight: '600'
  },
  chipTextActive: {
    color: '#fff'
  }
});
