import { useEffect, useState } from 'react';
import { performanceMonitor } from '@/services/PerformanceMonitoringService';

export interface PerformanceValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  metrics: {
    startupTime: number;
    essentialsTime: number;
    coreTime: number;
    featuresTime: number;
  };
  recommendations: string[];
}

export function usePerformanceValidation() {
  const [result, setResult] = useState<PerformanceValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      validatePerformance();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const validatePerformance = () => {
    setIsValidating(true);

    const startupMetrics = performanceMonitor.getStartupMetrics();
    const providerMetrics = performanceMonitor.getProviderMetrics();

    const warnings: string[] = [];
    const errors: string[] = [];
    const recommendations: string[] = [];

    const essentialsTime = startupMetrics.essentialsLoaded 
      ? startupMetrics.essentialsLoaded - startupMetrics.appStart 
      : 0;
    const coreTime = startupMetrics.coreLoaded 
      ? startupMetrics.coreLoaded - startupMetrics.appStart 
      : 0;
    const featuresTime = startupMetrics.featuresLoaded 
      ? startupMetrics.featuresLoaded - startupMetrics.appStart 
      : 0;
    const startupTime = startupMetrics.totalStartupTime || 0;

    if (essentialsTime > 200) {
      warnings.push(`Essential providers took ${essentialsTime.toFixed(0)}ms (target: <200ms)`);
      recommendations.push('Consider optimizing essential provider initialization');
    }

    if (coreTime > 500) {
      warnings.push(`Core providers took ${coreTime.toFixed(0)}ms (target: <500ms)`);
      recommendations.push('Review core provider dependencies and lazy loading');
    }

    if (startupTime > 3000) {
      errors.push(`Total startup time ${startupTime.toFixed(0)}ms exceeds 3s threshold`);
      recommendations.push('Critical: Investigate slow providers and reduce initialization work');
    } else if (startupTime > 2000) {
      warnings.push(`Total startup time ${startupTime.toFixed(0)}ms is above optimal (<2s)`);
    }

    const slowProviders = providerMetrics.filter(p => p.loadTime > 500);
    if (slowProviders.length > 0) {
      warnings.push(`${slowProviders.length} slow provider(s) detected`);
      slowProviders.forEach(p => {
        recommendations.push(`Optimize ${p.name} provider (${p.loadTime.toFixed(0)}ms)`);
      });
    }

    const essentialProviders = providerMetrics.filter(p => p.tier === 'essential');
    const essentialTotal = essentialProviders.reduce((sum, p) => sum + p.loadTime, 0);
    if (essentialTotal > 150) {
      warnings.push(`Essential tier total: ${essentialTotal.toFixed(0)}ms (target: <150ms)`);
    }

    const isValid = errors.length === 0 && warnings.length < 3;

    const validationResult: PerformanceValidationResult = {
      isValid,
      warnings,
      errors,
      metrics: {
        startupTime,
        essentialsTime,
        coreTime,
        featuresTime,
      },
      recommendations,
    };

    setResult(validationResult);
    setIsValidating(false);

    if (__DEV__) {
      console.group('[PERF] 🔍 Performance Validation');
      console.log('Status:', isValid ? '✅ PASSED' : '❌ FAILED');
      console.log('Metrics:', validationResult.metrics);
      if (warnings.length > 0) {
        console.warn('Warnings:', warnings);
      }
      if (errors.length > 0) {
        console.error('Errors:', errors);
      }
      if (recommendations.length > 0) {
        console.log('Recommendations:', recommendations);
      }
      console.groupEnd();
    }
  };

  return {
    result,
    isValidating,
    revalidate: validatePerformance,
  };
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    startup: performanceMonitor.getStartupMetrics(),
    providers: performanceMonitor.getProviderMetrics(),
    all: performanceMonitor.getMetrics(),
  });

  const refresh = () => {
    setMetrics({
      startup: performanceMonitor.getStartupMetrics(),
      providers: performanceMonitor.getProviderMetrics(),
      all: performanceMonitor.getMetrics(),
    });
  };

  useEffect(() => {
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    ...metrics,
    refresh,
    exportMetrics: () => performanceMonitor.exportMetrics(),
    clear: () => {
      performanceMonitor.clear();
      refresh();
    },
  };
}
