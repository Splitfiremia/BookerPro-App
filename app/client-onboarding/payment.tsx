import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CreditCard } from 'lucide-react-native';

export default function PaymentScreen() {
  const [selectedPayment, setSelectedPayment] = useState<string>('card');

  const handleGetStarted = () => {
    // Complete onboarding and navigate to client dashboard
    router.replace('/(app)/(client)/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ADDITIONAL INFORMATION</Text>
          <Text style={styles.subtitle}>PHONE NUMBER</Text>
          <Text style={styles.phoneNumber}>13013996890</Text>
        </View>

        {/* Payment Section */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>PAYMENT</Text>
          
          {/* Apple Pay */}
          <TouchableOpacity 
            style={[
              styles.paymentOption,
              selectedPayment === 'apple' && styles.paymentOptionSelected
            ]}
            onPress={() => setSelectedPayment('apple')}
          >
            <View style={styles.radioButton}>
              {selectedPayment === 'apple' && <View style={styles.radioButtonInner} />}
            </View>
            <View style={styles.paymentIcon}>
              <Text style={styles.applePayText}>🍎</Text>
            </View>
            <Text style={styles.paymentText}>Apple Pay</Text>
          </TouchableOpacity>

          {/* Cash App Pay */}
          <TouchableOpacity 
            style={[
              styles.paymentOption,
              selectedPayment === 'cashapp' && styles.paymentOptionSelected
            ]}
            onPress={() => setSelectedPayment('cashapp')}
          >
            <View style={styles.radioButton}>
              {selectedPayment === 'cashapp' && <View style={styles.radioButtonInner} />}
            </View>
            <View style={styles.paymentIcon}>
              <Text style={styles.cashAppText}>$</Text>
            </View>
            <Text style={styles.paymentText}>Cash App Pay</Text>
          </TouchableOpacity>

          {/* Credit Card */}
          <TouchableOpacity 
            style={[
              styles.paymentOption,
              styles.paymentOptionSelected,
              selectedPayment === 'card' && styles.paymentOptionActive
            ]}
            onPress={() => setSelectedPayment('card')}
          >
            <View style={styles.radioButton}>
              <View style={styles.radioButtonInner} />
            </View>
            <View style={styles.paymentIcon}>
              <CreditCard size={20} color="#FFFFFF" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.paymentText}>•••••••• 9752</Text>
              <Text style={styles.changeText}>CHANGE</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Fine Print */}
        <View style={styles.finePrintSection}>
          <Text style={styles.finePrintTitle}>THE FINE PRINT</Text>
          
          <View style={styles.finePrintItem}>
            <Text style={styles.finePrintLabel}>Preauthorization</Text>
            <Text style={styles.finePrintText}>
              A hold will not be placed on your payment method, you will only be charged once the 
              appointment has been completed by the provider.
            </Text>
          </View>

          <View style={styles.finePrintItem}>
            <Text style={styles.finePrintLabel}>Cancellation Policy</Text>
            <Text style={styles.finePrintText}>
              Any cancellation within 1 hour of the appointment are subject to a 100% fee of the original service price.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.bottomTitle}>PAY</Text>
        <Text style={styles.bottomDescription}>
          Securely pay for your service with flexible payment options.
        </Text>
        
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 32,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  phoneNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  paymentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333333',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  paymentOptionSelected: {
    borderColor: '#FFD700',
  },
  paymentOptionActive: {
    backgroundColor: '#FFD700',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  applePayText: {
    fontSize: 16,
  },
  cashAppText: {
    color: '#00D632',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  finePrintSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  finePrintTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 1,
  },
  finePrintItem: {
    marginBottom: 24,
  },
  finePrintLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  finePrintText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSection: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  bottomTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  bottomDescription: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 8,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
});