import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding, SubscriptionPlan } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, Check } from 'lucide-react-native';

export default function SubscriptionPlanSelection() {
  const router = useRouter();
  const { selectedPlanId, selectSubscriptionPlan, getSubscriptionPlans, nextStep } = useShopOwnerOnboarding();
  
  const plans = getSubscriptionPlans();
  // Auto-select the Professional plan since it's the only option
  const [selectedPlan, setSelectedPlan] = useState<string | null>(selectedPlanId || plans[0].id);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleNext = () => {
    // Since there's only one plan, we can always proceed
    selectSubscriptionPlan(selectedPlan || plans[0].id);
    nextStep();
    router.push('/shop-owner-onboarding/payment-information' as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Professional Plan</Text>
          <Text style={styles.subtitle}>
            Our professional plan offers everything you need for your business
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlan
              ]}
              onPress={() => handleSelectPlan(plan.id)}
              activeOpacity={0.8}
              testID={`plan-${plan.id}`}
            >
              <View style={styles.planHeader}>
                <Text style={[
                  styles.planName,
                  selectedPlan === plan.id && styles.selectedText
                ]}>
                  {plan.name}
                </Text>
                <Text style={styles.planPrice}>
                  ${plan.price.toFixed(2)}<Text style={styles.planPeriod}>/month</Text>
                </Text>
              </View>
              
              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Check size={16} color="#3b5998" style={styles.featureIcon} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              {selectedPlan === plan.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="subscription-next-button"
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedPlan: {
    borderColor: '#3b5998',
    backgroundColor: '#EBF0F9',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  selectedText: {
    color: '#3b5998',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b5998',
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  planFeatures: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#3b5998',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
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