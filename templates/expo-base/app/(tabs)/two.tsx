import React from 'react';
import { Sparkles } from 'lucide-react-native';
import { EmptyState, Screen, SectionHeader } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';

export default function ExploreScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen hasTabBar>
      <SectionHeader
        title="Explore"
        subtitle="Ready for your app's secondary flow"
      />
      <EmptyState
        icon={<Sparkles size={24} color={colors.accent} />}
        title="No items yet"
        description="Replace this tab with discovery feeds, analytics, search, or user profile screens using the reusable primitives in components/ui."
      />
    </Screen>
  );
}
