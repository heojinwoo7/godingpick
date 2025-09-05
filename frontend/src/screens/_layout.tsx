import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: Platform.OS === 'ios',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(tabs_t)" />
          <Stack.Screen name="(tabs_p)" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="find-id" />
          <Stack.Screen name="find-password" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
