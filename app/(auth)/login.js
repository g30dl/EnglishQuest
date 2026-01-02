import React, { useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../lib/userService';
import { theme } from '../../lib/theme';

const colors = theme.colors;
const s = theme.spacing;

const HEADER_COLOR = '#E3F5FF';
const PRIMARY = '#00C853';
const SECONDARY = '#2E7D5F';
const ACCENT = '#00D37F';
const logo = require('../../assets/logo/logo.png');

export default function LoginScreen() {
  const router = useRouter();
  const headerHeight = useMemo(() => {
    const windowHeight = Dimensions.get('window').height || 800;
    return Math.max(windowHeight * 0.4, 300);
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field, value) => {
    let message = '';
    if (field === 'email') {
      if (!value.trim()) {
        message = 'Ingresa tu correo.';
      } else if (!emailRegex.test(value.trim())) {
        message = 'Usa un correo valido.';
      }
    } else if (field === 'password') {
      if (!value) {
        message = 'Ingresa tu contrasena.';
      }
    }
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
    return message;
  };

  const validateAll = () => {
    const nextErrors = {
      email: validateField('email', email),
      password: validateField('password', password)
    };
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleLogin = async () => {
    setError(null);
    const isValid = validateAll();
    if (!isValid) return;

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { user, role } = await userService.getCurrentUser();
    if (user?.id) {
      await userService.updateStreak(user.id);
    }
    if (role === 'admin') {
      router.replace('/admin');
    } else {
      router.replace('/(drawer)');
    }
    setLoading(false);
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < 24; i += 1) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      dots.push(
        <View
          key={`dot-${i}`}
          style={[
            styles.dot,
            {
              top: 12 + row * 26,
              left: 16 + col * 26
            }
          ]}
        />
      );
    }
    return dots;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          contentInsetAdjustmentBehavior="always"
        >
          <View style={[styles.header, { height: headerHeight }]}>
            <View style={styles.dotsContainer}>{renderDots()}</View>
            <View style={styles.headerContent}>
              <View style={styles.logoBox}>
                <Image source={logo} style={styles.logoImage} resizeMode="cover" />
              </View>
              <Text style={styles.headerTitle}>EnglishQuest</Text>
              <Text style={styles.headerSubtitle}>Aprende ingles jugando</Text>
            </View>
          </View>

          <View style={styles.sheet}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(auth)/register')} activeOpacity={0.85}>
                <Text style={styles.tabText}>Registrarse</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab} activeOpacity={0.9}>
                <Text style={[styles.tabText, styles.activeTabText]}>Iniciar Sesion</Text>
                <View style={styles.activeBar} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo electronico</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'email' && styles.inputWrapperFocused,
                    fieldErrors.email && styles.inputWrapperError
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      validateField('email', text);
                    }}
                    placeholder="ejemplo@email.com"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="next"
                    ref={emailRef}
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>
                {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Contrasena</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'password' && styles.inputWrapperFocused,
                    fieldErrors.password && styles.inputWrapperError
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      validateField('password', text);
                    }}
                    placeholder="********"
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="done"
                    ref={passwordRef}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} hitSlop={10}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      style={styles.eyeIcon}
                    />
                  </TouchableOpacity>
                </View>
                {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
              </View>

              <TouchableOpacity style={styles.forgotButton} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Olvidaste tu contrasena?</Text>
              </TouchableOpacity>

              {error ? <Text style={styles.formError}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={loading}
              >
                <Text style={styles.ctaText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  scrollContent: {
    flexGrow: 1
  },
  header: {
    backgroundColor: HEADER_COLOR,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dotsContainer: {
    ...StyleSheet.absoluteFillObject
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c9e7f5',
    opacity: 0.6
  },
  headerContent: {
    alignItems: 'center',
    gap: s.md
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  logoImage: {
    width: '100%',
    height: '100%'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666'
  },
  sheet: {
    marginTop: -28,
    paddingHorizontal: s.xl
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  tab: {
    alignItems: 'center',
    flex: 1
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
    paddingBottom: 6
  },
  activeTabText: {
    color: PRIMARY,
    fontWeight: '700'
  },
  activeBar: {
    width: 60,
    height: 3,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    marginTop: 12
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  },
  fieldGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 2
  },
  inputWrapperFocused: {
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  inputWrapperError: {
    borderColor: colors.error
  },
  inputIcon: {
    color: '#999',
    marginRight: 10
  },
  eyeIcon: {
    color: '#666',
    marginLeft: 8
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary
  },
  fieldError: {
    marginTop: 6,
    color: colors.error,
    fontSize: 12,
    fontWeight: '600'
  },
  forgotButton: {
    marginTop: 16,
    alignItems: 'center'
  },
  forgotText: {
    fontSize: 13,
    color: '#666'
  },
  formError: {
    marginTop: 10,
    color: colors.error,
    fontWeight: '600',
    textAlign: 'center'
  },
  ctaButton: {
    marginTop: 24,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  ctaButtonDisabled: {
    opacity: 0.8
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800'
  }
});
