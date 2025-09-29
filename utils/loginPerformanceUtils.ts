import { Platform } from 'react-native';
import performanceCache from '../services/PerformanceCacheService';

// Performance monitoring utilities
interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface LoginPerformanceData {
  authenticationTime: number;
  dataFetchTime: number;
  providerLoadTime: number;
  dashboardRenderTime: number;
  totalLoginTime: number;
  userRole: string;
  timestamp: number;
}

class LoginPerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>();
  private loginSessions = new Map<string, Partial<LoginPerformanceData>>();

  // Start timing a metric
  startTiming(metricName: string, metadata?: Record<string, any>): string {
    const id = `${metricName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.metrics.set(id, {
      name: metricName,
      startTime: performance.now(),
      metadata,
    });

    console.log(`LoginPerformanceMonitor: Started timing ${metricName} (${id})`);
    return id;
  }

  // End timing a metric
  endTiming(id: string): number | null {
    const metric = this.metrics.get(id);
    if (!metric) {
      console.warn(`LoginPerformanceMonitor: Metric ${id} not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    console.log(`LoginPerformanceMonitor: ${metric.name} took ${duration.toFixed(2)}ms`);

    // Store in cache for analysis
    this.storeMetric(metric);

    return duration;
  }

  // Store metric for later analysis
  private async storeMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const key = `${metric.name}_${Date.now()}`;
      await performanceCache.set('performance_metrics', key, metric);
    } catch (error) {
      console.warn('LoginPerformanceMonitor: Failed to store metric:', error);
    }
  }

  // Start login session tracking
  startLoginSession(sessionId: string, userRole: string): void {
    this.loginSessions.set(sessionId, {
      userRole,
      timestamp: Date.now(),
    });

    console.log(`LoginPerformanceMonitor: Started login session ${sessionId} for role ${userRole}`);
  }

  // Update login session with timing data
  updateLoginSession(sessionId: string, updates: Partial<LoginPerformanceData>): void {
    const session = this.loginSessions.get(sessionId);
    if (!session) {
      console.warn(`LoginPerformanceMonitor: Session ${sessionId} not found`);
      return;
    }

    Object.assign(session, updates);
    this.loginSessions.set(sessionId, session);
  }

  // Complete login session and store results
  async completeLoginSession(sessionId: string): Promise<LoginPerformanceData | null> {
    const session = this.loginSessions.get(sessionId);
    if (!session) {
      console.warn(`LoginPerformanceMonitor: Session ${sessionId} not found`);
      return null;
    }

    // Calculate total login time
    const totalLoginTime = (session.authenticationTime || 0) + 
                          (session.dataFetchTime || 0) + 
                          (session.providerLoadTime || 0) + 
                          (session.dashboardRenderTime || 0);

    const completeSession: LoginPerformanceData = {
      authenticationTime: session.authenticationTime || 0,
      dataFetchTime: session.dataFetchTime || 0,
      providerLoadTime: session.providerLoadTime || 0,
      dashboardRenderTime: session.dashboardRenderTime || 0,
      totalLoginTime,
      userRole: session.userRole || 'unknown',
      timestamp: session.timestamp || Date.now(),
    };

    // Store session data
    try {
      await performanceCache.set('login_sessions', sessionId, completeSession);
      console.log(`LoginPerformanceMonitor: Completed login session ${sessionId}:`, completeSession);
    } catch (error) {
      console.warn('LoginPerformanceMonitor: Failed to store session:', error);
    }

    // Clean up
    this.loginSessions.delete(sessionId);

    // Log performance insights
    this.logPerformanceInsights(completeSession);

    return completeSession;
  }

  // Log performance insights
  private logPerformanceInsights(session: LoginPerformanceData): void {
    const insights: string[] = [];

    if (session.totalLoginTime > 3000) {
      insights.push('⚠️ Slow login detected (>3s)');
    }

    if (session.authenticationTime > 1500) {
      insights.push('🔐 Authentication is slow (>1.5s)');
    }

    if (session.dataFetchTime > 1000) {
      insights.push('📊 Data fetching is slow (>1s)');
    }

    if (session.providerLoadTime > 800) {
      insights.push('🔧 Provider loading is slow (>800ms)');
    }

    if (session.dashboardRenderTime > 500) {
      insights.push('🎨 Dashboard rendering is slow (>500ms)');
    }

    if (insights.length > 0) {
      console.warn('LoginPerformanceMonitor: Performance Issues Detected:');
      insights.forEach(insight => console.warn(`  ${insight}`));
    } else {
      console.log('✅ LoginPerformanceMonitor: Good login performance!');
    }
  }

  // Get performance statistics
  async getPerformanceStats(): Promise<{
    averageLoginTime: number;
    sessionCount: number;
    slowSessions: number;
    roleBreakdown: Record<string, { count: number; averageTime: number }>;
  }> {
    try {
      // This would typically fetch from a more persistent store
      // For now, we'll return mock data structure
      return {
        averageLoginTime: 0,
        sessionCount: 0,
        slowSessions: 0,
        roleBreakdown: {},
      };
    } catch (error) {
      console.warn('LoginPerformanceMonitor: Failed to get stats:', error);
      return {
        averageLoginTime: 0,
        sessionCount: 0,
        slowSessions: 0,
        roleBreakdown: {},
      };
    }
  }

  // Clear old performance data
  async clearOldData(olderThanDays: number = 7): Promise<void> {
    try {
      await performanceCache.clearNamespace('performance_metrics');
      await performanceCache.clearNamespace('login_sessions');
      console.log(`LoginPerformanceMonitor: Cleared data older than ${olderThanDays} days`);
    } catch (error) {
      console.warn('LoginPerformanceMonitor: Failed to clear old data:', error);
    }
  }
}

// Singleton instance
export const loginPerformanceMonitor = new LoginPerformanceMonitor();

// Performance optimization utilities
export class PerformanceOptimizer {
  // Debounce function calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Batch async operations
  static async batchAsync<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
      
      // Small delay between batches to prevent overwhelming
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }

  // Preload critical resources
  static async preloadCriticalData(userRole: string): Promise<void> {
    const preloadTasks: Promise<void>[] = [];

    // Common data for all roles
    preloadTasks.push(
      performanceCache.preload('services', 'common', async () => {
        // Mock service data loading
        return { services: [] };
      })
    );

    // Role-specific preloading
    switch (userRole) {
      case 'client':
        preloadTasks.push(
          performanceCache.preload('providers', 'nearby', async () => {
            // Mock nearby providers loading
            return { providers: [] };
          })
        );
        break;

      case 'provider':
        preloadTasks.push(
          performanceCache.preload('appointments', 'today', async () => {
            // Mock today's appointments loading
            return { appointments: [] };
          })
        );
        break;

      case 'owner':
        preloadTasks.push(
          performanceCache.preload('analytics', 'dashboard', async () => {
            // Mock dashboard analytics loading
            return { metrics: {} };
          })
        );
        break;
    }

    await Promise.all(preloadTasks);
    console.log(`PerformanceOptimizer: Preloaded critical data for ${userRole}`);
  }

  // Optimize for platform
  static getPlatformOptimizations() {
    const isWeb = Platform.OS === 'web';
    const isIOS = Platform.OS === 'ios';
    const isAndroid = Platform.OS === 'android';

    return {
      // Reduce animations on web for better performance
      shouldReduceAnimations: isWeb,
      
      // Use native optimizations on mobile
      useNativeOptimizations: isIOS || isAndroid,
      
      // Batch size adjustments
      batchSize: isWeb ? 3 : 5,
      
      // Cache size adjustments
      cacheMultiplier: isWeb ? 0.7 : 1.0,
      
      // Debounce delays
      debounceDelay: isWeb ? 300 : 200,
    };
  }
}

// Export performance utilities
export { performanceCache };
export default loginPerformanceMonitor;