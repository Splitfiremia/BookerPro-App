import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import React from "react";

// Debounce hook for search and input operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
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