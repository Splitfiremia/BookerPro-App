import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/FormInput';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { validateEmail, validatePhone } from '@/utils/validation';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    firstName, 
    lastName, 
    phone, 
    email, 
    setPersonalInfo, 
    nextStep,
    previousStep 
  } = useProviderOnboarding();

  const [formData, setFormData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    phone: phone || '',
    email: email || '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    phone: false,
    email: false,
  });

  const validateForm = () => {
    const newErrors = {
      firstName: formData.firstName.trim() ? '' : 'First name is required',
      lastName: formData.lastName.trim() ? '' : 'Last name is required',
      phone: validatePhone(formData.phone) ? '' : 'Valid phone number is required',
      email: validateEmail(formData.email) ? '' : 'Valid email is required',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field that was blurred
    if (field === 'firstName') {
      setErrors(prev => ({ 
        ...prev, 
        firstName: formData.firstName.trim() ? '' : 'First name is required' 
      }));
    } else if (field === 'lastName') {
      setErrors(prev => ({ 
        ...prev, 
        lastName: formData.lastName.trim() ? '' : 'Last name is required' 
      }));
    } else if (field === 'phone') {
      setErrors(prev => ({ 
        ...prev, 
        phone: validatePhone(formData.phone) ? '' : 'Valid phone number is required' 
      }));
    } else if (field === 'email') {
      setErrors(prev => ({ 
        ...prev, 
        email: validateEmail(formData.email) ? '' : 'Valid email is required' 
      }));
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error if field is now valid
    if (touched[field]) {
      if (field === 'firstName' && value.trim()) {
        setErrors(prev => ({ ...prev, firstName: '' }));
      } else if (field === 'lastName' && value.trim()) {
        setErrors(prev => ({ ...prev, lastName: '' }));
      } else if (field === 'phone' && validatePhone(value)) {
        setErrors(prev => ({ ...prev, phone: '' }));
      } else if (field === 'email' && validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      setPersonalInfo(
        formData.firstName,
        formData.lastName,
        formData.phone,
        formData.email
      );
      nextStep();
      router.push('/provider-onboarding/work-situation');
    } else {
      // Mark all fields as touched to show all errors
      setTouched({
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      });
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
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
            <Text style={styles.question}>Tell us about yourself</Text>
            <Text style={styles.description}>
              We'll use this information to set up your profile and help clients find you.
            </Text>

            <View style={styles.formContainer}>
              <FormInput
                label="FIRST NAME"
                value={formData.firstName}
                onChangeText={(value) => handleChange('firstName', value)}
                onBlur={() => handleBlur('firstName')}
                error={touched.firstName ? errors.firstName : null}
                isValid={touched.firstName && !errors.firstName}
                placeholder="Enter your first name"
                testID="first-name-input"
                autoCapitalize="words"
              />

              <FormInput
                label="LAST NAME"
                value={formData.lastName}
                onChangeText={(value) => handleChange('lastName', value)}
                onBlur={() => handleBlur('lastName')}
                error={touched.lastName ? errors.lastName : null}
                isValid={touched.lastName && !errors.lastName}
                placeholder="Enter your last name"
                testID="last-name-input"
                autoCapitalize="words"
              />

              <FormInput
                label="PHONE NUMBER"
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? errors.phone : null}
                isValid={touched.phone && !errors.phone}
                placeholder="(123) 456-7890"
                keyboardType="phone-pad"
                testID="phone-input"
              />

              <FormInput
                label="EMAIL"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : null}
                isValid={touched.email && !errors.email}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                testID="email-input"
              />
            </View>
          </View>

          <OnboardingNavigation
            onBack={handleBack}
            onNext={handleContinue}
            testID="personal-info-navigation"
          />
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
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});