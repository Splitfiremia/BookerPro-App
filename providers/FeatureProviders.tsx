import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useStreamlinedAuth as useAuth } from './StreamlinedAuthProvider';

const LazyOnboardingProvider = lazy(() => 
  import('./OnboardingProvider').then(m => ({ 
    default: m.OnboardingProvider 
  }))
);

const LazyNotificationProvider = lazy(() => 
  import('./NotificationProvider').then(m => ({ 
    default: m.NotificationProvider 
  }))
);

const LazyPaymentProvider = lazy(() => 
  import('./PaymentProvider').then(m => ({ 
    default: m.PaymentProvider 
  }))
);

const LazySocialProvider = lazy(() => 
  import('./SocialProvider').then(m => ({ 
    default: m.SocialProvider 
  }))
);

const LazyWaitlistProvider = lazy(() => 
  import('./WaitlistProvider').then(m => ({ 
    default: m.WaitlistProvider 
  }))
);

const LazyTeamManagementProvider = lazy(() => 
  import('./TeamManagementProvider').then(m => ({ 
    default: m.TeamManagementProvider 
  }))
);

const LazyShopManagementProvider = lazy(() => 
  import('./ShopManagementProvider').then(m => ({ 
    default: m.ShopManagementProvider 
  }))
);

interface RoleBasedProvidersProps {
  children: React.ReactNode;
}

const RoleBasedProviders = React.memo(({ children }: RoleBasedProvidersProps) => {
  const { user } = useAuth();
  const needsManagementProviders = user?.role === 'owner' || user?.role === 'provider';
  
  if (!needsManagementProviders) {
    console.log('[PERF] RoleBasedProviders: Skipping management providers for client');
    return <>{children}</>;
  }
  
  console.log('[PERF] RoleBasedProviders: Loading management providers for', user?.role);
  
  return (
    <Suspense fallback={null}>
      <LazyTeamManagementProvider>
        <LazyShopManagementProvider>
          {children}
        </LazyShopManagementProvider>
      </LazyTeamManagementProvider>
    </Suspense>
  );
});

RoleBasedProviders.displayName = 'RoleBasedProviders';

interface FeatureProvidersProps {
  children: React.ReactNode;
}

export const FeatureProviders = React.memo(({ children }: FeatureProvidersProps) => {
  console.log('[PERF] FeatureProviders: Rendering (Tier 3 - Feature Providers)');
  const startTime = performance.now();
  const { isAuthenticated, isInitialized } = useAuth();
  const [tier, setTier] = useState(0);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log('[PERF] FeatureProviders: Starting progressive load');
    
    setTimeout(() => {
      console.log('[PERF] FeatureProviders: Loading Tier 3a (Enhancement providers)');
      setTier(1);
    }, 300);
    
    setTimeout(() => {
      console.log('[PERF] FeatureProviders: Loading Tier 3b (Feature providers)');
      setTier(2);
    }, 800);
    
    setTimeout(() => {
      console.log('[PERF] FeatureProviders: Loading Tier 3c (Role-based providers)');
      setTier(3);
      const endTime = performance.now();
      console.log(`[PERF] FeatureProviders: All tiers loaded in ${(endTime - startTime).toFixed(2)}ms`);
    }, 1500);
  }, [isInitialized, startTime]);
  
  if (!isInitialized) {
    return <>{children}</>;
  }
  
  if (tier === 0) {
    return <>{children}</>;
  }
  
  return (
    <Suspense fallback={null}>
      {tier >= 1 && (
        <LazyOnboardingProvider>
          <LazyNotificationProvider>
            {tier >= 2 && isAuthenticated ? (
              <LazyPaymentProvider>
                <LazySocialProvider>
                  <LazyWaitlistProvider>
                    {tier >= 3 ? (
                      <RoleBasedProviders>
                        {children}
                      </RoleBasedProviders>
                    ) : children}
                  </LazyWaitlistProvider>
                </LazySocialProvider>
              </LazyPaymentProvider>
            ) : tier >= 3 ? (
              <RoleBasedProviders>
                {children}
              </RoleBasedProviders>
            ) : children}
          </LazyNotificationProvider>
        </LazyOnboardingProvider>
      )}
    </Suspense>
  );
});

FeatureProviders.displayName = 'FeatureProviders';
