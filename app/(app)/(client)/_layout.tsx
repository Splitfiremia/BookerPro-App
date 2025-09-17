import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";

export default function ClientLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="provider/[id]" options={{ title: "Provider Details" }} />
      <Stack.Screen name="booking" options={{ title: "Book Appointment" }} />
      <Stack.Screen name="appointment/[id]" options={{ title: "Appointment Details" }} />
    </Stack>
  );
}