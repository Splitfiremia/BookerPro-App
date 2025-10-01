import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { testUsers } from "@/mocks/users";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@/constants/theme";

export default function LandingScreen() {
  const { isDeveloperMode, setDeveloperMode, login, logout, isAuthenticated, user, isInitialized } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  
  // Add startup logging
  console.log('LandingScreen: Component rendering, isInitialized:', isInitialized);
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('Index: Auth state - isAuthenticated:', isAuthenticated, 'user:', user?.email, 'isDeveloperMode:', isDeveloperMode, 'isInitialized:', isInitialized);
  }, [isAuthenticated, user, isDeveloperMode, isInitialized]);

  useEffect(() => {
    let isMounted = true;
    
    if (isInitialized && isAuthenticated && user) {
      console.log('Index: Auto-redirecting authenticated user to role-specific dashboard');
      
      const redirectToRoleDashboard = () => {
        if (!isMounted) return;
        
        try {
          if (!isAuthenticated || !user) {
            console.log('Index: User no longer authenticated, skipping redirect');
            return;
          }
          
          if (!user.role || !user.email) {
            console.log('Index: Invalid user object, skipping redirect');
            return;
          }
          
          console.log('Index: Redirecting user with role:', user.role);
          
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
              console.warn('Unknown user role:', user.role);
              router.replace("/(app)/(client)/(tabs)/home");
              break;
          }
        } catch (error) {
          console.error('Auto-redirect navigation error:', error);
        }
      };
      
      const timeoutId = setTimeout(redirectToRoleDashboard, 800);
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [isInitialized, isAuthenticated, user]);

  const validateEmail = useCallback((email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0 || trimmedEmail.length > 254) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  }, []);

  const handleContinue = useCallback(() => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    
    router.push({
      pathname: "/(auth)/login",
      params: { 
        email: email.trim(),
        role: "client"
      }
    });
  }, [email, validateEmail]);

  const handleBrowseProviders = useCallback(() => {
    router.push("/(auth)/login");
  }, []);

  const toggleDeveloperMode = useCallback(() => {
    setDeveloperMode(!isDeveloperMode);
  }, [isDeveloperMode, setDeveloperMode]);

  const handleTestLogin = useCallback(async (userType: 'client' | 'provider' | 'owner') => {
    if (isLoggingIn) return;
    
    const testUser = testUsers.find(user => user.role === userType);
    if (!testUser) {
      console.error('Test user not found for type:', userType);
      alert('Test user configuration error. Please check developer settings.');
      return;
    }

    setIsLoggingIn(true);
    try {
      if (!isDeveloperMode) {
        await setDeveloperMode(true);
      }
      
      console.log('Attempting test login for:', userType, 'with email:', testUser.email);
      const loginResult = await login(testUser.email, testUser.password);
      
      if (!loginResult.success) {
        throw new Error(loginResult.error || 'Login failed');
      }
      
      console.log(`Test login successful for ${userType}`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const routes = {
        client: "/(app)/(client)/(tabs)/home",
        provider: "/(app)/(provider)/(tabs)/schedule", 
        owner: "/(app)/(shop-owner)/(tabs)/dashboard"
      };
      
      const route = routes[userType] || routes.client;
      router.replace(route);
      
    } catch (error) {
      console.error('Test login failed:', error);
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoggingIn(false);
    }
  }, [isLoggingIn, isDeveloperMode, setDeveloperMode, login]);
  
  const handleTestOnboarding = useCallback(async (type: 'client' | 'provider' | 'owner') => {
    if (type === 'provider') {
      router.push('/provider-onboarding');
    } else if (type === 'owner') {
      router.push('/shop-owner-onboarding');
    } else if (type === 'client') {
      router.push('/client-onboarding/profile-type');
    }
  }, []);

  const shouldShowContent = useMemo(() => {
    return !isAuthenticated && !isLoggingIn;
  }, [isAuthenticated, isLoggingIn]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (emailError) setEmailError(null);
  }, [emailError]);

  const handleLogout = useCallback(async () => {
    const result = await logout();
    if (result.success) {
      console.log('User logged out');
    } else {
      console.error('Logout failed:', result.error);
    }
  }, [logout]);

  const handleContinueToApp = useCallback(() => {
    try {
      switch (user?.role) {
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
      router.replace("/(auth)/login");
    }
  }, [user]);

  const handleClearData = useCallback(async () => {
    const result = await logout();
    if (result.success) {
      console.log('Cleared stored authentication data');
    } else {
      console.error('Failed to clear data:', result.error);
    }
  }, [logout]);

  return (
    <View style={styles.container}>
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                    onPress={handleClearData}
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
                  onPress={handleLogout}
                  testID="logout-button"
                >
                  <Text style={styles.logoutButtonText}>LOGOUT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.continueToAppButton}
                  onPress={handleContinueToApp}
                  testID="continue-to-app-button"
                >
                  <Text style={styles.continueToAppButtonText}>CONTINUE TO APP</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Content Section - only show if not authenticated */}
            {shouldShowContent && (
              <View style={styles.contentSection}>
                <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[styles.emailInput, emailError && styles.emailInputError]}
                    placeholder="Enter your email to log in or sign up"
                    placeholderTextColor="#999999"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="email-input"
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address to continue to login or signup"
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
                  accessibilityRole="button"
                  accessibilityLabel="Continue to login"
                  accessibilityHint="Navigates to the login screen with your entered email"
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  developerModeToggle: {
    position: "absolute",
    top: 50,
    right: SPACING.md,
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    zIndex: 1000,
  },
  developerModeText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.xs,
    fontWeight: "bold" as const,
    letterSpacing: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
  },
  logoSection: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: SPACING.md + 4,
  },
  logo: {
    fontSize: 64,
    fontWeight: '300' as const,
    fontStyle: 'italic' as const,
    color: COLORS.white,
    textAlign: 'center' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  testLoginSection: {
    paddingHorizontal: 0,
    paddingVertical: SPACING.md + 4,
    marginHorizontal: 0,
  },
  testLoginTitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginBottom: SPACING.sm,
  },
  testSectionTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm + 4,
  },
  testLoginSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    textAlign: "center" as const,
    marginBottom: SPACING.sm,
  },
  testLoginCredentials: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    textAlign: "center" as const,
    marginBottom: SPACING.md,
    fontWeight: "500" as const,
  },
  testButtonsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: SPACING.lg,
  },
  testLoginButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.sm + 4,
    alignItems: "center" as const,
    borderWidth: 2,
    minHeight: 80,
  },
  clientButton: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderColor: COLORS.info,
  },
  providerButton: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: COLORS.success,
  },
  ownerButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: COLORS.error,
  },
  testLoginButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: "bold" as const,
    marginBottom: SPACING.xs,
    textAlign: "center" as const,
  },
  testLoginButtonSubtext: {
    color: COLORS.lightGray,
    fontSize: 11,
    textAlign: "center" as const,
  },
  statusButton: {
    alignItems: "center" as const,
    paddingVertical: SPACING.sm + 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statusButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: "600" as const,
  },
  contentSection: {
    flex: 1,
    justifyContent: "center" as const,
  },
  formContainer: {
    marginBottom: 60,
  },
  inputContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md + 4,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.input.label,
    fontWeight: "500" as const,
    marginBottom: SPACING.sm,
  },
  emailInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.input.border,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: 0,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  emailInputError: {
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
    textAlign: "center" as const,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    alignItems: "center" as const,
    marginTop: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  bottomSection: {
    paddingBottom: 40,
  },
  dividerContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.input.border,
  },
  orText: {
    color: COLORS.input.placeholder,
    fontSize: FONT_SIZES.sm,
    fontWeight: "500" as const,
    marginHorizontal: SPACING.md,
  },
  browseButton: {
    alignItems: "center" as const,
  },
  browseButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  quickTestContainer: {
    marginTop: SPACING.sm + 4,
    marginBottom: SPACING.sm,
  },
  quickTestLabel: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.sm,
    textAlign: "center" as const,
  },
  quickTestButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: SPACING.sm,
  },
  quickTestButton: {
    flex: 1,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm + 4,
    alignItems: "center" as const,
  },
  quickTestButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: "600" as const,
  },

  disabledButton: {
    opacity: 0.5,
  },
  loggedInSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: SPACING.sm + 4,
    padding: SPACING.md + 4,
    marginBottom: SPACING.md + 4,
    alignItems: 'center' as const,
  },
  loggedInText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
    marginBottom: SPACING.sm,
    textAlign: 'center' as const,
  },
  loggedInSubtext: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md + 4,
    textAlign: 'center' as const,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm + 4,
    minWidth: 120,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  },
  continueToAppButton: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.lg,
    minWidth: 120,
  },
  continueToAppButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  },
  loadingText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.md,
    textAlign: 'center' as const,
  },
});