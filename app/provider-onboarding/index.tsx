import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';


export default function ProviderOnboardingIntro() {
  const router = useRouter();
  const { resetOnboarding } = useProviderOnboarding();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Reset onboarding state when starting
  useEffect(() => {
    resetOnboarding();
    
    // Start animations
    const animationSequence = Animated.sequence([
      // First, fade in the image
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Then add overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);
    
    // Animate content
    const contentAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);
    
    // Start both animations
    animationSequence.start();
    const timeoutId = setTimeout(() => contentAnimation.start(), 300);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      animationSequence.stop();
      contentAnimation.stop();
    };
  }, [resetOnboarding, fadeAnim, slideAnim, scaleAnim, imageOpacity, overlayOpacity]);

  const handleGetStarted = () => {
    router.push('/provider-onboarding/employment-type');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Animated.Image 
            source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2940&auto=format&fit=crop' }} 
            style={[styles.image, { opacity: imageOpacity }]}
            resizeMode="cover"
          />
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </View>
        
        <Animated.View style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <Text style={styles.title}>THE POWER OF BARBERING</Text>
          <Text style={styles.subtitle}>
            Barbering is an art form. When you master your craft, you have the power to transform not just appearances, but confidence.
          </Text>
        </Animated.View>

        <Animated.View style={[
          styles.indicatorContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <View style={styles.indicator} />
        </Animated.View>

        <Animated.View style={[
          styles.navigationContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <OnboardingNavigation
            onNext={handleGetStarted}
            nextTitle="GET STARTED"
            showBack={false}
            testID="intro-navigation"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  textContainer: {
    marginTop: 100,
    paddingHorizontal: SPACING.md,
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  buttonContainer: {
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  navigationContainer: {
    // Empty style for animation container
  },
});