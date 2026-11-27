'use client';
import { createButton } from '@gluestack-ui/core/button/creator';
import { UIIcon } from '@gluestack-ui/core/icon/creator';
import {
  tva,
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils';
import { withUniwind } from 'uniwind';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
const SCOPE = 'BUTTON';
const Root = withStyleContext(Pressable, SCOPE);
const StyledUIIcon = withUniwind(UIIcon);
const UIButton = createButton({
  Root: Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: StyledUIIcon,
});
/**
 * Duolingo-parity 3D tactile button.
 * Every solid variant = bright "face" + darker 4px bottom "lip". On press the lip
 * collapses to 2px and the face sinks 2px, giving the signature chunky click.
 * Surface variants (outline / secondary) use a 2px rim with a 4px slate lip.
 */
const PRESS_3D =
  'border-b-4 data-[active=true]:border-b-2 data-[active=true]:translate-y-[2px] web:transition-transform web:duration-75';
const buttonStyle = tva({
  base: `rounded-2xl flex-row items-center justify-center gap-2 data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 data-[focus-visible=true]:web:ring-ring/40 data-[disabled=true]:opacity-50 web:cursor-pointer web:select-none ${PRESS_3D}`,
  variants: {
    variant: {
      default:
        'bg-primary border-primary-lip data-[hover=true]:bg-primary/95',
      success:
        'bg-success border-success-lip data-[hover=true]:bg-success/95',
      warning:
        'bg-warning border-warning-lip data-[hover=true]:bg-warning/95',
      destructive:
        'bg-destructive border-destructive-lip data-[hover=true]:bg-destructive/95',
      outline:
        `bg-card border-2 border-border ${PRESS_3D} border-b-lip data-[hover=true]:bg-muted data-[active=true]:bg-muted`,
      secondary:
        `bg-secondary border-2 border-border ${PRESS_3D} border-b-lip data-[hover=true]:bg-muted data-[active=true]:bg-muted`,
      ghost:
        'border-0 data-[active=true]:border-0 data-[active=true]:translate-y-0 bg-transparent data-[hover=true]:bg-accent data-[active=true]:bg-accent',
      link: 'border-0 data-[active=true]:border-0 data-[active=true]:translate-y-0 bg-transparent',
    },
    size: {
      default: 'min-h-12 px-5 py-2.5',
      sm: 'min-h-10 rounded-xl px-4 py-2',
      lg: 'min-h-14 px-6 py-3',
      icon: 'h-11 w-11 p-0 rounded-xl',
    },
  },
});
const buttonTextStyle = tva({
  base: 'web:select-none font-sans font-extrabold tracking-wide',
  parentVariants: {
    variant: {
      default: 'text-primary-foreground uppercase',
      success: 'text-white uppercase',
      warning: 'text-white uppercase',
      destructive: 'text-white uppercase',
      outline: 'text-slate-600 uppercase',
      secondary: 'text-secondary-foreground uppercase',
      ghost: 'text-foreground',
      link: 'text-primary data-[hover=true]:underline data-[active=true]:underline',
    },
    size: {
      default: 'text-[15px]',
      sm: 'text-[13px]',
      lg: 'text-base',
      icon: 'text-sm',
    },
  },
});

const buttonSpinnerStyle = tva({
  base: '',
  parentVariants: {
    size: {
      default: 'h-4 w-4',
      sm: 'h-3 w-3',
      lg: 'h-5 w-5',
      icon: 'h-4 w-4',
    },
  },
});

const buttonIconStyle = tva({
  base: 'fill-none pointer-events-none shrink-0',
  parentVariants: {
    variant: {
      default: 'text-primary-foreground',
      success: 'text-white',
      warning: 'text-white',
      destructive: 'text-white',
      outline: 'text-slate-600',
      secondary: 'text-secondary-foreground',
      ghost:
        'text-foreground data-[hover=true]:text-accent-foreground data-[active=true]:text-accent-foreground',
      link: 'text-primary',
    },
    size: {
      default: 'h-5 w-5',
      sm: 'h-4 w-4',
      lg: 'h-5 w-5',
      icon: 'h-5 w-5',
    },
  },
});
const buttonGroupStyle = tva({
  base: '',
  variants: {
    space: {
      'xs': 'gap-1',
      'sm': 'gap-2',
      'md': 'gap-3',
      'lg': 'gap-4',
      'xl': 'gap-5',
      '2xl': 'gap-6',
      '3xl': 'gap-7',
      '4xl': 'gap-8',
    },
    isAttached: {
      true: 'gap-0',
    },
    flexDirection: {
      'row': 'flex-row',
      'column': 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  },
});
type IButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIButton>,
  'context'
> &
  VariantProps<typeof buttonStyle> & { className?: string };
const Button = React.forwardRef<
  React.ElementRef<typeof UIButton>,
  IButtonProps
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <UIButton
      ref={ref}
      {...props}
      className={buttonStyle({ variant, size, class: className })}
      context={{ variant, size }}
    />
  );
});
type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle> & { className?: string };
const ButtonText = React.forwardRef<
  React.ElementRef<typeof UIButton.Text>,
  IButtonTextProps
>(({ className, size, ...props }, ref) => {
  const { size: parentSize, variant: parentVariant } = useStyleContext(SCOPE);
  return (
    <UIButton.Text
      ref={ref}
      {...props}
      className={buttonTextStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
        },
        size,
        class: className,
      })}
    />
  );
});
const ButtonSpinner = React.forwardRef<
  React.ElementRef<typeof UIButton.Spinner>,
  React.ComponentPropsWithoutRef<typeof UIButton.Spinner>
>(({ className, ...props }, ref) => {
  const { size: parentSize } = useStyleContext(SCOPE);
  return <UIButton.Spinner ref={ref} {...props} className={buttonSpinnerStyle({ parentVariants: { size: parentSize }, class: className })} />;
});
type IButtonIcon = React.ComponentPropsWithoutRef<typeof UIButton.Icon> &
  VariantProps<typeof buttonIconStyle> & {
    className?: string | undefined;
    as?: React.ElementType;
    height?: number;
    width?: number;
  };
const ButtonIcon = React.forwardRef<
  React.ElementRef<typeof UIButton.Icon>,
  IButtonIcon
>(({ className, size, ...props }, ref) => {
  const { size: parentSize, variant: parentVariant } = useStyleContext(SCOPE);
  if (typeof size === 'number') {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
      />
    );
  }
  return (
    <UIButton.Icon
      {...props}
      className={buttonIconStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
        },
        size,
        class: className,
      })}
      ref={ref}
    />
  );
});
type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof UIButton.Group> &
  VariantProps<typeof buttonGroupStyle>;
const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof UIButton.Group>,
  IButtonGroupProps
>(
  (
    {
      className,
      space = 'md',
      isAttached = false,
      flexDirection = 'column',
      ...props
    },
    ref
  ) => {
    return (
      <UIButton.Group
        className={buttonGroupStyle({
          class: className,
          space,
          isAttached,
          flexDirection,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);
Button.displayName = 'Button';
ButtonText.displayName = 'ButtonText';
ButtonSpinner.displayName = 'ButtonSpinner';
ButtonIcon.displayName = 'ButtonIcon';
ButtonGroup.displayName = 'ButtonGroup';
export { Button, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText };
