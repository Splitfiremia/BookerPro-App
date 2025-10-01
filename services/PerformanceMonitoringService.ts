/**
 * Performance Monitoring Service
 * Tracks app startup, provider initialization, and runtime performance
 */

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ProviderMetrics {
  name: string;
  tier: 'essential' | 'core' | 'feature';
  loadTime: number;
  timestamp: number;
}

export interface StartupMetrics {
  appStart: number;
  essentialsLoaded?: number;
  coreLoaded?: number;
  featuresLoaded?: number;
  firstRender?: number;
  totalStartupTime?: number;
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private providerMetrics: ProviderMetrics[] = [];
  private startupMetrics: StartupMetrics = { appStart: 0 };
  private isEnabled: boolean = true;

  private constructor() {
    this.initializePerformanceAPI();
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  private initializePerformanceAPI(): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark('app-start');
        this.startupMetrics.appStart = performance.now();
        console.log('[PERF] Performance monitoring initialized');
      } catch (error) {
        console.warn('[PERF] Performance API not fully supported:', error);
        this.isEnabled = false;
      }
    } else {
      console.warn('[PERF] Performance API not available');
      this.isEnabled = false;
    }
  }

  /**
   * Mark the start of a performance measurement
   */
  markStart(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    this.metrics.set(name, {
      name,
      startTime,
      metadata,
    });

    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(`${name}-start`);
      } catch (error) {
        console.warn(`[PERF] Failed to mark start for ${name}:`, error);
      }
    }

    console.log(`[PERF] ⏱️  Started: ${name}`, metadata || '');
  }

  /**
   * Mark the end of a performance measurement
   */
  markEnd(name: string, metadata?: Record<string, any>): number | undefined {
    if (!this.isEnabled) return undefined;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`[PERF] No start mark found for: ${name}`);
      return undefined;
    }

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    if (metadata) {
      metric.metadata = { ...metric.metadata, ...metadata };
    }

    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      try {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      } catch (error) {
        console.warn(`[PERF] Failed to measure ${name}:`, error);
      }
    }

    const emoji = duration < 100 ? '✅' : duration < 500 ? '⚠️' : '🐌';
    console.log(`[PERF] ${emoji} Completed: ${name} in ${duration.toFixed(2)}ms`, metadata || '');

    return duration;
  }

  /**
   * Track provider initialization
   */
  trackProvider(
    name: string,
    tier: 'essential' | 'core' | 'feature',
    loadTime: number
  ): void {
    this.providerMetrics.push({
      name,
      tier,
      loadTime,
      timestamp: Date.now(),
    });

    const emoji = loadTime < 50 ? '⚡' : loadTime < 200 ? '✅' : loadTime < 500 ? '⚠️' : '🐌';
    console.log(`[PERF] ${emoji} Provider [${tier}]: ${name} loaded in ${loadTime.toFixed(2)}ms`);
  }

  /**
   * Mark startup milestones
   */
  markStartupMilestone(milestone: keyof Omit<StartupMetrics, 'appStart'>): void {
    if (!this.isEnabled) return;

    const time = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.startupMetrics[milestone] = time;

    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(milestone);
      } catch (error) {
        console.warn(`[PERF] Failed to mark milestone ${milestone}:`, error);
      }
    }

    console.log(`[PERF] 🎯 Milestone: ${milestone} at ${time.toFixed(2)}ms`);
  }

  /**
   * Calculate and log startup performance
   */
  calculateStartupMetrics(): void {
    if (!this.isEnabled) return;

    const { appStart, essentialsLoaded, coreLoaded, featuresLoaded, firstRender } = this.startupMetrics;

    console.group('[PERF] 📊 Startup Performance Report');

    if (essentialsLoaded) {
      const essentialsTime = essentialsLoaded - appStart;
      console.log(`⚡ Essentials loaded: ${essentialsTime.toFixed(2)}ms`);
      
      if (typeof performance !== 'undefined' && performance.measure) {
        try {
          performance.measure('startup-to-essentials', 'app-start', 'essentialsLoaded');
        } catch (error) {
          console.warn('[PERF] Failed to measure startup-to-essentials:', error);
        }
      }
    }

    if (coreLoaded) {
      const coreTime = coreLoaded - appStart;
      const coreDelta = essentialsLoaded ? coreLoaded - essentialsLoaded : 0;
      console.log(`✅ Core loaded: ${coreTime.toFixed(2)}ms (delta: ${coreDelta.toFixed(2)}ms)`);
      
      if (typeof performance !== 'undefined' && performance.measure) {
        try {
          performance.measure('startup-to-core', 'app-start', 'coreLoaded');
          if (essentialsLoaded) {
            performance.measure('essentials-to-core', 'essentialsLoaded', 'coreLoaded');
          }
        } catch (error) {
          console.warn('[PERF] Failed to measure core metrics:', error);
        }
      }
    }

    if (featuresLoaded) {
      const featuresTime = featuresLoaded - appStart;
      const featuresDelta = coreLoaded ? featuresLoaded - coreLoaded : 0;
      console.log(`🎨 Features loaded: ${featuresTime.toFixed(2)}ms (delta: ${featuresDelta.toFixed(2)}ms)`);
      
      if (typeof performance !== 'undefined' && performance.measure) {
        try {
          performance.measure('startup-to-features', 'app-start', 'featuresLoaded');
          if (coreLoaded) {
            performance.measure('core-to-features', 'coreLoaded', 'featuresLoaded');
          }
        } catch (error) {
          console.warn('[PERF] Failed to measure feature metrics:', error);
        }
      }
    }

    if (firstRender) {
      const renderTime = firstRender - appStart;
      console.log(`🎨 First render: ${renderTime.toFixed(2)}ms`);
      this.startupMetrics.totalStartupTime = renderTime;
    }

    console.groupEnd();

    // Provider breakdown by tier
    this.logProviderBreakdown();

    // Performance recommendations
    this.generateRecommendations();
  }

  /**
   * Log provider loading breakdown
   */
  private logProviderBreakdown(): void {
    const byTier = {
      essential: this.providerMetrics.filter(p => p.tier === 'essential'),
      core: this.providerMetrics.filter(p => p.tier === 'core'),
      feature: this.providerMetrics.filter(p => p.tier === 'feature'),
    };

    console.group('[PERF] 📦 Provider Loading Breakdown');

    Object.entries(byTier).forEach(([tier, providers]) => {
      if (providers.length === 0) return;

      const totalTime = providers.reduce((sum, p) => sum + p.loadTime, 0);
      const avgTime = totalTime / providers.length;
      const slowest = providers.reduce((max, p) => p.loadTime > max.loadTime ? p : max);

      console.log(`\n${tier.toUpperCase()} Tier (${providers.length} providers):`);
      console.log(`  Total: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${avgTime.toFixed(2)}ms`);
      console.log(`  Slowest: ${slowest.name} (${slowest.loadTime.toFixed(2)}ms)`);

      if (slowest.loadTime > 500) {
        console.warn(`  ⚠️ ${slowest.name} is a bottleneck!`);
      }
    });

    console.groupEnd();
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): void {
    const recommendations: string[] = [];
    const { totalStartupTime } = this.startupMetrics;

    // Check total startup time
    if (totalStartupTime && totalStartupTime > 3000) {
      recommendations.push('🐌 Total startup time exceeds 3s. Consider further optimization.');
    } else if (totalStartupTime && totalStartupTime < 1000) {
      recommendations.push('⚡ Excellent startup time! Under 1s.');
    }

    // Check for slow providers
    const slowProviders = this.providerMetrics.filter(p => p.loadTime > 500);
    if (slowProviders.length > 0) {
      recommendations.push(
        `⚠️ ${slowProviders.length} slow provider(s) detected: ${slowProviders.map(p => p.name).join(', ')}`
      );
    }

    // Check tier distribution
    const essentialTime = this.providerMetrics
      .filter(p => p.tier === 'essential')
      .reduce((sum, p) => sum + p.loadTime, 0);

    if (essentialTime > 200) {
      recommendations.push('⚠️ Essential providers taking >200ms. Consider optimization.');
    }

    if (recommendations.length > 0) {
      console.group('[PERF] 💡 Recommendations');
      recommendations.forEach(rec => console.log(rec));
      console.groupEnd();
    } else {
      console.log('[PERF] ✅ No performance issues detected!');
    }
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get provider metrics
   */
  getProviderMetrics(): ProviderMetrics[] {
    return [...this.providerMetrics];
  }

  /**
   * Get startup metrics
   */
  getStartupMetrics(): StartupMetrics {
    return { ...this.startupMetrics };
  }

  /**
   * Get Performance API entries
   */
  getPerformanceEntries(): PerformanceEntry[] {
    if (typeof performance === 'undefined' || !performance.getEntries) {
      return [];
    }

    try {
      return performance.getEntries();
    } catch (error) {
      console.warn('[PERF] Failed to get performance entries:', error);
      return [];
    }
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.getMetrics(),
      providerMetrics: this.getProviderMetrics(),
      startupMetrics: this.getStartupMetrics(),
      timestamp: Date.now(),
    }, null, 2);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.providerMetrics = [];
    this.startupMetrics = { appStart: 0 };
    console.log('[PERF] Metrics cleared');
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`[PERF] Monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export default PerformanceMonitoringService;

// Singleton instance
export const performanceMonitor = PerformanceMonitoringService.getInstance();
