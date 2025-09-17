import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  const indicators = Array.from({ length: totalSteps }, (_, index) => {
    const isActive = index + 1 <= currentStep;
    return (
      <View 
        key={index} 
        style={[
          styles.indicator, 
          isActive ? styles.activeIndicator : styles.inactiveIndicator
        ]}
        testID={`progress-indicator-${index}`}
      />
    );
  });

  return (
    <View style={styles.container} testID="onboarding-progress">
      {indicators}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FF5A5F',
    width: 24,
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 90, 95, 0.3)',
    width: 8,
  },
});