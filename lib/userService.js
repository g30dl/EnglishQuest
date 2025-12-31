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
      console.warn('Error obteniendo sesión', error.message);
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
        .single();
      if (error) {
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
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.warn('Error obteniendo usuario actual', error.message);
      return { user: null, role: 'student', profile: null };
    }

    const user = data.user ?? null;
    const role = this.deriveRole(user);
    const profile = await this.getProfile(user?.id);

    return { user, role, profile };
  }
}

export const userService = new CurrentUserService();
