import React, { type ComponentProps } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { Tabs } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useAppTheme } from '@/constants/Theme';
import { AnimatedPressable } from './AnimatedPressable';

type TabBarRenderFn = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;
export type NotchedFabTabBarProps = Parameters<TabBarRenderFn>[0] & {
  centerIcon?: React.ReactNode;
  centerLabel?: string;
  onCenterPress?: () => void;
};

/**
 * Bottom navigation bar with a raised circular center primary action button
 * (ideal for AI coaches, scanners, quick capture, or creation flows).
 */
export function NotchedFabTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
  centerIcon,
  centerLabel = 'Primary action',
  onCenterPress,
}: NotchedFabTabBarProps) {
  const { colors, shadows } = useAppTheme();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 10 : 8);
  const splitAt = Math.ceil(state.routes.length / 2);
  const leftRoutes = state.routes.slice(0, splitAt);
  const rightRoutes = state.routes.slice(splitAt);

  const renderTab = (route: (typeof state.routes)[number]) => {
    const index = state.routes.findIndex((r) => r.key === route.key);
    const { options } = descriptors[route.key];
    const label =
      typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : typeof options.title === 'string'
          ? options.title
          : route.name;
    const isFocused = state.index === index;

    const onPress = () => {
      const event = emitter.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigateToTab(route.key);
      }
    };

    const tint = isFocused ? colors.accent : colors.textTertiary;

    return (
      <AnimatedPressable
        key={route.key}
        haptic="selection"
        scaleTo={0.94}
        containerStyle={styles.tabSlot}
        accessibilityRole="tab"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
        onPress={onPress}
        style={styles.tabItem}
      >
        {options.tabBarIcon?.({ focused: isFocused, color: tint, size: 21 })}
        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            { color: tint, fontWeight: isFocused ? '700' : '500' },
          ]}
        >
          {label}
        </Text>
      </AnimatedPressable>
    );
  };

  return (
    <View
      style={[
        styles.bar,
        shadows.md,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
        },
      ]}
    >
      <View style={styles.sideGroup}>{leftRoutes.map(renderTab)}</View>

      <View style={styles.fabSlot}>
        <AnimatedPressable
          onPress={onCenterPress}
          haptic="medium"
          scaleTo={0.92}
          accessibilityRole="button"
          accessibilityLabel={centerLabel}
          style={[
            styles.fabRing,
            shadows.lg,
            { backgroundColor: colors.accentMuted },
          ]}
        >
          <View style={[styles.fabCore, { backgroundColor: colors.accent }]}>
            {centerIcon ?? <Sparkles size={24} color={colors.accentForeground} />}
          </View>
        </AnimatedPressable>
      </View>

      <View style={styles.sideGroup}>{rightRoutes.map(renderTab)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 8,
    minHeight: 66,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabSlot: {
    flex: 1,
    minWidth: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
  },
  fabSlot: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  fabRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabCore: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
