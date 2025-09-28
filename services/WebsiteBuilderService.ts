import { Alert } from 'react-native';
import { ShopWebsite, WebsiteTemplate } from '@/models/shopWebsite';

export class WebsiteBuilderService {
  static async saveWebsite(websiteData: Partial<ShopWebsite>): Promise<void> {
    try {
      console.log('Saving website data:', websiteData);
      // API call would go here
      // await api.updateWebsite(websiteData);
    } catch (error) {
      console.error('Error saving website:', error);
      throw new Error('Failed to save website. Please try again.');
    }
  }

  static async publishWebsite(websiteData: Partial<ShopWebsite>): Promise<void> {
    if (!websiteData.subdomainSlug) {
      throw new Error('Please enter a subdomain slug before publishing.');
    }

    try {
      console.log('Publishing website:', websiteData);
      // API call would go here
      // await api.publishWebsite(websiteData);
    } catch (error) {
      console.error('Error publishing website:', error);
      throw new Error('Failed to publish website. Please try again.');
    }
  }

  static generateWebsiteUrl(slug: string): string {
    return `https://bookerpro.com/${slug}`;
  }

  static copyWebsiteUrl(slug: string): void {
    const url = this.generateWebsiteUrl(slug);
    console.log('Copying URL:', url);
    Alert.alert('Copied!', `Website URL copied: ${url}`);
  }

  static validateSlug(slug: string): boolean {
    const pattern = /^[a-z0-9-]+$/;
    return pattern.test(slug) && slug.length >= 3 && slug.length <= 50;
  }

  static sanitizeSlug(input: string): string {
    return input.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}