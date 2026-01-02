import { useMemo, useRef, useState } from 'react';
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

const typeColors = {
  reading: '#2563EB',
  writing: '#7C3AED',
  listening: '#F97316'
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

  const [expandedAreas, setExpandedAreas] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({});
  const [message, setMessage] = useState('');

  const [createForm, setCreateForm] = useState({
    areaId: 'vocabulario',
    level: 1,
    title: '',
    type: 'reading',
    order: 1,
    xpReward: 50
  });

  const [questionForm, setQuestionForm] = useState({
    prompt: '',
    type: 'reading',
    options: '',
    answerIndex: '',
    answerText: ''
  });

  const [createLessonModal, setCreateLessonModal] = useState(false);
  const [editLessonModal, setEditLessonModal] = useState(null);
  const [createQuestionModal, setCreateQuestionModal] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const scrollRef = useRef(null);
  const [levelModal, setLevelModal] = useState({ visible: false, areaId: null, name: '', order: '' });

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

  const areaLessonCount = useMemo(() => {
    const map = {};
    lessons.forEach((ls) => {
      const key = ls.areaId || ls.area;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [lessons]);

  const toggleArea = (id) => setExpandedAreas((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleLevel = (id) => setExpandedLevels((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAddLevel = async () => {
    if (!levelModal.areaId) {
      setLevelModal({ visible: false, areaId: null, name: '', order: '' });
      return;
    }
    const existingOrders = levels
      .filter((l) => l.areaId === levelModal.areaId)
      .map((l) => Number(l.order || l.level || 0));

    const nextOrderDefault = (existingOrders.length || 0) + 1;
    const order = Number(levelModal.order || nextOrderDefault) || nextOrderDefault;
    const name = levelModal.name?.trim() || `Nivel ${order}`;

    if (existingOrders.includes(order)) {
      setMessage(`Ya existe un nivel ${order} en ${levelModal.areaId}. Usa otro numero.`);
      return;
    }

    const result = await addLevel({ areaId: levelModal.areaId, order, name });
    if (result?.success) {
      setMessage(`Nivel creado en ${levelModal.areaId}`);
      setLevelModal({ visible: false, areaId: null, name: '', order: '' });
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
      order: Number(createForm.order) || 1,
      xp_reward: Number(createForm.xpReward) || 0
    });
    if (result?.success) {
      setMessage('Leccion creada');
      setCreateForm((prev) => ({ ...prev, title: '' }));
      reload?.();
      setCreateLessonModal(false);
    } else {
      setMessage(result?.error || 'No se pudo crear la leccion');
    }
  };

  const handleEditOpen = (lesson) => {
    setEditLessonModal({
      id: lesson.id,
      title: lesson.title,
      areaId: lesson.areaId,
      level: lesson.level,
      type: lesson.type,
      order: lesson.order,
      xp_reward: lesson.xp_reward || lesson.xp || 0
    });
  };

  const handleUpdateLesson = async () => {
    if (!editLessonModal?.title?.trim()) {
      setMessage('El titulo es requerido');
      return;
    }
    const result = await updateLesson(editLessonModal.id, {
      title: editLessonModal.title.trim(),
      area: editLessonModal.areaId,
      level: Number(editLessonModal.level) || 1,
      type: editLessonModal.type,
      order: Number(editLessonModal.order) || 1,
      xp_reward: Number(editLessonModal.xp_reward) || 0
    });
    if (result?.success) {
      setMessage('Leccion actualizada');
      setEditLessonModal(null);
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
      setCreateQuestionModal(null);
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
      const questionsList = questionsByLesson[lesson.id] || [];
      const qCount = questionsList.length;
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
            <TouchableOpacity
              style={styles.questionBadge}
              onPress={() => setExpandedLesson((prev) => (prev === lesson.id ? null : lesson.id))}
            >
              <Text style={styles.badgeText}>{qCount}</Text>
              <Ionicons name="help-circle-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Orden {lesson.order || 0}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>XP {lesson.xp_reward || lesson.xp || 0}</Text>
            </View>
            <View style={[styles.typePill, { backgroundColor: typeColors[lesson.type] || '#e0e0e0' }]}>
              <Ionicons name={typeIcons[lesson.type] || 'book-outline'} size={14} color="#fff" />
              <Text style={styles.typePillText}>{lesson.type}</Text>
            </View>
          </View>

          {expandedLesson === lesson.id && (
            <View style={styles.questionsBlock}>
              <View style={styles.questionHeader}>
                <Text style={styles.subheading}>Preguntas ({qCount})</Text>
              </View>
              {questionsList.length === 0 ? (
                <Text style={styles.empty}>Sin preguntas aun.</Text>
              ) : (
                questionsList.map((q, idx) => (
                  <View key={q.id || idx} style={styles.questionRow}>
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionIndex}>{idx + 1}.</Text>
                      <Text style={styles.questionPrompt}>{q.prompt}</Text>
                    </View>
                    <View style={styles.questionMeta}>
                      <Text style={styles.metaPill}>{q.type}</Text>
                      {q.type === 'writing' ? (
                        <Text style={styles.metaPill}>Completar</Text>
                      ) : (
                        <Text style={styles.metaPill}>Opcion multiple</Text>
                      )}
                      <Ionicons name="trash-outline" size={16} color="#d32f2f" />
                    </View>
                  </View>
                ))
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setCreateQuestionModal(lesson.id);
                  setQuestionForm({
                    prompt: '',
                    type: 'reading',
                    options: '',
                    answerIndex: '',
                    answerText: ''
                  });
                }}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                <Text style={styles.addText}>Agregar pregunta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    });
  };

  const renderListView = () => (
    <View style={[styles.section, { gap: 12, paddingBottom: 16 }]}>
      {AREAS.map((areaId) => (
        <View key={areaId} style={styles.areaCard}>
          <TouchableOpacity style={styles.areaHeader} onPress={() => toggleArea(areaId)}>
            <View style={styles.areaTitleRow}>
              <View style={[styles.areaDot, { backgroundColor: AREA_COLORS[areaId] || colors.primary }]} />
              <Text style={styles.areaTitle}>
                {areaId.toUpperCase()} ({(areaLevels[areaId] || []).length} niveles, {areaLessonCount[areaId] || 0} lecciones)
              </Text>
            </View>
            <Ionicons
              name={expandedAreas[areaId] ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>

          {expandedAreas[areaId] && (
            <View style={styles.areaBody}>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.addInline}
                  onPress={() => {
                    const nextOrder = (levels.filter((l) => l.areaId === areaId).length || 0) + 1;
                    setLevelModal({ visible: true, areaId, name: `Nivel ${nextOrder}`, order: String(nextOrder) });
                  }}
                >
                  <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                  <Text style={styles.addText}>Nivel</Text>
                </TouchableOpacity>
              </View>
              {(areaLevels[areaId] || []).length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="book-outline" size={32} color="#b0b0b0" />
                  <Text style={styles.empty}>No hay lecciones en esta area.</Text>
                  <TouchableOpacity onPress={() => setCreateLessonModal(true)}>
                    <Text style={styles.link}>Crear la primera leccion</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                areaLevels[areaId].map((lvl) => (
                  <View key={lvl.id} style={styles.levelCard}>
                    <TouchableOpacity style={styles.levelHeader} onPress={() => toggleLevel(lvl.id)}>
                      <View style={styles.levelTitleWrap}>
                        <Text style={styles.levelTitle}>{lvl.name}</Text>
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelBadgeText}>Lvl {lvl.order}</Text>
                        </View>
                      </View>
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
    </View>
  );

  const activeLesson = createQuestionModal ? lessons.find((l) => l.id === createQuestionModal) : null;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Lecciones y preguntas</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setCreateLessonModal(true)} activeOpacity={0.9}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.primaryText}>Crear leccion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.subheading}>Estructura por area y nivel</Text>
        <Text style={styles.helper}>Expande niveles para gestionar lecciones y preguntas.</Text>
      </View>

      {renderListView()}

      <Modal visible={createLessonModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.heading}>Crear nueva leccion</Text>
              <TouchableOpacity onPress={() => setCreateLessonModal(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>
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
              placeholder="Titulo de la leccion"
              value={createForm.title}
              onChangeText={(t) => setCreateForm((prev) => ({ ...prev, title: t }))}
            />
        <View style={styles.formRow}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Nivel (numero)"
            keyboardType="numeric"
            value={String(createForm.level)}
            onChangeText={(t) => setCreateForm((prev) => ({ ...prev, level: t }))}
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Orden"
            keyboardType="numeric"
            value={String(createForm.order)}
            onChangeText={(t) => setCreateForm((prev) => ({ ...prev, order: t }))}
          />
        </View>
        <View style={styles.formRow}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="XP Reward"
            keyboardType="numeric"
            value={String(createForm.xpReward)}
            onChangeText={(t) => setCreateForm((prev) => ({ ...prev, xpReward: t }))}
          />
        </View>
        <View style={styles.formRow}>
          {['reading', 'writing', 'listening'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                createForm.type === opt && styles.chipActive,
                createForm.type === opt && { backgroundColor: typeColors[opt] }
              ]}
              onPress={() => setCreateForm((prev) => ({ ...prev, type: opt }))}
            >
              <Text style={[styles.chipText, createForm.type === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setCreateLessonModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleCreateLesson}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={levelModal.visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.heading}>Crear nivel</Text>
              <TouchableOpacity
                onPress={() => setLevelModal({ visible: false, areaId: null, name: '', order: '' })}
                hitSlop={10}
              >
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helper}>Area: {levelModal.areaId || '-'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del nivel"
              value={levelModal.name}
              onChangeText={(t) => setLevelModal((prev) => ({ ...prev, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Numero de orden / desbloqueo"
              keyboardType="numeric"
              value={String(levelModal.order || '')}
              onChangeText={(t) => setLevelModal((prev) => ({ ...prev, order: t }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLevelModal({ visible: false, areaId: null, name: '', order: '' })}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddLevel}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!editLessonModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.heading}>Editar leccion</Text>
            {editLessonModal ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Titulo"
                  value={editLessonModal.title}
                  onChangeText={(t) => setEditLessonModal((prev) => ({ ...prev, title: t }))}
                />
                <View style={styles.formRow}>
                  {AREAS.map((area) => (
                    <TouchableOpacity
                      key={area}
                      style={[styles.chip, editLessonModal.areaId === area && styles.chipActive]}
                      onPress={() => setEditLessonModal((prev) => ({ ...prev, areaId: area }))}
                    >
                      <Text style={[styles.chipText, editLessonModal.areaId === area && styles.chipTextActive]}>{area}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nivel"
                  keyboardType="numeric"
                  value={String(editLessonModal.level)}
                  onChangeText={(t) => setEditLessonModal((prev) => ({ ...prev, level: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Orden"
                  keyboardType="numeric"
                  value={String(editLessonModal.order || 0)}
                  onChangeText={(t) => setEditLessonModal((prev) => ({ ...prev, order: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="XP Reward"
                  keyboardType="numeric"
                  value={String(editLessonModal.xp_reward || 0)}
                  onChangeText={(t) => setEditLessonModal((prev) => ({ ...prev, xp_reward: t }))}
                />
                <View style={styles.formRow}>
                  {['reading', 'writing', 'listening'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.chip,
                        editLessonModal.type === opt && styles.chipActive,
                        editLessonModal.type === opt && { backgroundColor: typeColors[opt] }
                      ]}
                      onPress={() => setEditLessonModal((prev) => ({ ...prev, type: opt }))}
                    >
                      <Text style={[styles.chipText, editLessonModal.type === opt && styles.chipTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setEditLessonModal(null)}>
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

      <Modal visible={!!createQuestionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.heading}>Agregar pregunta{activeLesson ? ` a "${activeLesson.title}"` : ''}</Text>
              <TouchableOpacity
                onPress={() => {
                  setCreateQuestionModal(null);
                }}
                hitSlop={10}
              >
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Prompt"
              value={questionForm.prompt}
              onChangeText={(t) => setQuestionForm((prev) => ({ ...prev, prompt: t }))}
            />
            <View style={styles.formRow}>
              {['reading', 'writing', 'listening'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.chip,
                    questionForm.type === opt && styles.chipActive,
                    questionForm.type === opt && { backgroundColor: typeColors[opt] }
                  ]}
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
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setCreateQuestionModal(null);
                }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => createQuestionModal && handleAddQuestion(createQuestionModal)}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16
  },
  content: {
    gap: 14,
    paddingBottom: 120
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 10
  },
  subheading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  helper: {
    fontSize: 13,
    color: '#555'
  },
  message: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 8
  },
  section: {
    flex: 1
  },
  sectionHeader: {
    gap: 4
  },
  createCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
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
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap'
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
  addInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#eef7ef'
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
    justifyContent: 'space-between',
    gap: 8
  },
  levelTitle: {
    fontWeight: '800',
    color: '#2e2e2e',
    flexShrink: 1,
    flexWrap: 'wrap'
  },
  levelTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap'
  },
  levelBadge: {
    backgroundColor: '#e3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c4cdfb'
  },
  levelBadgeText: {
    color: '#1f3a93',
    fontWeight: '800',
    fontSize: 12
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    rowGap: 4
  },
  badge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeButton: {
    backgroundColor: '#e0f2e9',
    borderColor: '#c7e8d5',
    borderWidth: 1
  },
  questionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e0f2e9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#c7e8d5'
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  typePillText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12
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
    gap: 6,
    flex: 1,
    flexWrap: 'wrap'
  },
  lessonTitleText: {
    fontWeight: '800',
    color: colors.primary,
    flexShrink: 1,
    flexWrap: 'wrap'
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
  questionsBlock: {
    backgroundColor: '#f6f7f6',
    borderRadius: 10,
    padding: 10,
    gap: 8
  },
  questionRow: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    gap: 4
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  questionIndex: {
    fontWeight: '800',
    color: colors.primary
  },
  questionPrompt: {
    flex: 1,
    color: '#222',
    fontWeight: '700'
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  metaPill: {
    backgroundColor: '#eef2f7',
    color: '#334',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '700'
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
  inputHalf: {
    flex: 1
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800'
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10
  },
  link: {
    color: colors.accent,
    fontWeight: '700'
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  fabText: {
    color: '#fff',
    fontWeight: '800'
  }
});
