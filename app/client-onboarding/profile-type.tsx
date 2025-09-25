import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, User, Scissors, Store } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES, BORDER_RADIUS } from '@/constants/theme';

export default function ProfileTypeScreen() {
  const handleProfileSelection = (type: 'client' | 'provider' | 'owner') => {
    if (type === 'client') {
      router.push('/client-onboarding/welcome' as any);
    } else if (type === 'provider') {
      router.push('/provider-onboarding');
    } else {
      router.push('/shop-owner-onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.logo}>theCut</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>SIGN UP</Text>
        </View>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.tabText}>LOG IN</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>SELECT PROFILE TYPE</Text>
        
        {/* Client Option */}
        <TouchableOpacity 
          style={[styles.profileOption, styles.clientOption]}
          onPress={() => handleProfileSelection('client')}
        >
          <View style={styles.iconContainer}>
            <User size={32} color="#000000" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>CLIENT</Text>
            <Text style={styles.optionDescription}>Search providers and book appointments</Text>
          </View>
        </TouchableOpacity>

        {/* Provider Option */}
        <TouchableOpacity 
          style={[styles.profileOption, styles.providerOption]}
          onPress={() => handleProfileSelection('provider')}
        >
          <View style={styles.iconContainer}>
            <Scissors size={32} color="#FFFFFF" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>PROVIDER</Text>
            <Text style={styles.optionDescription}>Manage your business and clients</Text>
          </View>
        </TouchableOpacity>

        {/* Shop Owner Option */}
        <TouchableOpacity 
          style={[styles.profileOption, styles.ownerOption]}
          onPress={() => handleProfileSelection('owner')}
        >
          <View style={styles.iconContainer}>
            <Store size={32} color="#FFFFFF" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>SHOP OWNER</Text>
            <Text style={styles.optionDescription}>Manage your shops and providers</Text>
          </View>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => handleProfileSelection('client')}
        >
          <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  backButton: {
    ...GLASS_STYLES.card,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '300' as const,
    fontStyle: 'italic',
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
    marginRight: 48,
    fontFamily: FONTS.display,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
    ...GLASS_STYLES.card,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
    color: COLORS.lightGray,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  activeTabText: {
    color: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  profileOption: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  clientOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  providerOption: {
    borderColor: COLORS.border,
  },
  ownerOption: {
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
    fontFamily: FONTS.bold,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  createButton: {
    ...GLASS_STYLES.button.primary,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xxl,
  },
  createButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
});