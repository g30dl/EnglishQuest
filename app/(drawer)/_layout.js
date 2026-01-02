import { useEffect, useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../lib/userService';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

function CustomDrawerContent(props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('Usuario');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let mounted = true;
    userService.getCurrentUser().then(({ user, profile }) => {
      if (!mounted) return;
      setDisplayName(profile?.full_name || user?.email || 'Usuario');
      setEmail(user?.email || '');
    });
    return () => {
      mounted = false;
    };
  }, []);

  const goTo = (path) => {
    router.push(path);
    props.navigation.closeDrawer();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 12 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1B5E20' }}>{displayName}</Text>
        <Text style={{ fontSize: 13, color: '#555' }}>{email}</Text>
      </View>
      <DrawerItem
        label="Inicio"
        onPress={() => goTo('/(drawer)/(tabs)')}
        icon={({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />}
      />
      <DrawerItem
        label="Perfil"
        onPress={() => goTo('/(drawer)/perfil')}
        icon={({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />}
      />
      <DrawerItem
        label="Configuracion"
        onPress={() => goTo('/(drawer)/configuracion')}
        icon={({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />}
      />
      <DrawerItem
        label="Cerrar sesion"
        onPress={handleLogout}
        icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
      />
    </DrawerContentScrollView>
  );
}

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
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'EnglishQuest',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="perfil"
        options={{
          drawerLabel: 'Perfil',
          title: 'Perfil',
          drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="configuracion"
        options={{
          drawerLabel: 'Configuracion',
          title: 'Configuracion',
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="lesson"
        options={{
          drawerLabel: () => null,
          title: 'Leccion'
        }}
      />
    </Drawer>
  );
}
