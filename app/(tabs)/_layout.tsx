import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { Tabs, router } from "expo-router";
import { Search, Calendar, User, Heart, LogOut, Home, BarChart3, Settings } from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { COLORS } from "@/constants/theme";

export default function TabLayout() {
  const { user, logout } = useAuth();
  const isProvider = user?.role === "provider" || user?.role === "owner";
  
  const handleLogout = () => {
    logout();
    router.replace("/");
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: "#1a1a1a",
          borderTopWidth: 1,
        },
        headerShown: true,
        headerTitle: () => (
          <Image
            testID="header-logo"
            source={{
              uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/0sulh1gnicqeoihtkeijs",
            }}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="A2Z Calendar Logo"
          />
        ),
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: COLORS.background },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut color="#FF4444" size={24} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: isProvider ? "Dashboard" : "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: isProvider ? "Calendar" : "Explore",
          tabBarIcon: ({ color }) => isProvider ? <Calendar color={color} size={24} /> : <Search color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: isProvider ? "Clients" : "Saved",
          tabBarIcon: ({ color }) => isProvider ? <User color={color} size={24} /> : <Heart color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: isProvider ? "Earnings" : "Bookings",
          tabBarIcon: ({ color }) => isProvider ? <BarChart3 color={color} size={24} /> : <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isProvider ? "Settings" : "Profile",
          tabBarIcon: ({ color }) => isProvider ? <Settings color={color} size={24} /> : <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logo: { width: 180, height: 36 },
  logoutButton: { marginRight: 16 },
});
