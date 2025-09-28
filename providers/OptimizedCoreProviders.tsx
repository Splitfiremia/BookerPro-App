import React, { useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { COLORS } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Individual provider hooks - import only what's needed
import { useAuth } from './AuthProvider';
import { useAppointments } from './AppointmentProvider';
import { useServices } from './ServicesProvider';

// Core context for essential app functionality
interface CoreContextType {
  auth: ReturnType<typeof useAuth>;
  appointments: ReturnType<typeof useAppointments>;
  services: ReturnType<typeof useServices>;
}

// Create focused core context
export const [CoreProvider, useCoreContext] = createContextHook(() => {
  console.log('CoreProvider: Initializing core context');
  
  const auth = useAuth();
  const appointments = useAppointments();
  const services = useServices();

  const coreContext: CoreContextType = {
    auth,
    appointments,
    services,
  };

  console.log('CoreProvider: Core context created');
  return coreContext;
});

// Individual hook exports for direct access
export const useAuthContext = () => useCoreContext().auth;
export const useAppointmentsContext = () => useCoreContext().appointments;
export const useServicesContext = () => useCoreContext().services;

// Loading fallback component
function CoreProviderLoadingFallback() {
  return (
    <div style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}>
      <p style={{ color: COLORS.white, fontSize: 16 }}>Loading core services...</p>
    </div>
  );
}

// Error fallback component
function CoreProviderErrorFallback() {
  return (
    <div style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}>
      <p style={{ color: COLORS.error, fontSize: 16 }}>Failed to load core services</p>
    </div>
  );
}

// Wrapper component with error boundary
interface CoreProviderWrapperProps {
  children: React.ReactNode;
}

export function CoreProviderWrapper({ children }: CoreProviderWrapperProps) {
  return (
    <ErrorBoundary 
      fallback={<CoreProviderErrorFallback />}
      level="critical"
      resetOnPropsChange={true}
    >
      <React.Suspense fallback={<CoreProviderLoadingFallback />}>
        <CoreProvider>
          {children}
        </CoreProvider>
      </React.Suspense>
    </ErrorBoundary>
  );
}

// Feature-specific provider for shop management (lazy loaded)
export const ShopManagementProviderLazy = React.lazy(() => 
  import('./ShopManagementProvider').then(module => ({ 
    default: module.ShopManagementProvider 
  }))
);

// Feature-specific provider for social features (lazy loaded)
export const SocialProviderLazy = React.lazy(() => 
  import('./SocialProvider').then(module => ({ 
    default: module.SocialProvider 
  }))
);

// Utility hook for conditional provider loading
export function useFeatureProvider<T>(
  providerName: string,
  loader: () => Promise<T>,
  dependencies: any[] = []
): T | null {
  return useMemo(() => {
    // Only load if dependencies are met
    if (dependencies.some(dep => !dep)) {
      return null;
    }
    
    // In a real implementation, you'd use React.lazy or dynamic imports
    console.log(`Loading feature provider: ${providerName}`);
    return null;
  }, dependencies);
}