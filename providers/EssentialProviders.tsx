import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WithSafeAreaDeviceProvider } from './DeviceProvider';
import { StreamlinedAuthProvider } from './StreamlinedAuthProvider';
import { performanceMonitor } from '@/services/PerformanceMonitoringService';

let queryClientInstance: QueryClient | null = null;

function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          staleTime: 1000 * 60 * 5,
          refetchOnWindowFocus: false,
          gcTime: 1000 * 60 * 10,
          refetchOnMount: false,
          refetchOnReconnect: false,
          networkMode: 'online',
        },
        mutations: {
          networkMode: 'online',
          retry: 1,
        },
      },
    });
  }
  return queryClientInstance;
}

interface EssentialProvidersProps {
  children: React.ReactNode;
}

export const EssentialProviders = React.memo(({ children }: EssentialProvidersProps) => {
  console.log('[PERF] EssentialProviders: Rendering (Tier 1 - Essential)');
  const [isHydrated, setIsHydrated] = useState(false);
  const [startTime] = useState(() => {
    performanceMonitor.markStart('essential-providers');
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  });
  
  useEffect(() => {
    setIsHydrated(true);
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const duration = endTime - startTime;
    
    performanceMonitor.markEnd('essential-providers');
    performanceMonitor.markStartupMilestone('essentialsLoaded');
    performanceMonitor.trackProvider('QueryClient', 'essential', duration * 0.3);
    performanceMonitor.trackProvider('SafeArea+Device', 'essential', duration * 0.2);
    performanceMonitor.trackProvider('Auth', 'essential', duration * 0.5);
    
    console.log(`[PERF] EssentialProviders: Hydrated in ${duration.toFixed(2)}ms`);
  }, [startTime]);
  
  if (!isHydrated) {
    return null;
  }
  
  return (
    <QueryClientProvider client={getQueryClient()}>
      <WithSafeAreaDeviceProvider>
        <StreamlinedAuthProvider>
          {children}
        </StreamlinedAuthProvider>
      </WithSafeAreaDeviceProvider>
    </QueryClientProvider>
  );
});

EssentialProviders.displayName = 'EssentialProviders';
