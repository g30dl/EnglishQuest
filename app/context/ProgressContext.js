import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const XP_PER_CORRECT = 10;
const XP_PER_LESSON = 50;
const XP_PER_LEVEL = 500;

const initialAreas = [
  { id: 'vocab', name: 'Vocabulario', description: 'Amplía tu vocabulario con prácticas guiadas.', color: '#1B5E20' },
  { id: 'grammar', name: 'Gramática', description: 'Refuerza estructuras y tiempos verbales.', color: '#00C853' },
  { id: 'listening', name: 'Listening', description: 'Mejora comprensión auditiva con audios cortos.', color: '#4CAF50' }
];

const initialLevels = [
  { id: 'lvl1', areaId: 'vocab', name: 'Nivel 1', order: 1 },
  { id: 'lvl2', areaId: 'grammar', name: 'Nivel 2', order: 2 },
  { id: 'lvl3', areaId: 'listening', name: 'Nivel 3', order: 3 }
];

const initialLessons = [
  { id: 'ls1', levelId: 'lvl1', title: 'Saludos básicos', type: 'reading' },
  { id: 'ls2', levelId: 'lvl1', title: 'Colores y números', type: 'writing' },
  { id: 'ls3', levelId: 'lvl2', title: 'Present Simple vs Continuous', type: 'reading' },
  { id: 'ls4', levelId: 'lvl3', title: 'Dialogo en el aeropuerto', type: 'listening' }
];

const initialQuestions = [
  { id: 'q1', lessonId: 'ls1', type: 'reading', prompt: 'Selecciona el saludo formal', options: ['Hi', 'Hello', 'Good morning'], answerIndex: 2 },
  { id: 'q2', lessonId: 'ls2', type: 'writing', prompt: 'Escribe el número "seven" en inglés', answerIndex: 0 },
  { id: 'q3', lessonId: 'ls4', type: 'listening', prompt: 'Escucha y selecciona la intención', options: ['Check-in', 'Boarding', 'Asking directions'], answerIndex: 0 }
];

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [xp, setXp] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [areas] = useState(initialAreas);
  const [levels, setLevels] = useState(initialLevels);
  const [lessons, setLessons] = useState(initialLessons);
  const [questions, setQuestions] = useState(initialQuestions);

  const levelNumber = useMemo(() => Math.floor(xp / XP_PER_LEVEL) + 1, [xp]);
  const xpToNextLevel = useMemo(() => XP_PER_LEVEL - (xp % XP_PER_LEVEL || XP_PER_LEVEL), [xp]);

  const addXp = useCallback((amount) => {
    setXp((current) => Math.max(0, current + amount));
  }, []);

  const completeLesson = useCallback((lessonId) => {
    setCompletedLessons((prev) => {
      if (prev.includes(lessonId)) return prev;
      return [...prev, lessonId];
    });
    addXp(XP_PER_LESSON);
  }, [addXp]);

  const answerQuestion = useCallback(() => {
    addXp(XP_PER_CORRECT);
  }, [addXp]);

  const unlockedLevels = useMemo(
    () => levels.filter((lvl) => lvl.order <= levelNumber),
    [levels, levelNumber]
  );

  const lessonById = useCallback((lessonId) => lessons.find((ls) => ls.id === lessonId), [lessons]);

  const addLevel = useCallback((payload) => {
    setLevels((prev) => [...prev, { ...payload, id: `lvl-${prev.length + 1}` }]);
  }, []);

  const addLesson = useCallback((payload) => {
    setLessons((prev) => [...prev, { ...payload, id: `ls-${prev.length + 1}` }]);
  }, []);

  const addQuestion = useCallback((payload) => {
    setQuestions((prev) => [...prev, { ...payload, id: `q-${prev.length + 1}` }]);
  }, []);

  const value = useMemo(
    () => ({
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
      addQuestion
    }),
    [
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
      addQuestion
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
