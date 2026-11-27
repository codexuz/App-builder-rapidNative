import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/constants/Theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  contentStyle,
}: BottomSheetProps) {
  const { colors, radii, typography, shadows } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onClose}
          accessibilityLabel="Close sheet"
        />
        <View
          style={[
            styles.sheet,
            shadows.lg,
            {
              backgroundColor: colors.surfaceElevated,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 20) + 8,
            },
            contentStyle,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          {title ? (
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[typography.title2, { color: colors.textPrimary }]}>{title}</Text>
                {subtitle ? (
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={[styles.closeBtn, { backgroundColor: colors.surfaceMuted }]}
              >
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
