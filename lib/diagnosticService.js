import { supabase } from './supabaseClient';

export const diagnosticService = {
  // Recorre tablas clave para detectar datos duplicados o huerfanos.
  async checkDataIntegrity() {
    console.log('INICIANDO DIAGNOSTICO DE INTEGRIDAD...');
    const issues = [];

    const { data: lessons, error: lessonsError } = await supabase.from('lessons').select('*');
    if (lessonsError) {
      issues.push({ type: 'LESSON_FETCH_ERROR', severity: 'HIGH', message: lessonsError.message });
      return issues;
    }

    const lessonGroups = {};
    lessons?.forEach((lesson) => {
      const key = `${lesson.area}-${lesson.level}-${lesson.order_index}`;
      lessonGroups[key] = lessonGroups[key] || [];
      lessonGroups[key].push(lesson);
    });
    Object.entries(lessonGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        issues.push({
          type: 'DUPLICATE_LESSON_POSITION',
          severity: 'HIGH',
          message: `${group.length} lecciones con la misma posicion: ${key}`,
          lessons: group.map((l) => ({ id: l.id, title: l.title }))
        });
      }
    });

    const { data: questions, error: questionsError } = await supabase.from('questions').select('id, lesson_id, question_text');
    if (questionsError) {
      issues.push({ type: 'QUESTION_FETCH_ERROR', severity: 'HIGH', message: questionsError.message });
    }

    const lessonIds = new Set(lessons?.map((l) => l.id) || []);
    questions?.forEach((q) => {
      if (!lessonIds.has(q.lesson_id)) {
        issues.push({
          type: 'ORPHAN_QUESTION',
          severity: 'MEDIUM',
          message: `Pregunta ${q.id} apunta a leccion inexistente: ${q.lesson_id}`
        });
      }
    });

    const orphanQuestions = questions?.filter((q) => !q.lesson_id);
    if (orphanQuestions && orphanQuestions.length > 0) {
      issues.push({
        type: 'NULL_LESSON_ID',
        severity: 'HIGH',
        message: `${orphanQuestions.length} preguntas sin lesson_id asignado`,
        questions: orphanQuestions
      });
    }

    const questionGroups = {};
    questions?.forEach((q) => {
      const key = `${q.lesson_id}-${q.question_text}`;
      questionGroups[key] = questionGroups[key] || [];
      questionGroups[key].push(q);
    });
    Object.entries(questionGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        issues.push({
          type: 'DUPLICATE_QUESTION',
          severity: 'LOW',
          message: `${group.length} preguntas identicas en la misma leccion`,
          questions: group
        });
      }
    });

    const { data: levels, error: levelsError } = await supabase.from('levels').select('*');
    if (!levelsError) {
      const levelGroups = {};
      levels?.forEach((level) => {
        const key = `${level.area}-${level.order_index}`;
        levelGroups[key] = levelGroups[key] || [];
        levelGroups[key].push(level);
      });
      Object.entries(levelGroups).forEach(([key, group]) => {
        if (group.length > 1) {
          issues.push({
            type: 'DUPLICATE_LEVEL_ORDER',
            severity: 'HIGH',
            message: `${group.length} niveles con el mismo order en ${key}`,
            levels: group
          });
        }
      });
    } else {
      issues.push({ type: 'LEVEL_FETCH_ERROR', severity: 'MEDIUM', message: levelsError.message });
    }

    console.log(`DIAGNOSTICO COMPLETO: ${issues.length} problemas encontrados`);
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.severity}] ${issue.type} -> ${issue.message}`);
      if (issue.lessons) console.log('   Lecciones:', issue.lessons);
      if (issue.questions) console.log('   Preguntas:', issue.questions);
      if (issue.levels) console.log('   Niveles:', issue.levels);
    });

    return issues;
  },

  // Explora una leccion especifica y sus preguntas relacionadas.
  async inspectLesson(lessonId) {
    console.log(`INSPECCIONANDO LECCION: ${lessonId}`);
    const { data: lesson } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
    const { data: questions } = await supabase.from('questions').select('*').eq('lesson_id', lessonId);
    const { data: similarLessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('area', lesson?.area)
      .eq('level', lesson?.level);

    console.log('Leccion:', lesson);
    console.log(`Preguntas asociadas: ${questions?.length || 0}`);
    console.log(`Lecciones en el mismo area/nivel: ${similarLessons?.length || 0}`);

    return { lesson, questions, similarLessons };
  }
};
