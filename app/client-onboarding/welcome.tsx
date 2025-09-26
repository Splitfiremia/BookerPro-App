import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/client-onboarding/search' as any);
  };

  const handleEnterCode = () => {
    console.log('WelcomeScreen: enter code');
  };

  return (
    <View style={styles.root} testID="client-onboarding-welcome-root">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <View style={styles.glassTitle}>
                  <Text style={styles.title}>ELEVATE YOUR HAIRCUT EXPERIENCE</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.getStartedButton}
                  onPress={handleGetStarted}
                  testID="welcome-get-started"
                >
                  <Text style={styles.getStartedButtonText}>GET STARTED</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.enterCodeButton}
                  onPress={handleEnterCode}
                  testID="welcome-enter-code"
                >
                  <Text style={styles.enterCodeButtonText}>ENTER CODE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  glassTitle: {
    ...GLASS_STYLES.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  buttonContainer: {
    gap: SPACING.md,
  },
  getStartedButton: {
    ...GLASS_STYLES.button.primary,
    paddingVertical: SPACING.lg,
  },
  getStartedButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  enterCodeButton: {
    ...GLASS_STYLES.button.secondary,
    paddingVertical: SPACING.lg,
  },
  enterCodeButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
});