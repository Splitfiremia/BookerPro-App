import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function ClientOnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="profile-type" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="search" />
      <Stack.Screen name="payment" />
    </Stack>
  );
}