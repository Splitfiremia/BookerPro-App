import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding, WorkSituation } from '@/providers/ProviderOnboardingProvider';
import { Building2, Store, Car, Home } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function WorkSituationScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    workSituation, 
    setWorkSituation, 
    nextStep,
    previousStep 
  } = useProviderOnboarding();
  
  const [selected, setSelected] = useState<WorkSituation | null>(workSituation);
  
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

  const handleSelect = (situation: WorkSituation) => {
    setSelected(situation);
  };

  const handleContinue = () => {
    if (selected) {
      setWorkSituation(selected);
      nextStep();
      
      // Route to the appropriate next screen based on selection
      switch (selected) {
        case 'own_shop':
          router.replace('/provider-onboarding/service-address');
          break;
        case 'work_at_shop':
          router.replace('/provider-onboarding/shop-search');
          break;
        case 'mobile':
          router.replace('/provider-onboarding/service-address');
          break;
        case 'home_studio':
          router.replace('/provider-onboarding/service-address');
          break;
        default:
          router.replace('/provider-onboarding/service-address');
      }
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const workOptions: { 
    id: WorkSituation; 
    title: string; 
    description: string; 
    icon: React.ReactNode 
  }[] = [
    {
      id: 'own_shop',
      title: 'I have my own shop / studio',
      description: 'You own or rent a commercial space for your services',
      icon: <Building2 size={24} color={COLORS.primary} />
    },
    {
      id: 'work_at_shop',
      title: 'I work at a shop',
      description: 'You work at an established business owned by someone else',
      icon: <Store size={24} color={COLORS.primary} />
    },
    {
      id: 'mobile',
      title: 'I am mobile / I travel to clients',
      description: "You travel to provide services at clients' locations",
      icon: <Car size={24} color={COLORS.primary} />
    },
    {
      id: 'home_studio',
      title: 'I work from a home studio',
      description: 'You provide services from your home or private space',
      icon: <Home size={24} color={COLORS.primary} />
    }
  ];

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
          <Text style={styles.question}>How do you work?</Text>
          <Text style={styles.description}>
            This helps us set up your profile correctly.
          </Text>

          <Animated.View style={[
            styles.optionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: optionsSlideAnim }]
            }
          ]}>
            {workOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                style={[
                  styles.animatedOptionContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: Animated.add(
                          optionsSlideAnim,
                          new Animated.Value(index * 12)
                        )
                      }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    selected === option.id && styles.selectedCard
                  ]}
                  onPress={() => handleSelect(option.id)}
                  testID={`work-option-${option.id}`}
                >
                  <View style={styles.iconContainer}>{option.icon}</View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
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
            testID="work-situation-navigation"
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
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginBottom: SPACING.xl,
    fontFamily: FONTS.regular,
  },
  optionsContainer: {
    marginBottom: SPACING.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.glass.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
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
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  animatedOptionContainer: {
    // Container for animated option cards
  },
  animatedNavigationContainer: {
    // Container for animated navigation
  },
});