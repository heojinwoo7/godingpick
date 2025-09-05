import { Stack } from 'expo-router';

export default function SignUpLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signup-form" />
      <Stack.Screen name="student" />
      <Stack.Screen name="teacher" />
      <Stack.Screen name="parent" />
    </Stack>
  );
}
