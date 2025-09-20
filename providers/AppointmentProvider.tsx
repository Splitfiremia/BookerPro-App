import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthProvider";
import { 
  Appointment, 
  AppointmentStatus, 
  AppointmentStatusChange, 
  Notification, 
  UserRole 
} from "@/models/database";

// BookingRequest type for compatibility with existing UI
export interface BookingRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientImage?: string;
  providerId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  notes?: string;
  status: 'requested' | 'confirmed' | 'declined';
  createdAt: string;
}

// Color coding for appointment statuses - Visual Distinctions
export const APPOINTMENT_COLORS = {
  requested: '#FFC107', // Yellow
  cancelled: '#F44336',  // Red
  confirmed: '#2196F3',  // Blue
  completed: '#4CAF50',  // Green
  'no-show': '#9E9E9E',  // Grey
} as const;

// Mock appointments with new unified status system
const mockAppointmentsData: Appointment[] = [
  {
    id: "1",
    clientId: "client-1",
    providerId: "provider-1",
    serviceId: "service-1",
    shopId: "shop-1",
    date: "2024-09-16",
    time: "17:00",
    startTime: "17:00",
    endTime: "17:30",
    duration: 30,
    status: "confirmed",
    paymentStatus: "pending",
    totalAmount: 50,
    serviceAmount: 50,
    notes: "Regular haircut",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  },
  {
    id: "2",
    clientId: "client-2",
    providerId: "provider-1",
    serviceId: "service-2",
    shopId: "shop-1",
    date: "2024-09-18",
    time: "14:00",
    startTime: "14:00",
    endTime: "16:00",
    duration: 120,
    status: "requested",
    paymentStatus: "pending",
    totalAmount: 150,
    serviceAmount: 150,
    notes: "Color and highlights - please use organic products",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  }
];

const [AppointmentProviderInternal, useAppointmentsInternal] = createContextHook(() => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load appointments and notifications on mount with timeout
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading appointments and notifications...');
        
        // Quick timeout to prevent hanging
        const loadWithTimeout = (promise: Promise<any>, timeout: number = 300) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ]);
        };
        
        // Try to load appointments quickly
        try {
          const storedAppointments = await loadWithTimeout(AsyncStorage.getItem("appointments"));
          if (storedAppointments) {
            const parsedAppointments = JSON.parse(storedAppointments);
            console.log('Loaded stored appointments:', parsedAppointments.length);
            setAppointments(parsedAppointments);
          } else {
            console.log('Using mock appointments:', mockAppointmentsData.length);
            setAppointments(mockAppointmentsData);
          }
        } catch {
          console.log('Using mock appointments due to timeout/error');
          setAppointments(mockAppointmentsData);
        }

        // Try to load notifications quickly
        try {
          const storedNotifications = await loadWithTimeout(AsyncStorage.getItem("notifications"));
          if (storedNotifications) {
            const parsedNotifications = JSON.parse(storedNotifications);
            setNotifications(parsedNotifications);
          }
        } catch {
          console.log('No stored notifications or timeout');
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setAppointments(mockAppointmentsData);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    loadData();
    
    // Fallback timeout
    const fallbackTimeout = setTimeout(() => {
      console.warn('AppointmentProvider: Fallback timeout triggered');
      setAppointments(mockAppointmentsData);
      setIsLoading(false);
      setIsInitialized(true);
    }, 800);
    
    return () => clearTimeout(fallbackTimeout);
  }, []);

  // Save data to storage
  const saveAppointments = useCallback(async (newAppointments: Appointment[]) => {
    try {
      await AsyncStorage.setItem("appointments", JSON.stringify(newAppointments));
      console.log('Appointments saved to storage');
    } catch (error) {
      console.error('Error saving appointments:', error);
    }
  }, []);

  const saveNotifications = useCallback(async (newNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem("notifications", JSON.stringify(newNotifications));
      console.log('Notifications saved to storage');
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, []);

  // Create status change record for audit trail
  const createStatusChange = useCallback((appointmentId: string, fromStatus: AppointmentStatus | null, toStatus: AppointmentStatus, reason?: string): AppointmentStatusChange => {
    return {
      id: `status-change-${Date.now()}`,
      appointmentId,
      fromStatus,
      toStatus,
      changedBy: user?.id || 'unknown',
      changedByRole: user?.role || 'client',
      reason,
      timestamp: new Date().toISOString()
    };
  }, [user]);

  // Create notification for real-time updates
  const createNotification = useCallback((userId: string, type: Notification['type'], title: string, message: string, appointmentId?: string): Notification => {
    return {
      id: `notification-${Date.now()}`,
      userId,
      type,
      title,
      message,
      appointmentId,
      read: false,
      createdAt: new Date().toISOString()
    };
  }, []);

  // Update appointment status with audit trail and notifications
  const updateAppointmentStatus = useCallback(async (
    appointmentId: string, 
    newStatus: AppointmentStatus, 
    reason?: string,
    notes?: string
  ) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      return;
    }

    const statusChange = createStatusChange(appointmentId, appointment.status, newStatus, reason);
    
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          statusHistory: [...apt.statusHistory, statusChange],
          ...(notes && { notes }),
          ...(newStatus === 'cancelled' && reason && { cancellationReason: reason }),
          ...(newStatus === 'no-show' && reason && { noShowReason: reason })
        };
      }
      return apt;
    });

    setAppointments(updatedAppointments);
    await saveAppointments(updatedAppointments);

    console.log('Updated appointment status:', appointmentId, newStatus);
  }, [appointments, createStatusChange, saveAppointments]);

  // Role-Based UI (RBUI) - appointment filtering
  const getAppointmentsForUser = useCallback((userRole: UserRole, userId: string) => {
    switch (userRole) {
      case 'client':
        return appointments.filter(apt => apt.clientId === userId);
      case 'provider':
        return appointments.filter(apt => apt.providerId === userId);
      case 'owner':
        return appointments;
      default:
        return [];
    }
  }, [appointments]);

  // Status-based filtering with color coding
  const getAppointmentsByStatus = useCallback((status: AppointmentStatus) => {
    const userAppointments = user ? getAppointmentsForUser(user.role, user.id || '') : [];
    return userAppointments.filter(apt => apt.status === status);
  }, [getAppointmentsForUser, user]);

  // Get appointments with color coding for visual distinctions
  const getAppointmentsWithColors = useCallback(() => {
    const userAppointments = user ? getAppointmentsForUser(user.role, user.id || '') : [];
    return userAppointments.map(apt => ({
      ...apt,
      color: APPOINTMENT_COLORS[apt.status]
    }));
  }, [getAppointmentsForUser, user]);

  // Request new appointment (Client Flow)
  const requestAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `appointment-${Date.now()}`,
      status: 'requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: []
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    await saveAppointments(updatedAppointments);
    
    console.log('Created new appointment request:', newAppointment.id);
    return newAppointment;
  }, [appointments, saveAppointments]);

  // General appointment update function
  const updateAppointment = useCallback(async (appointmentId: string, updates: Partial<Appointment>) => {
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return apt;
    });
    
    setAppointments(updatedAppointments);
    await saveAppointments(updatedAppointments);
    
    console.log('Updated appointment:', appointmentId, updates);
  }, [appointments, saveAppointments]);

  // Convenience methods for common status updates
  const confirmAppointment = useCallback(async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'confirmed');
  }, [updateAppointmentStatus]);

  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string) => {
    await updateAppointmentStatus(appointmentId, 'cancelled', reason);
  }, [updateAppointmentStatus]);

  const completeAppointment = useCallback(async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'completed');
  }, [updateAppointmentStatus]);

  const markNoShow = useCallback(async (appointmentId: string, reason?: string) => {
    await updateAppointmentStatus(appointmentId, 'no-show', reason);
  }, [updateAppointmentStatus]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // Get unread notifications for current user
  const unreadNotifications = useMemo(() => {
    return user ? notifications.filter(notif => notif.userId === user.id && !notif.read) : [];
  }, [notifications, user]);

  // Convert appointments to booking requests format for compatibility
  const bookingRequests = useMemo((): BookingRequest[] => {
    if (!user || user.role !== 'provider' || !appointments || !Array.isArray(appointments)) {
      return [];
    }
    
    return appointments
      .filter(apt => apt && apt.providerId === user.id && apt.status === 'requested')
      .map(apt => ({
        id: apt.id,
        clientId: apt.clientId,
        clientName: `Client ${apt.clientId}`,
        clientImage: undefined,
        providerId: apt.providerId,
        serviceName: `Service ${apt.serviceId}`,
        date: apt.date,
        time: apt.startTime,
        duration: 60,
        price: 50,
        notes: apt.notes,
        status: 'requested' as const,
        createdAt: apt.createdAt,
      }));
  }, [appointments, user]);

  // Confirm booking request (converts to confirmed appointment)
  const confirmBookingRequest = useCallback(async (requestId: string) => {
    await updateAppointmentStatus(requestId, 'confirmed');
  }, [updateAppointmentStatus]);

  // Decline booking request (converts to cancelled appointment)
  const declineBookingRequest = useCallback(async (requestId: string) => {
    await updateAppointmentStatus(requestId, 'cancelled', 'Declined by provider');
  }, [updateAppointmentStatus]);

  const contextValue = useMemo(() => {
    // Ensure all required properties are defined
    const safeValue = {
      appointments: appointments || [],
      notifications: notifications || [],
      unreadNotifications: unreadNotifications || [],
      isLoading: Boolean(isLoading),
      isInitialized: Boolean(isInitialized),
      // Core appointment management
      requestAppointment: requestAppointment || (() => Promise.resolve({} as Appointment)),
      updateAppointment: updateAppointment || (() => Promise.resolve()),
      updateAppointmentStatus: updateAppointmentStatus || (() => Promise.resolve()),
      confirmAppointment: confirmAppointment || (() => Promise.resolve()),
      cancelAppointment: cancelAppointment || (() => Promise.resolve()),
      completeAppointment: completeAppointment || (() => Promise.resolve()),
      markNoShow: markNoShow || (() => Promise.resolve()),
      // Booking requests (for compatibility)
      bookingRequests: bookingRequests || [],
      confirmBookingRequest: confirmBookingRequest || (() => Promise.resolve()),
      declineBookingRequest: declineBookingRequest || (() => Promise.resolve()),
      // Filtering and querying
      getAppointmentsForUser: getAppointmentsForUser || (() => []),
      getAppointmentsByStatus: getAppointmentsByStatus || (() => []),
      getAppointmentsWithColors: getAppointmentsWithColors || (() => []),
      // Notifications
      markNotificationRead: markNotificationRead || (() => Promise.resolve()),
      // Constants
      APPOINTMENT_COLORS: APPOINTMENT_COLORS || {},
    };
    
    console.log('AppointmentProvider: Context value created with', {
      appointmentsCount: safeValue.appointments.length,
      isLoading: safeValue.isLoading,
      isInitialized: safeValue.isInitialized
    });
    
    return safeValue;
  }, [
    appointments,
    notifications,
    unreadNotifications,
    isLoading,
    isInitialized,
    requestAppointment,
    updateAppointment,
    updateAppointmentStatus,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    markNoShow,
    bookingRequests,
    confirmBookingRequest,
    declineBookingRequest,
    getAppointmentsForUser,
    getAppointmentsByStatus,
    getAppointmentsWithColors,
    markNotificationRead,
  ]);

  return contextValue;
});

// Robust hook wrapper to avoid undefined context usage
export function useAppointments(): ReturnType<typeof useAppointmentsInternal> {
  const ctx = useAppointmentsInternal();
  if (!ctx) {
    console.warn('useAppointments called outside of AppointmentProvider. Returning safe fallbacks.');

    const noop = async () => Promise.resolve();
    const noopReturnAppointment = async () => Promise.reject(new Error('AppointmentProvider is not mounted')) as Promise<Appointment>;

    return {
      appointments: [],
      notifications: [],
      unreadNotifications: [],
      isLoading: false,
      isInitialized: false,
      requestAppointment: noopReturnAppointment,
      updateAppointment: noop,
      updateAppointmentStatus: noop,
      confirmAppointment: noop,
      cancelAppointment: noop,
      completeAppointment: noop,
      markNoShow: noop,
      bookingRequests: [],
      confirmBookingRequest: noop,
      declineBookingRequest: noop,
      getAppointmentsForUser: () => [],
      getAppointmentsByStatus: () => [],
      getAppointmentsWithColors: () => [],
      markNotificationRead: noop,
      APPOINTMENT_COLORS,
    } as unknown as ReturnType<typeof useAppointmentsInternal>;
  }
  return ctx;
}

// Export the provider with the original name
export const AppointmentProvider = AppointmentProviderInternal;

// Helper hook for filtering appointments by user role and status
export function useFilteredAppointments(status?: AppointmentStatus) {
  const context = useAppointments();
  const { user } = useAuth();

  return useMemo(() => {
    if (!context || !context.isInitialized || !user) return [];
    
    if (status) {
      return context.getAppointmentsByStatus(status);
    }
    
    return context.getAppointmentsForUser(user.role, user.id || '');
  }, [context, status, user]);
}

// Helper hook for real-time appointment updates (simulated)
export function useRealTimeAppointments() {
  const context = useAppointments();
  
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Simulating real-time sync...');
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { appointments: context.appointments, notifications: context.notifications };
}

// Helper hook for provider-specific appointment management (Provider Flow)
export function useProviderAppointments() {
  const context = useAppointments();
  const { user } = useAuth();
  
  const providerAppointments = useMemo(() => {
    if (!context || !context.isInitialized || user?.role !== 'provider' || !user.id) return [];
    return context.getAppointmentsForUser('provider', user.id);
  }, [context, user]);

  const pendingRequests = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.getAppointmentsByStatus('requested');
  }, [context]);

  const confirmedAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.getAppointmentsByStatus('confirmed');
  }, [context]);

  const todaysAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    const today = new Date().toISOString().split('T')[0];
    return confirmedAppointments.filter((apt: Appointment) => apt.date === today);
  }, [confirmedAppointments, context]);

  const appointmentNotifications = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.unreadNotifications.filter((notif: Notification) => 
      notif.type === 'appointment_requested' || 
      notif.type === 'appointment_cancelled'
    );
  }, [context]);

  return {
    providerAppointments,
    pendingRequests,
    confirmedAppointments,
    todaysAppointments,
    appointmentNotifications,
    confirmAppointment: context.confirmAppointment,
    cancelAppointment: context.cancelAppointment,
    completeAppointment: context.completeAppointment,
    markNoShow: context.markNoShow,
  };
}

// Helper hook for shop owner appointment oversight (Shop Owner Flow)
export function useShopOwnerAppointments() {
  const context = useAppointments();
  const { user } = useAuth();
  
  const allShopAppointments = useMemo(() => {
    if (!context || !context.isInitialized || user?.role !== 'owner' || !user.id) return [];
    return context.getAppointmentsForUser('owner', user.id);
  }, [context, user]);

  const appointmentsWithColors = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.getAppointmentsWithColors();
  }, [context]);

  const appointmentsByStatus = useMemo(() => {
    if (!context || !context.isInitialized) {
      return {
        requested: [],
        confirmed: [],
        completed: [],
        cancelled: [],
        'no-show': [],
      };
    }
    return {
      requested: context.getAppointmentsByStatus('requested'),
      confirmed: context.getAppointmentsByStatus('confirmed'),
      completed: context.getAppointmentsByStatus('completed'),
      cancelled: context.getAppointmentsByStatus('cancelled'),
      'no-show': context.getAppointmentsByStatus('no-show'),
    };
  }, [context]);

  const todaysAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    const today = new Date().toISOString().split('T')[0];
    return allShopAppointments.filter((apt: Appointment) => apt.date === today);
  }, [allShopAppointments, context]);

  const revenueData = useMemo(() => {
    if (!context || !context.isInitialized) return { totalAppointments: 0, estimatedRevenue: 0 };
    const completedAppointments = appointmentsByStatus.completed;
    return {
      totalAppointments: completedAppointments.length,
      estimatedRevenue: completedAppointments.length * 50,
    };
  }, [appointmentsByStatus.completed, context]);

  return {
    allShopAppointments,
    appointmentsWithColors,
    appointmentsByStatus,
    todaysAppointments,
    revenueData,
    unreadNotifications: context.unreadNotifications,
  };
}

// Helper hook for client appointment management (Client Flow)
export function useClientAppointments() {
  const context = useAppointments();
  const { user } = useAuth();
  
  const clientAppointments = useMemo(() => {
    if (!context || !context.isInitialized || user?.role !== 'client' || !user.id) return [];
    return context.getAppointmentsForUser('client', user.id);
  }, [context, user]);

  const upcomingAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return clientAppointments.filter((apt: Appointment) => 
      apt.status === 'confirmed' || apt.status === 'requested'
    );
  }, [clientAppointments, context]);

  const pastAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return clientAppointments.filter((apt: Appointment) => 
      apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no-show'
    );
  }, [clientAppointments, context]);

  const pendingRequests = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return clientAppointments.filter((apt: Appointment) => apt.status === 'requested');
  }, [clientAppointments, context]);

  const appointmentNotifications = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.unreadNotifications.filter((notif: Notification) => 
      notif.type === 'appointment_confirmed' || 
      notif.type === 'appointment_cancelled' ||
      notif.type === 'appointment_reminder'
    );
  }, [context]);

  return {
    clientAppointments,
    upcomingAppointments,
    pastAppointments,
    pendingRequests,
    appointmentNotifications,
    requestAppointment: context.requestAppointment,
    cancelAppointment: context.cancelAppointment,
  };
}