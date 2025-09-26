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
import { Store, Building, Car, Home, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES, BORDER_RADIUS } from '@/constants/theme';

type WorkType = 'shop-owner' | 'shop-employee' | 'mobile' | 'home-studio';

export default function HowDoYouWorkScreen() {
  const [selectedWork, setSelectedWork] = useState<WorkType | null>(null);

  const handleWorkSelection = (type: WorkType) => {
    console.log('HowDoYouWorkScreen: select', type);
    setSelectedWork(type);
  };

  const handleContinue = () => {
    if (selectedWork) {
      router.push('/client-onboarding/search' as any);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const workOptions = [
    {
      id: 'shop-owner' as WorkType,
      icon: Store,
      title: 'I have my own shop / studio',
      description: 'You own or rent a commercial space for your services',
    },
    {
      id: 'shop-employee' as WorkType,
      icon: Building,
      title: 'I work at a shop',
      description: 'You work at an established business owned by someone else',
    },
    {
      id: 'mobile' as WorkType,
      icon: Car,
      title: 'I am mobile / I travel to clients',
      description: 'You travel to provide services at clients\' locations',
    },
    {
      id: 'home-studio' as WorkType,
      icon: Home,
      title: 'I work from a home studio',
      description: 'You provide services from your home or private space',
    },
  ];

  return (
    <View style={styles.root} testID="client-onboarding-how-work-root">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={handleBack}
                  testID="how-work-back"
                >
                  <ChevronLeft size={24} color={COLORS.text} />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.titleContainer}>
                <View style={styles.getStartedBadge}>
                  <Text style={styles.getStartedText}>GET STARTED</Text>
                </View>
                <Text style={styles.title}>How do you work?</Text>
                <Text style={styles.subtitle}>This helps us set up your profile correctly.</Text>
              </View>

              <View style={styles.optionsContainer}>
                {workOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedWork === option.id;
                  
                  return (
                    <Pressable
                      key={option.id}
                      style={({ pressed }) => [
                        styles.workOption,
                        isSelected && styles.selectedWorkOption,
                        pressed && styles.pressedWorkOption
                      ]}
                      onPress={() => handleWorkSelection(option.id)}
                      testID={`work-option-${option.id}`}
                    >
                      <View style={[
                        styles.iconContainer,
                        isSelected && styles.selectedIconContainer
                      ]}>
                        <IconComponent 
                          size={28} 
                          color={isSelected ? COLORS.background : COLORS.primary} 
                        />
                      </View>
                      <View style={styles.optionContent}>
                        <Text style={[
                          styles.optionTitle,
                          isSelected && styles.selectedOptionTitle
                        ]}>
                          {option.title}
                        </Text>
                        <Text style={[
                          styles.optionDescription,
                          isSelected && styles.selectedOptionDescription
                        ]}>
                          {option.description}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <TouchableOpacity 
                style={[
                  styles.continueButton,
                  !selectedWork && styles.disabledButton
                ]}
                onPress={handleContinue}
                disabled={!selectedWork}
                testID="how-work-continue"
              >
                <Text style={[
                  styles.continueButtonText,
                  !selectedWork && styles.disabledButtonText
                ]}>CONTINUE</Text>
              </TouchableOpacity>
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  getStartedBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.lg,
  },
  getStartedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  optionsContainer: {
    flex: 1,
    gap: SPACING.md,
  },
  workOption: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.glass.background,
  },
  selectedWorkOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pressedWorkOption: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.secondary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
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
  selectedOptionDescription: {
    color: COLORS.background + 'CC',
  },
  continueButton: {
    ...GLASS_STYLES.button.primary,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
  },
  disabledButton: {
    backgroundColor: COLORS.glass.background,
    borderColor: COLORS.border,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  disabledButtonText: {
    color: COLORS.lightGray,
  },
});