import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppointmentProvider } from "@/providers/AppointmentProvider";
import { OnboardingProvider } from "@/providers/OnboardingProvider";
import { ServicesProvider } from "@/providers/ServicesProvider";
import { SocialProvider } from "@/providers/SocialProvider";
import { PaymentProvider } from "@/providers/PaymentProvider";
import { WaitlistProvider } from "@/providers/WaitlistProvider";

import { ModeIndicator } from "@/components/ModeIndicator";
import ErrorBoundary from "@/components/ErrorBoundary";
import { COLORS } from "@/constants/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: styles.contentStyle
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />

      <Stack.Screen name="onboarding-status" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: "Not Found", headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  // Global fallback to prevent app from hanging during hydration
  React.useEffect(() => {
    const globalTimeout = setTimeout(() => {
      console.warn('Global timeout: App initialization taking too long, this may indicate a hydration issue');
      // Don't force navigation here as it can cause more issues
    }, 2000);
    
    return () => clearTimeout(globalTimeout);
  }, []);
  
  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppointmentProvider>
              <PaymentProvider>
                <SocialProvider>
                  <WaitlistProvider>
                    <OnboardingProvider>
                      <ServicesProvider>
                        <RootLayoutNav />
                        <ModeIndicator />
                      </ServicesProvider>
                    </OnboardingProvider>
                  </WaitlistProvider>
                </SocialProvider>
              </PaymentProvider>
            </AppointmentProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contentStyle: { backgroundColor: COLORS.background },
  gestureHandler: { flex: 1 },
});