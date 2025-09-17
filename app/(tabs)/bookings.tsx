import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Clock, MapPin, DollarSign, CreditCard } from "lucide-react-native";
import { router } from "expo-router";
import { mockAppointments } from "@/mocks/appointments";
import { usePayments } from "@/providers/PaymentProvider";

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const { payments } = usePayments();

  const filteredAppointments = mockAppointments.filter(apt => 
    activeTab === "upcoming" ? apt.status !== "completed" : apt.status === "completed"
  );

  const handleAppointmentPress = (appointmentId: string) => {
    router.push({
      pathname: "/appointment-details",
      params: { id: appointmentId }
    });
  };

  const handlePaymentPress = (appointmentId: string) => {
    router.push({
      pathname: "/complete-payment/[id]",
      params: { id: appointmentId }
    });
  };

  const getPaymentStatus = (appointmentId: string) => {
    const payment = payments.find(p => p.appointmentId === appointmentId);
    return payment?.status || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#4CAF50";
      case "pending": return "#FFA726";
      case "cancelled": return "#F44336";
      case "completed": return "#999";
      default: return "#999";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "past" && styles.activeTab]}
            onPress={() => setActiveTab("past")}
          >
            <Text style={[styles.tabText, activeTab === "past" && styles.activeTabText]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color="#666" size={64} />
            <Text style={styles.emptyTitle}>No {activeTab} appointments</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "upcoming" 
                ? "Book your next appointment to see it here"
                : "Your completed appointments will appear here"}
            </Text>
            {activeTab === "upcoming" && (
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <Text style={styles.bookButtonText}>Explore Services</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => handleAppointmentPress(appointment.id)}
            >
              <View style={styles.dateSection}>
                <Text style={styles.dayText}>{appointment.day}</Text>
                <Text style={styles.dateNumber}>{appointment.date}</Text>
                <Text style={styles.monthText}>{appointment.month}</Text>
              </View>

              <View style={styles.appointmentInfo}>
                <View style={styles.providerSection}>
                  <Image 
                    source={{ uri: appointment.providerImage }} 
                    style={styles.providerImage}
                  />
                  <View style={styles.providerDetails}>
                    <Text style={styles.providerName}>{appointment.providerName}</Text>
                    <Text style={styles.serviceName}>{appointment.service}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                      <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Clock color="#666" size={14} />
                    <Text style={styles.detailText}>{appointment.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin color="#666" size={14} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {appointment.location}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <DollarSign color="#666" size={14} />
                    <Text style={styles.detailText}>${appointment.price}</Text>
                  </View>
                  
                  {appointment.status === "completed" && (
                    <View style={styles.paymentSection}>
                      {getPaymentStatus(appointment.id) === "completed" ? (
                        <View style={styles.paidBadge}>
                          <Text style={styles.paidText}>Payment Complete</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.payButton}
                          onPress={() => handlePaymentPress(appointment.id)}
                        >
                          <CreditCard color="#000" size={16} />
                          <Text style={styles.payButtonText}>Complete Payment</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#D4AF37",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#000",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  bookButton: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  dateSection: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#333",
    paddingRight: 16,
    marginRight: 16,
  },
  dayText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D4AF37",
    marginBottom: 4,
  },
  monthText: {
    fontSize: 12,
    color: "#666",
  },
  appointmentInfo: {
    flex: 1,
  },
  providerSection: {
    flexDirection: "row",
    marginBottom: 12,
  },
  providerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: "#999",
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  appointmentDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: "#999",
    flex: 1,
  },
  paymentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
  },
  payButtonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  paidBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  paidText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});