import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';

export default function OwnerInformation() {
  const router = useRouter();
  const { ownerFirstName, ownerLastName, ownerPhone, setOwnerInfo, nextStep } = useShopOwnerOnboarding();
  
  const [firstName, setFirstName] = useState(ownerFirstName);
  const [lastName, setLastName] = useState(ownerLastName);
  const [phone, setPhone] = useState(ownerPhone);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Please enter a valid 10-digit phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setOwnerInfo(firstName, lastName, phone);
      nextStep();
      router.push('/shop-owner-onboarding/shop-type' as any);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="owner-info-back-button"
        >
          <ChevronLeft size={20} color="#666" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>And who are you?</Text>
          <Text style={styles.subtitle}>
            This information is for your account and billing
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your First Name</Text>
            <TextInput
              style={[styles.input, errors.firstName ? styles.inputError : null]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#A0A0A0"
              testID="owner-first-name-input"
            />
            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Last Name</Text>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#A0A0A0"
              testID="owner-last-name-input"
            />
            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              value={phone}
              onChangeText={setPhone}
              placeholder="(123) 456-7890"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
              testID="owner-phone-input"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="owner-info-next-button"
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
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
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
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
  button: {
    backgroundColor: '#3b5998',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
});