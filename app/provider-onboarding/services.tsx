import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { Plus, Trash2 } from 'lucide-react-native';

// Using the existing import for useProviderOnboarding

type ServiceFormData = {
  id: string;
  name: string;
  price: string;
  duration: string;
};

export default function ServicesScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    services,
    updateService: providerUpdateService,
    nextStep 
  } = useProviderOnboarding();

  const [servicesList, setServicesList] = useState<ServiceFormData[]>(
    services?.length ? services.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price.toString(),
      duration: s.duration.toString()
    })) : [{ id: Date.now().toString(), name: '', price: '', duration: '' }]
  );

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  const handleAddService = () => {
    setServicesList([
      ...servicesList,
      { id: Date.now().toString(), name: '', price: '', duration: '' }
    ]);
  };

  const handleRemoveService = (id: string) => {
    if (servicesList.length === 1) {
      // Don't remove the last service, just clear it
      setServicesList([{ id: Date.now().toString(), name: '', price: '', duration: '' }]);
      return;
    }
    setServicesList(servicesList.filter(service => service.id !== id));
  };

  const handleUpdateService = (id: string, field: keyof ServiceFormData, value: string) => {
    setServicesList(servicesList.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));

    // Clear error when user types
    if (errors[id]?.[field]) {
      setErrors({
        ...errors,
        [id]: {
          ...errors[id],
          [field]: ''
        }
      });
    }
  };

  const validateServices = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let isValid = true;

    servicesList.forEach(service => {
      const serviceErrors: Record<string, string> = {};
      
      if (!service.name.trim()) {
        serviceErrors.name = 'Service name is required';
        isValid = false;
      }
      
      if (!service.price.trim()) {
        serviceErrors.price = 'Price is required';
        isValid = false;
      } else if (isNaN(parseFloat(service.price))) {
        serviceErrors.price = 'Price must be a number';
        isValid = false;
      }
      
      if (!service.duration.trim()) {
        serviceErrors.duration = 'Duration is required';
        isValid = false;
      } else if (isNaN(parseInt(service.duration, 10))) {
        serviceErrors.duration = 'Duration must be a number';
        isValid = false;
      }
      
      if (Object.keys(serviceErrors).length > 0) {
        newErrors[service.id] = serviceErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateServices()) {
      // Clear existing services and add new ones
      servicesList.forEach(service => {
        const formattedService = {
          id: service.id,
          name: service.name.trim(),
          price: parseFloat(service.price),
          duration: parseInt(service.duration, 10)
        };
        
        // Update existing service or add new one
        providerUpdateService(service.id, formattedService);
      });
      nextStep();
      router.replace('profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>GET STARTED</Text>
            <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
          </View>

          <View style={styles.content}>
            <Text style={styles.question}>Set your services and prices</Text>
            <Text style={styles.description}>
              Add the services you offer, their prices, and how long they take.
            </Text>

            <View style={styles.servicesContainer}>
              {servicesList.map((service, index) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceNumber}>Service {index + 1}</Text>
                    {servicesList.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => handleRemoveService(service.id)}
                        style={styles.removeButton}
                        testID={`remove-service-${index}`}
                      >
                        <Trash2 size={20} color="#FF6B6B" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>SERVICE NAME</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors[service.id]?.name ? styles.inputError : null
                      ]}
                      placeholder="e.g. Haircut, Beard Trim, etc."
                      placeholderTextColor="#666666"
                      value={service.name}
                      onChangeText={(value) => handleUpdateService(service.id, 'name', value)}
                      testID={`service-name-${index}`}
                    />
                    {errors[service.id]?.name ? (
                      <Text style={styles.errorText}>{errors[service.id].name}</Text>
                    ) : null}
                  </View>

                  <View style={styles.rowContainer}>
                    <View style={styles.halfInputContainer}>
                      <Text style={styles.inputLabel}>PRICE ($)</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors[service.id]?.price ? styles.inputError : null
                        ]}
                        placeholder="0.00"
                        placeholderTextColor="#666666"
                        keyboardType="decimal-pad"
                        value={service.price}
                        onChangeText={(value) => handleUpdateService(service.id, 'price', value)}
                        testID={`service-price-${index}`}
                      />
                      {errors[service.id]?.price ? (
                        <Text style={styles.errorText}>{errors[service.id].price}</Text>
                      ) : null}
                    </View>

                    <View style={styles.halfInputContainer}>
                      <Text style={styles.inputLabel}>DURATION (MIN)</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors[service.id]?.duration ? styles.inputError : null
                        ]}
                        placeholder="30"
                        placeholderTextColor="#666666"
                        keyboardType="number-pad"
                        value={service.duration}
                        onChangeText={(value) => handleUpdateService(service.id, 'duration', value)}
                        testID={`service-duration-${index}`}
                      />
                      {errors[service.id]?.duration ? (
                        <Text style={styles.errorText}>{errors[service.id].duration}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity 
                style={styles.addServiceButton} 
                onPress={handleAddService}
                testID="add-service-button"
              >
                <Plus size={20} color="#D4AF37" />
                <Text style={styles.addServiceText}>Add Another Service</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <GradientButton
              title="CONTINUE"
              onPress={handleContinue}
              testID="continue-button"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
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
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
  },
  servicesContainer: {
    marginBottom: 30,
  },
  serviceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceNumber: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#D4AF37',
  },
  removeButton: {
    padding: 5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  addServiceText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});