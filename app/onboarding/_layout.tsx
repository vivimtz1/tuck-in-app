import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="barriers" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="teddy" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
