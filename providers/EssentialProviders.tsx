import React, { useEffect, useState } from 'react';
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [startTime] = useState(() => typeof performance !== 'undefined' ? performance.now() : Date.now());
  
  useEffect(() => {
    setIsHydrated(true);
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    console.log(`[PERF] EssentialProviders: Hydrated in ${(endTime - startTime).toFixed(2)}ms`);
  }, [startTime]);
  
  if (!isHydrated) {
    return null;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <WithSafeAreaDeviceProvider>
        <StreamlinedAuthProvider>
          {children}
        </StreamlinedAuthProvider>
      </WithSafeAreaDeviceProvider>
    </QueryClientProvider>
  );
});

EssentialProviders.displayName = 'EssentialProviders';
