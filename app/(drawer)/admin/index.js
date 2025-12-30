import { View, Text, StyleSheet } from 'react-native';

export default function AdminHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard administrativo</Text>
      <Text style={styles.text}>Pendiente implementar CRUD de niveles, lecciones y preguntas.</Text>
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
