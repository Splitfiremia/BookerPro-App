import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Eye,
  Save,
  Upload,
  Palette,
  Type,
  Settings,
  ExternalLink,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';
import { ShopWebsite, WebsiteTemplate, WEBSITE_TEMPLATES, DEFAULT_WEBSITE_CONFIG } from '@/models/shopWebsite';
import { useShopManagement } from '@/providers/ShopManagementProvider';



interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange }) => {
  const predefinedColors = [
    '#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706',
    '#0891b2', '#be185d', '#4338ca', '#9333ea', '#ea580c',
    '#0d9488', '#1f2937', '#374151', '#6b7280', '#000000'
  ];

  return (
    <View style={styles.colorPicker}>
      <View style={styles.colorGrid}>
        {predefinedColors.map((presetColor) => {
          if (!presetColor?.trim()) return null;
          return (
            <TouchableOpacity
              key={presetColor}
              style={[
                styles.colorSwatch,
                { backgroundColor: presetColor },
                color === presetColor && styles.selectedColorSwatch,
              ]}
              onPress={() => onColorChange(presetColor)}
            />
          );
        })}
      </View>
      <TextInput
        style={styles.colorInput}
        value={color}
        onChangeText={onColorChange}
        placeholder="#000000"
        placeholderTextColor={COLORS.secondary}
      />
    </View>
  );
};

interface WebsitePreviewProps {
  websiteData: Partial<ShopWebsite>;
  template: WebsiteTemplate;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({ websiteData, template }) => {
  const mockShopName = "Demo Barbershop";
  const mockServices = [
    { name: "Classic Cut", price: "$25", duration: "30 min" },
    { name: "Beard Trim", price: "$15", duration: "15 min" },
    { name: "Hot Shave", price: "$35", duration: "45 min" },
  ];

  return (
    <View style={[styles.previewContainer, { backgroundColor: '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.previewHeader, { backgroundColor: websiteData.primaryColor || template.defaultColors.primary }]}>
        <Text style={styles.previewHeaderText}>
          {websiteData.siteTitle || mockShopName}
        </Text>
      </View>

      {/* Hero Section */}
      <View style={styles.previewHero}>
        <View style={[styles.previewHeroImage, { backgroundColor: '#f3f4f6' }]}>
          <Text style={styles.previewImagePlaceholder}>Hero Image</Text>
        </View>
        <Text style={styles.previewHeroTitle}>
          {websiteData.tagline || "Professional Barbering Services"}
        </Text>
        <Text style={styles.previewHeroSubtitle}>
          {websiteData.businessBio || "Experience the finest cuts and grooming services in town"}
        </Text>
        <View style={[styles.previewBookButton, { backgroundColor: websiteData.primaryColor || template.defaultColors.primary }]}>
          <Text style={styles.previewBookButtonText}>Book Now</Text>
        </View>
      </View>

      {/* Services Section */}
      {template.features.hasServicesGrid && (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>Our Services</Text>
          {mockServices.map((service) => (
            <View key={service.name} style={styles.previewServiceItem}>
              <View>
                <Text style={styles.previewServiceName}>{service.name}</Text>
                <Text style={styles.previewServiceDuration}>{service.duration}</Text>
              </View>
              <Text style={[styles.previewServicePrice, { color: websiteData.primaryColor || template.defaultColors.primary }]}>
                {service.price}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* About Section */}
      {template.features.hasAboutSection && (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>About Us</Text>
          <Text style={styles.previewSectionText}>
            {websiteData.businessBio || "We are passionate about providing exceptional barbering services with attention to detail and customer satisfaction."}
          </Text>
        </View>
      )}

      {/* Contact Section */}
      {template.features.hasContactSection && (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>Contact</Text>
          <Text style={styles.previewSectionText}>
            📍 123 Main Street, City, State{'\n'}
            📞 (555) 123-4567{'\n'}
            ✉️ info@demobarbershop.com
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={[styles.previewFooter, { backgroundColor: websiteData.primaryColor || template.defaultColors.primary }]}>
        <Text style={styles.previewFooterText}>
          © 2024 {websiteData.siteTitle || mockShopName}
        </Text>
      </View>
    </View>
  );
};

export default function WebsiteBuilderScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { selectedShop } = useShopManagement();
  
  const PREVIEW_WIDTH = screenWidth > 768 ? 400 : screenWidth - 32;
  
  const [websiteData, setWebsiteData] = useState<Partial<ShopWebsite>>({
    ...DEFAULT_WEBSITE_CONFIG,
    siteTitle: selectedShop?.name || '',
    businessBio: selectedShop?.description || '',
    subdomainSlug: selectedShop?.name?.toLowerCase().replace(/\s+/g, '') || 'demo',
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>(WEBSITE_TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState<'settings' | 'content' | 'design' | 'preview'>('settings');
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load existing website data if available
    // This would typically fetch from an API
    console.log('Loading website data for shop:', selectedShop?.id);
  }, [selectedShop]);

  const handleDataChange = (field: keyof ShopWebsite, value: any) => {
    setWebsiteData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleTemplateChange = (template: WebsiteTemplate) => {
    if (!template?.id?.trim()) return;
    setSelectedTemplate(template);
    handleDataChange('templateId', template.id);
    handleDataChange('primaryColor', template.defaultColors.primary);
  };

  const handleSave = async () => {
    try {
      console.log('Saving website data:', websiteData);
      // API call would go here
      setHasUnsavedChanges(false);
      Alert.alert('Success', 'Website saved successfully!');
    } catch (error) {
      console.error('Error saving website:', error);
      Alert.alert('Error', 'Failed to save website. Please try again.');
    }
  };

  const handlePublish = async () => {
    if (!websiteData.subdomainSlug) {
      Alert.alert('Error', 'Please enter a subdomain slug before publishing.');
      return;
    }

    setIsPublishing(true);
    try {
      console.log('Publishing website:', websiteData);
      // API call would go here
      handleDataChange('isPublished', true);
      handleDataChange('publishedAt', new Date().toISOString());
      setHasUnsavedChanges(false);
      Alert.alert('Success', 'Website published successfully!', [
        {
          text: 'View Website',
          onPress: () => {
            const url = `https://bookerpro.com/${websiteData.subdomainSlug}`;
            console.log('Opening website:', url);
            // Would open in browser
          }
        },
        { text: 'OK' }
      ]);
    } catch (error) {
      console.error('Error publishing website:', error);
      Alert.alert('Error', 'Failed to publish website. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyWebsiteUrl = () => {
    const url = `https://bookerpro.com/${websiteData.subdomainSlug}`;
    // In a real app, this would copy to clipboard
    console.log('Copying URL:', url);
    Alert.alert('Copied!', `Website URL copied: ${url}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Site Settings</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Site Title</Text>
                <TextInput
                  style={styles.formInput}
                  value={websiteData.siteTitle || ''}
                  onChangeText={(value) => handleDataChange('siteTitle', value)}
                  placeholder="Enter your site title"
                  placeholderTextColor={COLORS.secondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Subdomain</Text>
                <View style={styles.subdomainContainer}>
                  <Text style={styles.subdomainPrefix}>bookerpro.com/</Text>
                  <TextInput
                    style={styles.subdomainInput}
                    value={websiteData.subdomainSlug || ''}
                    onChangeText={(value) => handleDataChange('subdomainSlug', value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    placeholder="yourshop"
                    placeholderTextColor={COLORS.secondary}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tagline</Text>
                <TextInput
                  style={styles.formInput}
                  value={websiteData.tagline || ''}
                  onChangeText={(value) => handleDataChange('tagline', value)}
                  placeholder="A short catchphrase for your business"
                  placeholderTextColor={COLORS.secondary}
                />
              </View>
            </View>
          </ScrollView>
        );

      case 'content':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Content</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Business Bio</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={websiteData.businessBio || ''}
                  onChangeText={(value) => handleDataChange('businessBio', value)}
                  placeholder="Tell visitors about your business..."
                  placeholderTextColor={COLORS.secondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hero Image</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <Upload size={20} color={COLORS.primary} />
                  <Text style={styles.uploadButtonText}>Upload Image</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Social Media</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Instagram</Text>
                  <TextInput
                    style={styles.formInput}
                    value={websiteData.socialLinks?.instagram || ''}
                    onChangeText={(value) => handleDataChange('socialLinks', { ...websiteData.socialLinks, instagram: value })}
                    placeholder="https://instagram.com/yourshop"
                    placeholderTextColor={COLORS.secondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Facebook</Text>
                  <TextInput
                    style={styles.formInput}
                    value={websiteData.socialLinks?.facebook || ''}
                    onChangeText={(value) => handleDataChange('socialLinks', { ...websiteData.socialLinks, facebook: value })}
                    placeholder="https://facebook.com/yourshop"
                    placeholderTextColor={COLORS.secondary}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case 'design':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Template</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
                {WEBSITE_TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateCard,
                      selectedTemplate.id === template.id && styles.selectedTemplateCard,
                    ]}
                    onPress={() => handleTemplateChange(template)}
                  >
                    <View style={[styles.templatePreview, { backgroundColor: template.defaultColors.primary }]} />
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>{template.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Colors</Text>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Primary Color</Text>
                <ColorPicker
                  color={websiteData.primaryColor || selectedTemplate.defaultColors.primary}
                  onColorChange={(color) => handleDataChange('primaryColor', color)}
                />
              </View>
            </View>
          </ScrollView>
        );

      case 'preview':
        return (
          <ScrollView style={styles.tabContent}>
            <WebsitePreview websiteData={websiteData} template={selectedTemplate} />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Website Builder</Text>
        <View style={styles.headerActions}>
          {websiteData.isPublished && (
            <TouchableOpacity style={styles.headerButton} onPress={copyWebsiteUrl}>
              <ExternalLink size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.headerButton, hasUnsavedChanges && styles.hasChangesButton]}
            onPress={handleSave}
          >
            <Save size={20} color={hasUnsavedChanges ? '#fff' : COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'settings', label: 'Settings', icon: Settings },
          { key: 'content', label: 'Content', icon: Type },
          { key: 'design', label: 'Design', icon: Palette },
          { key: 'preview', label: 'Preview', icon: Eye },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <tab.icon size={18} color={activeTab === tab.key ? COLORS.primary : COLORS.secondary} />
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.activeTabButtonText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Publish Button */}
      <View style={styles.publishContainer}>
        <TouchableOpacity
          style={[
            styles.publishButton,
            websiteData.isPublished && styles.publishedButton,
            isPublishing && styles.publishingButton,
          ]}
          onPress={handlePublish}
          disabled={isPublishing}
        >
          {websiteData.isPublished ? (
            <CheckCircle size={20} color="#fff" />
          ) : (
            <ExternalLink size={20} color="#fff" />
          )}
          <Text style={styles.publishButtonText}>
            {isPublishing ? 'Publishing...' : websiteData.isPublished ? 'Published' : 'Publish Website'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    ...GLASS_STYLES.button,
    padding: 8,
  },
  hasChangesButton: {
    backgroundColor: COLORS.primary,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  activeTabButtonText: {
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: FONTS.bold,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  formInput: {
    ...GLASS_STYLES.input,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  subdomainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.input,
    paddingHorizontal: 0,
  },
  subdomainPrefix: {
    fontSize: 16,
    color: COLORS.secondary,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
  },
  subdomainInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: FONTS.regular,
  },
  uploadButton: {
    ...GLASS_STYLES.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500' as const,
    fontFamily: FONTS.regular,
  },
  templateScroll: {
    marginBottom: 16,
  },
  templateCard: {
    width: 120,
    marginRight: 12,
    ...GLASS_STYLES.card,
    padding: 12,
  },
  selectedTemplateCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  templatePreview: {
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  templateDescription: {
    fontSize: 12,
    color: COLORS.secondary,
    lineHeight: 16,
    fontFamily: FONTS.regular,
  },
  colorPicker: {
    gap: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorSwatch: {
    borderColor: COLORS.text,
  },
  colorInput: {
    ...GLASS_STYLES.input,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  previewContainer: {
    alignSelf: 'center',
    overflow: 'hidden',
    ...GLASS_STYLES.card,
  },
  previewHeader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  previewHeaderText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  previewHero: {
    padding: 20,
    alignItems: 'center',
  },
  previewHeroImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  previewImagePlaceholder: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.regular,
  },
  previewHeroTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  previewHeroSubtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: FONTS.regular,
  },
  previewBookButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  previewBookButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  previewSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  previewSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  previewSectionText: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  previewServiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewServiceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  previewServiceDuration: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  previewServicePrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    fontFamily: FONTS.bold,
  },
  previewFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  previewFooterText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: FONTS.regular,
  },
  publishContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  publishButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  publishedButton: {
    backgroundColor: '#059669',
  },
  publishingButton: {
    backgroundColor: COLORS.secondary,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    fontFamily: FONTS.bold,
  },
});