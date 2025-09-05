import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
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
      }}>
      <Tabs.Screen
        name="timetable"
        options={{
          title: '고딩타임',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plaza"
        options={{
          title: '고딩광장',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '고뮤니티',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="celebrities"
        options={{
          title: '고딩루트',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star" color={color} />,
        }}
      />
    </Tabs>
  );
}
