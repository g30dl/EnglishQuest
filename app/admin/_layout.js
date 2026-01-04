import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../lib/userService';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

// Drawer admin: carga datos del usuario y expone navegacion a secciones de admin.
function CustomDrawerContent(props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('Admin');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let mounted = true;
    userService.getCurrentUser().then(({ user, profile }) => {
      if (!mounted) return;
      setDisplayName(profile?.full_name || user?.email || 'Admin');
      setEmail(user?.email || '');
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Navega a la ruta y cierra el drawer.
  const goTo = (path) => {
    router.push(path);
    props.navigation.closeDrawer();
  };

  // Cierra sesion y envia a login publico.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 12 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary }}>{displayName}</Text>
        <Text style={{ fontSize: 13, color: '#555' }}>{email}</Text>
      </View>

      <DrawerItem
        label="Inicio"
        onPress={() => goTo('/admin/(tabs)')}
        icon={({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />}
      />
      <DrawerItem
        label="Lecciones"
        onPress={() => goTo('/admin/(tabs)/levels')}
        icon={({ color, size }) => <Ionicons name="layers-outline" size={size} color={color} />}
      />
      <DrawerItem
        label="Perfil"
        onPress={() => goTo('/admin/profile')}
        icon={({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />}
      />
      <DrawerItem
        label="Cerrar sesion"
        onPress={handleLogout}
        icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
      />
    </DrawerContentScrollView>
  );
}

// Layout del area administrativa protegido por drawer.
export default function AdminLayout() {
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
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Inicio',
          drawerLabel: 'Inicio',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Perfil',
          drawerLabel: 'Perfil',
          drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />
        }}
      />
    </Drawer>
  );
}
