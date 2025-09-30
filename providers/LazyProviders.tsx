import React, { useState, useEffect, Suspense, lazy } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/providers/AuthProvider';

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

function ProviderErrorFallback({ error }: { error?: string }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Service Loading Failed</Text>
      <Text style={styles.errorText}>Unable to initialize app services. Please restart the app.</Text>
      {error && <Text style={styles.errorDetails}>{error}</Text>}
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
  console.log('StaggeredProviders: Rendering stage:', stage);
  
  switch (stage) {
    case 'critical':
      return (
        <ErrorBoundary 
          fallback={<ProviderErrorFallback error="Critical providers (Appointment/Onboarding) failed" />} 
          onError={(error) => {
            console.error('❌ CRITICAL PROVIDERS ERROR:', error);
            console.error('Failed providers: AppointmentProvider or OnboardingProvider');
          }}
        >
          <AppointmentProvider>
            <OnboardingProvider>
              {children}
            </OnboardingProvider>
          </AppointmentProvider>
        </ErrorBoundary>
      );
    
    case 'services':
      return (
        <Suspense fallback={<ProviderLoadingFallback stage="services" />}>
          <ErrorBoundary 
            fallback={<ProviderErrorFallback error="Services providers (Services/Payment) failed" />} 
            onError={(error) => {
              console.error('❌ SERVICES PROVIDERS ERROR:', error);
              console.error('Failed providers: ServicesProvider or PaymentProvider');
            }}
          >
            <ServicesProvider>
              <PaymentProvider>
                <StaggeredProviders stage="critical">
                  {children}
                </StaggeredProviders>
              </PaymentProvider>
            </ServicesProvider>
          </ErrorBoundary>
        </Suspense>
      );
    
    case 'social':
      return (
        <Suspense fallback={<ProviderLoadingFallback stage="social features" />}>
          <ErrorBoundary 
            fallback={<ProviderErrorFallback error="Social providers (Social/Waitlist) failed" />} 
            onError={(error) => {
              console.error('❌ SOCIAL PROVIDERS ERROR:', error);
              console.error('Failed providers: SocialProvider or WaitlistProvider');
            }}
          >
            <SocialProvider>
              <WaitlistProvider>
                <StaggeredProviders stage="services">
                  {children}
                </StaggeredProviders>
              </WaitlistProvider>
            </SocialProvider>
          </ErrorBoundary>
        </Suspense>
      );
    
    case 'management':
      return <ManagementProvidersConditional>{children}</ManagementProvidersConditional>;
    
    case 'complete':
    default:
      console.log('StaggeredProviders: All stages complete, rendering final tree');
      return (
        <StaggeredProviders stage="management">
          {children}
        </StaggeredProviders>
      );
  }
}

function ManagementProvidersConditional({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const userRole = auth?.user?.role;
  
  const needsManagementProviders = userRole === 'owner' || userRole === 'provider';
  
  console.log('ManagementProvidersConditional: User role:', userRole, 'Loading management providers:', needsManagementProviders);
  
  if (!needsManagementProviders) {
    return (
      <StaggeredProviders stage="social">
        {children}
      </StaggeredProviders>
    );
  }
  
  return (
    <Suspense fallback={<ProviderLoadingFallback stage="management tools" />}>
      <ErrorBoundary 
        fallback={<ProviderErrorFallback error="Management providers (Team/Shop) failed" />} 
        onError={(error) => {
          console.error('❌ MANAGEMENT PROVIDERS ERROR:', error);
          console.error('Failed providers: TeamManagementProvider or ShopManagementProvider');
        }}
      >
        <TeamManagementProvider>
          <ShopManagementProvider>
            <StaggeredProviders stage="social">
              {children}
            </StaggeredProviders>
          </ShopManagementProvider>
        </TeamManagementProvider>
      </ErrorBoundary>
    </Suspense>
  );
}

interface LazyProvidersProps {
  children: React.ReactNode;
}

export function LazyProviders({ children }: LazyProvidersProps) {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('complete');
  
  console.log('LazyProviders: Rendering all providers immediately to prevent hydration timeout');
  
  useEffect(() => {
    // Stagger provider loading AFTER initial render to prevent hydration timeout
    const stageTimings = [
      { stage: 'services' as LoadingStage, delay: 50 },
      { stage: 'social' as LoadingStage, delay: 100 },
      { stage: 'management' as LoadingStage, delay: 150 },
      { stage: 'complete' as LoadingStage, delay: 200 },
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
  
  return (
    <ErrorBoundary 
      fallback={<ProviderErrorFallback />}
      onError={(error) => {
        console.error('LazyProviders: Critical error in provider initialization:', error);
        console.error('LazyProviders: Current loading stage:', loadingStage);
      }}
    >
      <StaggeredProviders stage={loadingStage}>
        {children}
      </StaggeredProviders>
    </ErrorBoundary>
  );
}

export function FlatProviders({ children }: LazyProvidersProps) {
  console.log('FlatProviders: Rendering without staggered loading');
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <AppointmentProvider>
        <OnboardingProvider>
          <Suspense fallback={<ProviderLoadingFallback stage="services" />}>
            <ErrorBoundary fallback={<ProviderErrorFallback />}>
              <ServicesProvider>
                <PaymentProvider>
                  <Suspense fallback={<ProviderLoadingFallback stage="social" />}>
                    <ErrorBoundary fallback={<ProviderErrorFallback />}>
                      <SocialProvider>
                        <WaitlistProvider>
                          <Suspense fallback={<ProviderLoadingFallback stage="management" />}>
                            <ErrorBoundary fallback={<ProviderErrorFallback />}>
                              <TeamManagementProvider>
                                <ShopManagementProvider>
                                  {children}
                                </ShopManagementProvider>
                              </TeamManagementProvider>
                            </ErrorBoundary>
                          </Suspense>
                        </WaitlistProvider>
                      </SocialProvider>
                    </ErrorBoundary>
                  </Suspense>
                </PaymentProvider>
              </ServicesProvider>
            </ErrorBoundary>
          </Suspense>
        </OnboardingProvider>
      </AppointmentProvider>
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
  errorDetails: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.sm,
    opacity: 0.8,
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