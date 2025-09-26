import React, { lazy, Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load heavy providers to prevent hydration timeout
const AppointmentProvider = lazy(() => import('@/providers/AppointmentProvider').then(m => ({ default: m.AppointmentProvider })));
const OnboardingProvider = lazy(() => import('@/providers/OnboardingProvider').then(m => ({ default: m.OnboardingProvider })));
const ServicesProvider = lazy(() => import('@/providers/ServicesProvider').then(m => ({ default: m.ServicesProvider })));
const SocialProvider = lazy(() => import('@/providers/SocialProvider').then(m => ({ default: m.SocialProvider })));
const PaymentProvider = lazy(() => import('@/providers/PaymentProvider').then(m => ({ default: m.PaymentProvider })));
const WaitlistProvider = lazy(() => import('@/providers/WaitlistProvider').then(m => ({ default: m.WaitlistProvider })));
const TeamManagementProvider = lazy(() => import('@/providers/TeamManagementProvider').then(m => ({ default: m.TeamManagementProvider })));
const ShopManagementProvider = lazy(() => import('@/providers/ShopManagementProvider').then(m => ({ default: m.ShopManagementProvider })));

// Group related providers to reduce nesting
const CoreBusinessProviders = lazy(() => 
  Promise.all([
    import('@/providers/AppointmentProvider'),
    import('@/providers/PaymentProvider'),
    import('@/providers/ServicesProvider')
  ]).then(([appointments, payments, services]) => {
    return {
      default: ({ children }: { children: React.ReactNode }) => (
        <appointments.AppointmentProvider>
          <payments.PaymentProvider>
            <services.ServicesProvider>
              {children}
            </services.ServicesProvider>
          </payments.PaymentProvider>
        </appointments.AppointmentProvider>
      )
    };
  })
);

const UserExperienceProviders = lazy(() => 
  Promise.all([
    import('@/providers/OnboardingProvider'),
    import('@/providers/SocialProvider'),
    import('@/providers/WaitlistProvider')
  ]).then(([onboarding, social, waitlist]) => {
    return {
      default: ({ children }: { children: React.ReactNode }) => (
        <onboarding.OnboardingProvider>
          <social.SocialProvider>
            <waitlist.WaitlistProvider>
              {children}
            </waitlist.WaitlistProvider>
          </social.SocialProvider>
        </onboarding.OnboardingProvider>
      )
    };
  })
);

const ManagementProviders = lazy(() => 
  Promise.all([
    import('@/providers/TeamManagementProvider'),
    import('@/providers/ShopManagementProvider')
  ]).then(([team, shop]) => {
    return {
      default: ({ children }: { children: React.ReactNode }) => (
        <team.TeamManagementProvider>
          <shop.ShopManagementProvider>
            {children}
          </shop.ShopManagementProvider>
        </team.TeamManagementProvider>
      )
    };
  })
);

function ProviderLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading providers...</Text>
    </View>
  );
}

function ProviderErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load providers</Text>
    </View>
  );
}

interface LazyProvidersProps {
  children: React.ReactNode;
}

export function LazyProviders({ children }: LazyProvidersProps) {
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <Suspense fallback={<ProviderLoadingFallback />}>
        <CoreBusinessProviders>
          <ErrorBoundary fallback={<ProviderErrorFallback />}>
            <Suspense fallback={<ProviderLoadingFallback />}>
              <UserExperienceProviders>
                <ErrorBoundary fallback={<ProviderErrorFallback />}>
                  <Suspense fallback={<ProviderLoadingFallback />}>
                    <ManagementProviders>
                      {children}
                    </ManagementProviders>
                  </Suspense>
                </ErrorBoundary>
              </UserExperienceProviders>
            </Suspense>
          </ErrorBoundary>
        </CoreBusinessProviders>
      </Suspense>
    </ErrorBoundary>
  );
}

// Alternative flat provider structure for better performance
export function FlatProviders({ children }: LazyProvidersProps) {
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <Suspense fallback={<ProviderLoadingFallback />}>
        <AppointmentProvider>
          <PaymentProvider>
            <ServicesProvider>
              <OnboardingProvider>
                <SocialProvider>
                  <WaitlistProvider>
                    <TeamManagementProvider>
                      <ShopManagementProvider>
                        {children}
                      </ShopManagementProvider>
                    </TeamManagementProvider>
                  </WaitlistProvider>
                </SocialProvider>
              </OnboardingProvider>
            </ServicesProvider>
          </PaymentProvider>
        </AppointmentProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});