import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';

export default function ShopInformation() {
  const router = useRouter();
  const { shopName, shopPhone, shopEmail, shopAddress, shopCity, shopState, shopZip, setShopInfo, nextStep } = useShopOwnerOnboarding();
  
  const [name, setName] = useState(shopName);
  const [phone, setPhone] = useState(shopPhone);
  const [email, setEmail] = useState(shopEmail);
  const [address, setAddress] = useState(shopAddress);
  const [city, setCity] = useState(shopCity);
  const [state, setState] = useState(shopState);
  const [zip, setZip] = useState(shopZip);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Shop name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Please enter a valid 10-digit phone number';
    
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!/^\d{5}(-\d{4})?$/.test(zip)) newErrors.zip = 'Please enter a valid ZIP code';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShopInfo(name, phone, email, address, city, state, zip);
      nextStep();
      router.push('/shop-owner-onboarding/owner-information' as any);
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
          testID="shop-info-back-button"
        >
          <ChevronLeft size={20} color="#666" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Tell us about your business</Text>
          <Text style={styles.subtitle}>
            Let&apos;s start with the basic information about your shop
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Shop Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your shop name"
              placeholderTextColor="#A0A0A0"
              testID="shop-name-input"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Shop Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              value={phone}
              onChangeText={setPhone}
              placeholder="(123) 456-7890"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
              testID="shop-phone-input"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Shop Email Address</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="shop@example.com"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="shop-email-input"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Shop Address</Text>
            <TextInput
              style={[styles.input, errors.address ? styles.inputError : null]}
              value={address}
              onChangeText={setAddress}
              placeholder="123 Main St"
              placeholderTextColor="#A0A0A0"
              testID="shop-address-input"
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.cityInput]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, errors.city ? styles.inputError : null]}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#A0A0A0"
                testID="shop-city-input"
              />
              {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.stateInput]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={[styles.input, errors.state ? styles.inputError : null]}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#A0A0A0"
                maxLength={2}
                autoCapitalize="characters"
                testID="shop-state-input"
              />
              {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.zipInput]}>
              <Text style={styles.label}>ZIP Code</Text>
              <TextInput
                style={[styles.input, errors.zip ? styles.inputError : null]}
                value={zip}
                onChangeText={setZip}
                placeholder="12345"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                maxLength={10}
                testID="shop-zip-input"
              />
              {errors.zip ? <Text style={styles.errorText}>{errors.zip}</Text> : null}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="shop-info-next-button"
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cityInput: {
    flex: 3,
    marginRight: 12,
  },
  stateInput: {
    flex: 1,
    marginRight: 12,
  },
  zipInput: {
    flex: 2,
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