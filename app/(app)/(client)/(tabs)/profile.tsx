import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { Bell, LogOut } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";

interface Appointment {
  id: string;
  providerName: string;
  providerImage: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed";
}

interface Provider {
  id: string;
  name: string;
  image: string;
  specialty: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profileImage] = useState<string | null>(null);

  // Mock data for upcoming appointments
  const upcomingAppointments: Appointment[] = [
    {
      id: "1",
      providerName: "Jose Santiago",
      providerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      service: "Kids Haircut",
      date: "Sat, September 13",
      time: "5:00 PM - 5:30 PM",
      status: "confirmed",
    },
  ];

  // Mock data for saved barbers
  const myBarbers: Provider[] = [
    {
      id: "1",
      name: "Jose Santiago",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      specialty: "Master Barber",
    },
  ];

  const handleViewDetails = (appointment: Appointment) => {
    router.push({
      pathname: "/(app)/(client)/appointment-details",
      params: { id: appointment.id },
    });
  };

  const handleShareBarber = (barber: Provider) => {
    Alert.alert("Share", `Share ${barber.name}'s profile`);
  };

  const handleBookBarber = (barber: Provider) => {
    router.push({
      pathname: "/(app)/(client)/provider/[id]",
      params: { id: barber.id },
    });
  };

  const handleViewAllAppointments = () => {
    router.push("/(app)/(client)/(tabs)/appointments");
  };

  const handleFindBarbers = () => {
    router.push("/(app)/(client)/(tabs)/search");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Profile",
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
          },
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={24} color={COLORS.white} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>1</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={() => {
                  Alert.alert(
                    "Sign Out", 
                    "Are you sure you want to sign out?", 
                    [
                      {
                        text: "Cancel",
                        style: "cancel"
                      },
                      {
                        text: "Sign Out",
                        onPress: () => {
                          logout();
                          router.replace("/");
                        },
                        style: "destructive"
                      }
                    ]
                  );
                }}
              >
                <LogOut size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => Alert.alert("View Details", "Profile details would be shown here")}
          >
            <Text style={styles.viewDetailsText}>VIEW DETAILS</Text>
          </TouchableOpacity>
          
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0).toUpperCase() || "L"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || "Luis Martinez"}</Text>
          
          <TouchableOpacity 
            style={[styles.viewDetailsButton, styles.signOutButton]}
            onPress={() => {
              Alert.alert(
                "Sign Out", 
                "Are you sure you want to sign out?", 
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  {
                    text: "Sign Out",
                    onPress: () => {
                      logout();
                      router.replace("/");
                    },
                    style: "destructive"
                  }
                ]
              );
            }}
          >
            <Text style={styles.viewDetailsText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              UPCOMING APPOINTMENTS ({upcomingAppointments.length})
            </Text>
            <TouchableOpacity onPress={handleViewAllAppointments}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <Image
                  source={{ uri: appointment.providerImage }}
                  style={styles.providerImage}
                />
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>CONFIRMED</Text>
                </View>
              </View>
              <Text style={styles.providerName}>{appointment.providerName}</Text>
              <Text style={styles.serviceName}>{appointment.service}</Text>
              <Text style={styles.appointmentDate}>{appointment.date}</Text>
              <Text style={styles.appointmentTime}>{appointment.time}</Text>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => handleViewDetails(appointment)}
              >
                <Text style={styles.viewDetailsText}>VIEW DETAILS</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* My Barbers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MY BARBERS</Text>
            <TouchableOpacity onPress={handleFindBarbers}>
              <Text style={styles.viewAllText}>FIND BARBERS</Text>
            </TouchableOpacity>
          </View>

          {myBarbers.map((barber) => (
            <View key={barber.id} style={styles.barberCard}>
              <Image source={{ uri: barber.image }} style={styles.barberImage} />
              <Text style={styles.barberName}>{barber.name}</Text>
              <View style={styles.barberActions}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShareBarber(barber)}
                >
                  <Text style={styles.shareButtonText}>SHARE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookBarber(barber)}
                >
                  <Text style={styles.bookButtonText}>BOOK</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Inspiration Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INSPIRATION PHOTOS</Text>
          <View style={styles.photoGrid}>
            {/* Placeholder for inspiration photos */}
            <View style={styles.photoPlaceholder} />
            <View style={styles.photoPlaceholder} />
            <View style={styles.photoPlaceholder} />
          </View>
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
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  notificationButton: {
    position: "relative",
    marginRight: 20,
  },
  logoutButton: {
    marginLeft: 4,
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.accent,
  },
  appointmentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  statusBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  providerName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    color: COLORS.lightGray,
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 12,
  },
  viewDetailsButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  viewDetailsText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "700",
  },
  barberCard: {
    alignItems: "center",
    marginBottom: 20,
  },
  barberImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 12,
  },
  barberName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 12,
  },
  barberActions: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  bookButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "700",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  signOutButton: {
    marginTop: 16,
    backgroundColor: COLORS.error,
  },
  photoPlaceholder: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
  },
});