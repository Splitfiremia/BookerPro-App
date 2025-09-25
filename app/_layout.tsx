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
import { TeamManagementProvider } from "@/providers/TeamManagementProvider";
import { ShopManagementProvider } from "@/providers/ShopManagementProvider";

import { ModeIndicator } from "@/components/ModeIndicator";
import ErrorBoundary from "@/components/ErrorBoundary";
import { COLORS } from "@/constants/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      networkMode: 'offlineFirst', // Prevent hanging on network issues
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      refetchOnMount: false, // Prevent hydration issues
      refetchOnReconnect: false, // Prevent hydration issues
    },
    mutations: {
      networkMode: 'offlineFirst',
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
      <Stack.Screen name="unstuck" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-status" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: "Not Found", headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <OnboardingProvider>
              <AppointmentProvider>
                <PaymentProvider>
                  <SocialProvider>
                    <WaitlistProvider>
                      <TeamManagementProvider>
                        <ShopManagementProvider>
                          <ServicesProvider>
                            <RootLayoutNav />
                            <ModeIndicator />
                          </ServicesProvider>
                        </ShopManagementProvider>
                      </TeamManagementProvider>
                    </WaitlistProvider>
                  </SocialProvider>
                </PaymentProvider>
              </AppointmentProvider>
            </OnboardingProvider>
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