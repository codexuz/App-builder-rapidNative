import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { isWeb } from '@gluestack-ui/utils/nativewind-utils';
const baseStyle = isWeb ? 'flex flex-col relative z-0' : '';

/**
 * Duolingo-parity 3D card: crisp 2px rim + 4px darker bottom lip, no blurry drop shadow.
 *  - default:  white tactile surface
 *  - flat:     2px rim only (nested / list-inside-card usage)
 *  - selected: cobalt rim + cobalt lip on soft blue fill (active choice)
 *  - success / danger: answer feedback states
 */
export const cardStyle = tva({
  base: `${baseStyle} flex-col rounded-2xl border-2 border-b-4`,
  variants: {
    variant: {
      default: 'bg-card border-border border-b-lip',
      flat: 'bg-card border-border border-b-2 border-b-border',
      selected: 'bg-accent border-primary border-b-primary-lip',
      success: 'bg-lime-50 border-success border-b-success-lip',
      danger: 'bg-red-50 border-red-400 border-b-destructive-lip',
    },
    size: {
      default: 'p-4 gap-6',
      sm: 'p-3 gap-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});
