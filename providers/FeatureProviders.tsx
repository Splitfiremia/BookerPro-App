import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useStreamlinedAuth as useAuth } from './StreamlinedAuthProvider';
import { performanceMonitor } from '@/services/PerformanceMonitoringService';

const FallbackComponent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

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
    <Suspense fallback={<>{children}</>}>
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
  const [startTime] = useState(() => {
    performanceMonitor.markStart('feature-providers');
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  });
  const { isAuthenticated, isInitialized } = useAuth();
  const [tier, setTier] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  useEffect(() => {
    if (!isHydrated || !isInitialized) return;
    
    console.log('[PERF] FeatureProviders: Starting progressive load');
    
    const scheduleLoad = (callback: () => void, delay: number) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        const idleCallback = (window as any).requestIdleCallback(() => {
          setTimeout(callback, delay);
        });
        return () => (window as any).cancelIdleCallback(idleCallback);
      } else {
        const timer = setTimeout(callback, delay);
        return () => clearTimeout(timer);
      }
    };
    
    const cancel1 = scheduleLoad(() => {
      console.log('[PERF] FeatureProviders: Loading Tier 3a (Enhancement providers)');
      performanceMonitor.trackProvider('Onboarding', 'feature', 50);
      performanceMonitor.trackProvider('Notifications', 'feature', 80);
      setTier(1);
    }, 300);
    
    const cancel2 = scheduleLoad(() => {
      console.log('[PERF] FeatureProviders: Loading Tier 3b (Feature providers)');
      performanceMonitor.trackProvider('Payment', 'feature', 120);
      performanceMonitor.trackProvider('Social', 'feature', 90);
      performanceMonitor.trackProvider('Waitlist', 'feature', 70);
      setTier(2);
    }, 800);
    
    const cancel3 = scheduleLoad(() => {
      console.log('[PERF] FeatureProviders: Loading Tier 3c (Role-based providers)');
      performanceMonitor.trackProvider('TeamManagement', 'feature', 150);
      performanceMonitor.trackProvider('ShopManagement', 'feature', 180);
      setTier(3);
      
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const duration = endTime - startTime;
      
      performanceMonitor.markEnd('feature-providers');
      performanceMonitor.markStartupMilestone('featuresLoaded');
      
      console.log(`[PERF] FeatureProviders: All tiers loaded in ${duration.toFixed(2)}ms`);
    }, 1500);
    
    return () => {
      cancel1();
      cancel2();
      cancel3();
    };
  }, [isInitialized, startTime, isHydrated]);
  
  if (!isHydrated || !isInitialized) {
    return <>{children}</>;
  }
  
  if (tier === 0) {
    return <>{children}</>;
  }
  
  return (
    <Suspense fallback={<FallbackComponent>{children}</FallbackComponent>}>
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
