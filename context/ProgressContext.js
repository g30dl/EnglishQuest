import React, { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../lib/userService';
import { crudService } from '../lib/crudService';
import { AREAS } from '../lib/constants';

const XP_PER_CORRECT = 10;
const XP_PER_LESSON = 50;
const XP_PER_LEVEL = 500;

const ProgressContext = createContext(null);

// Normaliza ids de area para evitar variaciones de texto.
const normalizeArea = (area) => {
  if (!area) return 'vocabulario';
  const lower = area.toLowerCase();
  if (lower.startsWith('vocab')) return 'vocabulario';
  if (lower.startsWith('gram')) return 'gramatica';
  if (lower.startsWith('list')) return 'listening';
  const found = AREAS.find((a) => a === lower);
  return found || 'vocabulario';
};

// Proveedor centralizado que maneja niveles, lecciones, preguntas y progreso de usuario.
export function ProgressProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);
  const [xp, setXp] = useState(0);
  const [levelNumber, setLevelNumber] = useState(1);
  const [xpToNextLevel, setXpToNextLevel] = useState(XP_PER_LEVEL);
  const [areas, setAreas] = useState([]);
  const [levels, setLevels] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const channelRef = useRef(null);

  // Calcula nivel actual y XP restante hacia el siguiente nivel.
  const computeXpMeta = useCallback((totalXp) => {
    const lv = Math.floor(totalXp / XP_PER_LEVEL) + 1;
    const remainder = totalXp % XP_PER_LEVEL;
    const toNext = remainder === 0 ? XP_PER_LEVEL : XP_PER_LEVEL - remainder;
    return { lv, toNext };
  }, []);

  // Limpia y ordena registros de lecciones provenientes de Supabase.
  const hydrateLessons = useCallback((rows) => {
    if (!rows?.length) return [];
    return rows
      .filter((row) => row.is_active !== false)
      .map((row) => {
        const areaId = normalizeArea(row.area);
        const levelNum = row.level || row.order_index || 1;
        return {
          id: row.id,
          areaId,
          level: levelNum,
          title: row.title,
          type: row.type || row.question_type || 'reading',
          xp_reward: row.xp_reward || XP_PER_LESSON,
          order: row.order_index || 0,
          description: row.description || ''
        };
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, []);

  // Ajusta los datos de preguntas para el consumo del front.
  const hydrateQuestions = useCallback((rows) => {
    if (!rows?.length) return [];
    return rows.map((row) => {
      const options = Array.isArray(row.options) ? row.options : [];
      const correctAnswer = row.correct_answer || '';
      const answerIndex = options.findIndex((opt) => opt === correctAnswer);
      return {
        id: row.id,
        lessonId: row.lesson_id,
        type: row.question_type || 'reading',
        prompt: row.question_text,
        audioText: row.audio_text || row.question_text,
        options,
        answerIndex: answerIndex >= 0 ? answerIndex : undefined,
        answerText: answerIndex < 0 ? correctAnswer : undefined,
        explanation: row.explanation,
        order: row.order_index || 0
      };
    });
  }, []);

  // Genera los niveles con estado desbloqueado segun el nivel del usuario.
  const hydrateLevels = useCallback((rows, userLevel) => {
    if (!rows?.length) return [];
    const parsed = rows.map((row) => {
      const areaId = normalizeArea(row.area);
      const orderNum = row.order_index || row.level || 1;
      return {
        id: row.id,
        areaId,
        name: row.name || `Nivel ${orderNum}`,
        order: orderNum
      };
    });
    return parsed
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((lvl) => ({ ...lvl, unlocked: (lvl.order || 1) <= (userLevel || 1) }));
  }, []);

  // Carga datos de usuario, progreso y catalogos desde Supabase.
  const loadUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { user, profile } = await userService.getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      setLoadingAreas(true);
      setLoadingLevels(true);
      setLoadingLessons(true);
      setLoadingQuestions(true);

      const [
        { data: areasData, error: areasError },
        { data: levelsData, error: levelsError },
        { data: lessonsData, error: lessonsError },
        { data: questionsData, error: questionsError }
      ] = await Promise.all([
        supabase.from('areas').select('*'),
        supabase.from('levels').select('*'),
        supabase.from('lessons').select('*'),
        supabase.from('questions').select('*')
      ]);

      if (areasError) console.error('Error areas:', areasError);
      if (levelsError) console.error('Error levels:', levelsError);
      if (lessonsError) console.error('Error lessons:', lessonsError);
      if (questionsError) console.error('Error questions:', questionsError);

      const safeAreas =
        (areasData || []).map((a) => ({
          id: normalizeArea(a.id || a.area || a.slug),
          name: a.name || a.title || a.id,
          description: a.description || '',
          color: a.color || '#1B5E20'
        })) || [];
      setAreas(safeAreas);
      setLoadingAreas(false);

      const hydratedLevels = hydrateLevels(levelsData, profile?.current_level || 1);
      setLevels(hydratedLevels);
      setLoadingLevels(false);

      const hydratedLessons = hydrateLessons(lessonsData);
      setLessons(hydratedLessons);
      setLoadingLessons(false);
      const hydratedQuestions = hydrateQuestions(questionsData);
      setQuestions(hydratedQuestions);
      setLoadingQuestions(false);

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      if (progressError) {
        console.warn('No se pudo cargar progreso', progressError.message);
      }
      const completed = (progressData || []).filter((row) => row.is_completed).map((row) => row.lesson_id);
      setCompletedLessons(completed || []);

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('total_xp, current_level')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.warn('No se pudo cargar usuario', userError.message);
      }
      const totalXp = userRow?.total_xp ?? 0;
      const level = userRow?.current_level ?? profile?.current_level ?? 1;
      setXp(totalXp);
      const meta = computeXpMeta(totalXp);
      setLevelNumber(level || meta.lv);
      setXpToNextLevel(meta.toNext);
    } catch (err) {
      console.error('Error inesperado al cargar datos', err);
      setError('No se pudieron cargar datos remotos.');
    } finally {
      setLoading(false);
      setLoadingAreas(false);
      setLoadingLevels(false);
      setLoadingLessons(false);
      setLoadingQuestions(false);
    }
  }, [computeXpMeta, hydrateLevels, hydrateLessons, hydrateQuestions]);

  // Inicializa datos y se suscribe a cambios en supabase/auth y tablas relevantes.
  useEffect(() => {
    loadUserData();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData();
      }
    });

    // Subscripciones en tiempo real a cambios de BD para refrescar cache
    const channel = supabase
      .channel('realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => loadUserData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        () => loadUserData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'levels' },
        () => loadUserData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'areas' },
        () => loadUserData()
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      authListener?.subscription?.unsubscribe();
    };
  }, [loadUserData]);

  // Incrementa XP localmente y persiste en Supabase.
  const addXp = useCallback(
    async (amount) => {
      let updatedXp = xp;
      setXp((current) => {
        updatedXp = Math.max(0, current + amount);
        const meta = computeXpMeta(updatedXp);
        setLevelNumber(meta.lv);
        setXpToNextLevel(meta.toNext);
        return updatedXp;
      });

      if (!currentUserId) return;
      const meta = computeXpMeta(updatedXp);
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('users')
        .update({
          total_xp: updatedXp,
          current_level: meta.lv,
          last_activity_date: now
        })
        .eq('id', currentUserId);

      if (updateError) {
        console.warn('No se pudo actualizar XP en Supabase', updateError.message);
      }
    },
    [computeXpMeta, currentUserId, xp]
  );

  // Marca una leccion como completada, asigna XP y registra progreso.
  const completeLesson = useCallback(
    async (lessonId, scorePercent = 0, attempts = 1) => {
      setCompletedLessons((prev) => {
        if (prev.includes(lessonId)) return prev;
        return [...prev, lessonId];
      });

      const targetLesson = lessons.find((ls) => ls.id === lessonId);
      const xpReward = targetLesson?.xp_reward || XP_PER_LESSON;
      const passed = scorePercent >= 60;
      if (passed) {
        await addXp(xpReward);
      }

      if (!currentUserId) return;
      try {
        await userService.updateStreak(currentUserId);
        const payload = {
          user_id: currentUserId,
          lesson_id: lessonId,
          is_completed: passed,
          score: scorePercent,
          attempts,
          completed_at: new Date().toISOString()
        };

        const { data: existing, error: fetchError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.warn('No se pudo leer progreso de leccion', fetchError.message);
        }

        if (existing) {
          const { error: updateError } = await supabase
            .from('user_progress')
            .update({
              ...payload,
              attempts: (existing.attempts || 0) + 1
            })
            .eq('id', existing.id);
          if (updateError) console.warn('No se pudo actualizar progreso', updateError.message);
        } else {
          const { error: insertError } = await supabase.from('user_progress').insert(payload);
          if (insertError) console.warn('No se pudo guardar progreso', insertError.message);
        }
      } catch (err) {
        console.warn('Error guardando progreso de leccion', err.message);
      }
    },
    [addXp, currentUserId, lessons]
  );

  // Registra respuesta de pregunta y otorga XP por aciertos.
  const answerQuestion = useCallback(
    async ({ questionId, userAnswer, isCorrect }) => {
      if (isCorrect) {
        await addXp(XP_PER_CORRECT);
      }
      if (!currentUserId) return;
      try {
        await userService.updateStreak(currentUserId);
        const payload = {
          user_id: currentUserId,
          question_id: questionId,
          user_answer: userAnswer,
          is_correct: !!isCorrect,
          answered_at: new Date().toISOString()
        };
        const { error: insertError } = await supabase.from('user_answers').insert(payload);
        if (insertError) {
          console.warn('No se pudo guardar respuesta de pregunta', insertError.message);
        }
      } catch (err) {
        console.warn('Error inesperado al guardar respuesta', err.message);
      }
    },
    [addXp, currentUserId]
  );

  // Niveles a los que el usuario tiene acceso segun su nivel actual.
  const unlockedLevels = useMemo(
    () => levels.filter((lvl) => (lvl.order || 0) <= levelNumber),
    [levels, levelNumber]
  );

  // Busca una leccion en cache local por id.
  const lessonById = useCallback((lessonId) => lessons.find((ls) => ls.id === lessonId), [lessons]);

  // Crea un nuevo nivel en Supabase y lo agrega al estado local.
  const addLevel = useCallback(
    async (payload) => {
      try {
        const insertPayload = {
          name: payload.name || `Nivel ${payload.order || 1}`,
          area: payload.areaId,
          order_index: payload.order || 1
        };
        const { data, error } = await supabase.from('levels').insert(insertPayload).select().single();
        if (error) throw error;
        setLevels((prev) => [
          ...prev,
          {
            id: data.id,
            areaId: normalizeArea(data.area),
            name: data.name,
            order: data.order_index,
            unlocked: data.order_index <= levelNumber
          }
        ]);
        return { success: true };
      } catch (err) {
        console.warn('Error inesperado al crear nivel', err.message);
        return { success: false, error: err.message };
      }
    },
    [levelNumber]
  );

  // Crea una leccion a traves del crudService y la incorpora al estado.
  const addLesson = useCallback(
    async (payload) => {
      try {
        const area = payload.areaId || payload.area || 'vocabulario';
        const result = await crudService.createLesson({
          ...payload,
          area
        });
        if (!result.success) return result;
        const data = result.data;
        const areaId = normalizeArea(data.area);
        const levelVal = data.level || 1;
        setLessons((prev) => [
          ...prev,
          {
            id: data.id,
            areaId,
            level: levelVal,
            title: data.title,
            type: data.type || 'reading',
            xp_reward: data.xp_reward || XP_PER_LESSON,
            order: data.order_index || 0,
            description: data.description || ''
          }
        ]);
        return { success: true };
      } catch (err) {
        console.warn('Error inesperado al crear leccion', err.message);
        return { success: false, error: err.message };
      }
    },
    []
  );

  // Actualiza una leccion existente y sincroniza el estado local.
  const updateLesson = useCallback(
    async (id, payload) => {
      try {
        const area = payload.areaId || payload.area;
        const result = await crudService.updateLesson(id, { ...payload, area });
        if (!result.success) return result;
        const data = result.data;
        const areaId = normalizeArea(data.area);
        const levelVal = data.level || 1;
        setLessons((prev) =>
          prev.map((ls) =>
            ls.id === id
              ? {
                  id: data.id,
                  areaId,
                  level: levelVal,
                  title: data.title,
                  type: data.type || 'reading',
                  xp_reward: data.xp_reward || XP_PER_LESSON,
                  order: data.order_index || 0,
                  description: data.description || ''
                }
              : ls
          )
        );
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    []
  );

  // Elimina una leccion y limpia las referencias locales.
  const deleteLesson = useCallback(
    async (id) => {
      try {
        const result = await crudService.deleteLesson(id);
        if (!result.success) return result;
        setLessons((prev) => prev.filter((ls) => ls.id !== id));
        setCompletedLessons((prev) => prev.filter((c) => c !== id));
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    []
  );

  // Inserta una pregunta y recarga datos para reflejarla en pantalla.
  const addQuestion = useCallback(
    async (payload) => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .insert({
            lesson_id: payload.lessonId,
            question_type: payload.type,
            question_text: payload.prompt,
            correct_answer: payload.answerText || payload.correct_answer || '',
            options: payload.options || null,
            // answer_index columna puede no existir; no se envia si la columna no esta en el esquema
            order_index: payload.order || questions.length,
            audio_text: payload.audioText || payload.prompt
          })
          .select()
          .single();

        if (error) throw error;

        const { data: verification } = await supabase
          .from('questions')
          .select('id, lesson_id')
          .eq('id', data.id)
          .single();
        if (verification?.lesson_id !== payload.lessonId) {
          console.error('ERROR: lesson_id cambio despues de insertar', {
            esperado: payload.lessonId,
            obtenido: verification?.lesson_id
          });
        }

        setQuestions((prev) => [
          ...prev,
          {
            id: data.id,
            lessonId: data.lesson_id,
            type: data.question_type,
            prompt: data.question_text,
            audioText: data.audio_text || data.question_text,
            options: data.options,
            answerIndex:
              typeof data.answer_index === 'number'
                ? data.answer_index
                : Array.isArray(data.options)
                  ? data.options.findIndex((opt) => opt === data.correct_answer)
                  : undefined,
            answerText: data.correct_answer
          }
        ]);
        await loadUserData();
        return { success: true };
      } catch (err) {
        console.error('Error adding question:', err);
        return { success: false, error: err.message };
      }
    },
    [questions.length, loadUserData]
  );

  const value = useMemo(
    () => ({
      loading,
      loadingAreas,
      loadingLevels,
      loadingLessons,
      loadingQuestions,
      error,
      xp,
      levelNumber,
      xpToNextLevel,
      areas,
      levels,
      lessons,
      questions,
      completedLessons,
      unlockedLevels,
      lessonById,
      addXp,
      completeLesson,
      answerQuestion,
      addLevel,
      addLesson,
      updateLesson,
      deleteLesson,
      addQuestion,
      reload: loadUserData,
      refresh: loadUserData
    }),
    [
      loading,
      loadingAreas,
      loadingLevels,
      loadingLessons,
      loadingQuestions,
      error,
      xp,
      levelNumber,
      xpToNextLevel,
      areas,
      levels,
      lessons,
      questions,
      completedLessons,
      unlockedLevels,
      lessonById,
      addXp,
      completeLesson,
      answerQuestion,
      addLevel,
      addLesson,
      addQuestion,
      loadUserData
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// Hook de conveniencia para consumir el contexto de progreso.
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress debe usarse dentro de ProgressProvider');
  }
  return ctx;
}
