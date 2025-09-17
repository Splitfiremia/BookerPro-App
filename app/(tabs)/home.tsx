import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import { router } from "expo-router";
import { mockAppointments, mockProviders } from "@/mocks/appointments";
import { useAuth } from "@/providers/AuthProvider";

import { COLORS, FONTS } from "@/constants/theme";

export default function HomeScreen() {
  const { user } = useAuth();
  const { top } = useSafeAreaInsets();
  
  // Get upcoming appointments (non-completed)
  const upcomingAppointments = mockAppointments.filter(
    (apt) => apt.status !== "completed"
  ).slice(0, 1); // Only show the first one
  
  // Get user's providers
  const userProviders = mockProviders.slice(0, 1); // Just show one for the demo

  const handleAppointmentPress = (appointmentId: string) => {
    router.push({
      pathname: "/appointment-details",
      params: { id: appointmentId },
    });
  };

  const handleProviderPress = (providerId: string) => {
    router.push(`/provider/${providerId}`);
  };

  const handleViewAllAppointments = () => {
    router.push("/(tabs)/bookings");
  };

  const handleFindProviders = () => {
    router.push("/(tabs)/explore");
  };

  // Get user's first initial for the avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: top }]}>
        <Text style={styles.title}>HOME</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell color="#fff" size={24} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>1</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.initialAvatar}>
                <Text style={styles.initialText}>{userInitial}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
        </View>

        {/* Upcoming Appointments Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>UPCOMING APPOINTMENTS ({upcomingAppointments.length})</Text>
            <TouchableOpacity onPress={handleViewAllAppointments}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptyAppointments}>
              <Text style={styles.emptyText}>No upcoming appointments</Text>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => handleAppointmentPress(appointment.id)}
              >
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
                </View>
                
                <View style={styles.appointmentContent}>
                  <Image 
                    source={{ uri: appointment.providerImage }} 
                    style={styles.providerImage} 
                  />
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.providerName}>{appointment.providerName}</Text>
                    <Text style={styles.serviceText}>{appointment.service}</Text>
                    <Text style={styles.dateTimeText}>
                      {`${appointment.day}, ${appointment.month} ${appointment.date}`}
                    </Text>
                    <Text style={styles.timeText}>{appointment.time}</Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.detailsButton}>
                  <Text style={styles.detailsButtonText}>VIEW DETAILS</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* My Providers Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MY PROVIDERS</Text>
            <TouchableOpacity onPress={handleFindProviders}>
              <Text style={styles.viewAllText}>FIND PROVIDERS</Text>
            </TouchableOpacity>
          </View>

          {userProviders.length === 0 ? (
            <View style={styles.emptyProviders}>
              <Text style={styles.emptyText}>No saved providers</Text>
              <TouchableOpacity 
                style={styles.findButton}
                onPress={handleFindProviders}
              >
                <Text style={styles.findButtonText}>Find Providers</Text>
              </TouchableOpacity>
            </View>
          ) : (
            userProviders.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={styles.providerCard}
                onPress={() => handleProviderPress(provider.id)}
              >
                <Image 
                  source={{ uri: provider.image }} 
                  style={styles.providerCardImage} 
                />
                <View style={styles.providerCardDetails}>
                  <Text style={styles.providerCardName}>{provider.name}</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>SHARE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.bookProviderButton}
                    onPress={() => router.push({
                      pathname: "/booking",
                      params: { providerId: provider.id }
                    })}
                  >
                    <Text style={styles.bookProviderText}>BOOK</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Inspiration Photos Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>INSPIRATION PHOTOS</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.inspirationScroll}
          >
            {/* Add some placeholder inspiration photos */}
            {[1, 2, 3, 4].map((item) => (
              <View key={`inspiration-${item}`} style={styles.inspirationPhoto}>
                <Image 
                  source={{ 
                    uri: `https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&q=80&auto=format&fit=crop&crop=entropy&cs=tinysrgb&ixid=MnwxfDB8MXxyYW5kb218MHx8aGFpcnN0eWxlfHx8fHx8MTY5NTY3NjI0Mg&ixlib=rb-4.0.3&${item}` 
                  }} 
                  style={styles.inspirationImage} 
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  initialAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
    fontFamily: FONTS.bold,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    fontFamily: FONTS.bold,
  },
  emptyAppointments: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyProviders: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginBottom: 15,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  findButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  findButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  appointmentCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
  },
  statusBadge: {
    backgroundColor: "#4CAF50", // Green for confirmed
    paddingVertical: 6,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  appointmentContent: {
    flexDirection: "row",
    padding: 15,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  appointmentDetails: {
    flex: 1,
  },
  providerName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  serviceText: {
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  dateTimeText: {
    color: "#999",
    fontSize: 14,
    marginBottom: 2,
  },
  timeText: {
    color: "#999",
    fontSize: 14,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  providerCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  providerCardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 10,
  },
  providerCardDetails: {
    alignItems: "center",
    marginBottom: 15,
  },
  providerCardName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: FONTS.bold,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
    marginRight: 10,
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  bookProviderButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  bookProviderText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  inspirationScroll: {
    marginTop: 15,
  },
  inspirationPhoto: {
    marginRight: 15,
  },
  inspirationImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
});