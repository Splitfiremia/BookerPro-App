import { router, Stack } from "expo-router";
import { useStreamlinedAuth as useAuth } from "@/providers/StreamlinedAuthProvider";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import { COLORS, FONTS, FONT_SIZES, SPACING } from "@/constants/theme";

export default function AppLayout() {
  const { isLoading, isAuthenticated, user, isInitialized } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !user) {
      if (!hasRedirectedRef.current) {
        console.log('AppLayout: User not authenticated, redirecting to index');
        hasRedirectedRef.current = true;
        
        setTimeout(() => {
          router.replace("/");
        }, 100);
      }
      return;
    }

    if (isAuthenticated && user && !isReady) {
      console.log('AppLayout: User authenticated, preparing dashboard for role:', user.role);
      setIsReady(true);
    }
  }, [isInitialized, isAuthenticated, user, isReady]);

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Preparing workspace...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="(client)" options={{ headerShown: false }} />
      <Stack.Screen name="(provider)" options={{ headerShown: false }} />
      <Stack.Screen name="(shop-owner)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});