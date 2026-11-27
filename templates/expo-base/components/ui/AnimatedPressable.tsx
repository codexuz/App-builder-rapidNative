import React from 'react';
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Motion } from '@/constants/Theme';

export type HapticStyle = 'none' | 'light' | 'medium' | 'selection';

export interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  haptic?: HapticStyle;
  scaleTo?: number;
  children?: React.ReactNode;
}

function triggerHaptic(haptic: HapticStyle) {
  if (Platform.OS === 'web' || haptic === 'none') return;
  if (haptic === 'selection') {
    void Haptics.selectionAsync();
  } else if (haptic === 'medium') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function AnimatedPressable({
  style,
  containerStyle,
  haptic = 'light',
  scaleTo = Motion.pressScale,
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <Pressable
        disabled={disabled}
        onPressIn={(event) => {
          scale.value = withSpring(scaleTo, Motion.spring);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.value = withSpring(1, Motion.spring);
          onPressOut?.(event);
        }}
        onPress={(event) => {
          triggerHaptic(haptic);
          onPress?.(event);
        }}
        style={style}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
