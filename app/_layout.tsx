import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ModeIndicator } from "@/components/ModeIndicator";
import { CriticalErrorBoundary } from "@/components/SpecializedErrorBoundaries";
import OptimizedProviderTree from "@/providers/OptimizedProviderTree";
import { COLORS } from "@/constants/theme";
import { initializeDeepLinking, cleanupDeepLinking } from "@/utils/deepLinkHandler";

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
  
  // Initialize deep linking after mount - non-blocking
  useEffect(() => {
    let mounted = true;
    
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
    
    // Delay initialization significantly to not block startup
    const timeoutId = setTimeout(initializeApp, 2000);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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
      <CriticalErrorBoundary componentName="Root Application">
        <OptimizedProviderTree>
          <RootLayoutNav />
          <ModeIndicator />
        </OptimizedProviderTree>
      </CriticalErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contentStyle: { backgroundColor: COLORS.background },
  gestureHandler: { flex: 1 },
});