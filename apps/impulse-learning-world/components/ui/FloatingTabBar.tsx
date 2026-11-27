import React, { type ComponentProps } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { Tabs } from 'expo-router';
import { useAppTheme } from '@/constants/Theme';
import { AnimatedPressable } from './AnimatedPressable';

type TabBarRenderFn = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;
export type FloatingTabBarProps = Parameters<TabBarRenderFn>[0];

/**
 * Modern floating pill bottom tab bar for Expo Router `<Tabs tabBar={(p) => <FloatingTabBar {...p} />} />`.
 */
export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: FloatingTabBarProps) {
  const { colors, radii, shadows } = useAppTheme();
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'web' ? 16 : 12);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: bottomOffset }]}>
      <View
        style={[
          styles.bar,
          shadows.lg,
          {
            backgroundColor: colors.tabBarBg,
            borderColor: colors.tabBarBorder,
            borderRadius: radii.pill,
          },
        ]}
      >
        {state.routes.map((route, index) => {
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

          const iconColor = isFocused ? colors.accentForeground : colors.textSecondary;

          return (
            <AnimatedPressable
              key={route.key}
              haptic="selection"
              scaleTo={0.95}
              containerStyle={styles.tabSlot}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              style={[
                styles.tabItem,
                {
                  borderRadius: radii.pill,
                  backgroundColor: isFocused ? colors.accent : 'transparent',
                },
              ]}
            >
              {options.tabBarIcon?.({ focused: isFocused, color: iconColor, size: 18 })}
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: iconColor,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    borderWidth: 1,
    gap: 2,
    maxWidth: 420,
    width: '100%',
    overflow: 'hidden',
  },
  tabSlot: {
    flex: 1,
    minWidth: 0,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 4,
    minWidth: 0,
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
});
