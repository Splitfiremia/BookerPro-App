import { router, Slot } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { COLORS, FONTS, FONT_SIZES, SPACING } from "@/constants/theme";

export default function AppLayout() {
  const { isLoading, isAuthenticated, user, isInitialized } = useAuth();
  const [dashboardReady, setDashboardReady] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated && !redirecting) {
      console.log('AppLayout: User not authenticated, initiating redirect');
      setRedirecting(true);
      
      const redirect = async () => {
        try {
          await router.replace("/");
          console.log('AppLayout: Successfully redirected to index');
        } catch (error) {
          console.error('AppLayout: Error redirecting to index:', error);
          setRedirecting(false);
        }
      };
      
      redirect();
    }
  }, [isInitialized, isLoading, isAuthenticated, redirecting]);

  useEffect(() => {
    if (isAuthenticated && user && !dashboardReady) {
      console.log('AppLayout: Preparing dashboard for user role:', user.role);
      setDashboardReady(true);
      console.log('AppLayout: Dashboard ready for role:', user.role);
    }
  }, [isAuthenticated, user, dashboardReady]);

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing app...</Text>
      </View>
    );
  }

  if (isLoading || redirecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {redirecting ? 'Redirecting...' : 'Authenticating...'}
        </Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Please wait...</Text>
      </View>
    );
  }

  if (!dashboardReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Preparing your dashboard...</Text>
        <Text style={styles.loadingSubtext}>
          Setting up {user.role} workspace
        </Text>
      </View>
    );
  }

  return <Slot />;
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