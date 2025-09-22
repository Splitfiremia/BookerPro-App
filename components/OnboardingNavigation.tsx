import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { GradientButton } from './GradientButton';

interface OnboardingNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  nextTitle?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  loading?: boolean;
  testID?: string;
}

export function OnboardingNavigation({
  onBack,
  onNext,
  nextTitle = 'CONTINUE',
  nextDisabled = false,
  showBack = true,
  showNext = true,
  loading = false,
  testID = 'onboarding-navigation'
}: OnboardingNavigationProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      {showBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          testID={`${testID}-back`}
        >
          <ChevronLeft size={20} color="#CCCCCC" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}
      
      {showNext && (
        <View style={styles.nextContainer}>
          <GradientButton
            title={nextTitle}
            onPress={onNext}
            disabled={nextDisabled}
            loading={loading}
            testID={`${testID}-next`}
            icon={nextTitle === 'CONTINUE' ? <ChevronRight size={20} color="#000" /> : undefined}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  nextContainer: {
    // GradientButton will handle its own styling
  },
});