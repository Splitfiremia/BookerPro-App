import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, DollarSign, User, MapPin, CheckCircle } from 'lucide-react-native';

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const { providerId, serviceId, date, time } = useLocalSearchParams<{ 
    providerId: string; 
    serviceId: string; 
    date: string;
    time: string;
  }>();

  const handleConfirmBooking = () => {
    Alert.alert(
      'Booking Confirmed!',
      'Your appointment has been successfully booked. You will receive a confirmation email shortly.',
      [
        {
          text: 'View Appointments',
          onPress: () => router.push('/(app)/(client)/(tabs)/appointments'),
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  // Mock data - in real app, fetch based on IDs
  const providerName = 'John Smith';
  const serviceName = 'Haircut';
  const servicePrice = '$35';
  const serviceDuration = '30 min';
  const providerAddress = '123 Main St, New York, NY 10001';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <CheckCircle size={48} color="#4CAF50" />
          <Text style={styles.title}>Confirm Your Booking</Text>
          <Text style={styles.subtitle}>Please review your appointment details</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Provider</Text>
            <View style={styles.detailRow}>
              <User size={20} color="#666" />
              <Text style={styles.detailText}>{providerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={20} color="#666" />
              <Text style={styles.detailText}>{providerAddress}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.serviceLabel}>Service:</Text>
              <Text style={styles.detailText}>{serviceName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#666" />
              <Text style={styles.detailText}>{serviceDuration}</Text>
            </View>
            <View style={styles.detailRow}>
              <DollarSign size={20} color="#666" />
              <Text style={styles.detailText}>{servicePrice}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Time</Text>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#666" />
              <Text style={styles.detailText}>{date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#666" />
              <Text style={styles.detailText}>{time}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service</Text>
              <Text style={styles.paymentAmount}>{servicePrice}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tax</Text>
              <Text style={styles.paymentAmount}>$3.15</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>$38.15</Text>
            </View>
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>Cancellation Policy</Text>
            <Text style={styles.noteText}>
              Free cancellation up to 24 hours before your appointment. 
              Late cancellations may incur a fee.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  detailsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentAmount: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  noteContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});