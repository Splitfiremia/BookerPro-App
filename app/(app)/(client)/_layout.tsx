import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";
import { FeatureErrorBoundary } from "@/components/SpecializedErrorBoundaries";

export default function ClientLayout() {
  console.log('ClientLayout: Rendering client navigation');
  
  return (
    <FeatureErrorBoundary 
      featureName="Client Navigation"
      onError={(error, errorInfo) => {
        console.error('ClientLayout: Error caught in FeatureErrorBoundary:', error);
        console.error('ClientLayout: Error info:', errorInfo);
      }}
    >
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
    </FeatureErrorBoundary>
  );
}