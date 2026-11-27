import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '@/constants/Theme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Reserves extra bottom padding so content clears the FloatingTabBar. */
  hasTabBar?: boolean;
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  hasTabBar = false,
  edges = ['top', 'left', 'right'],
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const { colors, spacing } = useAppTheme();
  const horizontalPad = padded ? spacing.lg : 0;
  const bottomPad = hasTabBar ? 112 : spacing.xxl;

  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        ) : undefined
      }
      contentContainerStyle={[
        {
          paddingHorizontal: horizontalPad,
          paddingTop: spacing.sm,
          paddingBottom: bottomPad,
          gap: spacing.lg,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        {
          paddingHorizontal: horizontalPad,
          paddingTop: spacing.sm,
          paddingBottom: hasTabBar ? 96 : spacing.lg,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, { backgroundColor: colors.background }, style]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
