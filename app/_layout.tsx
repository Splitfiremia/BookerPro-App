import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ModeIndicator } from "@/components/ModeIndicator";
import { CriticalErrorBoundary } from "@/components/SpecializedErrorBoundaries";
import OptimizedProviderTreeV2 from "@/providers/OptimizedProviderTree-v2";
import { COLORS } from "@/constants/theme";
import { initializeDeepLinking, cleanupDeepLinking } from "@/utils/deepLinkHandler";
import { performanceMonitor } from "@/services/PerformanceMonitoringService";

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
  console.log('[PERF] RootLayout: Rendering');
  const isInitializedRef = useRef(false);
  
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    try {
      performanceMonitor.markStart('app-initialization');
      console.log('[PERF] 🚀 App startup initiated');
    } catch (error) {
      console.warn('[PERF] Performance monitoring initialization failed:', error);
    }
    
    return () => {
      try {
        performanceMonitor.markEnd('app-initialization');
      } catch (error) {
        console.warn('[PERF] Performance monitoring cleanup failed:', error);
      }
    };
  }, []);
  
  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    
    const initializeApp = async () => {
      try {
        if (mounted) {
          console.log('RootLayout: Initializing deep linking (non-blocking)');
          initializeDeepLinking();
        }
      } catch (error) {
        console.error('RootLayout: Deep linking initialization failed:', error);
      }
    };
    
    timeoutId = setTimeout(initializeApp, 3000);
    
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      try {
        cleanupDeepLinking();
      } catch (error) {
        console.error('RootLayout: Deep linking cleanup failed:', error);
      }
    };
  }, []);
  
  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <CriticalErrorBoundary componentName="Root Application">
        <OptimizedProviderTreeV2>
          <RootLayoutNav />
          <ModeIndicator />
        </OptimizedProviderTreeV2>
      </CriticalErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contentStyle: { backgroundColor: COLORS.background },
  gestureHandler: { flex: 1 },
});