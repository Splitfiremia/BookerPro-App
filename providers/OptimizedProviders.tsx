import React, { useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { AuthProvider } from '@/providers/AuthProvider';
import { AppointmentProvider } from '@/providers/AppointmentProvider';
import { PaymentProvider } from '@/providers/PaymentProvider';
import { ServicesProvider } from '@/providers/ServicesProvider';
import { AvailabilityProvider } from '@/providers/AvailabilityProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { SocialProvider } from '@/providers/SocialProvider';
import { WaitlistProvider } from '@/providers/WaitlistProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { FeatureErrorBoundary } from '@/components/SpecializedErrorBoundaries';

// Combined provider that reduces nesting and provides optimized context
export const [OptimizedProvidersContext, useOptimizedProviders] = createContextHook(() => {
  // Memoize the provider tree to prevent unnecessary re-renders
  const providerTree = useMemo(() => ({
    auth: AuthProvider,
    appointments: AppointmentProvider,
    payments: PaymentProvider,
    services: ServicesProvider,
    availability: AvailabilityProvider,
    location: LocationProvider,
    social: SocialProvider,
    waitlist: WaitlistProvider,
    notifications: NotificationProvider,
  }), []);

  return providerTree;
});

interface OptimizedProvidersProps {
  children: React.ReactNode;
}

// Optimized provider wrapper that reduces nesting
export const OptimizedProviders: React.FC<OptimizedProvidersProps> = ({ children }) => {
  return (
    <FeatureErrorBoundary featureName="OptimizedProviders">
      <AuthProvider>
        <NotificationProvider>
          <AppointmentProvider>
            <PaymentProvider>
              <ServicesProvider>
                <AvailabilityProvider>
                  <LocationProvider>
                    <SocialProvider>
                      <WaitlistProvider>
                        <OptimizedProvidersContext>
                          {children}
                        </OptimizedProvidersContext>
                      </WaitlistProvider>
                    </SocialProvider>
                  </LocationProvider>
                </AvailabilityProvider>
              </ServicesProvider>
            </PaymentProvider>
          </AppointmentProvider>
        </NotificationProvider>
      </AuthProvider>
    </FeatureErrorBoundary>
  );
};