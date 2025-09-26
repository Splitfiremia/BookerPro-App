import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";
import { LazyProviders } from "@/providers/LazyProviders";

export default function ClientLayout() {
  return (
    <LazyProviders>
      <Stack
        screenOptions={{
          headerShown: true,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="provider/[id]" options={{ title: "Provider Profile" }} />
        <Stack.Screen name="booking" options={{ title: "Book Appointment" }} />
        <Stack.Screen name="appointment/[id]" options={{ title: "Appointment Details" }} />
        <Stack.Screen name="shops/explore" options={{ title: "Explore Shops" }} />
        <Stack.Screen name="shops/[id]" options={{ title: "Shop Details" }} />
      </Stack>
    </LazyProviders>
  );
}