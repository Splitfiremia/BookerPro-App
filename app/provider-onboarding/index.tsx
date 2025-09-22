import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { ChevronRight } from 'lucide-react-native';

export default function ProviderOnboardingIntro() {
  const router = useRouter();
  const { resetOnboarding } = useProviderOnboarding();

  // Reset onboarding state when starting
  useEffect(() => {
    resetOnboarding();
  }, [resetOnboarding]);

  const handleGetStarted = () => {
    router.push('/provider-onboarding/provider-type');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2940&auto=format&fit=crop' }} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>THE POWER OF BARBERING</Text>
          <Text style={styles.subtitle}>
            Barbering is an art form. When you master your craft, you have the power to transform not just appearances, but confidence.
          </Text>
        </View>

        <View style={styles.indicatorContainer}>
          <View style={styles.indicator} />
        </View>

        <OnboardingNavigation
          onNext={handleGetStarted}
          nextTitle="GET STARTED"
          showBack={false}
          testID="intro-navigation"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  textContainer: {
    marginTop: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  buttonContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
});