import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../lib/userService';
import { theme } from '../../lib/theme';

const colors = theme.colors;
const t = theme.typography;
const s = theme.spacing;

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!fullName.trim()) {
        setError('El nombre completo es requerido.');
        setLoading(false);
        return;
      }
      if (!password || password.length < 6) {
        setError('La contrasena debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user?.id) {
        const now = new Date().toISOString();
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: fullName.trim(),
            total_xp: 0,
            current_level: 1,
            streak_days: 0,
            role: 'student',
            last_activity_date: now
          })
          .eq('id', user.id);
      }

      const { role } = await userService.getCurrentUser();
      if (role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(drawer)');
      }
    } catch (err) {
      setError(err.message || 'No se pudo registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para continuar</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Tu nombre completo"
        />

        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="tu@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Registrarse'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.linkButton}>
          <Text style={styles.linkText}>Ya tienes cuenta? Inicia sesion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: s.xl
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: s.xl,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    ...t.h1,
    color: colors.primary
  },
  subtitle: {
    ...t.caption,
    color: colors.textSecondary,
    marginBottom: s.lg
  },
  label: {
    ...t.caption,
    color: colors.textSecondary,
    marginTop: s.md
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e5d8',
    borderRadius: 10,
    padding: s.md,
    backgroundColor: '#fff',
    marginTop: s.xs
  },
  button: {
    marginTop: s.xl,
    backgroundColor: colors.accent,
    paddingVertical: s.md,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  error: {
    color: '#d32f2f',
    marginTop: s.sm
  },
  linkButton: {
    marginTop: s.md,
    alignItems: 'center'
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600'
  }
});
