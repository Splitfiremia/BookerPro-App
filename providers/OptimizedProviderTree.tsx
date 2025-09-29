import React, { Suspense, useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import only essential providers
import { AuthProvider } from './AuthProvider';
import { WithSafeAreaDeviceProvider } from './DeviceProvider';

// Lazy load non-essential providers
const LazyProviders = React.lazy(() => import('./LazyProviders').then(m => ({ default: m.LazyProviders })));

// Create optimized QueryClient with better defaults
const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 10, // 10 minutes
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
};

// Memoized QueryClient to prevent recreation
const queryClient = createOptimizedQueryClient();

// Optimized loading fallback
function ProvidersLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Initializing app services...</Text>
    </View>
  );
}

// Error fallback for providers
function ProvidersErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Service Initialization Failed</Text>
      <Text style={styles.errorText}>
        Unable to initialize app services. Please restart the app.
      </Text>
    </View>
  );
}

// Core providers that must load immediately
interface CoreProvidersProps {
  children: React.ReactNode;
}

function CoreProviders({ children }: CoreProvidersProps) {
  console.log('CoreProviders: Rendering core providers');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary level="critical" resetOnPropsChange={false}>
        <WithSafeAreaDeviceProvider>
          <ErrorBoundary level="warning" resetOnPropsChange={false}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </WithSafeAreaDeviceProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

// Main optimized provider tree
interface OptimizedProviderTreeProps {
  children: React.ReactNode;
}

export default function OptimizedProviderTree({ children }: OptimizedProviderTreeProps) {
  console.log('OptimizedProviderTree: Rendering optimized provider tree');
  
  // Memoize the provider tree to prevent unnecessary re-renders
  const providerTree = useMemo(() => (
    <CoreProviders>
      <ErrorBoundary 
        level="info" 
        resetOnPropsChange={false}
        fallback={<ProvidersErrorFallback />}
      >
        <Suspense fallback={<ProvidersLoadingFallback />}>
          <LazyProviders>
            {children}
          </LazyProviders>
        </Suspense>
      </ErrorBoundary>
    </CoreProviders>
  ), [children]);
  
  return providerTree;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
});