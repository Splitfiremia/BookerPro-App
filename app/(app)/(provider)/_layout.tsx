import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";
import LocationProvider from "@/providers/LocationProvider";
import { FeatureErrorBoundary } from "@/components/SpecializedErrorBoundaries";

export default function ProviderLayout() {
  console.log('ProviderLayout: Rendering provider navigation');
  
  return (
    <FeatureErrorBoundary featureName="Location Services">
      <LocationProvider>
        <FeatureErrorBoundary featureName="Provider Navigation">
          <Stack
            screenOptions={{
              headerShown: true,
              contentStyle: { backgroundColor: COLORS.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="appointment/[id]" options={{ title: "Appointment Details" }} />
            <Stack.Screen name="availability" options={{ title: "Set Availability" }} />
            <Stack.Screen name="booking" options={{ title: "New Booking" }} />
            <Stack.Screen name="complete-payment" options={{ title: "Complete Payment" }} />
            <Stack.Screen name="broadcast" options={{ headerShown: false }} />
          </Stack>
        </FeatureErrorBoundary>
      </LocationProvider>
    </FeatureErrorBoundary>
  );
}