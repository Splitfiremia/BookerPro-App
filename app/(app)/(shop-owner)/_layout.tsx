import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";
import { ShopOwnerProviders } from "@/providers/LazyProviders";
import { ProviderErrorBoundary, FeatureErrorBoundary } from "@/components/SpecializedErrorBoundaries";

export default function ShopOwnerLayout() {
  console.log('ShopOwnerLayout: Rendering with optimized providers');
  
  return (
    <ProviderErrorBoundary providerName="Shop Owner Providers">
      <ShopOwnerProviders>
        <FeatureErrorBoundary featureName="Shop Owner Navigation">
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
        </FeatureErrorBoundary>
      </ShopOwnerProviders>
    </ProviderErrorBoundary>
  );
}