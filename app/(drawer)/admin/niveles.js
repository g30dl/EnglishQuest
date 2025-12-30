import { View, Text, StyleSheet } from 'react-native';

export default function NivelesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Niveles</Text>
      <Text style={styles.text}>Aquí irá el CRUD de niveles (pendiente).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700'
  },
  text: {
    fontSize: 14,
    marginTop: 6
  }
});
