import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Direct imports - load immediately to prevent hydration timeout
import { ServicesProvider } from '@/providers/ServicesProvider';
import { ShopManagementProvider } from '@/providers/ShopManagementProvider';
import { TeamManagementProvider } from '@/providers/TeamManagementProvider';
import { AppointmentProvider } from '@/providers/AppointmentProvider';
import { OnboardingProvider } from '@/providers/OnboardingProvider';
import { SocialProvider } from '@/providers/SocialProvider';
import { PaymentProvider } from '@/providers/PaymentProvider';
import { WaitlistProvider } from '@/providers/WaitlistProvider';

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
  console.log('LazyProviders: Initializing all providers');
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
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
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
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