import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { playTileTapSound } from '@/utils/soundFeedback';

export type LeoPose =
  | 'idle'
  | 'wave'
  | 'cheer'
  | 'oops'
  | 'think'
  | 'sleep'
  | 'sad'
  | 'roar'
  | 'folded'
  | 'hat';

export const LEO_ART: Record<LeoPose, ImageSourcePropType> = {
  idle: require('../../assets/images/leo/leo-idle.webp'),
  wave: require('../../assets/images/leo/leo-wave.webp'),
  cheer: require('../../assets/images/leo/leo-cheer.webp'),
  oops: require('../../assets/images/leo/leo-oops.webp'),
  think: require('../../assets/images/leo/leo-think.webp'),
  sleep: require('../../assets/images/leo/leo-sleep.webp'),
  sad: require('../../assets/images/leo/leo-sad.webp'),
  roar: require('../../assets/images/leo/leo-roar.webp'),
  folded: require('../../assets/images/leo/leo-folded.webp'),
  hat: require('../../assets/images/leo/leo-hat.webp'),
};

export interface LeoMascotProps {
  pose?: LeoPose;
  size?: number;
  animate?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Official Impulse snow leopard mascot Leo — mirrors erp-lms/apps/student/components/mascot/leo.tsx
 * with gentle floating bob, energetic cheer/roar hop, and playful tap jump.
 */
export function LeoMascot({
  pose = 'wave',
  size = 86,
  animate = true,
  onPress,
  style,
}: LeoMascotProps) {
  const bobY = useSharedValue(0);
  const jumpY = useSharedValue(0);

  useEffect(() => {
    if (!animate || pose === 'sleep') {
      bobY.value = 0;
      return;
    }
    const energetic = pose === 'cheer' || pose === 'roar';
    const lift = energetic ? -8 : -3.5;
    const dur = energetic ? 420 : 1150;
    bobY.value = withRepeat(
      withSequence(
        withTiming(lift, { duration: dur, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: dur, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [animate, pose, bobY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobY.value + jumpY.value }],
  }));

  const handlePress = () => {
    playTileTapSound(undefined, true);
    jumpY.value = withSequence(
      withSpring(-15, { damping: 9, stiffness: 260 }),
      withSpring(0, { damping: 11, stiffness: 200 })
    );
    onPress?.();
  };

  const height = Math.round((size * 260) / 240);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress && !animate}
      accessibilityRole="imagebutton"
      accessibilityLabel={`Leo the snow leopard (${pose})`}
      style={[styles.wrap, { width: size, height }, style]}
    >
      <Animated.View style={animStyle}>
        <Image
          source={LEO_ART[pose]}
          style={{ width: size, height }}
          resizeMode="contain"
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
