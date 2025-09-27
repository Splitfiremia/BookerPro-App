import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useAppointments, APPOINTMENT_COLORS } from '@/providers/AppointmentProvider';
import { AppointmentStatus } from '@/models/database';

import { COLORS, FONTS } from '@/constants/theme';

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
    { status: 'in-progress', label: 'In Progress' },
    { status: 'completed', label: 'Completed' },
    { status: 'cancelled', label: 'Cancelled' },
    { status: 'no-show', label: 'No-show' },
    { status: 'rescheduled', label: 'Rescheduled' },
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
                  backgroundColor: isSelected ? APPOINTMENT_COLORS[status] : COLORS.glass.background,
                  borderColor: APPOINTMENT_COLORS[status],
                }
              ]}
              onPress={() => onStatusToggle(status)}
              testID={`filter-${status}`}
            >
              <Text style={[
                styles.filterChipText,
                { color: isSelected ? COLORS.background : COLORS.text }
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

  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([
    'requested', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'
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
        selectedColor: date === selectedDate ? COLORS.primary : undefined,
      };
    });

    // Mark selected date even if no appointments
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: COLORS.primary,
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
          backgroundColor: COLORS.background,
          calendarBackground: COLORS.background,
          textSectionTitleColor: COLORS.secondary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.background,
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.text,
          textDisabledColor: COLORS.secondary,
          dotColor: COLORS.primary,
          selectedDotColor: COLORS.background,
          arrowColor: COLORS.primary,
          disabledArrowColor: COLORS.secondary,
          monthTextColor: COLORS.text,
          indicatorColor: COLORS.primary,
          textDayFontFamily: FONTS.regular,
          textMonthFontFamily: FONTS.bold,
          textDayHeaderFontFamily: FONTS.regular,
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
                    {apt.clientNotes ?? 'Service appointment'}
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
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.text,
    fontFamily: FONTS.bold,
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
    fontFamily: FONTS.regular,
  },
  appointmentsList: {
    padding: 16,
    maxHeight: 300,
    backgroundColor: COLORS.background,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  noAppointments: {
    fontSize: 14,
    color: COLORS.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: FONTS.regular,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  appointmentService: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  appointmentStatus: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
});

export default AppointmentCalendar;