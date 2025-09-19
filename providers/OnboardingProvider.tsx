import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  locationPermissionGranted: boolean;
  notificationPermissionGranted: boolean;
  currentStep: number;
  totalSteps: number;
  serviceCategory: string | null;
  userStylePreferences: string[];
}

// Using createContextHook to create the provider and hook
export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [state, setState] = useState<OnboardingState>({
    hasCompletedOnboarding: true, // Set to true to allow client onboarding to run independently
    locationPermissionGranted: false,
    notificationPermissionGranted: false,
    currentStep: 1,
    totalSteps: 5,
    serviceCategory: null,
    userStylePreferences: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false); // Use useState for consistency

  // Load onboarding state on mount with timeout
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        // Quick timeout to prevent hanging
        const loadWithTimeout = (promise: Promise<any>, timeout: number = 200) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ]);
        };
        
        const storedState = await loadWithTimeout(AsyncStorage.getItem('onboardingState'));
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          setState(prevState => ({
            ...prevState,
            ...parsedState
          }));
        }
      } catch (error) {
        console.log('OnboardingProvider: Using default state due to timeout/error');
      }
    };

    loadOnboardingState();
    
    // Fallback timeout
    const fallbackTimeout = setTimeout(() => {
      console.warn('OnboardingProvider: Fallback timeout triggered');
    }, 400);
    
    return () => clearTimeout(fallbackTimeout);
  }, []);

  // Save onboarding state when needed
  const saveOnboardingState = useCallback(async () => {
    try {
      // Save onboarding state
      await AsyncStorage.setItem('onboardingState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  }, [state]);

  const nextStep = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      currentStep: Math.min(prevState.currentStep + 1, prevState.totalSteps)
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const previousStep = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      currentStep: Math.max(prevState.currentStep - 1, 1)
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const completeOnboarding = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      hasCompletedOnboarding: true
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const resetOnboarding = useCallback(() => {
    setState({
      hasCompletedOnboarding: false,
      locationPermissionGranted: false,
      notificationPermissionGranted: false,
      currentStep: 1,
      totalSteps: 5,
      serviceCategory: null,
      userStylePreferences: []
    });
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setServiceCategory = useCallback((category: string) => {
    setState(prevState => ({
      ...prevState,
      serviceCategory: category
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setUserStylePreferences = useCallback((styles: string[]) => {
    setState(prevState => ({
      ...prevState,
      userStylePreferences: styles
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  // Modified to use native permission request without explicit UI
  const requestLocationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        // Web doesn't support the same permission model
        setState(prevState => ({
          ...prevState,
          locationPermissionGranted: true
        }));
        return true;
      }
      
      // This will trigger the native permission dialog
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      
      setState(prevState => ({
        ...prevState,
        locationPermissionGranted: granted
      }));
      // Save after state update
      setTimeout(saveOnboardingState, 0);
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }, [saveOnboardingState]);

  const requestNotificationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        // Web notification permission handling
        try {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';
            
            setState(prevState => ({
              ...prevState,
              notificationPermissionGranted: granted
            }));
            // Save after state update
            setTimeout(saveOnboardingState, 0);
            
            return granted;
          }
        } catch (error) {
          console.error('Error requesting web notification permission:', error);
        }
        return false;
      } else {
        // For mobile, we'll just set the flag since we don't have actual permission API in this example
        // In a real app, you would use expo-notifications requestPermissionsAsync()
        setState(prevState => ({
          ...prevState,
          notificationPermissionGranted: true
        }));
        // Save after state update
        setTimeout(saveOnboardingState, 0);
        return true;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [saveOnboardingState]);

  return useMemo(() => ({
    ...state,
    isLoading,
    nextStep,
    previousStep,
    completeOnboarding,
    resetOnboarding,
    requestLocationPermission,
    requestNotificationPermission,
    setServiceCategory,
    setUserStylePreferences
  }), [
    state, 
    isLoading, 
    nextStep, 
    previousStep, 
    completeOnboarding, 
    resetOnboarding, 
    requestLocationPermission,
    requestNotificationPermission,
    setServiceCategory,
    setUserStylePreferences
  ]);
});