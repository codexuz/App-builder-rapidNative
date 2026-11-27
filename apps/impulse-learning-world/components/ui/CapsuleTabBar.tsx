import React, { type ComponentProps } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { Tabs } from 'expo-router';
import { useAppTheme } from '@/constants/Theme';
import { AnimatedPressable } from './AnimatedPressable';

type TabBarRenderFn = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;
export type CapsuleTabBarProps = Parameters<TabBarRenderFn>[0];

/**
 * Floating capsule bottom bar inspired by modern media/commerce apps:
 * only the active tab expands to show icon + label, keeping 4–5 tabs crisp on 390px screens.
 */
export function CapsuleTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: CapsuleTabBarProps) {
  const { colors, radii, shadows } = useAppTheme();
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'web' ? 16 : 12);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: bottomOffset }]}>
      <View
        style={[
          styles.capsule,
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

          const iconColor = isFocused ? colors.accentForeground : colors.tabBarInactive;

          return (
            <AnimatedPressable
              key={route.key}
              haptic="selection"
              scaleTo={0.94}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              style={[
                styles.item,
                isFocused && styles.itemExpanded,
                {
                  borderRadius: radii.pill,
                  backgroundColor: isFocused ? colors.accent : 'transparent',
                },
              ]}
            >
              {options.tabBarIcon?.({ focused: isFocused, color: iconColor, size: 20 })}
              {isFocused ? (
                <Text numberOfLines={1} style={[styles.label, { color: iconColor }]}>
                  {label}
                </Text>
              ) : null}
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
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 7,
    borderWidth: 1,
    gap: 6,
    maxWidth: 380,
    width: '100%',
  },
  item: {
    minWidth: 44,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 7,
  },
  itemExpanded: {
    paddingHorizontal: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
