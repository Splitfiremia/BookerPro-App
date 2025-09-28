import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { ShopWebsite, WebsiteTemplate, WEBSITE_TEMPLATES, DEFAULT_WEBSITE_CONFIG } from '@/models/shopWebsite';
import { WebsiteBuilderService } from '@/services/WebsiteBuilderService';
import { useShopManagement } from '@/providers/ShopManagementProvider';

export const useWebsiteBuilder = () => {
  const { selectedShop } = useShopManagement();
  
  const [websiteData, setWebsiteData] = useState<Partial<ShopWebsite>>({
    ...DEFAULT_WEBSITE_CONFIG,
    siteTitle: selectedShop?.name || '',
    businessBio: selectedShop?.description || '',
    subdomainSlug: selectedShop?.name?.toLowerCase().replace(/\\s+/g, '') || 'demo',
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>(WEBSITE_TEMPLATES[0]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    // Load existing website data if available
    console.log('Loading website data for shop:', selectedShop?.id);
  }, [selectedShop]);

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
    try {
      await WebsiteBuilderService.saveWebsite(websiteData);
      setHasUnsavedChanges(false);
      Alert.alert('Success', 'Website saved successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save website. Please try again.';
      Alert.alert('Error', message);
    }
  }, [websiteData]);

  const handlePublish = useCallback(async () => {
    if (!websiteData.subdomainSlug) {
      Alert.alert('Error', 'Please enter a subdomain slug before publishing.');
      return;
    }

    setIsPublishing(true);
    try {
      await WebsiteBuilderService.publishWebsite(websiteData);
      handleDataChange('isPublished', true);
      handleDataChange('publishedAt', new Date().toISOString());
      setHasUnsavedChanges(false);
      
      Alert.alert('Success', 'Website published successfully!', [
        {
          text: 'View Website',
          onPress: () => {
            const url = WebsiteBuilderService.generateWebsiteUrl(websiteData.subdomainSlug!);
            console.log('Opening website:', url);
          }
        },
        { text: 'OK' }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish website. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsPublishing(false);
    }
  }, [websiteData, handleDataChange]);

  const copyWebsiteUrl = useCallback(() => {
    if (websiteData.subdomainSlug) {
      WebsiteBuilderService.copyWebsiteUrl(websiteData.subdomainSlug);
    }
  }, [websiteData.subdomainSlug]);

  return {
    websiteData,
    selectedTemplate,
    hasUnsavedChanges,
    isPublishing,
    handleDataChange,
    handleTemplateChange,
    handleSave,
    handlePublish,
    copyWebsiteUrl,
  };
};