import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminLessonsScreen() {
  const { lessons, levels, addLesson } = useProgress();
  const [title, setTitle] = useState('');
  const [levelId, setLevelId] = useState(levels[0]?.id || '');
  const [type, setType] = useState('reading');
  const [message, setMessage] = useState('');

  const handleCreate = () => {
    if (!title || !levelId) {
      setMessage('Completa titulo y nivel.');
      return;
    }

    addLesson({ title, levelId, type });
    setMessage('Leccion creada.');
    setTitle('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>Gestionar lecciones</Text>
      <Text style={styles.sub}>Asigna lecciones a un nivel y define su tipo.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Titulo</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Saludos basicos" />

        <Text style={styles.label}>Nivel ID</Text>
        <TextInput value={levelId} onChangeText={setLevelId} style={styles.input} placeholder="lvl1" />

        <Text style={styles.label}>Tipo (reading/writing/listening)</Text>
        <TextInput value={type} onChangeText={setType} style={styles.input} placeholder="reading" />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Crear leccion</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sub}>Lecciones existentes</Text>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>Nivel: {item.levelId} · Tipo: {item.type}</Text>
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
