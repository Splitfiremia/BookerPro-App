import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StatusBar,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { testUsers } from "@/mocks/users";

export default function LandingScreen() {
  const { isDeveloperMode, setDeveloperMode, login, logout, isAuthenticated, user, isLoading } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Log auth state for debugging
  useEffect(() => {
    console.log('Index: Auth state - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user?.email, 'isDeveloperMode:', isDeveloperMode);
  }, [isLoading, isAuthenticated, user, isDeveloperMode]);

  // Emergency fallback - if loading takes too long, show the main interface
  const [emergencyFallback, setEmergencyFallback] = useState<boolean>(false);
  
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.warn('Emergency fallback triggered - bypassing loading state');
      setEmergencyFallback(true);
    }, 2000); // 2 second emergency fallback
    
    return () => clearTimeout(emergencyTimeout);
  }, []);
  
  // Show loading if auth is still being determined (but not for too long)
  if (isLoading && !emergencyFallback) {
    return (
      <ImageBackground
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/wq1viwd4zpq35fb12j801' }}
        style={styles.container}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.logo}>BookerPro</Text>
            <Text style={styles.loadingText}>Loading...</Text>
            <Text style={styles.loadingSubtext}>Initializing app...</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0 || trimmedEmail.length > 254) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  };

  const handleContinue = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    
    // Navigate to login/signup with the email
    router.push({
      pathname: "/(auth)/login",
      params: { 
        email: email.trim(),
        role: "client"
      }
    });
  };

  const handleBrowseProviders = () => {
    // For now, redirect to login since browsing requires authentication
    router.push("/(auth)/login");
  };

  const toggleDeveloperMode = () => {
    setDeveloperMode(!isDeveloperMode);
  };

  const handleTestLogin = async (userType: 'client' | 'provider' | 'owner') => {
    const testUser = testUsers.find(user => user.role === userType);
    if (!testUser) {
      console.error('Test user not found for type:', userType);
      return;
    }

    setIsLoggingIn(true);
    try {
      // Ensure developer mode is enabled for test login
      if (!isDeveloperMode) {
        await setDeveloperMode(true);
      }
      
      console.log('Attempting test login for:', userType, 'with email:', testUser.email);
      await login(testUser.email, testUser.password);
      console.log(`Test login successful for ${userType}`);
      
      // Navigate directly to role-specific home to avoid redirect loops
      console.log(`Redirecting ${userType} to role-specific home`);
      
      try {
        switch (userType) {
          case "client":
            router.replace("/(app)/(client)/(tabs)/home");
            break;
          case "provider":
            router.replace("/(app)/(provider)/(tabs)/schedule");
            break;
          case "owner":
            router.replace("/(app)/(shop-owner)/(tabs)/dashboard");
            break;
          default:
            router.replace("/(app)/(client)/(tabs)/home");
            break;
        }
      } catch (error) {
        console.error('Navigation error during test login:', error);
        // Fallback to auth screen if navigation fails
        router.replace("/(auth)/login");
      }
    } catch (error) {
      console.error('Test login failed:', error);
      // Show error to user
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleTestOnboarding = async (type: 'client' | 'provider' | 'owner') => {
    if (type === 'provider') {
      router.push('/provider-onboarding');
    } else if (type === 'owner') {
      router.push('/shop-owner-onboarding');
    } else if (type === 'client') {
      router.push('/client-onboarding/profile-type');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/wq1viwd4zpq35fb12j801' }}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        {/* Developer Mode Toggle */}
        <TouchableOpacity
          style={styles.developerModeToggle}
          onPress={toggleDeveloperMode}
          testID="developer-mode-toggle"
        >
          <Text style={styles.developerModeText}>
            {isDeveloperMode ? 'DEVELOPER MODE' : 'LIVE MODE'}
          </Text>
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Text style={styles.logo}>BookerPro</Text>
            </View>

            {/* Developer Mode Test Login Section */}
            {isDeveloperMode && (
              <View style={styles.testLoginSection}>
                <Text style={styles.testLoginTitle}>Quick Test Login</Text>
                <Text style={styles.testLoginSubtitle}>Choose a user type to test the app</Text>
                <Text style={styles.testLoginCredentials}>Available test users: client@test.com, provider@test.com, owner@test.com</Text>
                
                <Text style={styles.testSectionTitle}>Test Login</Text>
                <View style={styles.testButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.testLoginButton, styles.clientButton, isLoggingIn && styles.disabledButton]}
                    onPress={() => handleTestLogin('client')}
                    disabled={isLoggingIn}
                    testID="test-client-login"
                  >
                    <Text style={styles.testLoginButtonText}>👤 Client</Text>
                    <Text style={styles.testLoginButtonSubtext}>
                      {isLoggingIn ? 'Logging in...' : 'Book services'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.testLoginButton, styles.providerButton, isLoggingIn && styles.disabledButton]}
                    onPress={() => handleTestLogin('provider')}
                    disabled={isLoggingIn}
                    testID="test-provider-login"
                  >
                    <Text style={styles.testLoginButtonText}>✂️ Provider</Text>
                    <Text style={styles.testLoginButtonSubtext}>
                      {isLoggingIn ? 'Logging in...' : 'Manage bookings'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.testLoginButton, styles.ownerButton, isLoggingIn && styles.disabledButton]}
                    onPress={() => handleTestLogin('owner')}
                    disabled={isLoggingIn}
                    testID="test-owner-login"
                  >
                    <Text style={styles.testLoginButtonText}>🏪 Owner</Text>
                    <Text style={styles.testLoginButtonSubtext}>
                      {isLoggingIn ? 'Logging in...' : 'Manage shop'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.testSectionTitle}>Test Onboarding</Text>
                <View style={styles.testButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.testLoginButton, styles.clientButton]}
                    onPress={() => handleTestOnboarding('client')}
                    testID="test-client-signup"
                  >
                    <Text style={styles.testLoginButtonText}>👤 Client</Text>
                    <Text style={styles.testLoginButtonSubtext}>Signup flow</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.testLoginButton, styles.providerButton]}
                    onPress={() => handleTestOnboarding('provider')}
                    testID="test-provider-onboarding"
                  >
                    <Text style={styles.testLoginButtonText}>✂️ Provider</Text>
                    <Text style={styles.testLoginButtonSubtext}>Onboarding flow</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.testLoginButton, styles.ownerButton]}
                    onPress={() => handleTestOnboarding('owner')}
                    testID="test-owner-onboarding"
                  >
                    <Text style={styles.testLoginButtonText}>🏪 Owner</Text>
                    <Text style={styles.testLoginButtonSubtext}>Onboarding flow</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => router.push('/onboarding-status')}
                  testID="onboarding-status-button"
                >
                  <Text style={styles.statusButtonText}>View Onboarding Status</Text>
                </TouchableOpacity>
                
                {/* Clear stored data button */}
                {(isAuthenticated || user) && (
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: 'rgba(255, 68, 68, 0.1)', borderColor: '#FF4444' }]}
                    onPress={async () => {
                      await logout();
                      console.log('Cleared stored authentication data');
                    }}
                    testID="clear-data-button"
                  >
                    <Text style={[styles.statusButtonText, { color: '#FF4444' }]}>Clear Stored Data & Logout</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Show logout option if user is authenticated but not in developer mode */}
            {isAuthenticated && user && !isDeveloperMode && (
              <View style={styles.loggedInSection}>
                <Text style={styles.loggedInText}>You are logged in as {user.email}</Text>
                <Text style={styles.loggedInSubtext}>Role: {user.role}</Text>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={async () => {
                    await logout();
                    console.log('User logged out');
                  }}
                  testID="logout-button"
                >
                  <Text style={styles.logoutButtonText}>LOGOUT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.continueToAppButton}
                  onPress={() => {
                    // Navigate to role-specific home
                    try {
                      switch (user.role) {
                        case "client":
                          router.replace("/(app)/(client)/(tabs)/home");
                          break;
                        case "provider":
                          router.replace("/(app)/(provider)/(tabs)/schedule");
                          break;
                        case "owner":
                          router.replace("/(app)/(shop-owner)/(tabs)/dashboard");
                          break;
                        default:
                          router.replace("/(app)/(client)/(tabs)/home");
                          break;
                      }
                    } catch (error) {
                      console.error('Navigation error:', error);
                      // Fallback to auth screen if navigation fails
                      router.replace("/(auth)/login");
                    }
                  }}
                  testID="continue-to-app-button"
                >
                  <Text style={styles.continueToAppButtonText}>CONTINUE TO APP</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Content Section - only show if not authenticated */}
            {!isAuthenticated && (
              <View style={styles.contentSection}>
                <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[styles.emailInput, emailError && styles.emailInputError]}
                    placeholder="Enter your email to log in or sign up"
                    placeholderTextColor="#999999"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="email-input"
                  />
                </View>
                {emailError && (
                  <Text style={styles.errorText}>{emailError}</Text>
                )}

                {/* Quick Test Credentials */}
                <View style={styles.quickTestContainer}>
                  <Text style={styles.quickTestLabel}>Quick test:</Text>
                  <View style={styles.quickTestButtons}>
                    <TouchableOpacity
                      style={styles.quickTestButton}
                      onPress={() => setEmail('client@test.com')}
                      testID="quick-test-client"
                    >
                      <Text style={styles.quickTestButtonText}>Client</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickTestButton}
                      onPress={() => setEmail('provider@test.com')}
                      testID="quick-test-provider"
                    >
                      <Text style={styles.quickTestButtonText}>Provider</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickTestButton}
                      onPress={() => setEmail('owner@test.com')}
                      testID="quick-test-owner"
                    >
                      <Text style={styles.quickTestButtonText}>Owner</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinue}
                  testID="continue-button"
                >
                  <Text style={styles.continueButtonText}>CONTINUE</Text>
                </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <TouchableOpacity
                style={styles.browseButton}
                onPress={handleBrowseProviders}
                testID="browse-providers-button"
              >
                <Text style={styles.browseButtonText}>BROWSE PROVIDERS</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  developerModeToggle: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1000,
  },
  developerModeText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 64,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  testLoginSection: {
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  testLoginTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  testSectionTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  testLoginSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 8,
  },
  testLoginCredentials: {
    fontSize: 12,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  testButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  testLoginButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  clientButton: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    borderColor: "#007BFF",
  },
  providerButton: {
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    borderColor: "#28A745",
  },
  ownerButton: {
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    borderColor: "#DC3545",
  },
  testLoginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  testLoginButtonSubtext: {
    color: "#CCCCCC",
    fontSize: 11,
    textAlign: "center",
  },
  statusButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  contentSection: {
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    marginBottom: 60,
  },
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 12,
  },
  emailInput: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: '#666666',
    paddingVertical: 8,
    fontSize: 16,
    color: "#FFFFFF",
  },
  emailInputError: {
    borderWidth: 2,
    borderColor: "#FF4444",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  continueButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  bottomSection: {
    paddingBottom: 40,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#FFFFFF",
  },
  orText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 20,
    letterSpacing: 2,
  },
  browseButton: {
    alignItems: "center",
  },
  browseButtonText: {
    color: "#C8A574",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  quickTestContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  quickTestLabel: {
    color: "#999999",
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  quickTestButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  quickTestButton: {
    flex: 1,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  quickTestButtonText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loggedInSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  loggedInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loggedInSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
    minWidth: 120,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  continueToAppButton: {
    backgroundColor: '#28A745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  continueToAppButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});