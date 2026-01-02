import { StyleSheet, View, Text, Switch } from 'react-native';
import { useState } from 'react';
import { theme } from '../../lib/theme';

const colors = theme.colors;
const t = theme.typography;
const s = theme.spacing;

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
    padding: s.xl,
    gap: s.md
  },
  heading: {
    ...t.h1,
    color: colors.primary
  },
  sub: {
    ...t.caption,
    color: colors.textSecondary
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: s.xl,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    ...t.body,
    color: colors.textPrimary
  }
});
