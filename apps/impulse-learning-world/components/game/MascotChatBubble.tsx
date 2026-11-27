import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { LeoMascot, type LeoPose } from '@/components/mascot/LeoMascot';
import { AnimatedPressable } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';

export interface MascotChatBubbleProps {
  eyebrow?: string;
  /** Main instruction spoken by Leo */
  message: string;
  /** Optional subtle hint underneath */
  subHint?: string;
  /** Official Leo mascot pose */
  pose?: LeoPose;
  /** Accent color for speaker button & eyebrow */
  accentColor: string;
  /** Soft pastel background for speaker button */
  softAccentColor: string;
  /** Whether Leo is currently reading aloud */
  isSpeaking?: boolean;
  /** Triggered when tapping the bubble or speaker icon */
  onSpeakPress: () => void;
}

/**
 * Duolingo-style Leo mascot chat bubble: Leo the snow leopard stands beside a pointed
 * white speech bubble with a tappable read-aloud speaker button.
 */
export function MascotChatBubble({
  eyebrow,
  message,
  subHint,
  pose = 'wave',
  accentColor,
  softAccentColor,
  isSpeaking = false,
  onSpeakPress,
}: MascotChatBubbleProps) {
  const { colors, typography } = useAppTheme();

  return (
    <View style={styles.row}>
      <LeoMascot pose={pose} size={74} onPress={onSpeakPress} style={styles.mascotWrap} />

      {/* Pointed Speech Bubble with SVG Tail */}
      <View style={styles.bubbleOuter}>
        <View style={styles.tailWrap} pointerEvents="none">
          <Svg width={13} height={20} viewBox="0 0 13 20">
            <Path
              d="M13 2 L2 10 L13 18"
              fill={colors.surface}
              stroke={colors.borderStrong}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Path d="M11.5 2 L13 2 L13 18 L11.5 18 Z" fill={colors.surface} />
          </Svg>
        </View>

        <AnimatedPressable
          onPress={onSpeakPress}
          containerStyle={{ flex: 1, minWidth: 0 }}
          accessibilityLabel={`Read aloud: ${message}`}
          style={[
            styles.bubbleCard,
            {
              backgroundColor: colors.surface,
              borderColor: isSpeaking ? accentColor : colors.borderStrong,
            },
          ]}
        >
          <View
            style={[
              styles.speakerBadge,
              { backgroundColor: isSpeaking ? accentColor : softAccentColor },
            ]}
          >
            <Volume2 size={17} color={isSpeaking ? '#FFFFFF' : accentColor} />
          </View>

          <View style={styles.textCol}>
            {eyebrow ? (
              <Text style={[styles.eyebrow, { color: accentColor }]}>{eyebrow}</Text>
            ) : null}
            <Text style={[typography.callout, styles.messageText, { color: colors.textPrimary }]}>
              {message}
            </Text>
            {subHint ? (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {subHint}
              </Text>
            ) : null}
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  mascotWrap: {
    marginLeft: -4,
  },
  bubbleOuter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  tailWrap: {
    marginRight: -2,
    zIndex: 2,
  },
  bubbleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 18,
    borderWidth: 1.75,
    borderBottomWidth: 3.5,
  },
  speakerBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '700',
  },
});
