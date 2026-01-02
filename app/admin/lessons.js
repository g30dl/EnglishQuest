import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

const allowedAreas = ['vocabulario', 'gramatica', 'listening'];
const allowedTypes = ['reading', 'writing', 'listening'];
const levelOptions = Array.from({ length: 10 }, (_, i) => i + 1);

export default function AdminLessonsScreen() {
  const {
    lessons: ctxLessons,
    addLesson,
    updateLesson: ctxUpdateLesson,
    deleteLesson: ctxDeleteLesson,
    reload,
    loading: ctxLoading
  } = useProgress();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('vocab');
  const [level, setLevel] = useState('');
  const [type, setType] = useState('reading');
  const [order, setOrder] = useState('');
  const [xpReward, setXpReward] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setLessons(ctxLessons);
  }, [ctxLessons]);

  const resetForm = () => {
    setTitle('');
    setArea('vocab');
    setLevel('');
    setType('reading');
    setOrder('');
    setXpReward('');
    setDescription('');
    setEditing(null);
  };

  const handleCreate = async () => {
    if (!title || !level) {
      setMessage('Completa titulo y nivel.');
      return;
    }
    if (!allowedAreas.includes(area)) {
      setMessage('Area invalida. Usa vocab / grammar / listening.');
      return;
    }
    if (!allowedTypes.includes(type)) {
      setMessage('Tipo invalido. Usa reading / writing / listening.');
      return;
    }
    const basePayload = {
      title,
      area,
      level: Number(level),
      description,
      order_index: Number(order) || 0,
      xp_reward: Number(xpReward) || 50,
      is_active: true
    };
    const first = await supabase.from('lessons').insert({ ...basePayload, type });
    if (first.error) {
      const retry = await supabase.from('lessons').insert(basePayload);
      if (retry.error) {
        setMessage(`No se pudo crear la leccion: ${retry.error.message}`);
        return;
      }
    }
    const result = await addLesson(basePayload);
    if (result?.success) {
      setMessage('Leccion creada');
      resetForm();
      reload?.();
    } else {
      setMessage(`No se pudo crear: ${result?.error || 'Error desconocido'}`);
    }
  };

  const startEdit = (item) => {
    setEditing(item);
    setTitle(item.title);
    setArea(item.area);
    setLevel(String(item.level));
    setType(item.type || 'reading');
    setOrder(String(item.order_index || ''));
    setXpReward(String(item.xp_reward || ''));
    setDescription(item.description || '');
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!allowedAreas.includes(area)) {
      setMessage('Area invalida. Usa vocab / grammar / listening.');
      return;
    }
    if (!allowedTypes.includes(type)) {
      setMessage('Tipo invalido. Usa reading / writing / listening.');
      return;
    }
    const basePayload = {
      title,
      area,
      level: Number(level),
      description,
      order: Number(order) || 0,
      xp_reward: Number(xpReward) || 50,
      type
    };
    const result = await ctxUpdateLesson(editing.id, basePayload);
    if (!result?.success) {
      setMessage(`No se pudo actualizar la leccion: ${result?.error || 'Error desconocido'}`);
      return;
    }
    setMessage('Leccion actualizada');
    resetForm();
    reload?.();
  };

  const handleDelete = (item) => {
    Alert.alert('Eliminar leccion', 'Se borrara la leccion si no tiene preguntas asociadas. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const { data: qs, error: qsError } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: false })
            .eq('lesson_id', item.id);
          if (qsError) {
            setMessage('No se pudo verificar preguntas asociadas');
            return;
          }
          if ((qs || []).length > 0) {
            setMessage('No se puede eliminar: hay preguntas asociadas.');
            return;
          }
          const result = await ctxDeleteLesson(item.id);
          if (!result?.success) {
            setMessage(result?.error || 'No se pudo eliminar la leccion');
          } else {
            setMessage('Leccion eliminada');
            reload?.();
          }
        }
      }
    ]);
  };

  const handleToggle = async (item) => {
    const result = await ctxUpdateLesson(item.id, {
      ...item,
      area: item.area,
      level: item.level,
      order: item.order_index || 0,
      xp_reward: item.xp_reward,
      type: item.type,
      is_active: !item.is_active
    });
    if (!result?.success) {
      setMessage(result?.error || 'No se pudo actualizar el estado');
    } else {
      reload?.();
    }
  };

  const groupedLessons = useMemo(() => {
    const byLevel = {};
    lessons.forEach((ls) => {
      const key = `Nivel ${ls.level}`;
      byLevel[key] = byLevel[key] || [];
      byLevel[key].push(ls);
    });
    return Object.entries(byLevel).map(([key, items]) => ({
      key,
      items: items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    }));
  }, [lessons]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>Gestionar lecciones</Text>
      <Text style={styles.sub}>Crea y administra las lecciones guardadas en Supabase.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Titulo</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Saludos basicos" />

        <Text style={styles.label}>Area</Text>
        <View style={styles.chipsRow}>
          {allowedAreas.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, area === opt && styles.chipActive]}
              onPress={() => setArea(opt)}
            >
              <Text style={[styles.chipText, area === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nivel</Text>
        <View style={styles.chipsRow}>
          {levelOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, Number(level) === opt && styles.chipActive]}
              onPress={() => setLevel(String(opt))}
            >
              <Text style={[styles.chipText, Number(level) === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

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

        <Text style={styles.label}>Orden</Text>
        <TextInput value={order} onChangeText={setOrder} style={styles.input} placeholder="1" keyboardType="numeric" />

        <Text style={styles.label}>Recompensa XP</Text>
        <TextInput value={xpReward} onChangeText={setXpReward} style={styles.input} placeholder="50" keyboardType="numeric" />

        <Text style={styles.label}>Descripcion</Text>
        <TextInput value={description} onChangeText={setDescription} style={styles.input} placeholder="Descripcion corta" />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {editing ? (
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Actualizar leccion</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Crear leccion</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sub}>Lecciones existentes</Text>
      {loading || ctxLoading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={groupedLessons}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>{item.key}</Text>
              {item.items.map((lesson) => (
                <View key={lesson.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{lesson.title}</Text>
                  <Text style={styles.cardMeta}>
                    Area: {lesson.area} • Tipo: {lesson.type || 'reading'}
                  </Text>
                  <Text style={styles.cardMeta}>Orden: {lesson.order_index || 0} • XP: {lesson.xp_reward || 50}</Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.secondary} onPress={() => startEdit(lesson)}>
                      <Text style={styles.secondaryText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.delete} onPress={() => handleDelete(lesson)}>
                      <Text style={styles.deleteText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.toggleRow}>
                    <Text style={styles.cardMeta}>Activa</Text>
                    <Switch value={lesson.is_active !== false} onValueChange={() => handleToggle(lesson)} />
                  </View>
                </View>
              ))}
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
  group: {
    gap: 8
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
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
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
