import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding, PaymentMethod } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, CreditCard, Lock } from 'lucide-react-native';

export default function PaymentInformation() {
  const router = useRouter();
  const { setPaymentMethod, nextStep } = useShopOwnerOnboarding();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Card number validation (16 digits)
    const cleanedCardNumber = cardNumber.replace(/\D/g, '');
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanedCardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    // Expiry date validation (MM/YY format)
    const cleanedExpiry = expiryDate.replace(/\D/g, '');
    if (!cleanedExpiry) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (cleanedExpiry.length !== 4) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      const month = parseInt(cleanedExpiry.substring(0, 2), 10);
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Invalid month';
      }
    }
    
    // CVV validation (3-4 digits)
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }
    
    // Cardholder name validation
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // In a real app, you would securely process the payment information
      // For this demo, we'll just create a mock payment method
      const paymentMethod: PaymentMethod = {
        id: `card-${Date.now()}`,
        type: 'credit_card',
        last4: cardNumber.replace(/\D/g, '').slice(-4),
        expiryDate: expiryDate,
        brand: getCardBrand(cardNumber)
      };
      
      setPaymentMethod(paymentMethod);
      nextStep();
      router.push('/shop-owner-onboarding/policies' as any);
    }
  };

  const getCardBrand = (cardNumber: string): string => {
    const cleanedNumber = cardNumber.replace(/\D/g, '');
    
    // Very basic card brand detection
    if (cleanedNumber.startsWith('4')) {
      return 'Visa';
    } else if (/^5[1-5]/.test(cleanedNumber)) {
      return 'Mastercard';
    } else if (/^3[47]/.test(cleanedNumber)) {
      return 'American Express';
    } else if (/^6(?:011|5)/.test(cleanedNumber)) {
      return 'Discover';
    }
    
    return 'Unknown';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter payment details</Text>
          <Text style={styles.subtitle}>
            Your subscription will begin after completing setup
          </Text>
        </View>

        <View style={styles.securityNote}>
          <Lock size={20} color="#3b5998" />
          <Text style={styles.securityText}>
            Your payment information is securely processed and encrypted
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <CreditCard size={24} color="#3b5998" />
            <Text style={styles.cardHeaderText}>Credit Card</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={[styles.input, errors.cardNumber ? styles.inputError : null]}
                value={cardNumber}
                onChangeText={(value) => setCardNumber(formatCardNumber(value))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#A0A0A0"
                keyboardType="number-pad"
                maxLength={19}
                testID="card-number-input"
              />
              {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.expiryInput]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={[styles.input, errors.expiryDate ? styles.inputError : null]}
                  value={expiryDate}
                  onChangeText={(value) => setExpiryDate(formatExpiryDate(value))}
                  placeholder="MM/YY"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="number-pad"
                  maxLength={5}
                  testID="expiry-date-input"
                />
                {errors.expiryDate ? <Text style={styles.errorText}>{errors.expiryDate}</Text> : null}
              </View>

              <View style={[styles.inputContainer, styles.cvvInput]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={[styles.input, errors.cvv ? styles.inputError : null]}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  testID="cvv-input"
                />
                {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={[styles.input, errors.cardholderName ? styles.inputError : null]}
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholder="John Doe"
                placeholderTextColor="#A0A0A0"
                testID="cardholder-name-input"
              />
              {errors.cardholderName ? <Text style={styles.errorText}>{errors.cardholderName}</Text> : null}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="payment-next-button"
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF0F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  cardContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  form: {
    padding: 16,
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
  expiryInput: {
    flex: 1,
    marginRight: 12,
  },
  cvvInput: {
    flex: 1,
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