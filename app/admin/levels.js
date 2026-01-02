import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

const allowedAreas = ['vocabulario', 'gramatica', 'listening'];
const levelOptions = Array.from({ length: 10 }, (_, i) => i + 1);
const defaultArea = 'vocab';

export default function AdminLevelsScreen() {
  const { levels: ctxLevels, addLevel, reload, loading: ctxLoading } = useProgress();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [areaId, setAreaId] = useState(defaultArea);
  const [order, setOrder] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setLevels(ctxLevels);
  }, [ctxLevels]);

  const handleCreate = async () => {
    if (!areaId) {
      setMessage('Completa el area.');
      return;
    }
    if (!allowedAreas.includes(areaId)) {
      setMessage('Area invalida. Usa vocab / grammar / listening.');
      return;
    }
    const orderNumber = Number(order) || 1;
    const result = await addLevel({
      name: name || `Nivel ${orderNumber}`,
      areaId,
      order: orderNumber
    });
    if (result?.success) {
      setMessage('Nivel creado en Supabase');
      setName('');
      setOrder('');
      reload?.();
    } else {
      setMessage(`No se pudo crear el nivel: ${result?.error || 'Error desconocido'}`);
    }
  };

  const startEdit = (item) => {
    setEditing(item);
    setAreaId(item.area);
    setOrder(String(item.level));
    setName(item.name || `Nivel ${item.level}`);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!allowedAreas.includes(areaId)) {
      setMessage('Area invalida. Usa vocab / grammar / listening.');
      return;
    }
    const newLevel = Number(order) || editing.level;
    const result = await addLevel({
      name: name || `Nivel ${newLevel}`,
      areaId,
      order: newLevel
    });
    if (!result?.success) {
      setMessage(`No se pudo editar el nivel: ${result?.error || 'Error desconocido'}`);
    } else {
      setMessage('Nivel actualizado');
      setEditing(null);
      setAreaId(defaultArea);
      setOrder('');
      setName('');
      reload?.();
    }
  };

  const handleDelete = async (item) => {
    if (item.lessons?.length) {
      setMessage('No se puede eliminar: hay lecciones asociadas.');
      return;
    }
    Alert.alert('Eliminar nivel', 'Esto eliminara el nivel si no tiene lecciones. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('area', item.area)
            .eq('level', item.level);
          if (error) {
            setMessage('No se pudo eliminar el nivel');
          } else {
            setMessage('Nivel eliminado');
            reload?.();
          }
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>Gestionar niveles</Text>
      <Text style={styles.sub}>Los niveles se agrupan por numero en la tabla de lecciones.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nivel 1" />

        <Text style={styles.label}>Area</Text>
        <View style={styles.chipsRow}>
          {allowedAreas.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, areaId === opt && styles.chipActive]}
              onPress={() => setAreaId(opt)}
            >
              <Text style={[styles.chipText, areaId === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nivel</Text>
        <View style={styles.chipsRow}>
          {levelOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, Number(order) === opt && styles.chipActive]}
              onPress={() => setOrder(String(opt))}
            >
              <Text style={[styles.chipText, Number(order) === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {editing ? (
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Actualizar nivel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Crear nivel</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sub}>Niveles existentes</Text>
      {loading || ctxLoading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={[...levels].sort((a, b) => (a.level || 0) - (b.level || 0))}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Nivel {item.level}</Text>
              <Text style={styles.cardMeta}>Area: {item.area || '-'}</Text>
              <Text style={styles.cardMeta}>Lecciones: {item.lessons?.length || 0}</Text>
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
