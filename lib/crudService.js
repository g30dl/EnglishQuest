import { supabase } from './supabaseClient';
import { userService } from './userService';
import { AREAS } from './constants';

const validateLessonPayload = (payload) => {
  if (!payload?.title || !payload.title.trim()) {
    return { valid: false, error: 'El titulo es requerido.' };
  }
  if (!AREAS.includes(payload.area)) {
    return { valid: false, error: 'Area invalida (vocabulario/gramatica/listening).' };
  }
  const levelNumber = Number(payload.level);
  if (Number.isNaN(levelNumber) || levelNumber <= 0) {
    return { valid: false, error: 'El nivel debe ser un numero mayor a 0.' };
  }
  return { valid: true };
};

async function createLesson(payload) {
  const { role } = await userService.getCurrentUser();
  if (role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }
  const validation = validateLessonPayload(payload);
  if (!validation.valid) return { success: false, error: validation.error };

  const insertPayload = {
    title: payload.title.trim(),
    description: payload.description || '',
    area: payload.area,
    level: Number(payload.level) || 1,
    order_index: payload.order || 0,
    xp_reward: payload.xp_reward,
    type: payload.type || 'reading',
    is_active: payload.is_active ?? true
  };

  const { data, error } = await supabase.from('lessons').insert(insertPayload).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

async function updateLesson(id, payload) {
  const { role } = await userService.getCurrentUser();
  if (role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }
  const validation = validateLessonPayload(payload);
  if (!validation.valid) return { success: false, error: validation.error };
  const updatePayload = {
    title: payload.title.trim(),
    description: payload.description || '',
    area: payload.area,
    level: Number(payload.level) || 1,
    order_index: payload.order || 0,
    xp_reward: payload.xp_reward,
    type: payload.type || 'reading',
    is_active: payload.is_active ?? true
  };
  const { data, error } = await supabase.from('lessons').update(updatePayload).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

async function deleteLesson(id) {
  const { role } = await userService.getCurrentUser();
  if (role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }
  const { error } = await supabase.from('questions').select('id').eq('lesson_id', id).limit(1);
  if (error) return { success: false, error: error.message };
  const { error: delError } = await supabase.from('lessons').delete().eq('id', id);
  if (delError) return { success: false, error: delError.message };
  return { success: true };
}

export const crudService = {
  createLesson,
  updateLesson,
  deleteLesson
};
