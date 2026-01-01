import { supabase } from './supabaseClient';

class CurrentUserService {
  deriveRole(user) {
    return (
      user?.user_metadata?.role ||
      user?.app_metadata?.role ||
      'student'
    );
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Error obteniendo sesion', error.message);
      return null;
    }
    return data.session ?? null;
  }

  async getProfile(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        // Puede fallar por RLS; devolvemos null para no romper el flujo
        console.warn('No fue posible recuperar el perfil del usuario actual', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Error inesperado al recuperar perfil', err.message);
      return null;
    }
  }

  async getCurrentUser() {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData?.user) {
      return { user: null, role: 'student', profile: null };
    }

    const user = userData.user;
    const profile = await this.getProfile(user.id);
    const role = profile?.role || this.deriveRole(user);

    return { user, role, profile };
  }

  /**
   * Retorna los usuarios visibles según rol.
   * - admin: lista todos los usuarios
   * - student: solo su propio perfil
   */
  async getAccessibleUsers() {
    const { user, role, profile } = await this.getCurrentUser();
    if (!user) return { role: 'student', allUsers: [], ownProfile: null };

    if (role === 'admin') {
      const { data: allUsers, error } = await supabase.from('users').select('*');
      if (error) {
        console.warn('No fue posible recuperar usuarios (admin)', error.message);
      }
      return { role, allUsers: allUsers || [], ownProfile: profile };
    }

    // Usuario normal: solo su perfil
    const { data: ownProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn('No fue posible recuperar el perfil del usuario actual', error.message);
    }

    return { role, allUsers: [], ownProfile: ownProfile || profile || null };
  }
}

export const userService = new CurrentUserService();
