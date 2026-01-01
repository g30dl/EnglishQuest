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
        name="vocabulario"
        options={{
          title: 'Vocabulario',
          tabBarLabel: 'Vocabulario',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="gramatica"
        options={{
          title: 'Gramatica',
          tabBarLabel: 'Gramatica',
          tabBarIcon: ({ color, size }) => <Ionicons name="create-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="listening"
        options={{
          title: 'Listening',
          tabBarLabel: 'Listening',
          tabBarIcon: ({ color, size }) => <Ionicons name="headset-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
