import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import only essential providers
import { AuthProvider } from './AuthProvider';
import { WithSafeAreaDeviceProvider } from './DeviceProvider';
import { LazyProviders } from './LazyProviders';

// Create QueryClient once - outside component to prevent recreation
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

const CoreProviders = React.memo(({ children }: CoreProvidersProps) => {
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
});

CoreProviders.displayName = 'CoreProviders';

// Main optimized provider tree
interface OptimizedProviderTreeProps {
  children: React.ReactNode;
}

export default function OptimizedProviderTree({ children }: OptimizedProviderTreeProps) {
  console.log('OptimizedProviderTree: Rendering optimized provider tree');
  
  return (
    <CoreProviders>
      <ErrorBoundary 
        level="info" 
        resetOnPropsChange={false}
        fallback={<ProvidersErrorFallback />}
      >
        <LazyProviders>
          {children}
        </LazyProviders>
      </ErrorBoundary>
    </CoreProviders>
  );
}

const styles = StyleSheet.create({
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