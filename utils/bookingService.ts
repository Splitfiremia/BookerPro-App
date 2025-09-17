import { 
  ProviderAvailability, 
  AvailableTimeSlot, 
  Appointment,
  DayOfWeek 
} from '@/models/database';
import { 
  generateAvailableSlots, 
  generateAvailableSlotsForDateRange,
  isProviderAvailable,
  getDayOfWeek 
} from '@/utils/availability';

// Mock appointments for testing
const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: 'client-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    shopId: 'shop-1',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    statusHistory: []
  },
  {
    id: '2',
    clientId: 'client-2',
    providerId: 'provider-1',
    serviceId: 'service-2',
    shopId: 'shop-1',
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '15:30',
    status: 'confirmed',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    statusHistory: []
  }
];

/**
 * Get available time slots for a provider on a specific date
 */
export const getProviderAvailableSlots = (
  providerId: string,
  date: Date,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): AvailableTimeSlot[] => {
  console.log('BookingService: Getting available slots for provider', providerId, 'on', date.toDateString());
  
  // Filter appointments for this provider and date
  const providerAppointments = existingAppointments.filter(
    apt => apt.providerId === providerId && apt.status !== 'cancelled'
  );
  
  return generateAvailableSlots(
    date,
    providerAvailability,
    providerAppointments,
    serviceDuration,
    15 // 15-minute intervals
  );
};

/**
 * Get available time slots for a provider over a date range
 */
export const getProviderAvailableSlotsRange = (
  providerId: string,
  startDate: Date,
  endDate: Date,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): AvailableTimeSlot[] => {
  console.log('BookingService: Getting available slots for provider', providerId, 'from', startDate.toDateString(), 'to', endDate.toDateString());
  
  // Filter appointments for this provider
  const providerAppointments = existingAppointments.filter(
    apt => apt.providerId === providerId && apt.status !== 'cancelled'
  );
  
  return generateAvailableSlotsForDateRange(
    startDate,
    endDate,
    providerAvailability,
    providerAppointments,
    serviceDuration
  );
};

/**
 * Check if a provider can take an appointment at a specific time
 */
export const canProviderTakeAppointment = (
  providerId: string,
  date: Date,
  startTime: string,
  endTime: string,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): boolean => {
  console.log('BookingService: Checking if provider', providerId, 'can take appointment on', date.toDateString(), 'from', startTime, 'to', endTime);
  
  // Filter appointments for this provider
  const providerAppointments = existingAppointments.filter(
    apt => apt.providerId === providerId && apt.status !== 'cancelled'
  );
  
  return isProviderAvailable(
    date,
    startTime,
    endTime,
    providerAvailability,
    providerAppointments
  );
};

/**
 * Get the next available slot for a provider
 */
export const getNextAvailableSlot = (
  providerId: string,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments,
  startFromDate: Date = new Date()
): AvailableTimeSlot | null => {
  console.log('BookingService: Finding next available slot for provider', providerId);
  
  // Look ahead up to 30 days
  const endDate = new Date(startFromDate);
  endDate.setDate(endDate.getDate() + 30);
  
  const availableSlots = getProviderAvailableSlotsRange(
    providerId,
    startFromDate,
    endDate,
    serviceDuration,
    providerAvailability,
    existingAppointments
  );
  
  // Return the first available slot
  const nextSlot = availableSlots.find(slot => slot.isAvailable);
  
  if (nextSlot) {
    console.log('BookingService: Next available slot found:', nextSlot.date, nextSlot.startTime);
  } else {
    console.log('BookingService: No available slots found in the next 30 days');
  }
  
  return nextSlot || null;
};

/**
 * Get available slots grouped by date
 */
export const getAvailableSlotsByDate = (
  providerId: string,
  startDate: Date,
  endDate: Date,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): Record<string, AvailableTimeSlot[]> => {
  console.log('BookingService: Getting available slots grouped by date');
  
  const slots = getProviderAvailableSlotsRange(
    providerId,
    startDate,
    endDate,
    serviceDuration,
    providerAvailability,
    existingAppointments
  );
  
  // Group slots by date
  const slotsByDate: Record<string, AvailableTimeSlot[]> = {};
  
  slots.forEach(slot => {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = [];
    }
    slotsByDate[slot.date].push(slot);
  });
  
  return slotsByDate;
};

/**
 * Get provider's working days for the current week
 */
export const getProviderWorkingDays = (
  providerAvailability: ProviderAvailability
): DayOfWeek[] => {
  return providerAvailability.weeklySchedule
    .filter(day => day.isEnabled && day.intervals.length > 0)
    .map(day => day.day);
};

/**
 * Check if provider works on a specific day of the week
 */
export const doesProviderWorkOnDay = (
  dayOfWeek: DayOfWeek,
  providerAvailability: ProviderAvailability
): boolean => {
  const daySchedule = providerAvailability.weeklySchedule.find(d => d.day === dayOfWeek);
  return daySchedule ? daySchedule.isEnabled && daySchedule.intervals.length > 0 : false;
};

/**
 * Get provider's earliest and latest working hours for a day
 */
export const getProviderWorkingHours = (
  dayOfWeek: DayOfWeek,
  providerAvailability: ProviderAvailability
): { earliest: string; latest: string } | null => {
  const daySchedule = providerAvailability.weeklySchedule.find(d => d.day === dayOfWeek);
  
  if (!daySchedule || !daySchedule.isEnabled || daySchedule.intervals.length === 0) {
    return null;
  }
  
  const intervals = daySchedule.intervals;
  const earliest = intervals.reduce((min, interval) => 
    interval.start < min ? interval.start : min, intervals[0].start
  );
  const latest = intervals.reduce((max, interval) => 
    interval.end > max ? interval.end : max, intervals[0].end
  );
  
  return { earliest, latest };
};

/**
 * Calculate total working hours per week for a provider
 */
export const calculateWeeklyWorkingHours = (
  providerAvailability: ProviderAvailability
): number => {
  let totalMinutes = 0;
  
  providerAvailability.weeklySchedule.forEach(daySchedule => {
    if (daySchedule.isEnabled) {
      daySchedule.intervals.forEach(interval => {
        const [startHours, startMinutes] = interval.start.split(':').map(Number);
        const [endHours, endMinutes] = interval.end.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        totalMinutes += endTotalMinutes - startTotalMinutes;
      });
    }
  });
  
  return totalMinutes / 60; // Convert to hours
};