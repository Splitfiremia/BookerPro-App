import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";

export function ModeIndicator() {
  const { isDeveloperMode } = useAuth();

  // Always render a View, but conditionally set its contents
  return isDeveloperMode ? (
    <View style={styles.container}>
      <View style={styles.indicator}>
        <Text style={styles.text}>DEVELOPER MODE</Text>
      </View>
    </View>
  ) : null; // Still return null when not in developer mode, but after all hooks are called
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 999,
  },
  indicator: {
    backgroundColor: `${COLORS.primary}CC`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  text: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: FONTS.bold,
  },
});