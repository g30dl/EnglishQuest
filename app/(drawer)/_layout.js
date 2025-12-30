import { Drawer } from 'expo-router/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function DrawerLayout() {
  return (
    <Drawer
      initialRouteName="(tabs)"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        drawerActiveTintColor: colors.accent,
        drawerInactiveTintColor: '#2e2e2e',
        drawerStyle: { backgroundColor: colors.background },
        sceneContainerStyle: { backgroundColor: colors.background }
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Estudiante',
          drawerIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="admin"
        options={{
          title: 'Administracion',
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />
        }}
      />
    </Drawer>
  );
}
