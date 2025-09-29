import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';

// Debounce hook for search and input operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (typeof callback === 'function') {
        callback(...args);
      }
    }, delay);
  }, [callback, delay]) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

// Throttle hook for scroll and frequent operations
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        if (typeof callback === 'function') {
          callback(...args);
        }
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
}

// Memoization utility for expensive calculations
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  if (!Array.isArray(deps)) {
    throw new Error('Dependencies must be an array');
  }
  return useCallback(callback, deps);
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    if (renderCountRef.current > 1) {
      console.log(`${componentName}: Render #${renderCountRef.current}, ${timeSinceLastRender}ms since last render`);
      
      // Warn about frequent re-renders
      if (timeSinceLastRender < 100 && renderCountRef.current > 5) {
        console.warn(`${componentName}: Frequent re-renders detected. Consider optimization.`);
      }
    }
    
    lastRenderTimeRef.current = now;
  });
  
  return {
    renderCount: renderCountRef.current,
    resetRenderCount: () => { renderCountRef.current = 0; }
  };
}

// Batch state updates utility
export function useBatchedUpdates() {
  const batchRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  const batchUpdate = useCallback((updateFn: () => void) => {
    if (typeof updateFn !== 'function') return;
    batchRef.current.push(updateFn);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const updates = [...batchRef.current];
      batchRef.current = [];
      
      // Execute all batched updates
      updates.forEach(update => update());
    }, 0);
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return batchUpdate;
}

// Lazy loading utility for heavy components
export function useLazyComponent<T>(
  loader: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = useRef<React.ComponentType<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    loader()
      .then(module => {
        LazyComponent.current = module.default;
        setIsLoading(false);
      })
      .catch(err => {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setIsLoading(false);
      });
  }, [loader]);
  
  return {
    Component: LazyComponent.current,
    isLoading,
    error,
    Fallback: fallback
  };
}

// Memory usage optimization for large lists
export function useVirtualizedList<T>(
  data: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      data.length
    );
    
    return {
      startIndex: Math.max(0, startIndex - 1), // Add buffer
      endIndex,
      visibleItems: data.slice(Math.max(0, startIndex - 1), endIndex)
    };
  }, [data, itemHeight, containerHeight, scrollOffset]);
  
  const handleScroll = useThrottle((offset: number) => {
    if (typeof offset !== 'number' || offset < 0) return;
    setScrollOffset(offset);
  }, 16); // 60fps
  
  return {
    visibleItems: visibleRange.visibleItems,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    handleScroll,
    totalHeight: data.length * itemHeight
  };
}

// Advanced Performance Monitor for Provider Loading Bottlenecks
export class ProviderPerformanceMonitor {
  private static instance: ProviderPerformanceMonitor;
  private providerLoadTimes: Map<string, number> = new Map();
  private providerInitTimes: Map<string, number> = new Map();
  private bottlenecks: Map<string, { count: number; totalTime: number }> = new Map();
  private operationTimes: Map<string, number[]> = new Map();

  static getInstance(): ProviderPerformanceMonitor {
    if (!ProviderPerformanceMonitor.instance) {
      ProviderPerformanceMonitor.instance = new ProviderPerformanceMonitor();
    }
    return ProviderPerformanceMonitor.instance;
  }

  trackProviderInit(providerName: string): () => void {
    const startTime = Date.now();
    this.providerInitTimes.set(providerName, startTime);
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.providerLoadTimes.set(providerName, duration);
      
      if (duration > 500) {
        console.warn(`🐌 Provider bottleneck: ${providerName} took ${duration}ms to initialize`);
        const bottleneck = this.bottlenecks.get(providerName) || { count: 0, totalTime: 0 };
        bottleneck.count++;
        bottleneck.totalTime += duration;
        this.bottlenecks.set(providerName, bottleneck);
      }
      
      console.log(`✅ Provider ${providerName} initialized in ${duration}ms`);
    };
  }

  trackOperation(operationName: string, duration: number): void {
    const existing = this.operationTimes.get(operationName) || [];
    existing.push(duration);
    this.operationTimes.set(operationName, existing);
    
    if (duration > 200) {
      console.warn(`⚠️ Slow operation: ${operationName} took ${duration}ms`);
    }
  }

  getBottlenecks(): Record<string, { count: number; avgTime: number; totalTime: number }> {
    const result: Record<string, { count: number; avgTime: number; totalTime: number }> = {};
    for (const [key, value] of this.bottlenecks) {
      result[key] = {
        ...value,
        avgTime: value.totalTime / value.count,
      };
    }
    return result;
  }

  getProviderLoadTimes(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.providerLoadTimes) {
      result[key] = value;
    }
    return result;
  }

  generateReport(): void {
    console.group('🚀 Provider Performance Report');
    
    const loadTimes = this.getProviderLoadTimes();
    const bottlenecks = this.getBottlenecks();
    
    console.log('Provider Load Times:', loadTimes);
    console.log('Bottlenecks:', bottlenecks);
    
    // Identify the slowest providers
    const slowProviders = Object.entries(loadTimes)
      .filter(([, time]) => time > 300)
      .sort(([, a], [, b]) => b - a);
    
    if (slowProviders.length > 0) {
      console.warn('Slowest Providers:', slowProviders);
    }
    
    console.groupEnd();
  }

  clear(): void {
    this.providerLoadTimes.clear();
    this.providerInitTimes.clear();
    this.bottlenecks.clear();
    this.operationTimes.clear();
  }
}

// Hook for tracking provider performance
export function useProviderPerformanceTracking(providerName: string) {
  const monitor = ProviderPerformanceMonitor.getInstance();
  const endTracking = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    endTracking.current = monitor.trackProviderInit(providerName);
    
    return () => {
      if (endTracking.current) {
        endTracking.current();
      }
    };
  }, [providerName, monitor]);
  
  const trackOperation = useCallback((operationName: string, operation: () => Promise<any>) => {
    const startTime = Date.now();
    
    return operation().finally(() => {
      const duration = Date.now() - startTime;
      monitor.trackOperation(`${providerName}_${operationName}`, duration);
    });
  }, [providerName, monitor]);
  
  return { trackOperation };
}

// Hook for detecting and reporting bottlenecks
export function useBottleneckDetector(reportInterval: number = 10000) {
  const monitor = ProviderPerformanceMonitor.getInstance();
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      monitor.generateReport();
    }, reportInterval);
    
    return () => clearInterval(intervalId);
  }, [monitor, reportInterval]);
  
  return {
    getBottlenecks: () => monitor.getBottlenecks(),
    getProviderTimes: () => monitor.getProviderLoadTimes(),
    clearMetrics: () => monitor.clear(),
  };
}