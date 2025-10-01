/**
 * Provider Helper Utilities
 * Standardized patterns for error handling, loading states, and async operations
 */

import { useState, useCallback, useEffect, useRef, DependencyList } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_TIMEOUT = 100;

export interface ProviderState<T> {
  data: T;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AsyncOperation<T> {
  execute: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

export function createInitialState<T>(defaultData: T): ProviderState<T> {
  return {
    data: defaultData,
    isLoading: true,
    isInitialized: false,
    error: null,
  };
}

export function useProviderState<T>(defaultData: T) {
  const [state, setState] = useState<ProviderState<T>>(
    createInitialState(defaultData)
  );

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }));
  }, []);

  const setInitialized = useCallback((isInitialized: boolean) => {
    setState(prev => ({ ...prev, isInitialized }));
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState(defaultData));
  }, [defaultData]);

  return {
    state,
    setData,
    setLoading,
    setError,
    setInitialized,
    reset,
  };
}

export async function loadFromStorageWithTimeout<T>(
  key: string,
  timeout: number = STORAGE_TIMEOUT
): Promise<T | null> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage timeout')), timeout)
    );

    const dataPromise = AsyncStorage.getItem(key);
    const result = await Promise.race([dataPromise, timeoutPromise]);

    if (result && typeof result === 'string') {
      return JSON.parse(result) as T;
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage timeout') {
      console.log(`[Storage] Timeout loading ${key}, using defaults`);
    } else {
      console.error(`[Storage] Error loading ${key}:`, error);
    }
    return null;
  }
}

export async function saveToStorage<T>(
  key: string,
  data: T
): Promise<{ success: boolean; error?: string }> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Save failed';
    console.error(`[Storage] Error saving ${key}:`, error);
    return { success: false, error: message };
  }
}

export function useAbortableEffect(
  effect: (signal: AbortSignal) => void | Promise<void>,
  deps: DependencyList
) {
  const effectRef = useRef(effect);
  
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);
  
  useEffect(() => {
    const abortController = new AbortController();

    const runEffect = async () => {
      try {
        await effectRef.current(abortController.signal);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('[Effect] Abortable effect error:', error);
      }
    };

    runEffect();

    return () => {
      abortController.abort();
    };
  }, deps);
}

export function useSafeAsync<T>(
  asyncFn: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
) {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    try {
      const result = await asyncFn();
      if (isMountedRef.current && onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (error) {
      if (isMountedRef.current && onError) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
      throw error;
    }
  }, [asyncFn, onSuccess, onError]);

  return execute;
}

export function handleProviderError(
  providerName: string,
  operation: string,
  error: unknown
): string {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${providerName}] ${operation} failed:`, error);
  return message;
}

export function createSafeContextValue<T extends Record<string, any>>(
  value: T,
  providerName: string
): T {
  const safeValue = { ...value };
  
  Object.keys(safeValue).forEach(key => {
    if (safeValue[key] === undefined) {
      console.warn(`[${providerName}] Context value "${key}" is undefined`);
    }
  });

  return safeValue;
}

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoff = true } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxAttempts) {
        const delay = backoff ? delayMs * attempt : delayMs;
        console.log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Retry failed');
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
}
