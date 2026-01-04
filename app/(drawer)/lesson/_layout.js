import { Stack } from 'expo-router';

const colors = {
  primary: '#1B5E20',
  background: '#E8F5E9'
};

// Stack para pantallas de lecciones individuales.
export default function LessonLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background }
      }}
    />
  );
}
