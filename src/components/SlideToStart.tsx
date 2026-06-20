import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { radii } from '../theme/tokens';

const THUMB_SIZE = 44;
const TRACK_HEIGHT = 50;
const THRESHOLD = 0.85; // percentage of track the thumb must reach

interface SlideToStartProps {
  onStart: () => void;
  label?: string;
}

export function SlideToStart({ onStart, label = 'Slide to start' }: SlideToStartProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const completed = useSharedValue(false);

  const maxSlide = () => {
    'worklet';
    return Math.max(trackWidth.value - THUMB_SIZE - 6, 0);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (completed.value) return;
      translateX.value = Math.min(Math.max(e.translationX, 0), maxSlide());
    })
    .onEnd(() => {
      if (completed.value) return;
      const pct = translateX.value / maxSlide();
      if (pct >= THRESHOLD) {
        completed.value = true;
        translateX.value = withTiming(maxSlide(), { duration: 150 });
        runOnJS(onStart)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelStyle = useAnimatedStyle(() => {
    const max = maxSlide();
    return {
      opacity: max > 0
        ? interpolate(translateX.value, [0, max * 0.5], [1, 0], Extrapolation.CLAMP)
        : 1,
    };
  });

  const arrowStyle = useAnimatedStyle(() => {
    const max = maxSlide();
    return {
      opacity: max > 0
        ? interpolate(translateX.value, [0, max * 0.3], [1, 0], Extrapolation.CLAMP)
        : 1,
    };
  });

  return (
    <View
      style={[styles.track, { backgroundColor: colors.gold + '18' }]}
      onLayout={(e) => {
        trackWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, { backgroundColor: colors.gold }, thumbStyle]}>
          <Feather name="play" size={18} color={colors.goldButtonText} />
        </Animated.View>
      </GestureDetector>

      <Animated.View style={[styles.labelWrap, labelStyle]} pointerEvents="none">
        <Text style={[styles.label, { color: colors.gold }]}>{label}</Text>
        <Animated.View style={arrowStyle}>
          <Feather name="chevrons-right" size={16} color={colors.gold} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    justifyContent: 'center',
    marginTop: 10,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    left: 3,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 0.3,
  },
});
