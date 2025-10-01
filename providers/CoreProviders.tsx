import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useStreamlinedAuth as useAuth } from './StreamlinedAuthProvider';
import { performanceMonitor } from '@/services/PerformanceMonitoringService';

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
  const [startTime] = useState(() => {
    performanceMonitor.markStart('core-providers');
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  });
  const { isAuthenticated, isInitialized } = useAuth();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  useEffect(() => {
    if (!isHydrated) return;
    
    if (isInitialized && isAuthenticated) {
      console.log('[PERF] CoreProviders: User authenticated, loading core providers');
      
      if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
        requestAnimationFrame(() => {
          setShouldLoad(true);
          const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
          const duration = endTime - startTime;
          
          performanceMonitor.markEnd('core-providers');
          performanceMonitor.markStartupMilestone('coreLoaded');
          performanceMonitor.trackProvider('Appointments', 'core', duration * 0.6);
          performanceMonitor.trackProvider('Services', 'core', duration * 0.4);
          
          console.log(`[PERF] CoreProviders: Triggered load in ${duration.toFixed(2)}ms`);
        });
      } else {
        setTimeout(() => {
          setShouldLoad(true);
          const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
          const duration = endTime - startTime;
          
          performanceMonitor.markEnd('core-providers');
          performanceMonitor.markStartupMilestone('coreLoaded');
          performanceMonitor.trackProvider('Appointments', 'core', duration * 0.6);
          performanceMonitor.trackProvider('Services', 'core', duration * 0.4);
          
          console.log(`[PERF] CoreProviders: Triggered load in ${duration.toFixed(2)}ms`);
        }, 0);
      }
    } else if (isInitialized && !isAuthenticated) {
      console.log('[PERF] CoreProviders: User not authenticated, skipping core providers');
      setShouldLoad(false);
    }
  }, [isAuthenticated, isInitialized, startTime, isHydrated]);
  
  if (!isHydrated || !isInitialized) {
    console.log('[PERF] CoreProviders: Not hydrated or auth not initialized, rendering children directly');
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
