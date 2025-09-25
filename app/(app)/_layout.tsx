import { Stack, router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import { COLORS } from "@/constants/theme";

export default function AppLayout() {
  const { isLoading, isAuthenticated, user, isInitialized } = useAuth();

  // Redirect to index if not authenticated, but only after initialization
  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      console.log('AppLayout: User not authenticated, redirecting to index');
      console.log('AppLayout: Current user state:', user);
      
      // Use a small delay to prevent redirect loops
      const timeoutId = setTimeout(() => {
        try {
          router.replace("/");
          console.log('AppLayout: Successfully redirected to index');
        } catch (error) {
          console.error('AppLayout: Error redirecting to index:', error);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized, isLoading, isAuthenticated, user]);

  // Show loading while auth is being determined or not initialized
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(provider)" />
      <Stack.Screen name="(shop-owner)" />
    </Stack>
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