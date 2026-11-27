'use client';
import { createProgress } from '@gluestack-ui/core/progress/creator';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { tva, useStyleContext, withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import React from 'react';
import { View } from 'react-native';

const SCOPE = 'PROGRESS';
export const UIProgress = createProgress({
  Root: withStyleContext(View, SCOPE),
  FilledTrack: View,
});

const progressStyle = tva({
  // Duolingo-parity chunky track; the filled bar carries a glossy highlight strip.
  base: 'bg-slate-200 relative h-4 w-full overflow-hidden rounded-full',
  variants: {
    orientation: {
      horizontal: 'w-full h-4',
      vertical: 'h-full w-4 justify-end',
    },
  },
});

const progressFilledTrackStyle = tva({
  base: 'bg-success rounded-full web:transition-all overflow-hidden',
  variants: {
    orientation: {
      horizontal: 'h-full',
      vertical: 'w-full',
    },
  },
});

type IProgressProps = VariantProps<typeof progressStyle> &
  React.ComponentProps<typeof UIProgress>;
type IProgressFilledTrackProps = VariantProps<typeof progressFilledTrackStyle> &
  React.ComponentProps<typeof UIProgress.FilledTrack>;

const Progress = React.forwardRef<
  React.ComponentRef<typeof UIProgress>,
  IProgressProps
>(function Progress(
  { className, orientation = 'horizontal', ...props },
  ref
) {
  return (
    <UIProgress
      ref={ref}
      {...props}
      className={progressStyle({ orientation, class: className })}
      context={{ orientation }}
      orientation={orientation}
    />
  );
});

const ProgressFilledTrack = React.forwardRef<
  React.ComponentRef<typeof UIProgress.FilledTrack>,
  IProgressFilledTrackProps
>(function ProgressFilledTrack({ className, ...props }, ref) {
  const { orientation: parentOrientation } = useStyleContext(SCOPE);

  return (
    <UIProgress.FilledTrack
      ref={ref}
      className={progressFilledTrackStyle({
        orientation: parentOrientation,
        class: className,
      })}
      {...props}
    >
      {/* Duolingo glossy highlight strip riding on top of the filled bar */}
      <View
        pointerEvents="none"
        className="absolute left-[6px] right-[6px] top-[22%] h-[26%] min-h-[2px] rounded-full bg-white/35"
      />
    </UIProgress.FilledTrack>
  );
});

export { Progress, ProgressFilledTrack };
