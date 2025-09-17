import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Clock, MapPin, DollarSign, User, Calendar, ChevronLeft, Check, X } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { mockAppointments } from '@/mocks/appointments';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const appointment = mockAppointments.find(apt => apt.id === id);
  
  const [notes, setNotes] = useState<string>('');
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  
  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Appointment not found</Text>
      </View>
    );
  }
  
  const handleCheckIn = () => {
    setIsCheckedIn(true);
    Alert.alert('Success', 'Client checked in successfully');
  };
  
  const handleComplete = () => {
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => {
            router.push({
              pathname: '/(app)/(provider)/complete-payment',
              params: { appointmentId: appointment.id }
            });
          }
        }
      ]
    );
  };
  
  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            router.back();
          }
        }
      ]
    );
  };
  
  const handleReschedule = () => {
    router.push({
      pathname: '/(app)/(provider)/availability',
      params: { appointmentId: appointment.id, action: 'reschedule' }
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return COLORS.info;
      case 'pending':
        return COLORS.warning;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.text;
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ChevronLeft size={24} color={COLORS.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      
      {/* Client Info */}
      <View style={styles.clientCard}>
        <Image source={{ uri: appointment.providerImage }} style={styles.clientImage} />
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{appointment.providerName}</Text>
          <Text style={styles.clientPhone}>+1 (555) 123-4567</Text>
        </View>
      </View>
      
      {/* Appointment Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Calendar size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {appointment.day}, {appointment.month} {appointment.date}, 2025
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Clock size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{appointment.time}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <User size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Service</Text>
            <Text style={styles.detailValue}>{appointment.service}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <DollarSign size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>${appointment.price}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <MapPin size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{appointment.location}</Text>
          </View>
        </View>
        
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(appointment.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Notes Section */}
      <View style={styles.notesCard}>
        <Text style={styles.sectionTitle}>Appointment Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add notes about this appointment..."
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {appointment.status === 'confirmed' && !isCheckedIn && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.checkInButton]}
            onPress={handleCheckIn}
          >
            <Check size={20} color="#000" />
            <Text style={styles.checkInButtonText}>Check In Client</Text>
          </TouchableOpacity>
        )}
        
        {(appointment.status === 'confirmed' && isCheckedIn) && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleComplete}
          >
            <Check size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Complete & Charge</Text>
          </TouchableOpacity>
        )}
        
        {appointment.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => Alert.alert('Success', 'Appointment confirmed')}
            >
              <Check size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={handleCancel}
            >
              <X size={20} color="#fff" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}
        
        {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={handleReschedule}
          >
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
        )}
        
        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
          >
            <X size={20} color={COLORS.error} />
            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 50,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  clientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  clientPhone: {
    fontSize: 14,
    color: '#999',
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: FONTS.bold,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  checkInButton: {
    backgroundColor: COLORS.primary,
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: COLORS.info,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  declineButton: {
    backgroundColor: COLORS.error,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  rescheduleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  rescheduleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: 8,
  },
});