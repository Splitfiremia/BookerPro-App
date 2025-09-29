import { Stack, router } from "expo-router";
import { useOptimizedAuth } from "@/providers/OptimizedAuthProvider";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useEffect, Suspense } from "react";
import { COLORS } from "@/constants/theme";
import { OptimizedProviderTree } from "@/providers/OptimizedProviderTree";
import { RoleDashboardLoader } from "@/components/LazyDashboardLoader";
import { loginPerformanceMonitor, PerformanceOptimizer } from "@/utils/loginPerformanceUtils";

export default function OptimizedAppLayout() {
  const { isLoading, isAuthenticated, user, isInitialized } = useOptimizedAuth();

  // Performance monitoring
  useEffect(() => {
    if (user && isAuthenticated) {
      const sessionId = `login_${user.id}_${Date.now()}`;
      
      // Start performance monitoring
      loginPerformanceMonitor.startLoginSession(sessionId, user.role);
      
      // Preload critical data
      PerformanceOptimizer.preloadCriticalData(user.role);
      
      // Complete session after dashboard loads
      const timer = setTimeout(() => {
        loginPerformanceMonitor.completeLoginSession(sessionId);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated]);

  // Redirect to index if not authenticated, but only after initialization
  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      console.log('OptimizedAppLayout: User not authenticated, redirecting to index');
      
      // Use a small delay to prevent redirect loops
      const timeoutId = setTimeout(() => {
        try {
          router.replace("/");
          console.log('OptimizedAppLayout: Successfully redirected to index');
        } catch (error) {
          console.error('OptimizedAppLayout: Error redirecting to index:', error);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized, isLoading, isAuthenticated]);

  // Show loading while auth is being determined or not initialized
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <OptimizedProviderTree>
      <Suspense fallback={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      }>
        <RoleDashboardLoader userRole={user.role}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(client)" />
            <Stack.Screen name="(provider)" />
            <Stack.Screen name="(shop-owner)" />
          </Stack>
        </RoleDashboardLoader>
      </Suspense>
    </OptimizedProviderTree>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
});