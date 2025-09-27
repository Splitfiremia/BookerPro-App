import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppointmentWithColor {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  clientNotes?: string;
  color: string;
}

interface AppointmentListProps {
  selectedDate: string;
  appointments: AppointmentWithColor[];
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  selectedDate,
  appointments,
}) => {
  if (appointments.length === 0) {
    return (
      <View style={styles.appointmentsList}>
        <Text style={styles.appointmentsTitle}>
          Appointments for {selectedDate}
        </Text>
        <Text style={styles.noAppointments}>No appointments for this date</Text>
      </View>
    );
  }

  return (
    <View style={styles.appointmentsList}>
      <Text style={styles.appointmentsTitle}>
        Appointments for {selectedDate}
      </Text>
      {appointments.map(apt => (
        <View key={apt.id} style={styles.appointmentItem}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: apt.color }
          ]} />
          <View style={styles.appointmentDetails}>
            <Text style={styles.appointmentTime}>
              {apt.startTime} - {apt.endTime}
            </Text>
            <Text style={styles.appointmentService}>
              {apt.clientNotes ?? 'Service appointment'}
            </Text>
            <Text style={styles.appointmentStatus}>
              Status: {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentsList: {
    padding: 16,
    maxHeight: 300,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  noAppointments: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appointmentService: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  appointmentStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});