import React, { Suspense, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { COLORS } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useOptimizedAuth } from './OptimizedAuthProvider';

// Lazy load providers based on user role and features needed
const AppointmentProvider = React.lazy(() => 
  import('./AppointmentProvider').then(module => ({ 
    default: module.AppointmentProvider 
  }))
);

const ServicesProvider = React.lazy(() => 
  import('./ServicesProvider').then(module => ({ 
    default: module.ServicesProvider 
  }))
);

const PaymentProvider = React.lazy(() => 
  import('./PaymentProvider').then(module => ({ 
    default: module.PaymentProvider 
  }))
);

const ShopManagementProvider = React.lazy(() => 
  import('./ShopManagementProvider').then(module => ({ 
    default: module.ShopManagementProvider 
  }))
);

const TeamManagementProvider = React.lazy(() => 
  import('./TeamManagementProvider').then(module => ({ 
    default: module.TeamManagementProvider 
  }))
);

const SocialProvider = React.lazy(() => 
  import('./SocialProvider').then(module => ({ 
    default: module.SocialProvider 
  }))
);

const WaitlistProvider = React.lazy(() => 
  import('./WaitlistProvider').then(module => ({ 
    default: module.WaitlistProvider 
  }))
);

// Performance monitoring context
interface PerformanceMetrics {
  loginTime: number;
  dashboardLoadTime: number;
  providerLoadTime: number;
  totalLoadTime: number;
}

export const [PerformanceProvider, usePerformance] = createContextHook(() => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    loginTime: 0,
    dashboardLoadTime: 0,
    providerLoadTime: 0,
    totalLoadTime: 0,
  });

  const startTimer = useCallback((key: keyof PerformanceMetrics) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setMetrics(prev => ({ ...prev, [key]: duration }));
      console.log(`Performance: ${key} took ${duration.toFixed(2)}ms`);
    };
  }, []);

  const logMetrics = useCallback(() => {
    console.log('Performance Metrics:', metrics);
  }, [metrics]);

  return { metrics, startTimer, logMetrics };
});

// Provider loading states
interface ProviderLoadingState {
  core: boolean;
  appointments: boolean;
  services: boolean;
  payments: boolean;
  shopManagement: boolean;
  teamManagement: boolean;
  social: boolean;
  waitlist: boolean;
}

// Optimized provider manager
export const [OptimizedProviderManager, useProviderManager] = createContextHook(() => {
  const { user } = useOptimizedAuth();
  const { startTimer } = usePerformance();
  
  const [loadingState, setLoadingState] = React.useState<ProviderLoadingState>({
    core: true,
    appointments: false,
    services: false,
    payments: false,
    shopManagement: false,
    teamManagement: false,
    social: false,
    waitlist: false,
  });

  // Determine which providers to load based on user role
  const requiredProviders = useMemo(() => {
    if (!user) return [];

    const providers: string[] = ['appointments', 'services'];

    switch (user.role) {
      case 'client':
        providers.push('payments', 'social', 'waitlist');
        break;
      case 'provider':
        providers.push('payments', 'social');
        break;
      case 'owner':
        providers.push('payments', 'shopManagement', 'teamManagement');
        break;
    }

    return providers;
  }, [user?.role]);

  // Progressive provider loading
  const loadProvider = useCallback(async (providerName: keyof ProviderLoadingState) => {
    if (loadingState[providerName]) return;

    const endTimer = startTimer('providerLoadTime');
    
    setLoadingState(prev => ({ ...prev, [providerName]: true }));
    
    // Simulate provider initialization time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    endTimer();
    console.log(`OptimizedProviderManager: Loaded ${providerName} provider`);
  }, [loadingState, startTimer]);

  // Load providers in priority order
  React.useEffect(() => {
    if (!user || requiredProviders.length === 0) return;

    const loadProvidersSequentially = async () => {
      // High priority providers (load immediately)
      const highPriority = ['appointments', 'services'];
      const highPriorityToLoad = requiredProviders.filter(p => highPriority.includes(p));
      
      await Promise.all(
        highPriorityToLoad.map(provider => 
          loadProvider(provider as keyof ProviderLoadingState)
        )
      );

      // Medium priority providers (load after 200ms)
      setTimeout(async () => {
        const mediumPriority = ['payments', 'social'];
        const mediumPriorityToLoad = requiredProviders.filter(p => mediumPriority.includes(p));
        
        await Promise.all(
          mediumPriorityToLoad.map(provider => 
            loadProvider(provider as keyof ProviderLoadingState)
          )
        );
      }, 200);

      // Low priority providers (load after 500ms)
      setTimeout(async () => {
        const lowPriority = ['shopManagement', 'teamManagement', 'waitlist'];
        const lowPriorityToLoad = requiredProviders.filter(p => lowPriority.includes(p));
        
        await Promise.all(
          lowPriorityToLoad.map(provider => 
            loadProvider(provider as keyof ProviderLoadingState)
          )
        );
      }, 500);
    };

    loadProvidersSequentially();
  }, [user, requiredProviders, loadProvider]);

  return {
    loadingState,
    requiredProviders,
    isProviderLoaded: (provider: keyof ProviderLoadingState) => loadingState[provider],
    loadProvider,
  };
});

// Loading fallback components
function CoreProviderLoader() {
  return (
    <View style={styles.coreLoader}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.coreLoaderText}>Initializing core services...</Text>
    </View>
  );
}

function FeatureProviderLoader({ feature }: { feature: string }) {
  return (
    <View style={styles.featureLoader}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.featureLoaderText}>Loading {feature}...</Text>
    </View>
  );
}

// Provider wrapper components
interface ProviderWrapperProps {
  children: React.ReactNode;
  providerName: keyof ProviderLoadingState;
  ProviderComponent: React.ComponentType<{ children: React.ReactNode }>;
  priority?: 'high' | 'medium' | 'low';
}

function ProviderWrapper({ 
  children, 
  providerName, 
  ProviderComponent, 
  priority = 'medium' 
}: ProviderWrapperProps) {
  const { isProviderLoaded } = useProviderManager();
  
  if (!isProviderLoaded(providerName)) {
    return <FeatureProviderLoader feature={providerName} />;
  }

  return (
    <ErrorBoundary 
      fallback={
        <View style={styles.providerError}>
          <Text style={styles.providerErrorText}>
            {providerName} service unavailable
          </Text>
        </View>
      }
      level={priority === 'high' ? 'critical' : 'warning'}
    >
      <Suspense fallback={<FeatureProviderLoader feature={providerName} />}>
        <ProviderComponent>
          {children}
        </ProviderComponent>
      </Suspense>
    </ErrorBoundary>
  );
}

// Main optimized provider tree
interface OptimizedProviderTreeProps {
  children: React.ReactNode;
}

export function OptimizedProviderTree({ children }: OptimizedProviderTreeProps) {
  const { user } = useOptimizedAuth();
  const { requiredProviders } = useProviderManager();

  if (!user) {
    return (
      <View style={styles.noUserContainer}>
        <Text style={styles.noUserText}>No user authenticated</Text>
      </View>
    );
  }

  // Build provider tree based on required providers
  let providerTree = children;

  // Wrap in providers in reverse order (innermost first)
  if (requiredProviders.includes('waitlist')) {
    providerTree = (
      <ProviderWrapper 
        providerName="waitlist" 
        ProviderComponent={WaitlistProvider}
        priority="low"
      >
        {providerTree}
      </ProviderWrapper>
    );
  }

  if (requiredProviders.includes('social')) {
    providerTree = (
      <ProviderWrapper 
        providerName="social" 
        ProviderComponent={SocialProvider}
        priority="medium"
      >
        {providerTree}
      </ProviderWrapper>
    );
  }

  if (requiredProviders.includes('teamManagement')) {
    providerTree = (
      <ProviderWrapper 
        providerName="teamManagement" 
        ProviderComponent={TeamManagementProvider}
        priority="low"
      >
        {providerTree}
      </ProviderWrapper>
    );
  }

  if (requiredProviders.includes('shopManagement')) {
    providerTree = (
      <ProviderWrapper 
        providerName="shopManagement" 
        ProviderComponent={ShopManagementProvider}
        priority="low"
      >
        {providerTree}
      </ProviderWrapper>
    );
  }

  if (requiredProviders.includes('payments')) {
    providerTree = (
      <ProviderWrapper 
        providerName="payments" 
        ProviderComponent={PaymentProvider}
        priority="medium"
      >
        {providerTree}
      </ProviderWrapper>
    );
  }

  if (requiredProviders.includes('services')) {
    providerTree = (
      <ProviderWrapper 
        providerName="services" 
        ProviderComponent={ServicesProvider}
        priority="high"
      >
        {providerTree}
      </ProviderWrapper>
    );
  }

  if (requiredProviders.includes('appointments')) {
    providerTree = (
      <ProviderWrapper 
        providerName="appointments" 
        ProviderComponent={AppointmentProvider}
        priority="high"
      >
        {providerTree}
      </ProviderWrapper>
    );
  }

  return (
    <ErrorBoundary 
      fallback={<CoreProviderLoader />}
      level="critical"
    >
      <Suspense fallback={<CoreProviderLoader />}>
        <OptimizedProviderManager>
          <PerformanceProvider>
            {providerTree}
          </PerformanceProvider>
        </OptimizedProviderManager>
      </Suspense>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  coreLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  coreLoaderText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  featureLoader: {
    padding: 12,
    backgroundColor: COLORS.glass.background,
    borderRadius: 8,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLoaderText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.lightGray,
  },
  providerError: {
    padding: 12,
    backgroundColor: COLORS.glass.background,
    borderRadius: 8,
    margin: 4,
    alignItems: 'center',
  },
  providerErrorText: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
  },
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  noUserText: {
    fontSize: 16,
    color: COLORS.error,
  },
});