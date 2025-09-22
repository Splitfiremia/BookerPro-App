import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    bio,
    profileImage,
    setBio,
    setProfileImage,
    nextStep 
  } = useProviderOnboarding();

  const [bioText, setBioText] = useState(bio || '');
  const [imageUri, setImageUri] = useState<string | null>(profileImage);
  const [error, setError] = useState('');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError('');
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Camera permission is required to take a photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError('');
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to take photo. Please try again.');
    }
  };

  const handleContinue = () => {
    // Save profile data
    setBio(bioText.trim());
    if (imageUri) {
      setProfileImage(imageUri);
    }
    
    nextStep();
    router.replace('availability');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>GET STARTED</Text>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>Build your profile</Text>
          <Text style={styles.description}>
            Add a profile photo and write a bio to help clients get to know you.
          </Text>

          <View style={styles.profileImageContainer}>
            <View style={styles.imageContainer}>
              {imageUri && imageUri.trim() !== '' ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Upload size={40} color="#666666" />
                </View>
              )}
            </View>

            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={pickImage}
                testID="pick-image-button"
              >
                <Upload size={20} color="#D4AF37" />
                <Text style={styles.imageButtonText}>Upload Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={takePhoto}
                testID="take-photo-button"
              >
                <Camera size={20} color="#D4AF37" />
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.bioContainer}>
            <Text style={styles.inputLabel}>ABOUT YOU</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Tell clients about your experience, specialties, and style..."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={bioText}
              onChangeText={setBioText}
              maxLength={500}
              testID="bio-input"
            />
            <Text style={styles.charCount}>{bioText.length}/500</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="CONTINUE"
            onPress={handleContinue}
            testID="continue-button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
  },
  imageButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  bioContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  bioInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});