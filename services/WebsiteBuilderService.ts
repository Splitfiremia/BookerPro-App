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
 * Defines the skeleton of template processing algorithm
 */
abstract class TemplateProcessor {
  /**
   * Template Method - defines the algorithm structure
   */
  public async processTemplate(websiteData: Partial<ShopWebsite>, templateId: string): Promise<string> {
    try {
      console.log(`Processing template ${templateId} with Template Method pattern`);
      
      // Step 1: Load template
      const template = await this.loadTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }
      
      // Step 2: Validate data
      await this.validateTemplateData(websiteData, template);
      
      // Step 3: Prepare template variables
      const templateVars = await this.prepareTemplateVariables(websiteData, template);
      
      // Step 4: Process template content (abstract method)
      const processedContent = await this.processTemplateContent(template, templateVars);
      
      // Step 5: Apply optimizations
      const optimizedContent = await this.optimizeContent(processedContent, websiteData);
      
      // Step 6: Post-process (hook for subclasses)
      return await this.postProcess(optimizedContent, websiteData, template);
      
    } catch (error) {
      console.error('Template processing failed:', error);
      throw error;
    }
  }
  
  /**
   * Load template - can be overridden by subclasses
   */
  protected async loadTemplate(templateId: string): Promise<WebsiteTemplate | null> {
    return await WebsiteBuilderService.getTemplate(templateId);
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
   * Prepare template variables - can be overridden by subclasses
   */
  protected async prepareTemplateVariables(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<Record<string, any>> {
    return {
      ...websiteData,
      templateId: template.id,
      processedAt: new Date().toISOString(),
    };
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

// Export the Template Processor classes for external use
export { TemplateProcessor, HTMLTemplateProcessor, JSONTemplateProcessor, TemplateProcessorFactory };