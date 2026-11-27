import React from 'react';
import { Tabs } from 'expo-router';
import { BookOpen, Gift, Trophy, User } from 'lucide-react-native';
import { KidsTabBar } from '@/components/ui/KidsTabBar';
import { DS } from '@/constants/DesignSystem';

export default function KidsTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <KidsTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: DS.colors.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'Quests',
          tabBarIcon: ({ color, size }) => <Gift color={color} size={size} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'League',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
