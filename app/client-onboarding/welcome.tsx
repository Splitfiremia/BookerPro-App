import React, { useState } from 'react';
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
import { User, Store, ChevronLeft } from 'lucide-react-native';

export default function WelcomeScreen() {
  const [showWorkSelection, setShowWorkSelection] = useState<boolean>(false);

  const handleGetStarted = () => {
    setShowWorkSelection(true);
  };

  const handleWorkSelection = (worksForShop: boolean) => {
    if (worksForShop) {
      router.push('/client-onboarding/search?type=shop' as any);
    } else {
      router.push('/client-onboarding/search?type=independent' as any);
    }
  };

  const handleEnterCode = () => {
    // Handle referral code entry
    console.log('Enter code pressed');
  };

  if (showWorkSelection) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.selectionContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              testID="welcome-back-button"
            >
              <ChevronLeft size={20} color="#CCCCCC" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>GET STARTED</Text>
              <View style={styles.progressDots}>
                <View style={[styles.dot, styles.activeDot]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
            
            <View style={styles.selectionMain}>
              <Text style={styles.selectionTitle}>Do you work for a shop?</Text>
              <Text style={styles.selectionSubtitle}>
                Let us know if you&apos;re employed by a shop or work independently.
              </Text>
              
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={[styles.workOption, styles.shopOption]}
                  onPress={() => handleWorkSelection(true)}
                >
                  <View style={styles.optionIconContainer}>
                    <Store size={32} color="#000000" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Work for a Shop</Text>
                    <Text style={styles.optionDescription}>I&apos;m employed by a barbershop or salon</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.workOption, styles.independentOption]}
                  onPress={() => handleWorkSelection(false)}
                >
                  <View style={styles.optionIconContainer}>
                    <User size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Independent</Text>
                    <Text style={styles.optionDescription}>I work independently or freelance</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>ELEVATE YOUR HAIRCUT EXPERIENCE</Text>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.getStartedButton}
                  onPress={handleGetStarted}
                >
                  <Text style={styles.getStartedButtonText}>GET STARTED</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.enterCodeButton}
                  onPress={handleEnterCode}
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  selectionContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    marginTop: 10,
  },
  backText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  activeDot: {
    backgroundColor: '#FFD700',
  },
  selectionMain: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  selectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  selectionSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 20,
  },
  workOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  shopOption: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  independentOption: {
    backgroundColor: 'transparent',
    borderColor: '#333333',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 1,
  },
  buttonContainer: {
    gap: 16,
  },
  getStartedButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
  enterCodeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  enterCodeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});