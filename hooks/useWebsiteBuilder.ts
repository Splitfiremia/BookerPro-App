import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { ShopWebsite, WebsiteTemplate, WEBSITE_TEMPLATES, DEFAULT_WEBSITE_CONFIG } from '@/models/shopWebsite';
import { WebsiteBuilderService } from '@/services/WebsiteBuilderService';
import { analyticsService } from '@/services/AnalyticsService';
import { useShopManagement } from '@/providers/ShopManagementProvider';
import {
  PerformanceMetrics,
  OptimizationSuggestion,
  ExportOptions,
  ExportResult,
} from '@/types/website';

export const useWebsiteBuilder = () => {
  const { selectedShop } = useShopManagement();
  
  const [websiteData, setWebsiteData] = useState<Partial<ShopWebsite>>({
    ...DEFAULT_WEBSITE_CONFIG,
    siteTitle: selectedShop?.name || '',
    businessBio: selectedShop?.description || '',
    subdomainSlug: selectedShop?.name?.toLowerCase().replace(/\\s+/g, '') || 'demo',
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>(WEBSITE_TEMPLATES[0]);
  const [availableTemplates, setAvailableTemplates] = useState<WebsiteTemplate[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [cacheStats, setCacheStats] = useState<{ templates: any; general: any } | null>(null);

  useEffect(() => {
    const loadWebsiteData = async () => {
      if (!selectedShop?.id) return;
      
      setIsLoading(true);
      try {
        console.log('Loading website data for shop:', selectedShop.id);
        
        // Load available templates
        const templates = await WebsiteBuilderService.getAllTemplates();
        setAvailableTemplates(templates);
        
        // Load existing website data (in real app, this would fetch from API)
        // For now, we'll use the default config
        
        // Load performance metrics and optimization suggestions
        const [metrics, suggestions] = await Promise.all([
          WebsiteBuilderService.analyzePerformance(websiteData),
          WebsiteBuilderService.getOptimizationSuggestions(websiteData),
        ]);
        
        setPerformanceMetrics(metrics);
        setOptimizationSuggestions(suggestions);
        
      } catch (error) {
        console.error('Error loading website data:', error);
        Alert.alert('Error', 'Failed to load website data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWebsiteData();
  }, [selectedShop?.id]);
  
  // Load cache stats periodically
  useEffect(() => {
    const loadCacheStats = async () => {
      try {
        const stats = await WebsiteBuilderService.getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.error('Error loading cache stats:', error);
      }
    };
    
    loadCacheStats();
    const interval = setInterval(loadCacheStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleDataChange = useCallback((field: keyof ShopWebsite, value: any) => {
    setWebsiteData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleTemplateChange = useCallback((template: WebsiteTemplate) => {
    if (!template?.id?.trim()) return;
    setSelectedTemplate(template);
    handleDataChange('templateId', template.id);
    handleDataChange('primaryColor', template.defaultColors.primary);
  }, [handleDataChange]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await WebsiteBuilderService.saveWebsite(websiteData);
      
      if (response.success && response.data) {
        setWebsiteData(response.data);
        setHasUnsavedChanges(false);
        Alert.alert('Success', 'Website saved successfully!');
        
        // Update performance metrics after save
        const metrics = await WebsiteBuilderService.analyzePerformance(response.data);
        setPerformanceMetrics(metrics);
      } else {
        throw new Error(response.error?.message || 'Failed to save website');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save website. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  }, [websiteData]);

  const handlePublish = useCallback(async () => {
    if (!websiteData.subdomainSlug) {
      Alert.alert('Error', 'Please enter a subdomain slug before publishing.');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await WebsiteBuilderService.publishWebsite(websiteData);
      
      if (response.success && response.data) {
        const { website, liveUrl } = response.data;
        setWebsiteData(website);
        setHasUnsavedChanges(false);
        
        // Update performance metrics after publish
        const metrics = await WebsiteBuilderService.analyzePerformance(website);
        setPerformanceMetrics(metrics);
        
        Alert.alert('Success', 'Website published successfully!', [
          {
            text: 'View Website',
            onPress: () => {
              console.log('Opening website:', liveUrl);
              // In a real app, this would open the URL
            }
          },
          { text: 'OK' }
        ]);
      } else {
        throw new Error(response.error?.message || 'Failed to publish website');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish website. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsPublishing(false);
    }
  }, [websiteData]);

  const copyWebsiteUrl = useCallback(() => {
    if (websiteData.subdomainSlug) {
      WebsiteBuilderService.copyWebsiteUrl(websiteData.subdomainSlug);
    }
  }, [websiteData.subdomainSlug]);

  // Export website
  const handleExport = useCallback(async (options: ExportOptions): Promise<ExportResult | null> => {
    setIsExporting(true);
    try {
      if (!websiteData.id) {
        throw new Error('Website must be saved before exporting');
      }
      
      const result = await WebsiteBuilderService.exportWebsite(websiteData.id, options);
      
      if (result.success) {
        Alert.alert('Success', 'Website exported successfully!', [
          {
            text: 'Download',
            onPress: () => {
              console.log('Downloading from:', result.downloadUrl);
              // In a real app, this would trigger the download
            }
          },
          { text: 'OK' }
        ]);
      } else {
        throw new Error(result.error || 'Export failed');
      }
      
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export website. Please try again.';
      Alert.alert('Error', message);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [websiteData.id]);
  
  // Refresh performance metrics
  const refreshPerformanceMetrics = useCallback(async () => {
    try {
      const metrics = await WebsiteBuilderService.analyzePerformance(websiteData);
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error refreshing performance metrics:', error);
    }
  }, [websiteData]);
  
  // Refresh optimization suggestions
  const refreshOptimizationSuggestions = useCallback(async () => {
    try {
      const suggestions = await WebsiteBuilderService.getOptimizationSuggestions(websiteData);
      setOptimizationSuggestions(suggestions);
    } catch (error) {
      console.error('Error refreshing optimization suggestions:', error);
    }
  }, [websiteData]);
  
  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    try {
      await WebsiteBuilderService.clearAllCaches();
      Alert.alert('Success', 'All caches cleared successfully!');
      
      // Refresh cache stats
      const stats = await WebsiteBuilderService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error clearing caches:', error);
      Alert.alert('Error', 'Failed to clear caches. Please try again.');
    }
  }, []);
  
  // Get website analytics
  const getWebsiteAnalytics = useCallback(async (period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
    try {
      if (!selectedShop?.id) return null;
      
      return await analyticsService.getWebsiteAnalytics(selectedShop.id, { period });
    } catch (error) {
      console.error('Error getting website analytics:', error);
      return null;
    }
  }, [selectedShop?.id]);
  
  // Memoized computed values
  const computedValues = useMemo(() => {
    const isWebsiteReady = !!(websiteData.siteTitle && websiteData.subdomainSlug && websiteData.templateId);
    const hasPerformanceIssues = performanceMetrics ? (
      performanceMetrics.loadTime > 3000 ||
      performanceMetrics.cumulativeLayoutShift > 0.1 ||
      performanceMetrics.firstInputDelay > 100
    ) : false;
    
    return {
      isWebsiteReady,
      hasPerformanceIssues,
      canPublish: isWebsiteReady && !hasUnsavedChanges,
      canExport: isWebsiteReady && websiteData.id,
    };
  }, [websiteData, performanceMetrics, hasUnsavedChanges]);

  return {
    // Data
    websiteData,
    selectedTemplate,
    availableTemplates,
    performanceMetrics,
    optimizationSuggestions,
    cacheStats,
    
    // State
    hasUnsavedChanges,
    isPublishing,
    isLoading,
    isSaving,
    isExporting,
    
    // Computed values
    ...computedValues,
    
    // Actions
    handleDataChange,
    handleTemplateChange,
    handleSave,
    handlePublish,
    handleExport,
    copyWebsiteUrl,
    refreshPerformanceMetrics,
    refreshOptimizationSuggestions,
    clearAllCaches,
    getWebsiteAnalytics,
  };
};