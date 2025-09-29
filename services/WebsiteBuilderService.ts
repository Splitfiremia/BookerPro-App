import { Alert } from 'react-native';
import { ShopWebsite, WebsiteTemplate } from '@/models/shopWebsite';
import { templateCacheService, cacheService } from './CacheService';
import { analyticsService } from './AnalyticsService';
import {
  ValidationResult,
  ValidationError,
  APIResponse,
  ExportOptions,
  ExportResult,
  PerformanceMetrics,
  OptimizationSuggestion,
} from '@/types/website';

export interface WebsiteBuilderConfig {
  apiBaseUrl: string;
  cdnUrl: string;
  maxFileSize: number;
  supportedFormats: string[];
  cacheTTL: number;
}

export class WebsiteBuilderService {
  private static config: WebsiteBuilderConfig = {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.bookerpro.com',
    cdnUrl: process.env.EXPO_PUBLIC_CDN_URL || 'https://cdn.bookerpro.com',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    cacheTTL: 15 * 60 * 1000, // 15 minutes
  };

  /**
   * Save website with caching and validation
   */
  static async saveWebsite(websiteData: Partial<ShopWebsite>): Promise<APIResponse<ShopWebsite>> {
    try {
      // Validate website data
      const validation = this.validateWebsiteData(websiteData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      console.log('Saving website data:', websiteData);
      
      // In a real app, this would be an API call
      // const response = await fetch(`${this.config.apiBaseUrl}/websites`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(websiteData),
      // });
      
      // Simulate API response
      const savedWebsite: ShopWebsite = {
        id: websiteData.id || `website_${Date.now()}`,
        shopId: websiteData.shopId || 'default_shop',
        ...websiteData,
        lastModified: new Date().toISOString(),
      } as ShopWebsite;

      // Cache the saved website
      await cacheService.set(`website_${savedWebsite.id}`, savedWebsite, {
        ttl: this.config.cacheTTL,
      });

      // Invalidate related cache entries
      await this.invalidateWebsiteCache(savedWebsite.id);

      return {
        success: true,
        data: savedWebsite,
        timestamp: new Date().toISOString(),
        requestId: `save_${Date.now()}`,
      };
    } catch (error) {
      console.error('Error saving website:', error);
      return {
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to save website. Please try again.',
        },
        timestamp: new Date().toISOString(),
        requestId: `save_${Date.now()}`,
      };
    }
  }

  /**
   * Publish website with performance optimization
   */
  static async publishWebsite(websiteData: Partial<ShopWebsite>): Promise<APIResponse<{ website: ShopWebsite; liveUrl: string }>> {
    try {
      if (!websiteData.subdomainSlug) {
        throw new Error('Please enter a subdomain slug before publishing.');
      }

      // Validate slug availability
      const slugAvailable = await this.checkSlugAvailability(websiteData.subdomainSlug);
      if (!slugAvailable) {
        throw new Error('This subdomain is already taken. Please choose a different one.');
      }

      console.log('Publishing website:', websiteData);
      
      // Optimize website before publishing
      const optimizedData = await this.optimizeWebsite(websiteData);
      
      // Generate performance report
      const performanceMetrics = await this.analyzePerformance(optimizedData);
      
      // In a real app, this would be an API call
      const publishedWebsite: ShopWebsite = {
        ...optimizedData,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      } as ShopWebsite;

      const liveUrl = this.generateWebsiteUrl(websiteData.subdomainSlug);

      // Cache the published website
      await cacheService.set(`website_${publishedWebsite.id}`, publishedWebsite, {
        ttl: this.config.cacheTTL,
      });

      // Preload template assets
      if (publishedWebsite.templateId) {
        const template = await this.getTemplate(publishedWebsite.templateId);
        if (template) {
          await templateCacheService.preloadTemplateAssets(template);
        }
      }

      return {
        success: true,
        data: {
          website: publishedWebsite,
          liveUrl,
        },
        timestamp: new Date().toISOString(),
        requestId: `publish_${Date.now()}`,
      };
    } catch (error) {
      console.error('Error publishing website:', error);
      return {
        success: false,
        error: {
          code: 'PUBLISH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to publish website. Please try again.',
        },
        timestamp: new Date().toISOString(),
        requestId: `publish_${Date.now()}`,
      };
    }
  }

  /**
   * Get template with caching
   */
  static async getTemplate(templateId: string): Promise<WebsiteTemplate | null> {
    try {
      // Try cache first
      const cached = await templateCacheService.getTemplate(templateId);
      if (cached) {
        return cached;
      }

      // In a real app, this would fetch from API
      // const response = await fetch(`${this.config.apiBaseUrl}/templates/${templateId}`);
      // const template = await response.json();
      
      // For now, return mock data
      const mockTemplate: WebsiteTemplate = {
        id: templateId as any,
        name: 'Modern Template',
        description: 'A modern, responsive template',
        category: 'modern',
        previewImageUrl: `${this.config.cdnUrl}/templates/${templateId}/preview.jpg`,
        content: '<html>...</html>',
        defaultColors: {
          primary: '#007AFF',
          secondary: '#5856D6',
        },
        isPremium: false,
        rating: 4.5,
        usageCount: 150,
      };

      // Cache the template
      await templateCacheService.setTemplate(templateId, mockTemplate);
      
      return mockTemplate;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Get all templates with caching
   */
  static async getAllTemplates(): Promise<WebsiteTemplate[]> {
    try {
      // Try cache first
      const cached = await templateCacheService.getAllTemplates();
      if (cached) {
        return cached;
      }

      // In a real app, this would fetch from API
      const mockTemplates: WebsiteTemplate[] = [
        {
          id: 'modern' as any,
          name: 'Modern Professional',
          description: 'Clean and modern design perfect for professional services',
          category: 'modern',
          previewImageUrl: `${this.config.cdnUrl}/templates/modern/preview.jpg`,
          content: '<html>...</html>',
          defaultColors: { primary: '#007AFF', secondary: '#5856D6' },
          isPremium: false,
          rating: 4.8,
          usageCount: 320,
        },
        {
          id: 'classic' as any,
          name: 'Classic Elegance',
          description: 'Timeless design with elegant typography',
          category: 'classic',
          previewImageUrl: `${this.config.cdnUrl}/templates/classic/preview.jpg`,
          content: '<html>...</html>',
          defaultColors: { primary: '#8B4513', secondary: '#D2691E' },
          isPremium: true,
          rating: 4.6,
          usageCount: 180,
        },
        {
          id: 'creative' as any,
          name: 'Creative Design',
          description: 'Creative and artistic design for unique businesses',
          category: 'creative',
          previewImageUrl: `${this.config.cdnUrl}/templates/creative/preview.jpg`,
          content: '<html>...</html>',
          defaultColors: { primary: '#000000', secondary: '#666666' },
          isPremium: false,
          rating: 4.4,
          usageCount: 95,
        },
      ];

      // Cache the templates
      await templateCacheService.setAllTemplates(mockTemplates);
      
      return mockTemplates;
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Check slug availability with caching
   */
  static async checkSlugAvailability(slug: string): Promise<boolean> {
    try {
      if (!this.validateSlug(slug)) {
        return false;
      }

      // Check cache first
      const cacheKey = `slug_availability_${slug}`;
      const cached = await cacheService.get<boolean>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // In a real app, this would check with API
      // const response = await fetch(`${this.config.apiBaseUrl}/websites/check-slug/${slug}`);
      // const { available } = await response.json();
      
      // For now, simulate availability check
      const reservedSlugs = ['api', 'admin', 'www', 'app', 'mobile', 'web', 'help', 'support'];
      const available = !reservedSlugs.includes(slug.toLowerCase());

      // Cache the result for 5 minutes
      await cacheService.set(cacheKey, available, { ttl: 5 * 60 * 1000 });
      
      return available;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  }

  /**
   * Export website
   */
  static async exportWebsite(websiteId: string, options: ExportOptions): Promise<ExportResult> {
    try {
      console.log(`Exporting website ${websiteId} with options:`, options);
      
      // In a real app, this would generate the export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        downloadUrl: `${this.config.cdnUrl}/exports/${websiteId}.${options.format}`,
        fileSize: Math.floor(Math.random() * 1000000) + 500000, // 0.5-1.5MB
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };
    } catch (error) {
      console.error('Error exporting website:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Analyze website performance
   */
  static async analyzePerformance(websiteData: Partial<ShopWebsite>): Promise<PerformanceMetrics> {
    try {
      // In a real app, this would run actual performance tests
      return {
        loadTime: Math.floor(Math.random() * 2000) + 1000, // 1-3 seconds
        firstContentfulPaint: Math.floor(Math.random() * 1500) + 500, // 0.5-2 seconds
        largestContentfulPaint: Math.floor(Math.random() * 2500) + 1000, // 1-3.5 seconds
        cumulativeLayoutShift: parseFloat((Math.random() * 0.2).toFixed(3)), // 0-0.2
        firstInputDelay: Math.floor(Math.random() * 100) + 50, // 50-150ms
        timeToInteractive: Math.floor(Math.random() * 3000) + 2000, // 2-5 seconds
        totalBlockingTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
      };
    } catch (error) {
      console.error('Error analyzing performance:', error);
      return {
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timeToInteractive: 0,
        totalBlockingTime: 0,
      };
    }
  }

  /**
   * Get optimization suggestions
   */
  static async getOptimizationSuggestions(websiteData: Partial<ShopWebsite>): Promise<OptimizationSuggestion[]> {
    try {
      // In a real app, this would analyze the website and provide suggestions
      return [
        {
          type: 'image',
          priority: 'high',
          title: 'Optimize Images',
          description: 'Compress and resize images to improve loading speed',
          impact: 'Reduce load time by 30-50%',
          effort: 'low',
          resources: ['WebP format', 'Image compression tools'],
        },
        {
          type: 'css',
          priority: 'medium',
          title: 'Minify CSS',
          description: 'Remove unnecessary whitespace and comments from CSS',
          impact: 'Reduce file size by 15-25%',
          effort: 'low',
        },
        {
          type: 'cache',
          priority: 'medium',
          title: 'Enable Browser Caching',
          description: 'Set appropriate cache headers for static assets',
          impact: 'Improve repeat visit performance by 40-60%',
          effort: 'medium',
        },
      ];
    } catch (error) {
      console.error('Error getting optimization suggestions:', error);
      return [];
    }
  }

  /**
   * Optimize website before publishing
   */
  private static async optimizeWebsite(websiteData: Partial<ShopWebsite>): Promise<Partial<ShopWebsite>> {
    try {
      // In a real app, this would perform actual optimizations
      console.log('Optimizing website for publication...');
      
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...websiteData,
        lastModified: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error optimizing website:', error);
      return websiteData;
    }
  }

  /**
   * Validate website data
   */
  private static validateWebsiteData(websiteData: Partial<ShopWebsite>): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate subdomain slug
    if (websiteData.subdomainSlug && !this.validateSlug(websiteData.subdomainSlug)) {
      errors.push({
        field: 'subdomainSlug',
        message: 'Subdomain must be 3-50 characters long and contain only lowercase letters, numbers, and hyphens',
        code: 'INVALID_SLUG_FORMAT',
      });
    }

    // Validate site title
    if (websiteData.siteTitle && websiteData.siteTitle.length > 100) {
      errors.push({
        field: 'siteTitle',
        message: 'Site title must be 100 characters or less',
        code: 'TITLE_TOO_LONG',
      });
    }

    // Validate business bio
    if (websiteData.businessBio && websiteData.businessBio.length > 1000) {
      errors.push({
        field: 'businessBio',
        message: 'Business bio must be 1000 characters or less',
        code: 'BIO_TOO_LONG',
      });
    }

    // Validate colors
    if (websiteData.primaryColor && !this.isValidHexColor(websiteData.primaryColor)) {
      errors.push({
        field: 'primaryColor',
        message: 'Primary color must be a valid hex color (e.g., #FF0000)',
        code: 'INVALID_COLOR_FORMAT',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Invalidate website-related cache entries
   */
  private static async invalidateWebsiteCache(websiteId: string): Promise<void> {
    try {
      const cacheKeys = [
        `website_${websiteId}`,
        `website_analytics_${websiteId}`,
        `website_performance_${websiteId}`,
      ];
      
      for (const key of cacheKeys) {
        await cacheService.remove(key);
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * Generate website URL
   */
  static generateWebsiteUrl(slug: string): string {
    return `https://bookerpro.com/${slug}`;
  }

  /**
   * Copy website URL to clipboard
   */
  static copyWebsiteUrl(slug: string): void {
    const url = this.generateWebsiteUrl(slug);
    console.log('Copying URL:', url);
    Alert.alert('Copied!', `Website URL copied: ${url}`);
  }

  /**
   * Validate subdomain slug
   */
  static validateSlug(slug: string): boolean {
    const pattern = /^[a-z0-9-]+$/;
    return pattern.test(slug) && slug.length >= 3 && slug.length <= 50;
  }

  /**
   * Sanitize slug input
   */
  static sanitizeSlug(input: string): string {
    return input.toLowerCase().replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Validate hex color
   */
  private static isValidHexColor(color: string): boolean {
    const pattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return pattern.test(color);
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{ templates: any; general: any }> {
    try {
      const [templateStats, generalStats] = await Promise.all([
        templateCacheService.getStats(),
        cacheService.getStats(),
      ]);
      
      return {
        templates: templateStats,
        general: generalStats,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        templates: { memorySize: 0, storageKeys: 0 },
        general: { memorySize: 0, storageKeys: 0 },
      };
    }
  }

  /**
   * Clear all caches
   */
  static async clearAllCaches(): Promise<void> {
    try {
      await Promise.all([
        templateCacheService.clear(),
        cacheService.clear(),
        analyticsService.clearCache(),
      ]);
      
      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }
}