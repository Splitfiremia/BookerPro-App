import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useProviderOnboarding, WeeklyAvailability, TimeSlot } from '@/providers/ProviderOnboardingProvider';
import { Clock } from 'lucide-react-native';

// Days of the week
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = typeof DAYS[number];

// Time slots for selection
const TIME_SLOTS: { label: string; value: string }[] = [
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '5:00 PM', value: '17:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '7:00 PM', value: '19:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    availability,
    setAvailability,
    updateDayAvailability,
    nextStep,
    completeOnboarding
  } = useProviderOnboarding();

  // Initialize state with current availability or default
  const [availabilityState, setAvailabilityState] = useState<WeeklyAvailability>(
    availability || {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
  );

  // Track which days are enabled
  const [enabledDays, setEnabledDays] = useState<Record<Day, boolean>>(
    DAYS.reduce((acc, day) => {
      acc[day] = availability?.[day]?.length > 0 || false;
      return acc;
    }, {} as Record<Day, boolean>)
  );

  // Track selected time slots for each day
  const [selectedTimes, setSelectedTimes] = useState<Record<Day, string[]>>(
    DAYS.reduce((acc, day) => {
      const daySlots = availability?.[day] || [];
      const times = daySlots.flatMap(slot => {
        const startHour = slot.start.split(':')[0];
        const endHour = slot.end.split(':')[0];
        
        // Generate all hours between start and end
        const hours = [];
        for (let h = parseInt(startHour); h < parseInt(endHour); h++) {
          hours.push(h.toString().padStart(2, '0') + ':00');
        }
        return hours;
      });
      
      acc[day] = times;
      return acc;
    }, {} as Record<Day, string[]>)
  );

  const toggleDay = (day: Day) => {
    setEnabledDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));

    // If disabling a day, clear its time slots
    if (enabledDays[day]) {
      setSelectedTimes(prev => ({
        ...prev,
        [day]: []
      }));
    }
  };

  const toggleTimeSlot = (day: Day, time: string) => {
    setSelectedTimes(prev => {
      const dayTimes = [...prev[day]];
      
      if (dayTimes.includes(time)) {
        // Remove the time
        return {
          ...prev,
          [day]: dayTimes.filter(t => t !== time)
        };
      } else {
        // Add the time
        return {
          ...prev,
          [day]: [...dayTimes, time].sort()
        };
      }
    });
  };

  // Convert selected times to time slots (start-end pairs)
  const convertToTimeSlots = (times: string[]): TimeSlot[] => {
    if (times.length === 0) return [];
    
    // Sort times
    const sortedTimes = [...times].sort();
    
    // Group consecutive hours
    const slots: TimeSlot[] = [];
    let currentSlot: { start: string; end: string | null } = { 
      start: sortedTimes[0], 
      end: null 
    };
    
    for (let i = 1; i < sortedTimes.length; i++) {
      const currentHour = parseInt(sortedTimes[i-1].split(':')[0]);
      const nextHour = parseInt(sortedTimes[i].split(':')[0]);
      
      // Check if hours are consecutive
      if (nextHour === currentHour + 1) {
        // Continue current slot
        if (i === sortedTimes.length - 1) {
          // Last item, close the slot
          currentSlot.end = `${(nextHour + 1).toString().padStart(2, '0')}:00`;
          slots.push(currentSlot as TimeSlot);
        }
      } else {
        // Close current slot and start a new one
        currentSlot.end = `${(currentHour + 1).toString().padStart(2, '0')}:00`;
        slots.push(currentSlot as TimeSlot);
        currentSlot = { start: sortedTimes[i], end: null };
        
        // If this is the last item, add it as a single-hour slot
        if (i === sortedTimes.length - 1) {
          currentSlot.end = `${(nextHour + 1).toString().padStart(2, '0')}:00`;
          slots.push(currentSlot as TimeSlot);
        }
      }
    }
    
    // Handle case with only one time selected
    if (sortedTimes.length === 1) {
      const hour = parseInt(sortedTimes[0].split(':')[0]);
      slots.push({ 
        start: sortedTimes[0], 
        end: `${(hour + 1).toString().padStart(2, '0')}:00` 
      });
    }
    
    return slots;
  };

  const saveAvailability = () => {
    // Convert selected times to time slots for each day
    const newAvailability: WeeklyAvailability = { ...availabilityState };
    
    DAYS.forEach(day => {
      if (enabledDays[day]) {
        newAvailability[day] = convertToTimeSlots(selectedTimes[day]);
      } else {
        newAvailability[day] = [];
      }
    });
    
    setAvailability(newAvailability);
    return newAvailability;
  };

  const handleContinue = () => {
    const newAvailability = saveAvailability();
    nextStep();
    router.replace('/provider-onboarding/summary');
  };

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>GET STARTED</Text>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>Set your availability</Text>
          <Text style={styles.description}>
            Select the days and hours you're available to provide services.
          </Text>

          <View style={styles.availabilityContainer}>
            {DAYS.map(day => (
              <View key={day} style={styles.dayContainer}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayTitleContainer}>
                    <Text style={styles.dayTitle}>{formatDayName(day)}</Text>
                  </View>
                  <Switch
                    value={enabledDays[day]}
                    onValueChange={() => toggleDay(day)}
                    trackColor={{ false: '#333333', true: 'rgba(212, 175, 55, 0.3)' }}
                    thumbColor={enabledDays[day] ? '#D4AF37' : '#f4f3f4'}
                    testID={`day-switch-${day}`}
                  />
                </View>

                {enabledDays[day] && (
                  <View style={styles.timeSlots}>
                    {TIME_SLOTS.map(slot => (
                      <TouchableOpacity
                        key={slot.value}
                        style={[
                          styles.timeSlot,
                          selectedTimes[day].includes(slot.value) && styles.selectedTimeSlot
                        ]}
                        onPress={() => toggleTimeSlot(day, slot.value)}
                        testID={`time-slot-${day}-${slot.value}`}
                      >
                        <Clock 
                          size={16} 
                          color={selectedTimes[day].includes(slot.value) ? '#000000' : '#CCCCCC'} 
                        />
                        <Text 
                          style={[
                            styles.timeText,
                            selectedTimes[day].includes(slot.value) && styles.selectedTimeText
                          ]}
                        >
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="CONTINUE"
            onPress={handleContinue}
            testID="complete-button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
  },
  availabilityContainer: {
    marginBottom: 30,
  },
  dayContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: '#D4AF37',
  },
  timeText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 6,
  },
  selectedTimeText: {
    color: '#000000',
    fontWeight: 'bold' as const,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});