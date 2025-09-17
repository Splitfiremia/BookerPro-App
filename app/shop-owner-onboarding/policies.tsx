import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, Info } from 'lucide-react-native';

export default function Policies() {
  const router = useRouter();
  const { cancellationPolicy, setCancellationPolicy, nextStep } = useShopOwnerOnboarding();
  
  const [policy, setPolicy] = useState(cancellationPolicy);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!policy.trim()) {
      setError('Please enter a cancellation policy');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setCancellationPolicy(policy);
      nextStep();
      router.push('/shop-owner-onboarding/completion' as any);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Set your shop policies</Text>
          <Text style={styles.subtitle}>
            Define your cancellation policy and other important rules
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Info size={20} color="#3b5998" />
          <Text style={styles.infoText}>
            Clear policies help set expectations and reduce misunderstandings with clients.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cancellation Policy</Text>
            <Text style={styles.inputHelper}>
              Example: "24-hour notice required for cancellations. Late cancellations may be charged 50% of the service fee."
            </Text>
            <TextInput
              style={[styles.textArea, error ? styles.inputError : null]}
              value={policy}
              onChangeText={setPolicy}
              placeholder="Enter your cancellation policy"
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              testID="cancellation-policy-input"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="policies-next-button"
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
    marginBottom: 24,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF0F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
  inputHelper: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 150,
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
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
});