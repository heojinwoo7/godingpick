// app/(tabs_p)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function ParentTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50', // 고딩픽 브랜드 컬러
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house" color={color} />,
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: '자녀정보',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: '성적모니터링',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: '학교소식',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="newspaper" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape" color={color} />,
        }}
      />
    </Tabs>
  );
}
