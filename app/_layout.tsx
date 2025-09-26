import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/providers/AuthProvider";
import { WithSafeAreaDeviceProvider } from "@/providers/DeviceProvider";

import { ModeIndicator } from "@/components/ModeIndicator";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CriticalErrorBoundary } from "@/components/SpecializedErrorBoundaries";
import { COLORS } from "@/constants/theme";

// Create QueryClient with optimized settings to prevent hydration issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10,
      refetchOnMount: false,
      refetchOnReconnect: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Loading fallback component
function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

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
  console.log('RootLayout: Rendering');
  
  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <CriticalErrorBoundary componentName="Root Application">
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary level="critical" resetOnPropsChange={true}>
            <WithSafeAreaDeviceProvider>
              <ErrorBoundary level="warning" resetOnPropsChange={true}>
                <AuthProvider>
                  <Suspense fallback={<LoadingFallback />}>
                    <ErrorBoundary level="info" resetOnPropsChange={true}>
                      <RootLayoutNav />
                    </ErrorBoundary>
                  </Suspense>
                  <ModeIndicator />
                </AuthProvider>
              </ErrorBoundary>
            </WithSafeAreaDeviceProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </CriticalErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contentStyle: { backgroundColor: COLORS.background },
  gestureHandler: { flex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
});