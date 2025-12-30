import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#2e2e2e',
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: '#cfe9cf' }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="areas"
        options={{
          title: 'Areas',
          tabBarLabel: 'Areas',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
