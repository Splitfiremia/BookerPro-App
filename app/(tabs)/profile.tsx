import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  Settings, 
  CreditCard, 
  Heart, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Star,
  Calendar,
  Award
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";


export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const menuItems = [
    { icon: Heart, label: "Favorites", onPress: () => {} },
    { icon: CreditCard, label: "Payment Methods", onPress: () => {} },
    { icon: Settings, label: "Settings", onPress: () => {} },
    { icon: HelpCircle, label: "Help & Support", onPress: () => {} },
  ];

  const stats = [
    { icon: Calendar, value: "24", label: "Bookings" },
    { icon: Star, value: "4.9", label: "Avg Rating" },
    { icon: Award, value: "Gold", label: "Member" },
  ];
  
  // For debugging
  console.log("User role:", user?.role);
  console.log("Has mockData:", !!user?.mockData);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "guest@example.com"}</Text>
          
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <stat.icon color="#D4AF37" size={24} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <item.icon color="#D4AF37" size={24} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <ChevronRight color="#666" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#FF4444" size={24} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#D4AF37",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF4444",
    marginLeft: 12,
  },
  version: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginBottom: 30,
  },
});