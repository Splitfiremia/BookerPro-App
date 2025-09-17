import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useAppointments, APPOINTMENT_COLORS } from '@/providers/AppointmentProvider';
import { AppointmentStatus } from '@/models/database';
import { useAuth } from '@/providers/AuthProvider';

interface AppointmentCalendarProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

interface StatusFilterProps {
  selectedStatuses: AppointmentStatus[];
  onStatusToggle: (status: AppointmentStatus) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatuses, onStatusToggle }) => {
  const statusOptions: { status: AppointmentStatus; label: string }[] = [
    { status: 'requested', label: 'Requested' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'completed', label: 'Completed' },
    { status: 'cancelled', label: 'Cancelled' },
    { status: 'no-show', label: 'No-show' },
  ];

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filter by Status:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {statusOptions.map(({ status, label }) => {
          const isSelected = selectedStatuses.includes(status);
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? APPOINTMENT_COLORS[status] : '#f0f0f0',
                  borderColor: APPOINTMENT_COLORS[status],
                }
              ]}
              onPress={() => onStatusToggle(status)}
              testID={`filter-${status}`}
            >
              <Text style={[
                styles.filterChipText,
                { color: isSelected ? '#fff' : '#333' }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onDateSelect,
  selectedDate
}) => {
  const { getAppointmentsWithColors } = useAppointments();
  const { user } = useAuth();
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([
    'requested', 'confirmed', 'completed', 'cancelled', 'no-show'
  ]);

  const appointmentsWithColors = getAppointmentsWithColors();

  // Filter appointments based on selected statuses
  const filteredAppointments = useMemo(() => {
    return appointmentsWithColors.filter(apt => selectedStatuses.includes(apt.status));
  }, [appointmentsWithColors, selectedStatuses]);

  // Create marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};

    // Group appointments by date
    const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
      if (!acc[apt.date]) {
        acc[apt.date] = [];
      }
      acc[apt.date].push(apt);
      return acc;
    }, {} as { [key: string]: typeof filteredAppointments });

    // Mark dates with appointments
    Object.keys(appointmentsByDate).forEach(date => {
      const dayAppointments = appointmentsByDate[date];
      const dots = dayAppointments.slice(0, 3).map(apt => ({
        color: apt.color,
        selectedDotColor: apt.color,
      }));

      marked[date] = {
        dots,
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? '#2196F3' : undefined,
      };
    });

    // Mark selected date even if no appointments
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#2196F3',
      };
    }

    return marked;
  }, [filteredAppointments, selectedDate]);

  const handleStatusToggle = (status: AppointmentStatus) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleDayPress = (day: DateData) => {
    onDateSelect?.(day.dateString);
  };

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return filteredAppointments.filter(apt => apt.date === selectedDate);
  }, [filteredAppointments, selectedDate]);

  return (
    <View style={styles.container}>
      <StatusFilter 
        selectedStatuses={selectedStatuses} 
        onStatusToggle={handleStatusToggle} 
      />
      
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType={'multi-dot'}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#2196F3',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2196F3',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: '#2196F3',
          disabledArrowColor: '#d9e1e8',
          monthTextColor: '#2d4150',
          indicatorColor: '#2196F3',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13
        }}
      />

      {selectedDate && (
        <View style={styles.appointmentsList}>
          <Text style={styles.appointmentsTitle}>
            Appointments for {selectedDate}
          </Text>
          {selectedDateAppointments.length === 0 ? (
            <Text style={styles.noAppointments}>No appointments for this date</Text>
          ) : (
            selectedDateAppointments.map(apt => (
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
                    {apt.notes || 'Service appointment'}
                  </Text>
                  <Text style={styles.appointmentStatus}>
                    Status: {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
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

export default AppointmentCalendar;