import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../lib/theme';

const { colors, spacing: s, typography: t } = theme;

/**
 * @param {Object} props
 * @param {{ prompt: string, type: string, options?: string[], answerIndex?: number, answerText?: string }} props.question
 * @param {number|null} props.selectedOption
 * @param {(index: number) => void} props.onSelectOption
 * @param {string} props.writtenAnswer
 * @param {(text: string) => void} props.onChangeText
 * @param {boolean} props.showFeedback
 * @param {boolean|null} props.isCorrect
 */
export const QuestionCard = memo(function QuestionCard({
  question,
  selectedOption,
  onSelectOption,
  writtenAnswer,
  onChangeText,
  showFeedback,
  isCorrect
}) {
  const renderOptions = () => {
    if (!question?.options) return null;
    return question.options.map((opt, idx) => {
      const active = selectedOption === idx;
      return (
        <Pressable
          key={`${opt}-${idx}`}
          style={[styles.option, active && styles.optionSelected]}
          onPress={() => onSelectOption(idx)}
          hitSlop={6}
        >
          <View style={[styles.radio, active && styles.radioActive]}>
            {active ? <View style={styles.radioDot} /> : null}
          </View>
          <Text style={[styles.optionText, active && { color: colors.primary }]}>{opt}</Text>
        </Pressable>
      );
    });
  };

  const renderFeedback = () => {
    if (!showFeedback || isCorrect === null || isCorrect === undefined) return null;
    const icon = isCorrect ? 'checkmark-circle-outline' : 'close-circle-outline';
    const color = isCorrect ? colors.accent : colors.error;
    const label = isCorrect ? 'Correcto' : 'Respuesta incorrecta';
    return (
      <View style={styles.feedbackRow}>
        <Ionicons name={icon} size={28} color={color} />
        <Text style={[styles.feedbackText, { color }]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.prompt}>{question?.prompt}</Text>
        {question?.type ? (
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{question.type}</Text>
          </View>
        ) : null}
      </View>

      {question?.type === 'writing' ? (
        <TextInput
          style={styles.input}
          placeholder="Escribe tu respuesta"
          value={writtenAnswer}
          onChangeText={onChangeText}
          placeholderTextColor={colors.textHint}
        />
      ) : (
        renderOptions()
      )}

      {renderFeedback()}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: s.lg,
    gap: s.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: s.sm
  },
  prompt: {
    ...t.h3,
    color: colors.textPrimary,
    flex: 1
  },
  typePill: {
    paddingHorizontal: s.md,
    paddingVertical: s.xs,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  typeText: {
    ...t.small,
    color: colors.textSecondary,
    fontWeight: '700'
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.md,
    padding: s.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.background
  },
  optionText: {
    ...t.body,
    color: colors.textPrimary
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioActive: {
    borderColor: colors.accent
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: s.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.sm
  },
  feedbackText: {
    ...t.caption,
    fontWeight: '800'
  }
});

