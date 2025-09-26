import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";
import { LazyProviders } from "@/providers/LazyProviders";

export default function ShopOwnerLayout() {
  return (
    <LazyProviders>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="appointment/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="provider/[id]" options={{ headerShown: false }} />
      </Stack>
    </LazyProviders>
  );
}