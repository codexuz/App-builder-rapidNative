'use client';
import React from 'react';
import { View } from 'react-native';
import { cardStyle } from './styles';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

type ICardProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof cardStyle> & {
    className?: string;
    size?: 'default' | 'sm';
  };

const Card = React.forwardRef<React.ComponentRef<typeof View>, ICardProps>(
  function Card({ className, size = 'default', variant = 'default', ...props }, ref) {
    return (
      <View className={cardStyle({ size, variant, class: className })} {...props} ref={ref} />
    );
  }
);

Card.displayName = 'Card';

export { Card };
