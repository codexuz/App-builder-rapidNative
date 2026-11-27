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
import { DS } from '@/constants/DesignSystem';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
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
  const horizontalPad = padded ? DS.space.lg : 0;
  const bottomPad = hasTabBar ? 28 : 24;

  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DS.colors.brand}
          />
        ) : undefined
      }
      contentContainerStyle={[
        {
          paddingHorizontal: horizontalPad,
          paddingTop: DS.space.md,
          paddingBottom: bottomPad,
          gap: DS.space.lg,
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
          paddingTop: DS.space.md,
          paddingBottom: bottomPad,
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
      style={[styles.flex, { backgroundColor: DS.colors.canvas }, style]}
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
