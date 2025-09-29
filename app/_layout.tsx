import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/providers/AuthProvider";
import { WithSafeAreaDeviceProvider } from "@/providers/DeviceProvider";

import { ModeIndicator } from "@/components/ModeIndicator";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CriticalErrorBoundary } from "@/components/SpecializedErrorBoundaries";
import { COLORS } from "@/constants/theme";
import { initializeDeepLinking, cleanupDeepLinking } from "@/utils/deepLinkHandler";

// Create QueryClient with hydration-safe settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10,
      refetchOnMount: false,
      refetchOnReconnect: false,
      networkMode: 'online',
    },
    mutations: {
      networkMode: 'online',
    },
  },
});

// Hydration-safe loading fallback
function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

// Hydration wrapper to prevent timeout
function HydrationWrapper({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Set hydrated immediately to prevent timeout
    setIsHydrated(true);
  }, []);
  
  if (!isHydrated) {
    return <LoadingFallback />;
  }
  
  return <>{children}</>;
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
  console.log('RootLayout: Rendering with hydration safety');
  
  // Initialize deep linking with error handling
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        if (mounted) {
          console.log('RootLayout: Initializing deep linking');
          initializeDeepLinking();
        }
      } catch (error) {
        console.error('RootLayout: Deep linking initialization failed:', error);
      }
    };
    
    // Use setTimeout to prevent blocking hydration
    setTimeout(initializeApp, 100);
    
    return () => {
      mounted = false;
      try {
        console.log('RootLayout: Cleaning up deep linking');
        cleanupDeepLinking();
      } catch (error) {
        console.error('RootLayout: Deep linking cleanup failed:', error);
      }
    };
  }, []);
  
  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <HydrationWrapper>
        <CriticalErrorBoundary componentName="Root Application">
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary level="critical" resetOnPropsChange={false}>
              <WithSafeAreaDeviceProvider>
                <ErrorBoundary level="warning" resetOnPropsChange={false}>
                  <AuthProvider>
                    <ErrorBoundary level="info" resetOnPropsChange={false}>
                      <RootLayoutNav />
                    </ErrorBoundary>
                    <ModeIndicator />
                  </AuthProvider>
                </ErrorBoundary>
              </WithSafeAreaDeviceProvider>
            </ErrorBoundary>
          </QueryClientProvider>
        </CriticalErrorBoundary>
      </HydrationWrapper>
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