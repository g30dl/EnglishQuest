import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'expo-router';
import { userService } from '../../lib/userService';
import { useEffect, useState } from 'react';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

export default function AdminProfile() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');

  useEffect(() => {
    userService.getCurrentUser().then(({ user, role }) => {
      setEmail(user?.email || '');
      setRole(role || 'admin');
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil admin</Text>
      <Text style={styles.text}>Gestiona tu cuenta y sesion.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{email}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{role}</Text>
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary
  },
  text: {
    fontSize: 14,
    color: '#2e2e2e'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 6
  },
  label: {
    fontSize: 13,
    color: '#555'
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  logout: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700'
  }
});
