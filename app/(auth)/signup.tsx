import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const params = useLocalSearchParams();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  
  const [formData, setFormData] = useState({
    email: (params.email as string) || '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignup = async () => {
    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.phone || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Register the user
      await register({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        role: 'client'
      }, formData.password);
      
      // Navigate to profile type selection after successful registration
      router.replace('/client-onboarding/profile-type');
    } catch (err) {
      console.error('Signup error:', err);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/g3qm3ar0sgtd2932ma5m0' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>SIGN UP</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => {
                setActiveTab('login');
                router.replace({
                  pathname: '/(auth)/login',
                  params: { email: formData.email }
                });
              }}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>LOG IN</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({...formData, firstName: text})}
                  placeholder="First"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.nameField}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({...formData, lastName: text})}
                  placeholder="Last"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              placeholder="(555) 123-4567"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry
            />

            {/* SMS Opt-in */}
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setSmsOptIn(!smsOptIn)}
            >
              <View style={[styles.checkbox, smsOptIn && styles.checkboxChecked]}>
                {smsOptIn && <Ionicons name="checkmark" size={16} color="#000" />}
              </View>
              <Text style={styles.checkboxText}>
                By checking this box, you agree to receive SMS appointment updates from theCut. 
                Message & data rates may apply. Message frequency varies. Email support@thecut.co 
                for help, STOP to cancel.
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By signing up, I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isSubmitting}
            >
              <Text style={styles.signupButtonText}>
                {isSubmitting ? 'CREATING...' : 'SIGN UP'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 280,
    height: 160,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingBottom: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 16,
  },
  nameField: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#666666',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  termsLink: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
});