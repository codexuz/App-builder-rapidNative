import React from 'react';
import { Tabs } from 'expo-router';
import { Compass, Home } from 'lucide-react-native';
import { FloatingTabBar } from '@/components/ui';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
