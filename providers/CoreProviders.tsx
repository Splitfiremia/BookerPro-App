import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useStreamlinedAuth as useAuth } from './StreamlinedAuthProvider';

const LazyAppointmentProvider = lazy(() => 
  import('./AppointmentProvider').then(m => ({ 
    default: m.AppointmentProvider 
  }))
);

const LazyServicesProvider = lazy(() => 
  import('./ServicesProvider').then(m => ({ 
    default: m.ServicesProvider 
  }))
);

interface CoreProvidersProps {
  children: React.ReactNode;
}

export const CoreProviders = React.memo(({ children }: CoreProvidersProps) => {
  console.log('[PERF] CoreProviders: Rendering (Tier 2 - Core Business Logic)');
  const startTime = performance.now();
  const { isAuthenticated, isInitialized } = useAuth();
  const [shouldLoad, setShouldLoad] = useState(false);
  
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log('[PERF] CoreProviders: User authenticated, loading core providers');
      requestAnimationFrame(() => {
        setShouldLoad(true);
        const endTime = performance.now();
        console.log(`[PERF] CoreProviders: Triggered load in ${(endTime - startTime).toFixed(2)}ms`);
      });
    } else if (isInitialized && !isAuthenticated) {
      console.log('[PERF] CoreProviders: User not authenticated, skipping core providers');
      setShouldLoad(false);
    }
  }, [isAuthenticated, isInitialized, startTime]);
  
  if (!isInitialized) {
    console.log('[PERF] CoreProviders: Auth not initialized, rendering children directly');
    return <>{children}</>;
  }
  
  if (!isAuthenticated || !shouldLoad) {
    console.log('[PERF] CoreProviders: Not authenticated or not ready, rendering children directly');
    return <>{children}</>;
  }
  
  return (
    <Suspense fallback={<>{children}</>}>
      <LazyAppointmentProvider>
        <LazyServicesProvider>
          {children}
        </LazyServicesProvider>
      </LazyAppointmentProvider>
    </Suspense>
  );
});

CoreProviders.displayName = 'CoreProviders';
