import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ShopWebsite } from '@/models/shopWebsite';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';
import { WebsiteBuilderService } from '@/services/WebsiteBuilderService';

interface WebsiteSettingsFormProps {
  websiteData: Partial<ShopWebsite>;
  onDataChange: (field: keyof ShopWebsite, value: any) => void;
}

export const WebsiteSettingsForm: React.FC<WebsiteSettingsFormProps> = React.memo(({
  websiteData,
  onDataChange,
}) => {
  const handleSlugChange = (value: string) => {
    const sanitized = WebsiteBuilderService.sanitizeSlug(value);
    onDataChange('subdomainSlug', sanitized);
  };

  return (
    <View style={styles.formSection}>
      <Text style={styles.formSectionTitle}>Site Settings</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Site Title</Text>
        <TextInput
          style={styles.formInput}
          value={websiteData.siteTitle || ''}
          onChangeText={(value) => onDataChange('siteTitle', value)}
          placeholder="Enter your site title"
          placeholderTextColor={COLORS.secondary}
          maxLength={100}
          testID="site-title-input"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Subdomain</Text>
        <View style={styles.subdomainContainer}>
          <Text style={styles.subdomainPrefix}>bookerpro.com/</Text>
          <TextInput
            style={styles.subdomainInput}
            value={websiteData.subdomainSlug || ''}
            onChangeText={handleSlugChange}
            placeholder="yourshop"
            placeholderTextColor={COLORS.secondary}
            maxLength={50}
            testID="subdomain-input"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Tagline</Text>
        <TextInput
          style={styles.formInput}
          value={websiteData.tagline || ''}
          onChangeText={(value) => onDataChange('tagline', value)}
          placeholder="A short catchphrase for your business"
          placeholderTextColor={COLORS.secondary}
          maxLength={150}
          testID="tagline-input"
        />
      </View>
    </View>
  );
});

WebsiteSettingsForm.displayName = 'WebsiteSettingsForm';

const styles = StyleSheet.create({
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
});