import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminLevelsScreen() {
  const { levels, areas, addLevel } = useProgress();
  const [name, setName] = useState('');
  const [areaId, setAreaId] = useState(areas[0]?.id || '');
  const [order, setOrder] = useState('');
  const [message, setMessage] = useState('');

  const handleCreate = () => {
    if (!name || !areaId) {
      setMessage('Completa nombre y area.');
      return;
    }

    addLevel({ name, areaId, order: Number(order) || levels.length + 1 });
    setMessage('Nivel creado.');
    setName('');
    setOrder('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Gestionar niveles</Text>
      <Text style={styles.sub}>Crea nuevos niveles asignados a un area.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nivel 1" />

        <Text style={styles.label}>Area ID</Text>
        <TextInput value={areaId} onChangeText={setAreaId} style={styles.input} placeholder="vocab / grammar / listening" />

        <Text style={styles.label}>Orden</Text>
        <TextInput
          value={order}
          onChangeText={setOrder}
          style={styles.input}
          placeholder="1"
          keyboardType="numeric"
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Crear nivel</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sub}>Niveles existentes</Text>
      <FlatList
        data={[...levels].sort((a, b) => (a.order || 0) - (b.order || 0))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>Area: {item.areaId} · Orden: {item.order}</Text>
          </View>
        )}
        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
      />
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
