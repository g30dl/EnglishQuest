import { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
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
  const {
    levels,
    lessons,
    questions,
    addLevel,
    addLesson,
    addQuestion,
    updateLesson,
    deleteLesson,
    reload
  } = useProgress();

  const [viewMode, setViewMode] = useState('list'); // list | create
  const [expandedAreas, setExpandedAreas] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({});
  const [message, setMessage] = useState('');

  const [createForm, setCreateForm] = useState({
    areaId: 'vocabulario',
    level: 1,
    title: '',
    type: 'reading',
    order: 1
  });

  const [questionForm, setQuestionForm] = useState({
    prompt: '',
    type: 'reading',
    options: '',
    answerIndex: '',
    answerText: ''
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState(null);

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

  const areaLevels = useMemo(() => {
    const grouped = {};
    AREAS.forEach((id) => {
      grouped[id] = [];
    });
    levels.forEach((lvl) => {
      const key = lvl.areaId;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(lvl);
    });
    Object.values(grouped).forEach((arr) => arr.sort((a, b) => (a.order || 0) - (b.order || 0)));
    return grouped;
  }, [levels]);

  const toggleArea = (id) => setExpandedAreas((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleLevel = (id) => setExpandedLevels((prev) => ({ ...prev, [id]: !prev[id] }));

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

  const handleCreateLesson = async () => {
    if (!createForm.title.trim()) {
      setMessage('Escribe un titulo para la leccion');
      return;
    }
    const result = await addLesson({
      title: createForm.title.trim(),
      area: createForm.areaId,
      level: Number(createForm.level) || 1,
      type: createForm.type,
      order: Number(createForm.order) || 1
    });
    if (result?.success) {
      setMessage('Leccion creada');
      setCreateForm((prev) => ({ ...prev, title: '' }));
      reload?.();
      setViewMode('list');
    } else {
      setMessage(result?.error || 'No se pudo crear la leccion');
    }
  };

  const handleEditOpen = (lesson) => {
    setEditForm({
      id: lesson.id,
      title: lesson.title,
      areaId: lesson.areaId,
      level: lesson.level,
      type: lesson.type,
      order: lesson.order
    });
    setEditModalVisible(true);
  };

  const handleUpdateLesson = async () => {
    if (!editForm?.title?.trim()) {
      setMessage('El titulo es requerido');
      return;
    }
    const result = await updateLesson(editForm.id, {
      title: editForm.title.trim(),
      area: editForm.areaId,
      level: Number(editForm.level) || 1,
      type: editForm.type,
      order: Number(editForm.order) || 1
    });
    if (result?.success) {
      setMessage('Leccion actualizada');
      setEditModalVisible(false);
      setEditForm(null);
      reload?.();
    } else {
      setMessage(result?.error || 'No se pudo actualizar');
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

  const handleAddQuestion = async (lessonId) => {
    if (!questionForm.prompt.trim()) {
      setMessage('Escribe un prompt para la pregunta');
      return;
    }
    const isWriting = questionForm.type === 'writing';
    const opts = isWriting
      ? null
      : questionForm.options
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);
    const result = await addQuestion({
      lessonId,
      type: questionForm.type,
      prompt: questionForm.prompt.trim(),
      options: opts,
      answerText: isWriting ? questionForm.answerText.trim() : undefined,
      answerIndex: isWriting ? null : Number(questionForm.answerIndex),
      audioText: questionForm.type === 'listening' ? questionForm.prompt.trim() : undefined
    });
    if (result?.success) {
      setMessage('Pregunta creada');
      setQuestionForm({
        prompt: '',
        type: 'reading',
        options: '',
        answerIndex: '',
        answerText: ''
      });
      reload?.();
    } else {
      setMessage(result?.error || 'No se pudo crear la pregunta');
    }
  };

  const renderLessons = (areaId, lvl) => {
    const lessonList = lessonsByAreaLevel[`${areaId}-${lvl.order}`] || [];
    if (lessonList.length === 0) {
      return <Text style={styles.empty}>No hay lecciones en este nivel.</Text>;
    }
    return lessonList.map((lesson) => {
      const qCount = questionsByLesson[lesson.id]?.length || 0;
      return (
        <View key={lesson.id} style={styles.lessonRow}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonTitleBox}>
              <Ionicons name={typeIcons[lesson.type] || 'book-outline'} size={16} color={colors.primary} />
              <Text style={styles.lessonTitleText}>{lesson.title}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => handleEditOpen(lesson)}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteLesson(lesson)}>
                <Ionicons name="trash-outline" size={18} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{qCount} preguntas</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Orden {lesson.order || 0}</Text>
            </View>
          </View>

          <View style={styles.questionForm}>
            <Text style={styles.label}>Agregar pregunta a "{lesson.title}"</Text>
            <TextInput
              style={styles.input}
              placeholder="Prompt"
              value={questionForm.prompt}
              onChangeText={(t) => setQuestionForm((prev) => ({ ...prev, prompt: t }))}
            />
            <View style={styles.chipsRow}>
              {['reading', 'writing', 'listening'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, questionForm.type === opt && styles.chipActive]}
                  onPress={() => setQuestionForm((prev) => ({ ...prev, type: opt }))}
                >
                  <Text style={[styles.chipText, questionForm.type === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {questionForm.type === 'writing' ? (
              <TextInput
                style={styles.input}
                placeholder="Respuesta texto"
                value={questionForm.answerText}
                onChangeText={(t) => setQuestionForm((prev) => ({ ...prev, answerText: t }))}
              />
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Opciones separadas por coma"
                  value={questionForm.options}
                  onChangeText={(t) => setQuestionForm((prev) => ({ ...prev, options: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Indice de respuesta (0 basado)"
                  value={questionForm.answerIndex}
                  onChangeText={(t) => setQuestionForm((prev) => ({ ...prev, answerIndex: t }))}
                  keyboardType="numeric"
                />
              </>
            )}
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddQuestion(lesson.id)}>
              <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
              <Text style={styles.addText}>Agregar pregunta</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  };

  const renderListView = () => (
    <ScrollView style={styles.section} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      {AREAS.map((areaId) => (
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

              {(areaLevels[areaId] || []).length === 0 ? (
                <Text style={styles.empty}>No hay niveles en esta area.</Text>
              ) : (
                areaLevels[areaId].map((lvl) => (
                  <View key={lvl.id} style={styles.levelCard}>
                    <TouchableOpacity style={styles.levelHeader} onPress={() => toggleLevel(lvl.id)}>
                      <Text style={styles.levelTitle}>
                        {lvl.name} (orden {lvl.order})
                      </Text>
                      <View style={styles.badges}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {(lessonsByAreaLevel[`${areaId}-${lvl.order}`]?.length || 0)} lecciones
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name={expandedLevels[lvl.id] ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#555"
                      />
                    </TouchableOpacity>

                    {expandedLevels[lvl.id] && <View style={styles.levelBody}>{renderLessons(areaId, lvl)}</View>}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderCreateView = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Crear nueva leccion</Text>
      <View style={styles.formRow}>
        {AREAS.map((area) => (
          <TouchableOpacity
            key={area}
            style={[styles.chip, createForm.areaId === area && styles.chipActive]}
            onPress={() => setCreateForm((prev) => ({ ...prev, areaId: area }))}
          >
            <Text style={[styles.chipText, createForm.areaId === area && styles.chipTextActive]}>{area}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Titulo"
        value={createForm.title}
        onChangeText={(t) => setCreateForm((prev) => ({ ...prev, title: t }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Nivel (numero)"
        keyboardType="numeric"
        value={String(createForm.level)}
        onChangeText={(t) => setCreateForm((prev) => ({ ...prev, level: t }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Orden"
        keyboardType="numeric"
        value={String(createForm.order)}
        onChangeText={(t) => setCreateForm((prev) => ({ ...prev, order: t }))}
      />
      <View style={styles.formRow}>
        {['reading', 'writing', 'listening'].map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, createForm.type === opt && styles.chipActive]}
            onPress={() => setCreateForm((prev) => ({ ...prev, type: opt }))}
          >
            <Text style={[styles.chipText, createForm.type === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleCreateLesson}>
        <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
        <Text style={styles.addText}>Crear leccion</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Contenido (Areas / Niveles / Lecciones / Preguntas)</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'list' && styles.tabActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.tabText, viewMode === 'list' && styles.tabTextActive]}>Listado</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'create' && styles.tabActive]}
          onPress={() => setViewMode('create')}
        >
          <Text style={[styles.tabText, viewMode === 'create' && styles.tabTextActive]}>Crear leccion</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? renderListView() : renderCreateView()}

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.heading}>Editar leccion</Text>
            {editForm ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Titulo"
                  value={editForm.title}
                  onChangeText={(t) => setEditForm((prev) => ({ ...prev, title: t }))}
                />
                <View style={styles.formRow}>
                  {AREAS.map((area) => (
                    <TouchableOpacity
                      key={area}
                      style={[styles.chip, editForm.areaId === area && styles.chipActive]}
                      onPress={() => setEditForm((prev) => ({ ...prev, areaId: area }))}
                    >
                      <Text style={[styles.chipText, editForm.areaId === area && styles.chipTextActive]}>{area}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nivel"
                  keyboardType="numeric"
                  value={String(editForm.level)}
                  onChangeText={(t) => setEditForm((prev) => ({ ...prev, level: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Orden"
                  keyboardType="numeric"
                  value={String(editForm.order || 0)}
                  onChangeText={(t) => setEditForm((prev) => ({ ...prev, order: t }))}
                />
                <View style={styles.formRow}>
                  {['reading', 'writing', 'listening'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.chip, editForm.type === opt && styles.chipActive]}
                      onPress={() => setEditForm((prev) => ({ ...prev, type: opt }))}
                    >
                      <Text style={[styles.chipText, editForm.type === opt && styles.chipTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleUpdateLesson}>
                    <Text style={styles.saveText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
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
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  tab: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8e5d8'
  },
  tabActive: {
    backgroundColor: '#e8f5e9',
    borderColor: colors.accent
  },
  tabText: {
    color: '#555',
    fontWeight: '700'
  },
  tabTextActive: {
    color: colors.accent
  },
  section: {
    flex: 1
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
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  actionsRow: {
    flexDirection: 'row',
    gap: 10
  },
  questionForm: {
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
  },
  formRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 10
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#eee'
  },
  cancelText: {
    color: '#555',
    fontWeight: '700'
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.accent
  },
  saveText: {
    color: '#fff',
    fontWeight: '800'
  }
});
