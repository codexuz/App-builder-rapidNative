import React, { type ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Tabs } from 'expo-router';
import { DS } from '@/constants/DesignSystem';

type TabBarRenderFn = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;
export type KidsTabBarProps = Parameters<TabBarRenderFn>[0];

/**
 * Clean, docked native-grade bottom tab bar:
 * - Pure white surface with subtle hairline top border (never floats over or slices content!)
 * - Equal-width touch targets, clear labels for all 4 destinations, subtle cobalt active pill
 */
export function KidsTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: KidsTabBarProps) {
  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
              ? options.title
              : route.name;

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

        const color = isFocused ? DS.colors.brand : DS.colors.inkMuted;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[
              styles.item,
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as never) : null,
            ]}
          >
            <View style={[styles.iconPill, isFocused ? styles.iconPillActive : null]}>
              {options.tabBarIcon
                ? options.tabBarIcon({ focused: isFocused, color, size: 21 })
                : null}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color,
                  fontWeight: isFocused ? '700' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: DS.colors.surface,
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 48,
  },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: DS.colors.brandSoft,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
});
