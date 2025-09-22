import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding, ProviderType } from '@/providers/ProviderOnboardingProvider';
import { Scissors, Brush, Palette, Zap, HelpCircle } from 'lucide-react-native';

export default function ProviderTypeScreen() {
  const router = useRouter();
  const { currentStep, totalSteps, providerType, setProviderType, nextStep, previousStep } = useProviderOnboarding();
  const [selectedType, setSelectedType] = useState<ProviderType | null>(providerType);

  const handleTypeSelect = (type: ProviderType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      setProviderType(selectedType);
      nextStep();
      router.push('/provider-onboarding/personal-info');
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const providerTypes: { type: ProviderType; icon: React.ReactNode; description: string }[] = [
    { 
      type: 'Barber', 
      icon: <Scissors size={24} color="#D4AF37" />, 
      description: 'Haircuts, beard trims, shaves, and styling'
    },
    { 
      type: 'Hair Stylist', 
      icon: <Brush size={24} color="#D4AF37" />, 
      description: 'Cuts, coloring, styling, and treatments'
    },
    { 
      type: 'Nail Technician', 
      icon: <Palette size={24} color="#D4AF37" />, 
      description: 'Manicures, pedicures, and nail art'
    },
    { 
      type: 'Tattoo Artist', 
      icon: <Zap size={24} color="#D4AF37" />, 
      description: 'Custom tattoos and body art'
    },
    { 
      type: 'Other', 
      icon: <HelpCircle size={24} color="#D4AF37" />, 
      description: 'Other beauty or wellness services'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>GET STARTED</Text>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>What type of services do you provide?</Text>
          <Text style={styles.description}>Select the category that best describes your expertise.</Text>

          <View style={styles.optionsContainer}>
            {providerTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.optionCard,
                  selectedType === item.type && styles.selectedCard
                ]}
                onPress={() => handleTypeSelect(item.type)}
                testID={`provider-type-${item.type}`}
              >
                <View style={styles.iconContainer}>{item.icon}</View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{item.type}</Text>
                  <Text style={styles.optionDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <OnboardingNavigation
          onBack={handleBack}
          onNext={handleContinue}
          nextDisabled={!selectedType}
          testID="provider-type-navigation"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCard: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});