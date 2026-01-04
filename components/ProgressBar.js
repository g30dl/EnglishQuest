import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';

const { colors, spacing: s, typography: t } = theme;

/**
 * @param {Object} props
 * @param {number} props.current
 * @param {number} props.total
 * @param {boolean} [props.showPercentage]
 * @param {string} [props.color]
 * @param {number} [props.height]
 * @param {boolean} [props.animated]
 */
// Barra de progreso reutilizable con animacion opcional y porcentaje.
export const ProgressBar = memo(function ProgressBar({
  current,
  total,
  showPercentage = false,
  color = colors.accent,
  height = 14,
  animated = true
}) {
  const progressValue = useMemo(() => {
    if (!total || total <= 0) return 0;
    const raw = current / total;
    return Math.min(Math.max(raw, 0), 1);
  }, [current, total]);

  const widthAnim = useRef(new Animated.Value(progressValue)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sincroniza la animacion del ancho y un ligero pulso cuando cambia el progreso.
  useEffect(() => {
    const toValue = progressValue;
    if (animated) {
      Animated.timing(widthAnim, {
        toValue,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false
      }).start(() => {
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 140, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 140, useNativeDriver: false })
        ]).start();
      });
    } else {
      widthAnim.setValue(toValue);
    }
  }, [progressValue, animated, pulseAnim, widthAnim]);

  const percentage = Math.round(progressValue * 100);
  const isHigh = percentage >= 80;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: color,
              transform: [{ scaleY: pulseAnim }],
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
        {isHigh && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              {
                height,
                width: widthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }),
                opacity: widthAnim.interpolate({
                  inputRange: [0.8, 1],
                  outputRange: [0.15, 0.35],
                  extrapolate: 'clamp'
                })
              }
            ]}
          />
        )}
      </View>
      {showPercentage && (
        <Text style={styles.meta}>{percentage}%</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: s.xs
  },
  track: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  fill: {
    borderRadius: 12
  },
  glow: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 12,
    backgroundColor: colors.gold
  },
  meta: {
    ...t.caption,
    color: colors.textSecondary,
    fontWeight: '700'
  }
});
