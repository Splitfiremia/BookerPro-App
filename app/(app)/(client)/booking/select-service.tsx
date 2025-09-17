import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  description?: string;
}

const services: Service[] = [
  { id: '1', name: 'Haircut', duration: '30 min', price: '$35', description: 'Professional haircut and styling' },
  { id: '2', name: 'Beard Trim', duration: '20 min', price: '$25', description: 'Beard shaping and trimming' },
  { id: '3', name: 'Hair & Beard', duration: '45 min', price: '$55', description: 'Complete grooming package' },
  { id: '4', name: 'Hair Color', duration: '90 min', price: '$75', description: 'Professional hair coloring service' },
  { id: '5', name: 'Hot Towel Shave', duration: '30 min', price: '$40', description: 'Classic hot towel shave experience' },
];

export default function SelectServiceScreen() {
  const router = useRouter();
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (selectedService) {
      router.push(`/(app)/(client)/booking/select-date?providerId=${providerId}&serviceId=${selectedService}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Service</Text>
          <Text style={styles.subtitle}>Choose the service you'd like to book</Text>
        </View>

        <View style={styles.servicesContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService === service.id && styles.selectedCard
              ]}
              onPress={() => handleServiceSelect(service.id)}
              activeOpacity={0.7}
            >
              <View style={styles.serviceInfo}>
                <Text style={[
                  styles.serviceName,
                  selectedService === service.id && styles.selectedText
                ]}>
                  {service.name}
                </Text>
                {service.description && (
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                )}
                <View style={styles.serviceDetails}>
                  <Text style={[
                    styles.serviceDuration,
                    selectedService === service.id && styles.selectedSubtext
                  ]}>
                    {service.duration}
                  </Text>
                  <Text style={[
                    styles.servicePrice,
                    selectedService === service.id && styles.selectedText
                  ]}>
                    {service.price}
                  </Text>
                </View>
              </View>
              <ChevronRight 
                size={20} 
                color={selectedService === service.id ? '#fff' : '#666'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedService && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedService}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  servicesContainer: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#007AFF',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  selectedText: {
    color: '#fff',
  },
  selectedSubtext: {
    color: '#e0e0e0',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});