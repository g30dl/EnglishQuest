import { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useProgress } from '../../context/ProgressContext';
import { AREAS, AREA_COLORS } from '../../lib/constants';

const colors = {
  primary: '#1B5E20',
  accent: '#00C853',
  background: '#E8F5E9'
};

const typeIcons = {
  reading: 'book-outline',
  writing: 'create-outline',
  listening: 'headset-outline'
};

export default function AdminContentScreen() {
  const { areas, levels, lessons, questions, addLevel, addLesson, addQuestion, deleteLesson, reload } = useProgress();

  const [expandedAreas, setExpandedAreas] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({});
  const [form, setForm] = useState({
    areaId: 'vocabulario',
    levelOrder: 1,
    lessonTitle: '',
    lessonType: 'reading',
    questionPrompt: '',
    questionType: 'reading',
    options: '',
    answerIndex: '',
    answerText: ''
  });
  const [message, setMessage] = useState('');

  const toggleArea = (id) => {
    setExpandedAreas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLevel = (id) => {
    setExpandedLevels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const grouped = useMemo(() => {
    const areaMap = {};
    AREAS.forEach((a) => {
      areaMap[a] = { areaId: a, levels: [] };
    });
    levels.forEach((lvl) => {
      if (!areaMap[lvl.areaId]) areaMap[lvl.areaId] = { areaId: lvl.areaId, levels: [] };
      areaMap[lvl.areaId].levels.push(lvl);
    });
    Object.values(areaMap).forEach((entry) => {
      entry.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    return Object.values(areaMap);
  }, [levels]);

  const lessonsByAreaLevel = useMemo(() => {
    const map = {};
    lessons.forEach((ls) => {
      const key = `${ls.areaId}-${ls.level}`;
      map[key] = map[key] || [];
      map[key].push(ls);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.order || 0) - (b.order || 0)));
    return map;
  }, [lessons]);

  const questionsByLesson = useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      map[q.lessonId] = map[q.lessonId] || [];
      map[q.lessonId].push(q);
    });
    return map;
  }, [questions]);

  const handleAddLevel = async (areaId) => {
    const nextOrder = (levels.filter((l) => l.areaId === areaId).length || 0) + 1;
    const result = await addLevel({ areaId, order: nextOrder, name: `Nivel ${nextOrder}` });
    if (result?.success) {
      setMessage(`Nivel creado en ${areaId}`);
      reload?.();
    } else {
      setMessage(result?.error || 'No se pudo crear el nivel');
    }
  };

  const handleAddLesson = async (areaId, order) => {
    if (!form.lessonTitle.trim()) {
      setMessage('Escribe un titulo para la leccion');
      return;
    }
    const result = await addLesson({
      title: form.lessonTitle.trim(),
      area: areaId,
      level: order,
      type: form.lessonType,
      xp_reward: 50,
      order: (lessonsByAreaLevel[`${areaId}-${order}`]?.length || 0) + 1
    });
    if (result?.success) {
      setMessage('Leccion creada');
      setForm((prev) => ({ ...prev, lessonTitle: '' }));
      reload?.();
    } else {
      setMessage(result?.error || 'No se pudo crear la leccion');
    }
  };

  const handleAddQuestion = async (lessonId) => {
    if (!form.questionPrompt.trim()) {
      setMessage('Escribe un prompt para la pregunta');
      return;
    }
    const isWriting = form.questionType === 'writing';
    const opts = isWriting
      ? null
      : form.options
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);
    const result = await addQuestion({
      lessonId,
      type: form.questionType,
      prompt: form.questionPrompt.trim(),
      options: opts,
      answerText: isWriting ? form.answerText.trim() : undefined,
      answerIndex: isWriting ? null : Number(form.answerIndex),
      audioText: form.questionType === 'listening' ? form.questionPrompt.trim() : undefined
    });
    if (result?.success) {
      setMessage('Pregunta creada');
      setForm((prev) => ({
        ...prev,
        questionPrompt: '',
        options: '',
        answerIndex: '',
        answerText: ''
      }));
      reload?.();
    } else {
      setMessage(result?.error || 'No se pudo crear la pregunta');
    }
  };

  const handleDeleteLesson = (lesson) => {
    const qCount = questionsByLesson[lesson.id]?.length || 0;
    Alert.alert(
      'Eliminar leccion',
      `Esta leccion tiene ${qCount} preguntas. Deseas eliminarla?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteLesson(lesson.id);
            if (!result?.success) {
              setMessage(result?.error || 'No se pudo eliminar la leccion');
            } else {
              setMessage('Leccion eliminada');
              reload?.();
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.heading}>Contenido (Areas / Niveles / Lecciones / Preguntas)</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {AREAS.map((areaId) => {
        const areaLevels = levels.filter((l) => l.areaId === areaId).sort((a, b) => (a.order || 0) - (b.order || 0));
        return (
          <View key={areaId} style={styles.areaCard}>
            <TouchableOpacity style={styles.areaHeader} onPress={() => toggleArea(areaId)}>
              <View style={styles.areaTitleRow}>
                <View style={[styles.areaDot, { backgroundColor: AREA_COLORS[areaId] || colors.primary }]} />
                <Text style={styles.areaTitle}>{areaId}</Text>
              </View>
              <Ionicons
                name={expandedAreas[areaId] ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>

            {expandedAreas[areaId] && (
              <View style={styles.areaBody}>
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddLevel(areaId)}>
                  <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                  <Text style={styles.addText}>Agregar nivel</Text>
                </TouchableOpacity>

                {areaLevels.length === 0 ? (
                  <Text style={styles.empty}>No hay niveles en esta area.</Text>
                ) : (
                  areaLevels.map((lvl) => {
                    const lvlLessons = lessonsByAreaLevel[`${areaId}-${lvl.order}`] || [];
                    return (
                      <View key={lvl.id} style={styles.levelCard}>
                        <TouchableOpacity style={styles.levelHeader} onPress={() => toggleLevel(lvl.id)}>
                          <Text style={styles.levelTitle}>
                            {lvl.name} (orden {lvl.order})
                          </Text>
                          <View style={styles.badges}>
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>{lvlLessons.length} lecciones</Text>
                            </View>
                          </View>
                          <Ionicons
                            name={expandedLevels[lvl.id] ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color="#555"
                          />
                        </TouchableOpacity>

                        {expandedLevels[lvl.id] && (
                          <View style={styles.levelBody}>
                            <TouchableOpacity style={styles.addButton} onPress={() => handleAddLesson(areaId, lvl.order)}>
                              <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                              <Text style={styles.addText}>Agregar leccion</Text>
                            </TouchableOpacity>

                            {lvlLessons.length === 0 ? (
                              <Text style={styles.empty}>No hay lecciones en este nivel.</Text>
                            ) : (
                              lvlLessons.map((lesson) => (
                                <View key={lesson.id} style={styles.lessonRow}>
                                  <View style={styles.lessonTitleBox}>
                                    <Ionicons
                                      name={typeIcons[lesson.type] || 'book-outline'}
                                      size={16}
                                      color={colors.primary}
                                    />
                                    <Text style={styles.lessonTitleText}>{lesson.title}</Text>
                                  </View>
                                  <View style={styles.badges}>
                                    <View style={styles.badge}>
                                      <Text style={styles.badgeText}>
                                        {(questionsByLesson[lesson.id]?.length || 0)} preguntas
                                      </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteLesson(lesson)}>
                                      <Ionicons name="trash-outline" size={18} color="#d32f2f" />
                                    </TouchableOpacity>
                                  </View>

                                  <View style={styles.questionForm}>
                                    <Text style={styles.label}>Nueva pregunta para {lesson.title}</Text>
                                    <TextInput
                                      style={styles.input}
                                      placeholder="Prompt"
                                      value={form.questionPrompt}
                                      onChangeText={(t) => setForm((prev) => ({ ...prev, questionPrompt: t }))}
                                    />
                                    <View style={styles.chipsRow}>
                                      {['reading', 'writing', 'listening'].map((opt) => (
                                        <TouchableOpacity
                                          key={opt}
                                          style={[
                                            styles.chip,
                                            form.questionType === opt && styles.chipActive
                                          ]}
                                          onPress={() => setForm((prev) => ({ ...prev, questionType: opt }))}
                                        >
                                          <Text
                                            style={[
                                              styles.chipText,
                                              form.questionType === opt && styles.chipTextActive
                                            ]}
                                          >
                                            {opt}
                                          </Text>
                                        </TouchableOpacity>
                                      ))}
                                    </View>
                                    {form.questionType === 'writing' ? (
                                      <TextInput
                                        style={styles.input}
                                        placeholder="Respuesta texto"
                                        value={form.answerText}
                                        onChangeText={(t) => setForm((prev) => ({ ...prev, answerText: t }))}
                                      />
                                    ) : (
                                      <>
                                        <TextInput
                                          style={styles.input}
                                          placeholder="Opciones separadas por coma"
                                          value={form.options}
                                          onChangeText={(t) => setForm((prev) => ({ ...prev, options: t }))}
                                        />
                                        <TextInput
                                          style={styles.input}
                                          placeholder="Indice de respuesta (0 basado)"
                                          value={form.answerIndex}
                                          onChangeText={(t) => setForm((prev) => ({ ...prev, answerIndex: t }))}
                                          keyboardType="numeric"
                                        />
                                      </>
                                    )}
                                    <TouchableOpacity
                                      style={styles.addButton}
                                      onPress={() => handleAddQuestion(lesson.id)}
                                    >
                                      <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                                      <Text style={styles.addText}>Agregar pregunta</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ))
                            )}

                            <View style={styles.lessonForm}>
                              <Text style={styles.label}>Crear leccion en {areaId} > Nivel {lvl.order}</Text>
                              <TextInput
                                style={styles.input}
                                placeholder="Titulo de la leccion"
                                value={form.lessonTitle}
                                onChangeText={(t) => setForm((prev) => ({ ...prev, lessonTitle: t }))}
                              />
                              <View style={styles.chipsRow}>
                                {['reading', 'writing', 'listening'].map((opt) => (
                                  <TouchableOpacity
                                    key={opt}
                                    style={[styles.chip, form.lessonType === opt && styles.chipActive]}
                                    onPress={() => setForm((prev) => ({ ...prev, lessonType: opt }))}
                                  >
                                    <Text style={[styles.chipText, form.lessonType === opt && styles.chipTextActive]}>
                                      {opt}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                              <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => handleAddLesson(areaId, lvl.order)}
                              >
                                <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                                <Text style={styles.addText}>Crear leccion</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 10
  },
  message: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 8
  },
  areaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  areaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  areaDot: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  areaBody: {
    marginTop: 8,
    gap: 8
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8
  },
  addText: {
    color: colors.accent,
    fontWeight: '700'
  },
  empty: {
    color: '#555',
    fontSize: 13
  },
  levelCard: {
    backgroundColor: '#f9faf9',
    borderRadius: 10,
    padding: 10,
    gap: 8
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  levelTitle: {
    fontWeight: '800',
    color: '#2e2e2e'
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  badge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '700'
  },
  levelBody: {
    gap: 8
  },
  lessonRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  lessonTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  lessonTitleText: {
    fontWeight: '800',
    color: colors.primary
  },
  questionForm: {
    backgroundColor: '#f6f7f6',
    borderRadius: 10,
    padding: 8,
    gap: 6
  },
  lessonForm: {
    backgroundColor: '#f6f7f6',
    borderRadius: 10,
    padding: 8,
    gap: 6
  },
  label: {
    fontWeight: '700',
    color: '#444'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e5d8',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff'
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f1'
  },
  chipActive: {
    backgroundColor: colors.accent
  },
  chipText: {
    color: '#555',
    fontWeight: '600'
  },
  chipTextActive: {
    color: '#fff'
  }
});
