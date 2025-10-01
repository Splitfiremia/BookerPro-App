import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';
import { EssentialProviders } from './EssentialProviders';
import { CoreProviders } from './CoreProviders';
import { FeatureProviders } from './FeatureProviders';

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

interface OptimizedProviderTreeV2Props {
  children: React.ReactNode;
}

export default function OptimizedProviderTreeV2({ children }: OptimizedProviderTreeV2Props) {
  console.log('[PERF] OptimizedProviderTreeV2: Starting provider tree initialization');
  const startTime = performance.now();
  
  useEffect(() => {
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    console.log(`[PERF] OptimizedProviderTreeV2: Provider tree mounted in ${totalTime.toFixed(2)}ms`);
    
    performance.mark('provider-tree-complete');
    
    if (performance.getEntriesByName('app-start').length > 0) {
      performance.measure(
        'app-startup-to-providers',
        'app-start',
        'provider-tree-complete'
      );
      
      const measure = performance.getEntriesByName('app-startup-to-providers')[0];
      console.log(`[PERF] Total app startup time: ${measure.duration.toFixed(2)}ms`);
    }
  }, [startTime]);
  
  return (
    <ErrorBoundary 
      level="critical" 
      resetOnPropsChange={false}
      fallback={<ProvidersErrorFallback />}
      onError={(error) => console.error('[PERF] CRITICAL: Provider tree error:', error)}
    >
      <EssentialProviders>
        <ErrorBoundary 
          level="warning" 
          resetOnPropsChange={false}
          fallback={<ProvidersErrorFallback />}
          onError={(error) => console.error('[PERF] WARNING: Core providers error:', error)}
        >
          <CoreProviders>
            <ErrorBoundary 
              level="info" 
              resetOnPropsChange={false}
              fallback={<ProvidersErrorFallback />}
              onError={(error) => console.error('[PERF] INFO: Feature providers error:', error)}
            >
              <FeatureProviders>
                {children}
              </FeatureProviders>
            </ErrorBoundary>
          </CoreProviders>
        </ErrorBoundary>
      </EssentialProviders>
    </ErrorBoundary>
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
