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
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES, BORDER_RADIUS } from '@/constants/theme';

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
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.xl,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500' as const,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
    fontFamily: FONTS.regular,
  },
  phoneNumber: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '500' as const,
    fontFamily: FONTS.regular,
  },
  paymentSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.lg,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  paymentOption: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
  },
  paymentOptionActive: {
    backgroundColor: COLORS.primary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.text,
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
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
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '500' as const,
    flex: 1,
    fontFamily: FONTS.regular,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold' as const,
    letterSpacing: 0.5,
    fontFamily: FONTS.bold,
  },
  finePrintSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  finePrintTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.lg,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  finePrintItem: {
    ...GLASS_STYLES.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  finePrintLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  finePrintText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  bottomSection: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  bottomDescription: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  getStartedButton: {
    ...GLASS_STYLES.button.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl * 2,
  },
  getStartedButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
});