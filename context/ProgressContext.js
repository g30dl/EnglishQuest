import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../lib/userService';

const XP_PER_CORRECT = 10;
const XP_PER_LESSON = 50;
const XP_PER_LEVEL = 500;

// Fallbacks en memoria para no romper la UI si Supabase falla
const initialAreas = [
  { id: 'vocab', name: 'Vocabulario', description: 'Amplia tu vocabulario con practicas guiadas.', color: '#1B5E20' },
  { id: 'grammar', name: 'Gramatica', description: 'Refuerza estructuras y tiempos verbales.', color: '#00C853' },
  { id: 'listening', name: 'Listening', description: 'Mejora la comprension auditiva con audios cortos.', color: '#4CAF50' }
];

const initialLevels = [
  { id: 'lvl1', areaId: 'vocab', name: 'Nivel 1', order: 1 },
  { id: 'lvl2', areaId: 'grammar', name: 'Nivel 2', order: 2 },
  { id: 'lvl3', areaId: 'listening', name: 'Nivel 3', order: 3 }
];

const initialLessons = [
  { id: 'ls1', levelId: 'lvl1', title: 'Saludos basicos', type: 'reading', areaId: 'vocab', level: 1, xp_reward: XP_PER_LESSON },
  { id: 'ls2', levelId: 'lvl1', title: 'Colores y numeros', type: 'writing', areaId: 'vocab', level: 1, xp_reward: XP_PER_LESSON },
  { id: 'ls3', levelId: 'lvl2', title: 'Present Simple vs Continuous', type: 'reading', areaId: 'grammar', level: 2, xp_reward: XP_PER_LESSON },
  { id: 'ls4', levelId: 'lvl3', title: 'Dialogo en el aeropuerto', type: 'listening', areaId: 'listening', level: 3, xp_reward: XP_PER_LESSON },
  { id: 'ls5', levelId: 'lvl3', title: 'Anuncio en el avion', type: 'listening', areaId: 'listening', level: 3, xp_reward: XP_PER_LESSON }
];

const initialQuestions = [
  {
    id: 'q1',
    lessonId: 'ls1',
    type: 'reading',
    prompt: 'Selecciona el saludo formal',
    options: ['Hi', 'Hello', 'Good morning'],
    answerIndex: 2
  },
  {
    id: 'q2',
    lessonId: 'ls2',
    type: 'writing',
    prompt: 'Escribe el numero "seven" en ingles',
    answerText: 'seven'
  },
  {
    id: 'q3',
    lessonId: 'ls4',
    type: 'listening',
    prompt: 'Escucha y selecciona la intencion',
    audioText: 'Welcome to the airport. Please proceed to the check-in desk for your flight.',
    options: ['Check-in', 'Boarding', 'Asking directions'],
    answerIndex: 0
  },
  {
    id: 'q4',
    lessonId: 'ls5',
    type: 'listening',
    prompt: 'Listen and choose the correct gate number',
    audioText: 'Attention passengers. Flight 247 to New York is now boarding at gate five.',
    options: ['Gate 2', 'Gate 4', 'Gate 5'],
    answerIndex: 2
  }
];

const ProgressContext = createContext(null);

const normalizeArea = (area) => {
  if (!area) return 'vocab';
  const lower = area.toLowerCase();
  if (lower.startsWith('vocab')) return 'vocab';
  if (lower.startsWith('gram')) return 'grammar';
  if (lower.startsWith('list')) return 'listening';
  return lower;
};

export function ProgressProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [xp, setXp] = useState(0);
  const [levelNumber, setLevelNumber] = useState(1);
  const [xpToNextLevel, setXpToNextLevel] = useState(XP_PER_LEVEL);
  const [areas] = useState(initialAreas);
  const [levels, setLevels] = useState(initialLevels);
  const [lessons, setLessons] = useState(initialLessons);
  const [questions, setQuestions] = useState(initialQuestions);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const computeXpMeta = useCallback((totalXp) => {
    const lv = Math.floor(totalXp / XP_PER_LEVEL) + 1;
    const remainder = totalXp % XP_PER_LEVEL;
    const toNext = remainder === 0 ? XP_PER_LEVEL : XP_PER_LEVEL - remainder;
    return { lv, toNext };
  }, []);

  const hydrateLessons = useCallback((rows) => {
    if (!rows?.length) return initialLessons;
    return rows
      .filter((row) => row.is_active !== false)
      .map((row) => {
        const areaId = normalizeArea(row.area);
        return {
          id: row.id,
          levelId: `lvl-${row.level || 1}-${areaId}`,
          title: row.title,
          type: row.type || row.question_type || 'reading',
          areaId,
          level: row.level || 1,
          xp_reward: row.xp_reward || XP_PER_LESSON,
          order: row.order_index || 0,
          description: row.description || ''
        };
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, []);

  const hydrateQuestions = useCallback((rows) => {
    if (!rows?.length) return initialQuestions;
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

  const hydrateLevels = useCallback((lessonData, userLevel) => {
    const uniques = {};
    lessonData.forEach((ls) => {
      const key = `${ls.areaId}-${ls.level}`;
      if (!uniques[key]) {
        uniques[key] = {
          id: `lvl-${ls.level}-${ls.areaId}`,
          areaId: ls.areaId,
          name: `Nivel ${ls.level}`,
          order: ls.level
        };
      }
    });
    const arr = Object.values(uniques);
    if (!arr.length) return initialLevels;
    return arr.sort((a, b) => (a.order || 0) - (b.order || 0)).map((lvl) => ({
      ...lvl,
      unlocked: lvl.order <= (userLevel || 1)
    }));
  }, []);

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

      const [{ data: lessonsData, error: lessonsError }, { data: questionsData, error: questionsError }] =
        await Promise.all([
          supabase.from('lessons').select('*'),
          supabase.from('questions').select('*')
        ]);

      if (lessonsError) {
        console.warn('No se pudieron cargar lecciones, usando fallback', lessonsError.message);
      }
      if (questionsError) {
        console.warn('No se pudieron cargar preguntas, usando fallback', questionsError.message);
      }

      const hydratedLessons = hydrateLessons(lessonsData);
      setLessons(hydratedLessons);
      setLevels(hydrateLevels(hydratedLessons, profile?.current_level || 1));
      const hydratedQuestions = hydrateQuestions(questionsData);
      setQuestions(hydratedQuestions);

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      if (progressError) {
        console.warn('No se pudo cargar progreso, usando fallback', progressError.message);
      }
      const completed = (progressData || []).filter((row) => row.is_completed).map((row) => row.lesson_id);
      setCompletedLessons(completed.length ? completed : []);

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('total_xp, current_level')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.warn('No se pudo cargar usuario, usando fallback', userError.message);
      }
      const totalXp = userRow?.total_xp ?? 0;
      const level = userRow?.current_level ?? profile?.current_level ?? 1;
      setXp(totalXp);
      const meta = computeXpMeta(totalXp);
      setLevelNumber(level || meta.lv);
      setXpToNextLevel(meta.toNext);
    } catch (err) {
      console.warn('Error inesperado al cargar datos, usando fallback', err.message);
      setError('No se pudieron cargar datos remotos.');
    } finally {
      setLoading(false);
    }
  }, [computeXpMeta, hydrateLevels, hydrateLessons, hydrateQuestions]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

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

  const answerQuestion = useCallback(
    async ({ questionId, userAnswer, isCorrect }) => {
      if (isCorrect) {
        await addXp(XP_PER_CORRECT);
      }
      if (!currentUserId) return;
      try {
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

  const unlockedLevels = useMemo(
    () => levels.filter((lvl) => (lvl.order || 0) <= levelNumber),
    [levels, levelNumber]
  );

  const lessonById = useCallback((lessonId) => lessons.find((ls) => ls.id === lessonId), [lessons]);

  const addLevel = useCallback(
    async (payload) => {
      try {
        const basePayload = {
          title: payload.name || `Nivel ${payload.order || 1}`,
          area: payload.areaId,
          level: payload.order || 1,
          order_index: payload.order || 1,
          xp_reward: XP_PER_LESSON,
          is_active: true
        };
        const firstAttempt = await supabase.from('lessons').insert({ ...basePayload, type: payload.type || 'reading' });
        if (firstAttempt.error) {
          const retry = await supabase.from('lessons').insert(basePayload);
          if (retry.error) {
            console.warn('No se pudo crear nivel', retry.error.message);
            return;
          }
        }
        loadUserData();
      } catch (err) {
        console.warn('Error inesperado al crear nivel', err.message);
      }
    },
    [loadUserData]
  );

  const addLesson = useCallback(
    async (payload) => {
      try {
        const basePayload = {
          title: payload.title,
          description: payload.description || '',
          area: payload.areaId || payload.area || 'vocab',
          level: payload.level || 1,
          order_index: payload.order || 0,
          xp_reward: payload.xp_reward || XP_PER_LESSON,
          is_active: payload.is_active ?? true
        };
        const firstAttempt = await supabase.from('lessons').insert({ ...basePayload, type: payload.type || 'reading' });
        if (firstAttempt.error) {
          const retry = await supabase.from('lessons').insert(basePayload);
          if (retry.error) {
            console.warn('No se pudo crear leccion', retry.error.message);
            return;
          }
        }
        loadUserData();
      } catch (err) {
        console.warn('Error inesperado al crear leccion', err.message);
      }
    },
    [loadUserData]
  );

  const addQuestion = useCallback(
    async (payload) => {
      try {
        const { error } = await supabase.from('questions').insert({
          lesson_id: payload.lessonId,
          question_type: payload.type,
          question_text: payload.prompt,
          options: payload.options || null,
          correct_answer: payload.answerText || payload.correct_answer || '',
          answer_index: payload.answerIndex,
          explanation: payload.explanation || '',
          order_index: payload.order || 0
        });
        if (error) {
          console.warn('No se pudo crear pregunta', error.message);
        } else {
          loadUserData();
        }
      } catch (err) {
        console.warn('Error inesperado al crear pregunta', err.message);
      }
    },
    [loadUserData]
  );

  const value = useMemo(
    () => ({
      loading,
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
      reload: loadUserData
    }),
    [
      loading,
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

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress debe usarse dentro de ProgressProvider');
  }
  return ctx;
}
