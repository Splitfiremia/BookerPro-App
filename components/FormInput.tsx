import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react-native";
import { COLORS, FONTS } from "@/constants/theme";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  secureTextEntry?: boolean;
  testID?: string;
  isValid?: boolean;
  onBlur?: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  secureTextEntry,
  testID,
  isValid,
  onBlur,
  editable = true,
  accessibilityLabel,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const errorOpacity = React.useRef(new Animated.Value(0)).current;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  React.useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: error ? 1 : 0,
      duration: 200,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [error, errorOpacity]);

  return (
    <View style={styles.inputContainer} testID={testID}>
      <Text style={[styles.label, !editable && styles.labelDisabled]} accessibilityLabel={`${label} label`}>
        {label}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isFocused ? styles.inputFocused : null,
            error ? styles.inputError : null,
            isValid && !error ? styles.inputValid : null,
            secureTextEntry ? styles.passwordInput : null,
            !editable ? styles.inputDisabled : null,
          ]}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          editable={editable}
          accessibilityLabel={accessibilityLabel ?? `${label} input`}
          accessibilityHint={secureTextEntry ? "Double tap the eye icon to toggle password visibility" : undefined}
          accessibilityState={{ disabled: !editable }}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
            disabled={!editable}
            testID={testID ? `${testID}-toggle-visibility` : undefined}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff color="#9CA3AF" size={20} />
            ) : (
              <Eye color="#9CA3AF" size={20} />
            )}
          </TouchableOpacity>
        )}
        {!!error && (
          <View style={styles.statusIcon}>
            <AlertCircle size={18} color="#EF4444" />
          </View>
        )}
        {isValid && !error && (
          <View style={styles.statusIcon}>
            <CheckCircle2 size={18} color="#10B981" />
          </View>
        )}
      </View>
      <Animated.View
        style={[styles.errorContainer, { opacity: errorOpacity }]}
        accessibilityLiveRegion={Platform.OS === "android" ? "polite" : undefined}
      >
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 1,
    fontFamily: FONTS.regular,
  },
  labelDisabled: {
    color: "#555",
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    fontFamily: FONTS.regular,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputValid: {
    borderColor: "#10B981",
  },
  inputDisabled: {
    backgroundColor: "#0f0f0f",
    borderColor: "#222",
    color: "#777",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
  },
  statusIcon: {
    position: "absolute",
    right: 16,
  },
  errorContainer: {
    minHeight: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
});