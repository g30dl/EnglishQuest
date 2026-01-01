import { StyleSheet, View, Text, Switch } from 'react-native';
import { useState } from 'react';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function ConfiguracionScreen() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Configuracion</Text>
      <Text style={styles.sub}>Ajusta tus preferencias.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Notificaciones</Text>
        <Switch value={notifications} onValueChange={setNotifications} thumbColor={colors.accent} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Sonido</Text>
        <Switch value={sound} onValueChange={setSound} thumbColor={colors.accent} />
      </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 16,
    color: '#2e2e2e'
  }
});
