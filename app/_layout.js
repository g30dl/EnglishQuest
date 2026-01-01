import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProgressProvider } from '../context/ProgressContext';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../lib/userService';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('student');

  useEffect(() => {
    let mounted = true;

    const hydrateUser = async () => {
      const { user, role: derivedRole } = await userService.getCurrentUser();
      if (!mounted) return;
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setRole(derivedRole);
      setLoading(false);
    };

    hydrateUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        const { role: derivedRole } = await userService.getCurrentUser();
        setRole(derivedRole);
      } else {
        setRole('student');
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe();
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inAdmin = segments.includes('admin');

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (session && inAuthGroup) {
      router.replace(role === 'admin' ? '/admin' : '/(drawer)');
      return;
    }

    if (session && role === 'admin' && !inAdmin) {
      router.replace('/admin');
      return;
    }

    if (session && role !== 'admin' && inAdmin) {
      router.replace('/(drawer)');
    }
  }, [loading, session, segments, role, router]);

  return (
    <SafeAreaProvider>
      <ProgressProvider>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#1B5E20" />
          </View>
        ) : (
          <Slot />
        )}
      </ProgressProvider>
    </SafeAreaProvider>
  );
}
