import React, { useState, useEffect, Suspense, lazy } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Critical providers - load immediately
import { AppointmentProvider } from '@/providers/AppointmentProvider';
import { OnboardingProvider } from '@/providers/OnboardingProvider';

// Lazy load non-critical providers to prevent hydration timeout
const ServicesProvider = lazy(() => import('@/providers/ServicesProvider').then(m => ({ default: m.ServicesProvider })));
const PaymentProvider = lazy(() => import('@/providers/PaymentProvider').then(m => ({ default: m.PaymentProvider })));
const SocialProvider = lazy(() => import('@/providers/SocialProvider').then(m => ({ default: m.SocialProvider })));
const WaitlistProvider = lazy(() => import('@/providers/WaitlistProvider').then(m => ({ default: m.WaitlistProvider })));
const TeamManagementProvider = lazy(() => import('@/providers/TeamManagementProvider').then(m => ({ default: m.TeamManagementProvider })));
const ShopManagementProvider = lazy(() => import('@/providers/ShopManagementProvider').then(m => ({ default: m.ShopManagementProvider })));

function ProviderErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Service Loading Failed</Text>
      <Text style={styles.errorText}>Unable to initialize app services. Please restart the app.</Text>
    </View>
  );
}

function ProviderLoadingFallback({ stage }: { stage: string }) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading {stage}...</Text>
    </View>
  );
}

// Staggered provider loading stages
type LoadingStage = 'critical' | 'services' | 'social' | 'management' | 'complete';

interface StaggeredProvidersProps {
  children: React.ReactNode;
  stage: LoadingStage;
}

function StaggeredProviders({ children, stage }: StaggeredProvidersProps) {
  switch (stage) {
    case 'critical':
      return (
        <AppointmentProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </AppointmentProvider>
      );
    
    case 'services':
      return (
        <Suspense fallback={<ProviderLoadingFallback stage="services" />}>
          <ServicesProvider>
            <PaymentProvider>
              <StaggeredProviders stage="critical">
                {children}
              </StaggeredProviders>
            </PaymentProvider>
          </ServicesProvider>
        </Suspense>
      );
    
    case 'social':
      return (
        <Suspense fallback={<ProviderLoadingFallback stage="social features" />}>
          <SocialProvider>
            <WaitlistProvider>
              <StaggeredProviders stage="services">
                {children}
              </StaggeredProviders>
            </WaitlistProvider>
          </SocialProvider>
        </Suspense>
      );
    
    case 'management':
      return (
        <Suspense fallback={<ProviderLoadingFallback stage="management tools" />}>
          <TeamManagementProvider>
            <ShopManagementProvider>
              <StaggeredProviders stage="social">
                {children}
              </StaggeredProviders>
            </ShopManagementProvider>
          </TeamManagementProvider>
        </Suspense>
      );
    
    case 'complete':
    default:
      return (
        <StaggeredProviders stage="management">
          {children}
        </StaggeredProviders>
      );
  }
}

interface LazyProvidersProps {
  children: React.ReactNode;
}

export function LazyProviders({ children }: LazyProvidersProps) {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('critical');
  const [isHydrated, setIsHydrated] = useState(false);
  
  console.log('LazyProviders: Initializing with staggered loading, stage:', loadingStage);
  
  useEffect(() => {
    // Prevent hydration timeout by setting hydrated immediately
    setIsHydrated(true);
    
    // Stagger provider loading to prevent blocking
    const stageTimings = [
      { stage: 'services' as LoadingStage, delay: 100 },
      { stage: 'social' as LoadingStage, delay: 300 },
      { stage: 'management' as LoadingStage, delay: 500 },
      { stage: 'complete' as LoadingStage, delay: 700 },
    ];
    
    const timeouts: NodeJS.Timeout[] = [];
    
    stageTimings.forEach(({ stage, delay }) => {
      const timeout = setTimeout(() => {
        console.log('LazyProviders: Loading stage:', stage);
        setLoadingStage(stage);
      }, delay);
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);
  
  // Show minimal loading during hydration
  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <StaggeredProviders stage={loadingStage}>
        {children}
      </StaggeredProviders>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});