import React, { Suspense, lazy } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/providers/AuthProvider';

// Critical providers - load immediately (needed for all users)
import { AppointmentProvider } from '@/providers/AppointmentProvider';
import { OnboardingProvider } from '@/providers/OnboardingProvider';

// Lazy load non-critical providers
const ServicesProvider = lazy(() => import('@/providers/ServicesProvider').then(m => ({ default: m.ServicesProvider })));
const PaymentProvider = lazy(() => import('@/providers/PaymentProvider').then(m => ({ default: m.PaymentProvider })));
const SocialProvider = lazy(() => import('@/providers/SocialProvider').then(m => ({ default: m.SocialProvider })));
const WaitlistProvider = lazy(() => import('@/providers/WaitlistProvider').then(m => ({ default: m.WaitlistProvider })));

// Management providers - ONLY load for shop owners and providers
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



// Conditional management providers - only load for shop owners and providers
function ManagementProvidersConditional({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const userRole = auth?.user?.role;
  
  const needsManagementProviders = userRole === 'owner' || userRole === 'provider';
  
  // Skip management providers for clients or when no user yet
  if (!needsManagementProviders || !userRole) {
    return <>{children}</>;
  }
  
  // Only load management providers when needed
  return (
    <Suspense fallback={null}>
      <ErrorBoundary 
        fallback={<ProviderErrorFallback error="Management providers (Team/Shop) failed" />} 
        onError={(error) => {
          console.error('❌ MANAGEMENT PROVIDERS ERROR:', error);
        }}
      >
        <TeamManagementProvider>
          <ShopManagementProvider>
            {children}
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
  return (
    <ErrorBoundary 
      fallback={<ProviderErrorFallback />}
      onError={(error) => {
        console.error('LazyProviders: Critical error:', error);
      }}
    >
      <AppointmentProvider>
        <OnboardingProvider>
          <Suspense fallback={null}>
            <ErrorBoundary fallback={<ProviderErrorFallback error="Services/Payment providers failed" />}>
              <ServicesProvider>
                <PaymentProvider>
                  <Suspense fallback={null}>
                    <ErrorBoundary fallback={<ProviderErrorFallback error="Social/Waitlist providers failed" />}>
                      <SocialProvider>
                        <WaitlistProvider>
                          <ManagementProvidersConditional>
                            {children}
                          </ManagementProvidersConditional>
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

});