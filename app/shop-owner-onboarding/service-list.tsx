import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding, ShopService } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react-native';

export default function ServiceList() {
  const router = useRouter();
  const { services, addService, updateService, removeService, nextStep } = useShopOwnerOnboarding();
  
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [servicesList, setServicesList] = useState<ShopService[]>(services);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!serviceName.trim()) newErrors.name = 'Service name is required';
    if (!price.trim()) newErrors.price = 'Price is required';
    if (isNaN(Number(price)) || Number(price) <= 0) newErrors.price = 'Please enter a valid price';
    if (!duration.trim()) newErrors.duration = 'Duration is required';
    if (isNaN(Number(duration)) || Number(duration) <= 0) newErrors.duration = 'Please enter a valid duration in minutes';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = () => {
    if (validateForm()) {
      const newService: ShopService = {
        id: editingId || `service-${Date.now()}`,
        name: serviceName,
        price: Number(price),
        duration: Number(duration)
      };
      
      if (editingId) {
        updateService(editingId, newService);
        const updatedList = servicesList.map(service => 
          service.id === editingId ? newService : service
        );
        setServicesList(updatedList);
        setEditingId(null);
      } else {
        addService(newService);
        setServicesList([...servicesList, newService]);
      }
      
      // Reset form
      setServiceName('');
      setPrice('');
      setDuration('');
      setErrors({});
    }
  };

  const handleEditService = (service: ShopService) => {
    setServiceName(service.name);
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setEditingId(service.id);
  };

  const handleRemoveService = (serviceId: string) => {
    Alert.alert(
      "Remove Service",
      "Are you sure you want to remove this service?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: () => {
            removeService(serviceId);
            setServicesList(servicesList.filter(service => service.id !== serviceId));
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleNext = () => {
    if (servicesList.length === 0) {
      Alert.alert(
        "No Services Added",
        "You haven't added any services yet. Are you sure you want to continue?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Continue", 
            onPress: () => {
              nextStep();
              router.push('/shop-owner-onboarding/subscription-plan' as any);
            }
          }
        ]
      );
    } else {
      nextStep();
      router.push('/shop-owner-onboarding/subscription-plan' as any);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Set your shop's service menu</Text>
          <Text style={styles.subtitle}>
            Define the services and prices your providers will use. They cannot change these prices.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Service Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="e.g. Haircut, Styling, Manicure"
              placeholderTextColor="#A0A0A0"
              testID="service-name-input"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.priceInput]}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={[styles.input, errors.price ? styles.inputError : null]}
                value={price}
                onChangeText={(value) => setPrice(formatCurrency(value))}
                placeholder="0.00"
                placeholderTextColor="#A0A0A0"
                keyboardType="decimal-pad"
                testID="service-price-input"
              />
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.durationInput]}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput
                style={[styles.input, errors.duration ? styles.inputError : null]}
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                placeholderTextColor="#A0A0A0"
                keyboardType="number-pad"
                testID="service-duration-input"
              />
              {errors.duration ? <Text style={styles.errorText}>{errors.duration}</Text> : null}
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddService}
            activeOpacity={0.8}
            testID="add-service-button"
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {editingId ? 'Update Service' : 'Add Service'}
            </Text>
          </TouchableOpacity>
        </View>

        {servicesList.length > 0 && (
          <View style={styles.servicesList}>
            <Text style={styles.servicesTitle}>Your Services</Text>
            
            {servicesList.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  </View>
                </View>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditService(service)}
                    testID={`edit-service-${service.id}`}
                  >
                    <Edit2 size={18} color="#3b5998" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveService(service.id)}
                    testID={`delete-service-${service.id}`}
                  >
                    <Trash2 size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="service-list-next-button"
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
    marginRight: 12,
  },
  durationInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3b5998',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  servicesList: {
    marginBottom: 24,
  },
  servicesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    color: '#3b5998',
    fontWeight: '500',
    marginRight: 12,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  button: {
    backgroundColor: '#3b5998',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
});