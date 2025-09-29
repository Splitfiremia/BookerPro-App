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

/**
 * Abstract Template Processor using Template Method Pattern
 * Defines the skeleton of template processing algorithm with performance optimizations
 */
abstract class TemplateProcessor {
  private static readonly PROCESSING_CACHE = new Map<string, { result: string; timestamp: number; ttl: number }>();
  private static readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_CACHE_SIZE = 100;
  
  /**
   * Template Method - defines the algorithm structure with caching
   */
  public async processTemplate(websiteData: Partial<ShopWebsite>, templateId: string): Promise<string> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(websiteData, templateId);
    
    try {
      console.log(`Processing template ${templateId} with Template Method pattern`);
      
      // Check cache first
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        console.log(`Template ${templateId} served from cache in ${(performance.now() - startTime).toFixed(2)}ms`);
        return cached;
      }
      
      // Step 1: Load template with parallel data fetching
      const [template, validationResult] = await Promise.all([
        this.loadTemplate(templateId),
        this.preValidateData(websiteData)
      ]);
      
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }
      
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Step 2: Validate template-specific data
      await this.validateTemplateData(websiteData, template);
      
      // Step 3: Prepare template variables with optimization
      const templateVars = await this.prepareTemplateVariables(websiteData, template);
      
      // Step 4: Process template content (abstract method)
      const processedContent = await this.processTemplateContent(template, templateVars);
      
      // Step 5: Apply optimizations in parallel
      const [optimizedContent, performanceMetrics] = await Promise.all([
        this.optimizeContent(processedContent, websiteData),
        this.collectPerformanceMetrics(processedContent)
      ]);
      
      // Step 6: Post-process (hook for subclasses)
      const finalContent = await this.postProcess(optimizedContent, websiteData, template);
      
      // Cache the result
      this.setCachedResult(cacheKey, finalContent);
      
      const processingTime = performance.now() - startTime;
      console.log(`Template ${templateId} processed in ${processingTime.toFixed(2)}ms`);
      
      // Log performance metrics
      this.logPerformanceMetrics(templateId, processingTime, performanceMetrics);
      
      return finalContent;
      
    } catch (error) {
      console.error('Template processing failed:', error);
      throw error;
    }
  }
  
  /**
   * Load template with caching - can be overridden by subclasses
   */
  protected async loadTemplate(templateId: string): Promise<WebsiteTemplate | null> {
    return await templateCacheService.getTemplate(templateId) || await WebsiteBuilderService.getTemplate(templateId);
  }
  
  /**
   * Pre-validate data for early error detection
   */
  protected async preValidateData(websiteData: Partial<ShopWebsite>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!websiteData.siteTitle?.trim()) {
      errors.push('Site title is required');
    }
    
    if (websiteData.siteTitle && websiteData.siteTitle.length > 100) {
      errors.push('Site title must be 100 characters or less');
    }
    
    if (websiteData.primaryColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(websiteData.primaryColor)) {
      errors.push('Primary color must be a valid hex color');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate template data - can be overridden by subclasses
   */
  protected async validateTemplateData(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<void> {
    // Default validation
    if (!websiteData.siteTitle?.trim()) {
      throw new Error('Site title is required for template processing');
    }
  }
  
  /**
   * Prepare template variables with optimization - can be overridden by subclasses
   */
  protected async prepareTemplateVariables(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<Record<string, any>> {
    // Use memoization for expensive computations
    const baseVariables = {
      ...websiteData,
      templateId: template.id,
      processedAt: new Date().toISOString(),
      bookNowUrl: websiteData.subdomainSlug ? `https://bookerpro.com/${websiteData.subdomainSlug}/book` : '#',
    };
    
    // Generate optimized HTML sections in parallel
    const [servicesHtml, providersHtml, reviewsHtml] = await Promise.all([
      this.generateServicesHtml(websiteData, template),
      this.generateProvidersHtml(websiteData, template),
      this.generateReviewsHtml(websiteData, template)
    ]);
    
    return {
      ...baseVariables,
      servicesHtml,
      providersHtml,
      reviewsHtml,
    };
  }
  
  /**
   * Generate services HTML section
   */
  protected async generateServicesHtml(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<string> {
    if (!template.features.hasServicesGrid) return '';
    
    // Mock services data - in real app, this would come from the database
    const services = [
      { name: 'Haircut', price: '$30', duration: '30 min' },
      { name: 'Hair Color', price: '$80', duration: '90 min' },
      { name: 'Styling', price: '$40', duration: '45 min' },
    ];
    
    return `
      <section class="services" style="padding: 60px 20px; background: #f8f9fa;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2.5rem; margin-bottom: 40px; color: ${websiteData.primaryColor || '#333'};">Our Services</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${services.map(service => `
              <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: #333;">${service.name}</h3>
                <p style="font-size: 1.2rem; color: ${websiteData.primaryColor || '#007AFF'}; font-weight: 600; margin-bottom: 5px;">${service.price}</p>
                <p style="color: #666; font-size: 0.9rem;">${service.duration}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
  
  /**
   * Generate providers HTML section
   */
  protected async generateProvidersHtml(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<string> {
    if (!template.features.hasTeamSection) return '';
    
    // Mock providers data
    const providers = [
      { name: 'Sarah Johnson', role: 'Senior Stylist', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face' },
      { name: 'Mike Chen', role: 'Colorist', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
    ];
    
    return `
      <section class="team" style="padding: 60px 20px;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2.5rem; margin-bottom: 40px; color: ${websiteData.primaryColor || '#333'};">Meet Our Team</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
            ${providers.map(provider => `
              <div style="text-align: center;">
                <img src="${provider.image}" alt="${provider.name}" style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover; margin-bottom: 20px;" />
                <h3 style="font-size: 1.3rem; margin-bottom: 5px; color: #333;">${provider.name}</h3>
                <p style="color: #666;">${provider.role}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
  
  /**
   * Generate reviews HTML section
   */
  protected async generateReviewsHtml(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<string> {
    if (!template.features.hasReviewsCarousel) return '';
    
    // Mock reviews data
    const reviews = [
      { name: 'Emma Wilson', rating: 5, text: 'Amazing service! Sarah did an incredible job with my hair color.' },
      { name: 'David Brown', rating: 5, text: 'Professional and friendly staff. Highly recommend!' },
    ];
    
    return `
      <section class="reviews" style="padding: 60px 20px; background: #f8f9fa;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2.5rem; margin-bottom: 40px; color: ${websiteData.primaryColor || '#333'};">What Our Clients Say</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${reviews.map(review => `
              <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="color: #ffd700; font-size: 1.2rem; margin-bottom: 15px;">${'★'.repeat(review.rating)}</div>
                <p style="font-style: italic; margin-bottom: 20px; color: #555;">"${review.text}"</p>
                <p style="font-weight: 600; color: #333;">- ${review.name}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
  
  /**
   * Abstract method - must be implemented by subclasses
   */
  protected abstract processTemplateContent(template: WebsiteTemplate, variables: Record<string, any>): Promise<string>;
  
  /**
   * Optimize content - can be overridden by subclasses
   */
  protected async optimizeContent(content: string, websiteData: Partial<ShopWebsite>): Promise<string> {
    // Default optimization: minify HTML
    return content
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      .trim();
  }
  
  /**
   * Post-process hook - can be overridden by subclasses
   */
  protected async postProcess(content: string, websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<string> {
    return content;
  }
  
  /**
   * Generate cache key for template processing
   */
  private generateCacheKey(websiteData: Partial<ShopWebsite>, templateId: string): string {
    const keyData = {
      templateId,
      siteTitle: websiteData.siteTitle,
      primaryColor: websiteData.primaryColor,
      secondaryColor: websiteData.secondaryColor,
      businessBio: websiteData.businessBio,
      showTeamSection: websiteData.showTeamSection,
      showServicesSection: websiteData.showServicesSection,
      showReviewsSection: websiteData.showReviewsSection,
    };
    
    return `template_${templateId}_${this.hashObject(keyData)}`;
  }
  
  /**
   * Simple hash function for cache keys
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Get cached result if valid
   */
  private getCachedResult(cacheKey: string): string | null {
    const cached = TemplateProcessor.PROCESSING_CACHE.get(cacheKey);
    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      return cached.result;
    }
    
    if (cached) {
      TemplateProcessor.PROCESSING_CACHE.delete(cacheKey);
    }
    
    return null;
  }
  
  /**
   * Set cached result with TTL
   */
  private setCachedResult(cacheKey: string, result: string): void {
    // Implement LRU eviction if cache is full
    if (TemplateProcessor.PROCESSING_CACHE.size >= TemplateProcessor.MAX_CACHE_SIZE) {
      const firstKey = TemplateProcessor.PROCESSING_CACHE.keys().next().value;
      if (firstKey) {
        TemplateProcessor.PROCESSING_CACHE.delete(firstKey);
      }
    }
    
    TemplateProcessor.PROCESSING_CACHE.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl: TemplateProcessor.CACHE_TTL
    });
  }
  
  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(content: string): Promise<{ size: number; complexity: number }> {
    return {
      size: content.length,
      complexity: (content.match(/</g) || []).length // Simple complexity metric based on HTML tags
    };
  }
  
  /**
   * Log performance metrics
   */
  private logPerformanceMetrics(templateId: string, processingTime: number, metrics: { size: number; complexity: number }): void {
    console.log(`Template ${templateId} metrics:`, {
      processingTime: `${processingTime.toFixed(2)}ms`,
      contentSize: `${(metrics.size / 1024).toFixed(2)}KB`,
      complexity: metrics.complexity,
      cacheSize: TemplateProcessor.PROCESSING_CACHE.size
    });
  }
  
  /**
   * Clear processing cache
   */
  public static clearProcessingCache(): void {
    TemplateProcessor.PROCESSING_CACHE.clear();
    console.log('Template processing cache cleared');
  }
}

/**
 * HTML Template Processor - handles HTML template processing
 */
class HTMLTemplateProcessor extends TemplateProcessor {
  protected async processTemplateContent(template: WebsiteTemplate, variables: Record<string, any>): Promise<string> {
    // Load HTML template content
    const htmlContent = await this.loadHTMLContent(template.id as string);
    
    // Process Handlebars-style template
    return this.processHandlebarsTemplate(htmlContent, variables);
  }
  
  private async loadHTMLContent(templateId: string): Promise<string> {
    // In a real app, this would load from file system or CDN
    // For now, return mock HTML content based on template ID
    const templateMap: Record<string, string> = {
      'modern': await this.getModernTemplateHTML(),
      'classic': await this.getClassicTemplateHTML(),
      'creative': await this.getCreativeTemplateHTML(),
    };
    
    return templateMap[templateId] || templateMap['modern'];
  }
  
  private processHandlebarsTemplate(html: string, variables: Record<string, any>): string {
    let processedHtml = html;
    
    // Process simple variables {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, String(value || ''));
    });
    
    // Process conditional blocks {{#if condition}}...{{/if}}
    processedHtml = this.processConditionals(processedHtml, variables);
    
    // Process loops {{#each array}}...{{/each}}
    processedHtml = this.processLoops(processedHtml, variables);
    
    return processedHtml;
  }
  
  private processConditionals(html: string, variables: Record<string, any>): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return html.replace(conditionalRegex, (match, condition, content) => {
      const value = variables[condition];
      return value ? content : '';
    });
  }
  
  private processLoops(html: string, variables: Record<string, any>): string {
    const loopRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return html.replace(loopRegex, (match, arrayName, template) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        let itemHtml = template;
        Object.entries(item).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemHtml = itemHtml.replace(regex, String(value || ''));
        });
        return itemHtml;
      }).join('');
    });
  }
  
  private async getModernTemplateHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteTitle}}</title>
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
        .hero { background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); color: white; padding: 100px 20px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; }
        .cta-button { background: white; color: {{primaryColor}}; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <section class="hero">
        <h1>{{siteTitle}}</h1>
        <p>{{businessBio}}</p>
        <a href="{{bookNowUrl}}" class="cta-button">Book Now</a>
    </section>
    {{servicesHtml}}
    {{providersHtml}}
    {{reviewsHtml}}
</body>
</html>`;
  }
  
  private async getClassicTemplateHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteTitle}}</title>
    <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background: #f8f8f8; }
        .header { background: {{primaryColor}}; color: white; padding: 60px 20px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 15px; }
        .content { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .cta-button { background: {{primaryColor}}; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; }
    </style>
</head>
<body>
    <header class="header">
        <h1>{{siteTitle}}</h1>
        <p>{{businessBio}}</p>
    </header>
    <div class="content">
        {{servicesHtml}}
        {{providersHtml}}
        <a href="{{bookNowUrl}}" class="cta-button">Schedule Appointment</a>
    </div>
</body>
</html>`;
  }
  
  private async getCreativeTemplateHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteTitle}}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 0; background: #000; color: #fff; }
        .hero { background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}}); padding: 120px 20px; text-align: center; }
        .hero h1 { font-size: 4rem; margin-bottom: 20px; font-weight: 300; }
        .hero p { font-size: 1.3rem; margin-bottom: 40px; }
        .cta-button { background: transparent; color: white; border: 2px solid white; padding: 15px 30px; border-radius: 0; text-decoration: none; font-weight: 400; transition: all 0.3s; }
        .cta-button:hover { background: white; color: {{primaryColor}}; }
    </style>
</head>
<body>
    <section class="hero">
        <h1>{{siteTitle}}</h1>
        <p>{{businessBio}}</p>
        <a href="{{bookNowUrl}}" class="cta-button">BOOK NOW</a>
    </section>
    {{servicesHtml}}
    {{providersHtml}}
</body>
</html>`;
  }
  
  protected async optimizeContent(content: string, websiteData: Partial<ShopWebsite>): Promise<string> {
    let optimized = await super.optimizeContent(content, websiteData);
    
    // HTML-specific optimizations
    optimized = optimized
      .replace(/\s*\n\s*/g, ' ')  // Remove line breaks and extra spaces
      .replace(/<!--[\s\S]*?-->/g, '')  // Remove HTML comments
      .replace(/\s{2,}/g, ' ')  // Replace multiple spaces with single space
      .trim();
    
    return optimized;
  }
}

/**
 * JSON Template Processor - handles JSON-based templates
 */
class JSONTemplateProcessor extends TemplateProcessor {
  protected async processTemplateContent(template: WebsiteTemplate, variables: Record<string, any>): Promise<string> {
    // Process JSON-based template configuration
    const jsonConfig = {
      template: template.id,
      data: variables,
      features: template.features,
      colors: {
        primary: variables.primaryColor || template.defaultColors.primary,
        secondary: variables.secondaryColor || template.defaultColors.secondary,
      },
      sections: this.generateSections(variables, template),
    };
    
    return JSON.stringify(jsonConfig, null, 2);
  }
  
  private generateSections(variables: Record<string, any>, template: WebsiteTemplate): any[] {
    const sections = [];
    
    // Hero section
    sections.push({
      type: 'hero',
      title: variables.siteTitle,
      subtitle: variables.businessBio,
      backgroundImage: variables.heroImageUrl,
      ctaText: 'Book Now',
      ctaUrl: variables.bookNowUrl,
    });
    
    // Services section
    if (template.features.hasServicesGrid && variables.services) {
      sections.push({
        type: 'services',
        title: 'Our Services',
        items: variables.services,
      });
    }
    
    // Team section
    if (template.features.hasTeamSection && variables.providers) {
      sections.push({
        type: 'team',
        title: 'Meet Our Team',
        members: variables.providers,
      });
    }
    
    return sections;
  }
}

/**
 * Template Factory - creates appropriate processor based on output format
 */
class TemplateProcessorFactory {
  static createProcessor(outputFormat: 'html' | 'json' = 'html'): TemplateProcessor {
    switch (outputFormat) {
      case 'html':
        return new HTMLTemplateProcessor();
      case 'json':
        return new JSONTemplateProcessor();
      default:
        return new HTMLTemplateProcessor();
    }
  }
}

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
   * Process template using Template Method pattern
   */
  static async processTemplate(
    websiteData: Partial<ShopWebsite>, 
    templateId: string, 
    outputFormat: 'html' | 'json' = 'html'
  ): Promise<string> {
    const processor = TemplateProcessorFactory.createProcessor(outputFormat);
    return await processor.processTemplate(websiteData, templateId);
  }

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
      
      // Simulate API response
      const savedWebsite: ShopWebsite = {
        id: websiteData.id || `website_${Date.now()}`,
        shopId: websiteData.shopId || 'default_shop',
        ...websiteData,
        updatedAt: new Date().toISOString(),
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
        // Get alternative suggestions
        const suggestions = await this.suggestAlternativeSlugs(websiteData.subdomainSlug, 3);
        const suggestionText = suggestions.length > 0 
          ? ` Try: ${suggestions.join(', ')}` 
          : '';
        throw new Error(`This subdomain is already taken. Please choose a different one.${suggestionText}`);
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
        updatedAt: new Date().toISOString(),
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

      // For now, return mock data
      const mockTemplate: WebsiteTemplate = {
        id: templateId as any,
        name: 'Modern Template',
        description: 'A modern, responsive template',
        category: 'modern',
        previewImageUrl: `${this.config.cdnUrl}/templates/${templateId}/preview.jpg`,
        defaultColors: {
          primary: '#007AFF',
          secondary: '#5856D6',
        },
        features: {
          hasHeroSection: true,
          hasAboutSection: true,
          hasServicesGrid: true,
          hasTeamSection: true,
          hasPortfolioGallery: true,
          hasReviewsCarousel: true,
          hasContactSection: true,
          hasBookingCTA: true
        },
        mobileOptimized: true,
        tabletOptimized: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
          defaultColors: { primary: '#007AFF', secondary: '#5856D6' },
          features: {
            hasHeroSection: true,
            hasAboutSection: true,
            hasServicesGrid: true,
            hasTeamSection: true,
            hasPortfolioGallery: true,
            hasReviewsCarousel: true,
            hasContactSection: true,
            hasBookingCTA: true
          },
          mobileOptimized: true,
          tabletOptimized: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'classic' as any,
          name: 'Classic Elegance',
          description: 'Timeless design with elegant typography',
          category: 'classic',
          previewImageUrl: `${this.config.cdnUrl}/templates/classic/preview.jpg`,
          defaultColors: { primary: '#8B4513', secondary: '#D2691E' },
          features: {
            hasHeroSection: true,
            hasAboutSection: true,
            hasServicesGrid: true,
            hasTeamSection: false,
            hasPortfolioGallery: true,
            hasReviewsCarousel: true,
            hasContactSection: true,
            hasBookingCTA: true
          },
          mobileOptimized: true,
          tabletOptimized: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'creative' as any,
          name: 'Creative Design',
          description: 'Creative and artistic design for unique businesses',
          category: 'creative',
          previewImageUrl: `${this.config.cdnUrl}/templates/creative/preview.jpg`,
          defaultColors: { primary: '#000000', secondary: '#666666' },
          features: {
            hasHeroSection: true,
            hasAboutSection: true,
            hasServicesGrid: true,
            hasTeamSection: true,
            hasPortfolioGallery: true,
            hasReviewsCarousel: false,
            hasContactSection: true,
            hasBookingCTA: true
          },
          mobileOptimized: true,
          tabletOptimized: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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

      // Check against reserved slugs
      const reservedSlugs = ['api', 'admin', 'www', 'app', 'mobile', 'web', 'help', 'support', 'blog', 'shop', 'store', 'mail', 'email', 'ftp', 'cdn', 'assets', 'static', 'media', 'images', 'css', 'js', 'fonts'];
      if (reservedSlugs.includes(slug.toLowerCase())) {
        await cacheService.set(cacheKey, false, { ttl: 24 * 60 * 60 * 1000 }); // Cache for 24 hours
        return false;
      }

      // Check against existing websites (simulate database check)
      // In a real app, this would query the database for existing subdomains
      const existingSlugs = await this.getExistingSlugs();
      const available = !existingSlugs.includes(slug.toLowerCase());

      // Cache the result for 5 minutes (shorter cache for existing slugs as they can change)
      await cacheService.set(cacheKey, available, { ttl: 5 * 60 * 1000 });
      
      return available;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  }

  /**
   * Get existing slugs from storage/database
   */
  private static async getExistingSlugs(): Promise<string[]> {
    try {
      // In a real app, this would query the database
      // For now, simulate with some existing slugs
      const existingSlugs = ['demo', 'test', 'sample', 'example', 'myshop', 'barbershop', 'salon', 'spa'];
      
      // You could also check AsyncStorage for locally saved websites
      // const savedWebsites = await AsyncStorage.getItem('saved_websites');
      // if (savedWebsites) {
      //   const websites = JSON.parse(savedWebsites) as ShopWebsite[];
      //   existingSlugs.push(...websites.map(w => w.subdomainSlug).filter(Boolean));
      // }
      
      return existingSlugs;
    } catch (error) {
      console.error('Error getting existing slugs:', error);
      return [];
    }
  }

  /**
   * Suggest alternative slugs when the desired one is taken
   */
  static async suggestAlternativeSlugs(baseSlug: string, count: number = 3): Promise<string[]> {
    const suggestions: string[] = [];
    const cleanSlug = this.cleanSlug(baseSlug);
    
    // Try with numbers
    for (let i = 1; i <= count + 2; i++) {
      const suggestion = `${cleanSlug}${i}`;
      const available = await this.checkSlugAvailability(suggestion);
      if (available && suggestions.length < count) {
        suggestions.push(suggestion);
      }
    }
    
    // Try with common suffixes if we don't have enough suggestions
    if (suggestions.length < count) {
      const suffixes = ['shop', 'store', 'biz', 'co', 'online', 'pro'];
      for (const suffix of suffixes) {
        if (suggestions.length >= count) break;
        const suggestion = `${cleanSlug}${suffix}`;
        const available = await this.checkSlugAvailability(suggestion);
        if (available) {
          suggestions.push(suggestion);
        }
      }
    }
    
    return suggestions.slice(0, count);
  }

  /**
   * Clean and format slug
   */
  private static cleanSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20); // Limit length
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
        updatedAt: new Date().toISOString(),
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

/**
 * Template Processing Performance Monitor
 * Tracks and optimizes template processing performance
 */
class TemplatePerformanceMonitor {
  private static readonly PERFORMANCE_METRICS = new Map<string, {
    totalProcessingTime: number;
    processCount: number;
    averageTime: number;
    lastProcessed: number;
    cacheHitRate: number;
    errors: number;
  }>();
  
  private static readonly BOTTLENECK_THRESHOLD = 5000; // 5 seconds
  private static readonly SLOW_TEMPLATE_THRESHOLD = 2000; // 2 seconds
  
  /**
   * Record template processing metrics
   */
  static recordProcessing(templateId: string, processingTime: number, fromCache: boolean, error?: boolean): void {
    const existing = this.PERFORMANCE_METRICS.get(templateId) || {
      totalProcessingTime: 0,
      processCount: 0,
      averageTime: 0,
      lastProcessed: 0,
      cacheHitRate: 0,
      errors: 0
    };
    
    existing.totalProcessingTime += processingTime;
    existing.processCount += 1;
    existing.averageTime = existing.totalProcessingTime / existing.processCount;
    existing.lastProcessed = Date.now();
    existing.errors += error ? 1 : 0;
    
    // Calculate cache hit rate
    const cacheHits = fromCache ? 1 : 0;
    existing.cacheHitRate = ((existing.cacheHitRate * (existing.processCount - 1)) + cacheHits) / existing.processCount;
    
    this.PERFORMANCE_METRICS.set(templateId, existing);
    
    // Log performance warnings
    if (processingTime > this.SLOW_TEMPLATE_THRESHOLD) {
      console.warn(`Slow template processing detected: ${templateId} took ${processingTime.toFixed(2)}ms`);
    }
    
    if (existing.averageTime > this.BOTTLENECK_THRESHOLD) {
      console.error(`Performance bottleneck detected: ${templateId} average time ${existing.averageTime.toFixed(2)}ms`);
    }
  }
  
  /**
   * Get performance metrics for a template
   */
  static getMetrics(templateId: string) {
    return this.PERFORMANCE_METRICS.get(templateId);
  }
  
  /**
   * Get all performance metrics
   */
  static getAllMetrics() {
    const metrics = Array.from(this.PERFORMANCE_METRICS.entries()).map(([templateId, data]) => ({
      templateId,
      ...data,
      status: this.getPerformanceStatus(data.averageTime, data.cacheHitRate, data.errors / data.processCount)
    }));
    
    return metrics.sort((a, b) => b.averageTime - a.averageTime);
  }
  
  /**
   * Get performance status
   */
  private static getPerformanceStatus(averageTime: number, cacheHitRate: number, errorRate: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (errorRate > 0.1) return 'critical'; // More than 10% errors
    if (averageTime > this.BOTTLENECK_THRESHOLD) return 'critical';
    if (averageTime > this.SLOW_TEMPLATE_THRESHOLD) return 'warning';
    if (cacheHitRate < 0.5) return 'warning'; // Less than 50% cache hit rate
    if (averageTime < 500 && cacheHitRate > 0.8) return 'excellent';
    return 'good';
  }
  
  /**
   * Get optimization recommendations
   */
  static getOptimizationRecommendations(): {
    templateId: string;
    issue: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }[] {
    const recommendations: {
      templateId: string;
      issue: string;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
    }[] = [];
    
    for (const [templateId, metrics] of this.PERFORMANCE_METRICS.entries()) {
      const errorRate = metrics.errors / metrics.processCount;
      
      if (errorRate > 0.1) {
        recommendations.push({
          templateId,
          issue: `High error rate: ${(errorRate * 100).toFixed(1)}%`,
          recommendation: 'Review template validation and error handling',
          priority: 'high'
        });
      }
      
      if (metrics.averageTime > this.BOTTLENECK_THRESHOLD) {
        recommendations.push({
          templateId,
          issue: `Slow processing: ${metrics.averageTime.toFixed(0)}ms average`,
          recommendation: 'Optimize template complexity, add more caching, or break into smaller components',
          priority: 'high'
        });
      }
      
      if (metrics.cacheHitRate < 0.3) {
        recommendations.push({
          templateId,
          issue: `Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
          recommendation: 'Increase cache TTL or improve cache key generation',
          priority: 'medium'
        });
      }
      
      if (metrics.processCount > 100 && metrics.averageTime > 1000) {
        recommendations.push({
          templateId,
          issue: `Frequently used slow template: ${metrics.processCount} uses, ${metrics.averageTime.toFixed(0)}ms average`,
          recommendation: 'Consider pre-compiling or creating a faster variant',
          priority: 'medium'
        });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  /**
   * Clear performance metrics
   */
  static clearMetrics(): void {
    this.PERFORMANCE_METRICS.clear();
    console.log('Template performance metrics cleared');
  }
  
  /**
   * Get performance summary
   */
  static getPerformanceSummary() {
    const allMetrics = Array.from(this.PERFORMANCE_METRICS.values());
    
    if (allMetrics.length === 0) {
      return {
        totalTemplates: 0,
        totalProcesses: 0,
        averageProcessingTime: 0,
        overallCacheHitRate: 0,
        overallErrorRate: 0,
        slowTemplates: 0,
        criticalTemplates: 0
      };
    }
    
    const totalProcesses = allMetrics.reduce((sum, m) => sum + m.processCount, 0);
    const totalProcessingTime = allMetrics.reduce((sum, m) => sum + m.totalProcessingTime, 0);
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.errors, 0);
    const totalCacheHits = allMetrics.reduce((sum, m) => sum + (m.cacheHitRate * m.processCount), 0);
    
    const slowTemplates = allMetrics.filter(m => m.averageTime > this.SLOW_TEMPLATE_THRESHOLD).length;
    const criticalTemplates = allMetrics.filter(m => m.averageTime > this.BOTTLENECK_THRESHOLD).length;
    
    return {
      totalTemplates: allMetrics.length,
      totalProcesses,
      averageProcessingTime: totalProcessingTime / totalProcesses,
      overallCacheHitRate: totalCacheHits / totalProcesses,
      overallErrorRate: totalErrors / totalProcesses,
      slowTemplates,
      criticalTemplates
    };
  }
}

// Export the Template Processor classes for external use
export { TemplateProcessor, HTMLTemplateProcessor, JSONTemplateProcessor, TemplateProcessorFactory, TemplatePerformanceMonitor };