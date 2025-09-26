import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Scissors, Store } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES, BORDER_RADIUS } from '@/constants/theme';

export default function ProfileTypeScreen() {
  const [selectedType, setSelectedType] = useState<'client' | 'provider' | 'owner' | null>(null);
  const [hoveredType, setHoveredType] = useState<'client' | 'provider' | 'owner' | null>(null);

  const handleProfileSelection = (type: 'client' | 'provider' | 'owner') => {
    console.log('ProfileTypeScreen: select', type);
    setSelectedType(type);
    
    // Add a small delay to show the selection effect
    setTimeout(() => {
      if (type === 'client') {
        router.push('/client-onboarding/welcome' as any);
      } else if (type === 'provider') {
        router.push('/provider-onboarding');
      } else {
        router.push('/shop-owner-onboarding');
      }
    }, 150);
  };

  return (
    <View style={styles.root} testID="client-onboarding-profile-type-root">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>


            <View style={styles.tabContainer}>
              <View style={[styles.tab, styles.activeTab]}>
                <Text style={[styles.tabText, styles.activeTabText]}>SIGN UP</Text>
              </View>
              <TouchableOpacity 
                style={styles.tab}
                onPress={() => router.replace('/(auth)/login')}
                testID="profile-type-login-tab"
              >
                <Text style={styles.tabText}>LOG IN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>SELECT PROFILE TYPE</Text>

              <Pressable 
                style={({ pressed }) => [
                  styles.profileOption,
                  selectedType === 'client' && styles.selectedOption,
                  hoveredType === 'client' && styles.hoveredOption,
                  pressed && styles.pressedOption
                ]}
                onPress={() => handleProfileSelection('client')}
                onHoverIn={() => setHoveredType('client')}
                onHoverOut={() => setHoveredType(null)}
                testID="profile-type-client"
              >
                <View style={[
                  styles.iconContainer,
                  selectedType === 'client' && styles.selectedIconContainer,
                  hoveredType === 'client' && styles.hoveredIconContainer
                ]}>
                  <User 
                    size={32} 
                    color={selectedType === 'client' || hoveredType === 'client' ? "#000000" : "#FFFFFF"} 
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    selectedType === 'client' && styles.selectedOptionTitle,
                    hoveredType === 'client' && styles.hoveredOptionTitle
                  ]}>CLIENT</Text>
                  <Text style={[
                    styles.optionDescription,
                    selectedType === 'client' && styles.selectedOptionDescription,
                    hoveredType === 'client' && styles.hoveredOptionDescription
                  ]}>Search providers and book appointments</Text>
                </View>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [
                  styles.profileOption,
                  selectedType === 'provider' && styles.selectedOption,
                  hoveredType === 'provider' && styles.hoveredOption,
                  pressed && styles.pressedOption
                ]}
                onPress={() => handleProfileSelection('provider')}
                onHoverIn={() => setHoveredType('provider')}
                onHoverOut={() => setHoveredType(null)}
                testID="profile-type-provider"
              >
                <View style={[
                  styles.iconContainer,
                  selectedType === 'provider' && styles.selectedIconContainer,
                  hoveredType === 'provider' && styles.hoveredIconContainer
                ]}>
                  <Scissors 
                    size={32} 
                    color={selectedType === 'provider' || hoveredType === 'provider' ? "#000000" : "#FFFFFF"} 
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    selectedType === 'provider' && styles.selectedOptionTitle,
                    hoveredType === 'provider' && styles.hoveredOptionTitle
                  ]}>PROVIDER</Text>
                  <Text style={[
                    styles.optionDescription,
                    selectedType === 'provider' && styles.selectedOptionDescription,
                    hoveredType === 'provider' && styles.hoveredOptionDescription
                  ]}>Manage your business and clients</Text>
                </View>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [
                  styles.profileOption,
                  selectedType === 'owner' && styles.selectedOption,
                  hoveredType === 'owner' && styles.hoveredOption,
                  pressed && styles.pressedOption
                ]}
                onPress={() => handleProfileSelection('owner')}
                onHoverIn={() => setHoveredType('owner')}
                onHoverOut={() => setHoveredType(null)}
                testID="profile-type-owner"
              >
                <View style={[
                  styles.iconContainer,
                  selectedType === 'owner' && styles.selectedIconContainer,
                  hoveredType === 'owner' && styles.hoveredIconContainer
                ]}>
                  <Store 
                    size={32} 
                    color={selectedType === 'owner' || hoveredType === 'owner' ? "#000000" : "#FFFFFF"} 
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    selectedType === 'owner' && styles.selectedOptionTitle,
                    hoveredType === 'owner' && styles.hoveredOptionTitle
                  ]}>SHOP OWNER</Text>
                  <Text style={[
                    styles.optionDescription,
                    selectedType === 'owner' && styles.selectedOptionDescription,
                    hoveredType === 'owner' && styles.hoveredOptionDescription
                  ]}>Manage your shops and providers</Text>
                </View>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [
                  styles.createButton,
                  pressed && styles.pressedCreateButton
                ]}
                onPress={() => selectedType ? handleProfileSelection(selectedType) : handleProfileSelection('client')}
                testID="profile-type-create-account"
              >
                <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  container: {
    flex: 1,
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
    borderColor: COLORS.border,
    backgroundColor: COLORS.glass.background,
    transform: [{ scale: 1 }],
  },
  hoveredOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    transform: [{ scale: 1.02 }],
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    transform: [{ scale: 1.05 }],
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  pressedOption: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hoveredIconContainer: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
  selectedIconContainer: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    transform: [{ scale: 1.15 }],
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
  hoveredOptionTitle: {
    color: COLORS.primary,
  },
  selectedOptionTitle: {
    color: COLORS.background,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  hoveredOptionDescription: {
    color: COLORS.text,
  },
  selectedOptionDescription: {
    color: COLORS.background + 'CC',
  },
  createButton: {
    ...GLASS_STYLES.button.primary,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xxl,
    transform: [{ scale: 1 }],
  },
  pressedCreateButton: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  createButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
});