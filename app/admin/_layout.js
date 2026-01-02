import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const colors = {
  primary: '#1B5E20',
  background: '#E8F5E9',
  accent: '#00C853'
};

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#2e2e2e',
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: '#cfe9cf' },
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="levels"
        options={{
          title: 'Contenido',
          tabBarLabel: 'Contenido',
          tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
