import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { FormInput } from "@/components/FormInput";
import { GradientButton } from "@/components/GradientButton";
import { validateForm, ValidationRules, ValidationErrors, required, minLength } from "@/utils/validation";
import { testUsers } from "@/mocks/users";
import { COLORS, FONTS } from "@/constants/theme";

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const routerInstance = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  
  // Pre-fill password if email matches a test user
  const getTestPassword = (email: string) => {
    const testUser = testUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    return testUser ? testUser.password : "";
  };

  const initialEmail = (params.email as string) || "";
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: getTestPassword(initialEmail),
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validation rules
  const validationRules: ValidationRules = {
    email: [required],
    password: [required, minLength(6)],
  };

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Regular field validation
    const fieldError = validateForm(newFormData, { [field]: validationRules[field] });
    setErrors({ ...errors, [field]: fieldError[field] });
  };

  const handleLogin = async () => {
    // Validate all fields
    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);

    // Check if there are any errors
    const hasErrors = Object.values(formErrors).some(error => error !== null);
    if (hasErrors) return;

    try {
      setIsSubmitting(true);
      const email = formData.email.trim();
      
      // Check if this is a test user and provide a helpful error message
      const isTestUser = testUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (isTestUser) {
        // For test users, verify the password matches
        const testUser = testUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
        if (testUser && formData.password !== testUser.password) {
          throw new Error(`Invalid credentials. Available test users: ${testUsers.map(u => u.email).join(',')}`);  
        }
      }
      
      // Login will trigger the redirection in the root layout
      await login(email, formData.password);
      
      // Navigate to root and let the root layout handle role-based redirection
      // This ensures onboarding checks are properly performed
      console.log('Login successful, redirecting to root for proper routing');
      router.replace("/");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials. Please check your email and password.";
      setErrors({ password: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = () => {
    router.push({
      pathname: "/(auth)/signup",
      params: { 
        email: formData.email,
        role: params.role || "client"
      }
    });
  };

  // Update password when email changes from params
  useEffect(() => {
    if (params.email) {
      const email = params.email as string;
      const password = getTestPassword(email);
      setFormData(prev => ({ ...prev, email, password }));
    }
  }, [params.email]);

  // Animation for smooth transitions
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [animatedValue]);
  
  // Prevent navigation flashes by setting a minimum loading time
  useEffect(() => {
    if (isSubmitting) {
      const minLoadingTime = setTimeout(() => {}, 500); // Ensure loading state shows for at least 500ms
      return () => clearTimeout(minLoadingTime);
    }
  }, [isSubmitting]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => {
            if (routerInstance.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Animated.View style={[styles.animatedContainer, { opacity: animatedValue }]}>
            <View style={styles.logoContainer}>
              <Image
                testID="login-logo"
                source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/0sulh1gnicqeoihtkeijs" }}
                style={styles.logoImage}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="A2Z Calendar Logo"
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </Animated.View>

          <Animated.View style={[styles.animatedContainer, { 
            opacity: animatedValue, 
            transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] 
          }]}>
            <FormInput
              label="EMAIL"
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              testID="login-email-input"
            />
          </Animated.View>

          <Animated.View style={[styles.animatedContainer, { 
            opacity: animatedValue, 
            transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] 
          }]}>
            <FormInput
              label="PASSWORD"
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
              testID="login-password-input"
            />
          </Animated.View>

          <Animated.View 
            style={[styles.animatedContainer, { 
              opacity: animatedValue, 
              transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] 
            }]}
          >
            <GradientButton
              title="SIGN IN"
              onPress={handleLogin}
              loading={isSubmitting}
              disabled={!formData.email || !formData.password}
              testID="login-button"
              style={styles.loginButton}
            />
          </Animated.View>

          <Animated.View 
            style={[styles.animatedContainer, { 
              opacity: animatedValue, 
              transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] 
            }]}
          >
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    opacity: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 30,
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  logoImage: {
    width: '90%',
    maxWidth: 450,
    height: undefined,
    aspectRatio: 340/130,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 30,
    textAlign: "center",
  },
  loginButton: {
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  signupText: {
    fontSize: 16,
    color: "#999",
  },
  signupLink: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "bold",
    fontFamily: FONTS.bold,
  },
});