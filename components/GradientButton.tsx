import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/theme";

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  icon?: React.ReactElement;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  testID,
  icon,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      disabled={isDisabled}
      testID={testID}
      {...props}
    >
      <LinearGradient
        colors={
          isDisabled
            ? ["#333", "#333"]
            : [COLORS.primary, COLORS.primary]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <View style={styles.content}>
            <Text style={styles.text}>{title}</Text>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: 20,
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    height: 56,
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Lufea-Bold",
  },
  iconContainer: {
    marginLeft: 8,
  },
});