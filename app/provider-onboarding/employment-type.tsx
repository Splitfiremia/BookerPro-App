import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { User, Store } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function EmploymentTypeScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    nextStep,
    previousStep 
  } = useProviderOnboarding();
  
  const [selected, setSelected] = useState<'shop' | 'independent' | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const optionsSlideAnim = useRef(new Animated.Value(50)).current;
  const navigationSlideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Staggered animation sequence
    const animations = Animated.stagger(120, [
      // Header animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Content animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      // Options animation
      Animated.timing(optionsSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // Navigation animation
      Animated.timing(navigationSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);
    
    animations.start();
    
    return () => {
      animations.stop();
    };
  }, [fadeAnim, slideAnim, headerSlideAnim, optionsSlideAnim, navigationSlideAnim]);

  const handleSelect = (type: 'shop' | 'independent') => {
    setSelected(type);
  };

  const handleContinue = () => {
    if (selected) {
      nextStep();
      router.replace('/provider-onboarding/provider-type');
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: headerSlideAnim }]
          }
        ]}>
          <Text style={styles.title}>GET STARTED</Text>

        </Animated.View>

        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={styles.question}>Do you work for a shop?</Text>
          <Text style={styles.description}>
            Let us know if you're employed by a shop or work independently.
          </Text>

          <Animated.View style={[
            styles.optionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: optionsSlideAnim }]
            }
          ]}>
            <Animated.View
              style={[
                styles.animatedOptionContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: Animated.add(
                        optionsSlideAnim,
                        new Animated.Value(0)
                      )
                    }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  styles.shopOption,
                  selected === 'shop' && styles.selectedCard
                ]}
                onPress={() => handleSelect('shop')}
                testID="employment-type-shop"
              >
                <View style={styles.iconContainer}>
                  <Store size={32} color="#000000" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Work for a Shop</Text>
                  <Text style={styles.optionDescription}>I'm employed by a barbershop or salon</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.animatedOptionContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: Animated.add(
                        optionsSlideAnim,
                        new Animated.Value(12)
                      )
                    }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  styles.independentOption,
                  selected === 'independent' && styles.selectedCard
                ]}
                onPress={() => handleSelect('independent')}
                testID="employment-type-independent"
              >
                <View style={styles.iconContainer}>
                  <User size={32} color="#FFFFFF" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Independent</Text>
                  <Text style={styles.optionDescription}>I work independently or freelance</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[
          styles.animatedNavigationContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: navigationSlideAnim }]
          }
        ]}>
          <OnboardingNavigation
            onBack={handleBack}
            onNext={handleContinue}
            nextDisabled={!selected}
            testID="employment-type-navigation"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  content: {
    flex: 1,
  },
  question: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
    lineHeight: 36,
    fontFamily: FONTS.bold,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  optionsContainer: {
    marginBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
  },
  shopOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  independentOption: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  animatedOptionContainer: {
    // Container for animated option cards
  },
  animatedNavigationContainer: {
    // Container for animated navigation
  },
});