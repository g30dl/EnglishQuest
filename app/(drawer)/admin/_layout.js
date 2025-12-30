import { Stack } from 'expo-router';

const colors = {
  primary: '#1B5E20',
  background: '#E8F5E9'
};

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background }
      }}
    />
  );
}
