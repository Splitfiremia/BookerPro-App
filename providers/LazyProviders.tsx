import React, { lazy, Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

// Lazy load heavy providers to prevent hydration timeout
const AppointmentProvider = lazy(() => import('@/providers/AppointmentProvider').then(m => ({ default: m.AppointmentProvider })));
const OnboardingProvider = lazy(() => import('@/providers/OnboardingProvider').then(m => ({ default: m.OnboardingProvider })));
const ServicesProvider = lazy(() => import('@/providers/ServicesProvider').then(m => ({ default: m.ServicesProvider })));
const SocialProvider = lazy(() => import('@/providers/SocialProvider').then(m => ({ default: m.SocialProvider })));
const PaymentProvider = lazy(() => import('@/providers/PaymentProvider').then(m => ({ default: m.PaymentProvider })));
const WaitlistProvider = lazy(() => import('@/providers/WaitlistProvider').then(m => ({ default: m.WaitlistProvider })));
const TeamManagementProvider = lazy(() => import('@/providers/TeamManagementProvider').then(m => ({ default: m.TeamManagementProvider })));
const ShopManagementProvider = lazy(() => import('@/providers/ShopManagementProvider').then(m => ({ default: m.ShopManagementProvider })));

function ProviderLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading providers...</Text>
    </View>
  );
}

interface LazyProvidersProps {
  children: React.ReactNode;
}

export function LazyProviders({ children }: LazyProvidersProps) {
  return (
    <Suspense fallback={<ProviderLoadingFallback />}>
      <OnboardingProvider>
        <AppointmentProvider>
          <PaymentProvider>
            <SocialProvider>
              <WaitlistProvider>
                <TeamManagementProvider>
                  <ShopManagementProvider>
                    <ServicesProvider>
                      {children}
                    </ServicesProvider>
                  </ShopManagementProvider>
                </TeamManagementProvider>
              </WaitlistProvider>
            </SocialProvider>
          </PaymentProvider>
        </AppointmentProvider>
      </OnboardingProvider>
    </Suspense>
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
});