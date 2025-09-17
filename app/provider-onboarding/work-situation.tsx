import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useProviderOnboarding, WorkSituation } from '@/providers/ProviderOnboardingProvider';
import { Building2, Store, Car, Home } from 'lucide-react-native';

export default function WorkSituationScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    workSituation, 
    setWorkSituation, 
    nextStep 
  } = useProviderOnboarding();
  
  const [selected, setSelected] = useState<WorkSituation | null>(workSituation);

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
      icon: <Building2 size={24} color="#D4AF37" />
    },
    {
      id: 'work_at_shop',
      title: 'I work at a shop',
      description: 'You work at an established business owned by someone else',
      icon: <Store size={24} color="#D4AF37" />
    },
    {
      id: 'mobile',
      title: 'I am mobile / I travel to clients',
      description: "You travel to provide services at clients' locations",
      icon: <Car size={24} color="#D4AF37" />
    },
    {
      id: 'home_studio',
      title: 'I work from a home studio',
      description: 'You provide services from your home or private space',
      icon: <Home size={24} color="#D4AF37" />
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>GET STARTED</Text>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>How do you work?</Text>
          <Text style={styles.description}>
            This helps us set up your profile correctly.
          </Text>

          <View style={styles.optionsContainer}>
            {workOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
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
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="CONTINUE"
            onPress={handleContinue}
            disabled={!selected}
            testID="continue-button"
          />
        </View>
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
    fontSize: 16,
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