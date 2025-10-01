import React, { useMemo, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WithSafeAreaDeviceProvider } from './DeviceProvider';
import { StreamlinedAuthProvider } from './StreamlinedAuthProvider';

const queryClient = new QueryClient({
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

interface EssentialProvidersProps {
  children: React.ReactNode;
}

export const EssentialProviders = React.memo(({ children }: EssentialProvidersProps) => {
  console.log('[PERF] EssentialProviders: Rendering (Tier 1 - Essential)');
  const startTime = performance.now();
  const [isHydrated, setIsHydrated] = useState(false);
  
  const content = useMemo(() => (
    <QueryClientProvider client={queryClient}>
      <WithSafeAreaDeviceProvider>
        <StreamlinedAuthProvider>
          {children}
        </StreamlinedAuthProvider>
      </WithSafeAreaDeviceProvider>
    </QueryClientProvider>
  ), [children]);
  
  useEffect(() => {
    console.log('[PERF] EssentialProviders: Hydration complete');
    setIsHydrated(true);
    const endTime = performance.now();
    console.log(`[PERF] EssentialProviders: Hydrated in ${(endTime - startTime).toFixed(2)}ms`);
  }, [startTime]);
  
  if (!isHydrated) {
    console.log('[PERF] EssentialProviders: Waiting for hydration');
    return null;
  }
  
  return content;
});

EssentialProviders.displayName = 'EssentialProviders';
