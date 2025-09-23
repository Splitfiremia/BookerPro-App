import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Clock, User, MapPin, Phone, Star, Filter } from "lucide-react-native";
import { router } from "expo-router";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";

interface Appointment {
  id: string;
  providerName: string;
  providerImage: string;
  shopName: string;
  service: string;
  date: Date;
  time: string;
  duration: number;
  status: "upcoming" | "completed" | "cancelled";
  price: number;
  address: string;
  phone: string;
  notes?: string;
}

// Mock appointments for testing
const generateMockAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const services = [
    "Haircut & Style",
    "Hair Color",
    "Highlights",
    "Balayage",
    "Manicure",
    "Pedicure",
    "Facial Treatment",
    "Massage Therapy",
  ];
  const providers = [
    {
      name: "Jose Santiago",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      shop: "Free Advice Barber Shop",
      address: "548 East 13th Street, New York, NY",
      phone: "(347) 721-2262"
    },
    {
      name: "Maria Lopez",
      image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200",
      shop: "Glamour Beauty Salon",
      address: "234 Broadway, New York, NY",
      phone: "(212) 555-1234"
    },
    {
      name: "Lily Chen",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200",
      shop: "Zen Nail Spa",
      address: "456 Park Avenue, New York, NY",
      phone: "(212) 555-5678"
    },
  ];
  
  const today = new Date();
  
  // Generate upcoming appointments
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + dayOffset);
    
    if (Math.random() > 0.6) { // 40% chance of appointment each day
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const hour = 9 + Math.floor(Math.random() * 10); // 9 AM to 6 PM
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      appointments.push({
        id: `apt-${dayOffset}`,
        providerName: provider.name,
        providerImage: provider.image,
        shopName: provider.shop,
        service: services[Math.floor(Math.random() * services.length)],
        date: appointmentDate,
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
        status: "upcoming",
        price: Math.floor(Math.random() * 150) + 50,
        address: provider.address,
        phone: provider.phone,
        notes: Math.random() > 0.7 ? "Please arrive 10 minutes early" : undefined,
      });
    }
  }
  
  // Generate past appointments
  for (let dayOffset = -14; dayOffset < 0; dayOffset++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + dayOffset);
    
    if (Math.random() > 0.5) { // 50% chance of past appointment
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const hour = 9 + Math.floor(Math.random() * 10);
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      appointments.push({
        id: `apt-past-${Math.abs(dayOffset)}`,
        providerName: provider.name,
        providerImage: provider.image,
        shopName: provider.shop,
        service: services[Math.floor(Math.random() * services.length)],
        date: appointmentDate,
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.1 ? "completed" : "cancelled",
        price: Math.floor(Math.random() * 150) + 50,
        address: provider.address,
        phone: provider.phone,
      });
    }
  }
  
  return appointments.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [appointments] = useState<Appointment[]>(generateMockAppointments());
  const [filterStatus, setFilterStatus] = useState<Appointment["status"] | "all">("all");

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesFilter = filterStatus === "all" || apt.status === filterStatus;
      return matchesFilter;
    });
  }, [appointments, filterStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return COLORS.primary;
      case "completed":
        return COLORS.success;
      case "cancelled":
        return COLORS.error;
      default:
        return COLORS.text;
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => {
          // Navigate to appointment details or provider profile
          console.log('Navigate to appointment details:', item.id);
        }}
        testID={`appointment-${item.id}`}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.providerInfo}>
            <Image source={{ uri: item.providerImage }} style={styles.providerImage} />
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{item.providerName}</Text>
              <Text style={styles.shopName}>{item.shopName}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentBody}>
          <Text style={styles.serviceName}>{item.service}</Text>
          
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color={COLORS.lightGray} />
              <Text style={styles.detailText}>
                {formatDate(item.date)} at {item.time}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={16} color={COLORS.lightGray} />
              <Text style={styles.detailText}>{item.duration} minutes</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MapPin size={16} color={COLORS.lightGray} />
              <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
            </View>
          </View>
          
          <View style={styles.appointmentFooter}>
            <TouchableOpacity 
              style={styles.phoneButton}
              onPress={() => console.log('Call provider:', item.phone)}
            >
              <Phone size={16} color={COLORS.primary} />
              <Text style={styles.phoneText}>Call</Text>
            </TouchableOpacity>
            
            <Text style={styles.priceText}>${item.price}</Text>
          </View>
          
          {item.notes && (
            <Text style={styles.notesText}>Note: {item.notes}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const upcomingCount = appointments.filter(apt => apt.status === "upcoming").length;
  const completedCount = appointments.filter(apt => apt.status === "completed").length;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Your Appointments</Text>
        <Text style={styles.subtitle}>
          {upcomingCount} upcoming • {completedCount} completed
        </Text>
      </View>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {["all", "upcoming", "completed", "cancelled"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.activeFilterButton,
              ]}
              onPress={() => setFilterStatus(status as typeof filterStatus)}
              testID={`filter-${status}`}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.activeFilterButtonText,
              ]}>
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Appointments List */}
      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === "all" 
                ? "Book your first appointment to get started"
                : `No ${filterStatus} appointments`
              }
            </Text>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => router.push("/(app)/(client)/(tabs)/home")}
            >
              <Text style={styles.bookButtonText}>FIND PROVIDERS</Text>
            </TouchableOpacity>
          </View>
        }
        testID="appointments-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "bold",
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  filterContainer: {
    paddingBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.card,
    marginRight: SPACING.sm,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  activeFilterButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  appointmentCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  providerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.md,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  shopName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  appointmentBody: {
    width: "100%",
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.bold,
  },
  appointmentDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    marginLeft: SPACING.sm,
    flex: 1,
    fontFamily: FONTS.regular,
  },
  appointmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  phoneText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  priceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    marginTop: SPACING.sm,
    fontStyle: "italic",
    fontFamily: FONTS.regular,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginTop: SPACING.lg,
    fontWeight: "600",
    fontFamily: FONTS.bold,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginTop: SPACING.sm,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "bold",
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
});