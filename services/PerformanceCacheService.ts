import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  priority: 'high' | 'medium' | 'low';
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  accessCount: number;
  lastAccessed: number;
}

// Default cache configurations for different data types
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  user: { ttl: 24 * 60 * 60 * 1000, maxSize: 1, priority: 'high' }, // 24 hours
  appointments: { ttl: 5 * 60 * 1000, maxSize: 100, priority: 'high' }, // 5 minutes
  services: { ttl: 30 * 60 * 1000, maxSize: 50, priority: 'medium' }, // 30 minutes
  providers: { ttl: 15 * 60 * 1000, maxSize: 200, priority: 'medium' }, // 15 minutes
  shops: { ttl: 60 * 60 * 1000, maxSize: 100, priority: 'low' }, // 1 hour
  analytics: { ttl: 10 * 60 * 1000, maxSize: 20, priority: 'low' }, // 10 minutes
};

class PerformanceCacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
  };

  constructor() {
    // Clean up expired items every 5 minutes
    setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
    
    // Log cache stats every 10 minutes in development
    if (__DEV__) {
      setInterval(() => this.logStats(), 10 * 60 * 1000);
    }
  }

  // Generate cache key
  private generateKey(namespace: string, key: string): string {
    return `cache:${namespace}:${key}`;
  }

  // Get cache configuration
  private getConfig(namespace: string): CacheConfig {
    return CACHE_CONFIGS[namespace] || { ttl: 5 * 60 * 1000, maxSize: 50, priority: 'medium' };
  }

  // Check if item is expired
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Update access statistics
  private updateAccess(item: CacheItem<any>): void {
    item.accessCount++;
    item.lastAccessed = Date.now();
  }

  // Evict items based on LRU and priority
  private evictItems(namespace: string, maxSize: number): void {
    const namespaceItems = Array.from(this.memoryCache.entries())
      .filter(([key]) => key.startsWith(`cache:${namespace}:`))
      .map(([key, item]) => ({ key, item }));

    if (namespaceItems.length <= maxSize) return;

    // Sort by priority (low first), then by last accessed (oldest first)
    namespaceItems.sort((a, b) => {
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      const priorityDiff = priorityOrder[a.item.priority] - priorityOrder[b.item.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return a.item.lastAccessed - b.item.lastAccessed;
    });

    // Remove excess items
    const itemsToRemove = namespaceItems.slice(0, namespaceItems.length - maxSize);
    itemsToRemove.forEach(({ key }) => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });

    console.log(`PerformanceCacheService: Evicted ${itemsToRemove.length} items from ${namespace}`);
  }

  // Clean up expired items
  private cleanupExpired(): void {
    const expiredKeys: string[] = [];
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`PerformanceCacheService: Cleaned up ${expiredKeys.length} expired items`);
    }
  }

  // Get item from cache
  async get<T>(namespace: string, key: string): Promise<T | null> {
    this.cacheStats.totalRequests++;
    
    const cacheKey = this.generateKey(namespace, key);
    
    // Check memory cache first
    const memoryItem = this.memoryCache.get(cacheKey);
    if (memoryItem && !this.isExpired(memoryItem)) {
      this.updateAccess(memoryItem);
      this.cacheStats.hits++;
      console.log(`PerformanceCacheService: Memory cache hit for ${namespace}:${key}`);
      return memoryItem.data;
    }

    // Check persistent storage for high-priority items
    const config = this.getConfig(namespace);
    if (config.priority === 'high') {
      try {
        const persistedData = await AsyncStorage.getItem(cacheKey);
        if (persistedData) {
          const parsedItem: CacheItem<T> = JSON.parse(persistedData);
          if (!this.isExpired(parsedItem)) {
            // Restore to memory cache
            this.updateAccess(parsedItem);
            this.memoryCache.set(cacheKey, parsedItem);
            this.cacheStats.hits++;
            console.log(`PerformanceCacheService: Persistent cache hit for ${namespace}:${key}`);
            return parsedItem.data;
          } else {
            // Remove expired persistent item
            await AsyncStorage.removeItem(cacheKey);
          }
        }
      } catch (error) {
        console.warn(`PerformanceCacheService: Failed to read from persistent storage:`, error);
      }
    }

    this.cacheStats.misses++;
    return null;
  }

  // Set item in cache
  async set<T>(namespace: string, key: string, data: T): Promise<void> {
    const config = this.getConfig(namespace);
    const cacheKey = this.generateKey(namespace, key);
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      priority: config.priority,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    // Store in memory cache
    this.memoryCache.set(cacheKey, cacheItem);
    
    // Evict if necessary
    this.evictItems(namespace, config.maxSize);

    // Store in persistent storage for high-priority items
    if (config.priority === 'high') {
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn(`PerformanceCacheService: Failed to write to persistent storage:`, error);
      }
    }

    console.log(`PerformanceCacheService: Cached ${namespace}:${key} with TTL ${config.ttl}ms`);
  }

  // Remove item from cache
  async remove(namespace: string, key: string): Promise<void> {
    const cacheKey = this.generateKey(namespace, key);
    
    this.memoryCache.delete(cacheKey);
    
    try {
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn(`PerformanceCacheService: Failed to remove from persistent storage:`, error);
    }

    console.log(`PerformanceCacheService: Removed ${namespace}:${key}`);
  }

  // Clear namespace
  async clearNamespace(namespace: string): Promise<void> {
    const keysToRemove: string[] = [];
    
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`cache:${namespace}:`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.memoryCache.delete(key));

    // Clear from persistent storage
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const namespacePersistentKeys = allKeys.filter(key => 
        key.startsWith(`cache:${namespace}:`)
      );
      
      if (namespacePersistentKeys.length > 0) {
        await AsyncStorage.multiRemove(namespacePersistentKeys);
      }
    } catch (error) {
      console.warn(`PerformanceCacheService: Failed to clear namespace from persistent storage:`, error);
    }

    console.log(`PerformanceCacheService: Cleared namespace ${namespace} (${keysToRemove.length} items)`);
  }

  // Get or set with fallback
  async getOrSet<T>(
    namespace: string, 
    key: string, 
    fallback: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(namespace, key);
    
    if (cached !== null) {
      return cached;
    }

    console.log(`PerformanceCacheService: Cache miss for ${namespace}:${key}, executing fallback`);
    const data = await fallback();
    await this.set(namespace, key, data);
    
    return data;
  }

  // Batch operations
  async getBatch<T>(namespace: string, keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.get<T>(namespace, key);
      })
    );

    return results;
  }

  async setBatch<T>(namespace: string, items: Record<string, T>): Promise<void> {
    await Promise.all(
      Object.entries(items).map(([key, data]) => 
        this.set(namespace, key, data)
      )
    );
  }

  // Preload data
  async preload<T>(
    namespace: string, 
    key: string, 
    loader: () => Promise<T>
  ): Promise<void> {
    // Only preload if not already cached
    const existing = await this.get<T>(namespace, key);
    if (existing === null) {
      const data = await loader();
      await this.set(namespace, key, data);
      console.log(`PerformanceCacheService: Preloaded ${namespace}:${key}`);
    }
  }

  // Cache statistics
  getStats() {
    const hitRate = this.cacheStats.totalRequests > 0 
      ? (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2)
      : '0.00';

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memorySize: this.memoryCache.size,
    };
  }

  // Log statistics
  private logStats(): void {
    const stats = this.getStats();
    console.log('PerformanceCacheService Stats:', stats);
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache:'));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.warn(`PerformanceCacheService: Failed to clear persistent storage:`, error);
    }

    // Reset stats
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
    };

    console.log('PerformanceCacheService: Cleared all cache');
  }

  // Platform-specific optimizations
  optimizeForPlatform(): void {
    if (Platform.OS === 'web') {
      // Web-specific optimizations
      console.log('PerformanceCacheService: Applying web optimizations');
      
      // Use sessionStorage for temporary data on web
      if (typeof sessionStorage !== 'undefined') {
        console.log('PerformanceCacheService: SessionStorage available for web caching');
      }
    } else {
      // Mobile-specific optimizations
      console.log('PerformanceCacheService: Applying mobile optimizations');
      
      // Reduce memory cache size on mobile
      Object.keys(CACHE_CONFIGS).forEach(namespace => {
        CACHE_CONFIGS[namespace].maxSize = Math.floor(CACHE_CONFIGS[namespace].maxSize * 0.7);
      });
    }
  }
}

// Singleton instance
export const performanceCache = new PerformanceCacheService();

// Initialize platform optimizations
performanceCache.optimizeForPlatform();

// Export cache service
export default performanceCache;