import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { FormInput } from '@/components/FormInput';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';

export default function ServiceAddressScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    workSituation,
    address,
    city,
    state,
    zip,
    travelRadius,
    setAddress,
    setTravelRadius,
    nextStep 
  } = useProviderOnboarding();

  const [formData, setFormData] = useState({
    address: address || '',
    city: city || '',
    state: state || '',
    zip: zip || '',
  });

  const [radius, setRadius] = useState(travelRadius || 10);
  
  const [errors, setErrors] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const [touched, setTouched] = useState({
    address: false,
    city: false,
    state: false,
    zip: false,
  });

  // Determine if we need to show address fields based on work situation
  const showAddressFields = workSituation === 'own_shop' || workSituation === 'home_studio';
  const showTravelRadius = workSituation === 'mobile';
  
  // Set screen title based on work situation
  const getScreenTitle = () => {
    switch (workSituation) {
      case 'own_shop':
        return 'Where is your shop located?';
      case 'home_studio':
        return 'Where is your home studio located?';
      case 'mobile':
        return 'What is your service area?';
      default:
        return 'Where do you provide your services?';
    }
  };

  const getScreenDescription = () => {
    switch (workSituation) {
      case 'own_shop':
        return 'Enter the address of your shop or studio.';
      case 'home_studio':
        return 'Your address will only be shared with confirmed clients.';
      case 'mobile':
        return "Set the maximum distance you're willing to travel to clients.";
      default:
        return 'Let us know where you provide your services.';
    }
  };

  const validateForm = () => {
    if (showTravelRadius) {
      return true; // No validation needed for travel radius
    }
    
    if (showAddressFields) {
      const newErrors = {
        address: formData.address.trim() ? '' : 'Address is required',
        city: formData.city.trim() ? '' : 'City is required',
        state: formData.state.trim() ? '' : 'State is required',
        zip: formData.zip.trim() ? '' : 'ZIP code is required',
      };

      setErrors(newErrors);
      return !Object.values(newErrors).some(error => error);
    }
    
    return true;
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field that was blurred
    if (field === 'address') {
      setErrors(prev => ({ 
        ...prev, 
        address: formData.address.trim() ? '' : 'Address is required' 
      }));
    } else if (field === 'city') {
      setErrors(prev => ({ 
        ...prev, 
        city: formData.city.trim() ? '' : 'City is required' 
      }));
    } else if (field === 'state') {
      setErrors(prev => ({ 
        ...prev, 
        state: formData.state.trim() ? '' : 'State is required' 
      }));
    } else if (field === 'zip') {
      setErrors(prev => ({ 
        ...prev, 
        zip: formData.zip.trim() ? '' : 'ZIP code is required' 
      }));
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error if field is now valid
    if (touched[field] && value.trim()) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      if (showAddressFields) {
        setAddress(formData.address, formData.city, formData.state, formData.zip);
      }
      
      if (showTravelRadius) {
        setTravelRadius(radius);
      }
      
      nextStep();
      
      // If they work at a shop, they already went through shop search
      // If they're independent, they need to set up services
      router.push('/provider-onboarding/services');
    } else {
      // Mark all fields as touched to show all errors
      setTouched({
        address: true,
        city: true,
        state: true,
        zip: true,
      });
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
            <Text style={styles.question}>{getScreenTitle()}</Text>
            <Text style={styles.description}>{getScreenDescription()}</Text>

            {showAddressFields && (
              <View style={styles.formContainer}>
                <FormInput
                  label="ADDRESS"
                  value={formData.address}
                  onChangeText={(value) => handleChange('address', value)}
                  onBlur={() => handleBlur('address')}
                  error={touched.address ? errors.address : null}
                  isValid={touched.address && !errors.address}
                  placeholder="Enter your street address"
                  testID="address-input"
                />

                <FormInput
                  label="CITY"
                  value={formData.city}
                  onChangeText={(value) => handleChange('city', value)}
                  onBlur={() => handleBlur('city')}
                  error={touched.city ? errors.city : null}
                  isValid={touched.city && !errors.city}
                  placeholder="Enter your city"
                  testID="city-input"
                />

                <View style={styles.rowContainer}>
                  <View style={styles.stateContainer}>
                    <FormInput
                      label="STATE"
                      value={formData.state}
                      onChangeText={(value) => handleChange('state', value)}
                      onBlur={() => handleBlur('state')}
                      error={touched.state ? errors.state : null}
                      isValid={touched.state && !errors.state}
                      placeholder="State"
                      testID="state-input"
                      maxLength={2}
                      autoCapitalize="characters"
                    />
                  </View>
                  
                  <View style={styles.zipContainer}>
                    <FormInput
                      label="ZIP CODE"
                      value={formData.zip}
                      onChangeText={(value) => handleChange('zip', value)}
                      onBlur={() => handleBlur('zip')}
                      error={touched.zip ? errors.zip : null}
                      isValid={touched.zip && !errors.zip}
                      placeholder="ZIP"
                      testID="zip-input"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View>
              </View>
            )}

            {showTravelRadius && (
              <View style={styles.radiusContainer}>
                <Text style={styles.radiusLabel}>Maximum Travel Distance</Text>
                <Text style={styles.radiusValue}>{radius} miles</Text>
                
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={50}
                  step={1}
                  value={radius}
                  onValueChange={setRadius}
                  minimumTrackTintColor="#D4AF37"
                  maximumTrackTintColor="#333333"
                  thumbTintColor="#D4AF37"
                  testID="radius-slider"
                />
                
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1 mile</Text>
                  <Text style={styles.sliderLabel}>50 miles</Text>
                </View>
              </View>
            )}
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
  formContainer: {
    marginBottom: 30,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stateContainer: {
    flex: 1,
    marginRight: 10,
  },
  zipContainer: {
    flex: 1.5,
  },
  radiusContainer: {
    marginBottom: 30,
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  radiusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 20,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});