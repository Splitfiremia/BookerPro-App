import React, { useState, useRef, useCallback } from 'react';
import { View, PanResponder, Animated, StyleSheet, Platform } from 'react-native';
import { COLORS } from '@/constants/theme';

interface CustomSliderProps {
  minimumValue: number;
  maximumValue: number;
  value: number;
  step?: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
  testID?: string;
}

export function CustomSlider({
  minimumValue,
  maximumValue,
  value,
  step = 1,
  onValueChange,
  minimumTrackTintColor = COLORS.primary,
  maximumTrackTintColor = COLORS.gray,
  thumbTintColor = COLORS.primary,
  style,
  testID
}: CustomSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const animatedValue = useRef(new Animated.Value(value)).current;
  const [currentValue, setCurrentValue] = useState(value);

  const getValueFromPosition = (x: number) => {
    const percentage = Math.max(0, Math.min(1, x / sliderWidth));
    const rawValue = minimumValue + percentage * (maximumValue - minimumValue);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(minimumValue, Math.min(maximumValue, steppedValue));
  };

  const getPositionFromValue = useCallback((val: number) => {
    const percentage = (val - minimumValue) / (maximumValue - minimumValue);
    return percentage * sliderWidth;
  }, [minimumValue, maximumValue, sliderWidth]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (Platform.OS === 'web') {
        const x = evt.nativeEvent.locationX;
        const newValue = getValueFromPosition(x);
        setCurrentValue(newValue);
        onValueChange(newValue);
        
        Animated.timing(animatedValue, {
          toValue: getPositionFromValue(newValue),
          duration: 0,
          useNativeDriver: false,
        }).start();
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (sliderWidth === 0) return;
      
      let x;
      if (Platform.OS === 'web') {
        x = evt.nativeEvent.locationX;
      } else {
        x = gestureState.moveX - gestureState.x0 + getPositionFromValue(currentValue);
      }
      
      const newValue = getValueFromPosition(x);
      setCurrentValue(newValue);
      onValueChange(newValue);
      
      Animated.timing(animatedValue, {
        toValue: getPositionFromValue(newValue),
        duration: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  React.useEffect(() => {
    setCurrentValue(value);
    if (sliderWidth > 0) {
      Animated.timing(animatedValue, {
        toValue: getPositionFromValue(value),
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [value, sliderWidth, animatedValue, getPositionFromValue]);

  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, sliderWidth || 1],
    outputRange: [0, sliderWidth || 1],
    extrapolate: 'clamp',
  });

  const trackFillWidth = animatedValue.interpolate({
    inputRange: [0, sliderWidth || 1],
    outputRange: [0, sliderWidth || 1],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.container, style]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setSliderWidth(width - 20); // Account for thumb size
      }}
      testID={testID}
    >
      <View style={styles.trackContainer} {...panResponder.panHandlers}>
        {/* Background track */}
        <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]} />
        
        {/* Fill track */}
        <Animated.View
          style={[
            styles.trackFill,
            {
              backgroundColor: minimumTrackTintColor,
              width: trackFillWidth,
            },
          ]}
        />
        
        {/* Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: thumbTintColor,
              transform: [{ translateX: thumbPosition }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 10,
    right: 10,
  },
  trackFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 10,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    left: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});