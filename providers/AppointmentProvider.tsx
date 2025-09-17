import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@/utils/contextHook";
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
    startTime: "17:00",
    endTime: "17:30",
    status: "confirmed",
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
    startTime: "14:00",
    endTime: "16:00",
    status: "requested",
    notes: "Color and highlights - please use organic products",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  },
  {
    id: "3",
    clientId: "client-3",
    providerId: "provider-1",
    serviceId: "service-3",
    shopId: "shop-1",
    date: "2024-09-19",
    startTime: "10:00",
    endTime: "11:00",
    status: "requested",
    notes: "First time client - consultation needed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  },
  {
    id: "4",
    clientId: "client-4",
    providerId: "provider-1",
    serviceId: "service-4",
    shopId: "shop-1",
    date: "2024-09-20",
    startTime: "16:00",
    endTime: "16:30",
    status: "requested",
    notes: "Beard trim and styling",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  },
  {
    id: "5",
    clientId: "client-1",
    providerId: "provider-3",
    serviceId: "service-3",
    shopId: "shop-2",
    date: "2024-09-15",
    startTime: "11:00",
    endTime: "11:45",
    status: "completed",
    notes: "Gel manicure",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  },
  {
    id: "6",
    clientId: "client-5",
    providerId: "provider-1",
    serviceId: "service-1",
    shopId: "shop-1",
    date: "2024-09-14",
    startTime: "10:00",
    endTime: "10:30",
    status: "cancelled",
    notes: "Regular cut",
    cancellationReason: "Client cancelled due to emergency",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  },
  {
    id: "7",
    clientId: "client-6",
    providerId: "provider-2",
    serviceId: "service-5",
    shopId: "shop-1",
    date: "2024-09-13",
    startTime: "15:00",
    endTime: "16:00",
    status: "no-show",
    notes: "Hair styling",
    noShowReason: "Client did not show up",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  }
];

export const [AppointmentProvider, useAppointments] = createContextHook(() => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load appointments and notifications on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading appointments and notifications...');
        
        // Load appointments
        const storedAppointments = await AsyncStorage.getItem("appointments");
        if (storedAppointments) {
          const parsedAppointments = JSON.parse(storedAppointments);
          console.log('Loaded stored appointments:', parsedAppointments.length);
          setAppointments(parsedAppointments);
        } else {
          console.log('Using mock appointments:', mockAppointmentsData.length);
          setAppointments(mockAppointmentsData);
          await AsyncStorage.setItem("appointments", JSON.stringify(mockAppointmentsData));
        }

        // Load notifications
        const storedNotifications = await AsyncStorage.getItem("notifications");
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          setNotifications(parsedNotifications);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setAppointments(mockAppointmentsData);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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

    // Create notifications based on status change and user role - Notification Engine
    const newNotifications: Notification[] = [];
    
    if (newStatus === 'confirmed' && user?.role === 'provider') {
      // Provider confirmed appointment - notify client
      newNotifications.push(createNotification(
        appointment.clientId,
        'appointment_confirmed',
        'Appointment Confirmed',
        `Your appointment has been confirmed for ${appointment.date} at ${appointment.startTime}`,
        appointmentId
      ));
    } else if (newStatus === 'requested' && user?.role === 'client') {
      // Client requested appointment - notify provider
      newNotifications.push(createNotification(
        appointment.providerId,
        'appointment_requested',
        'New Appointment Request',
        `You have a new appointment request for ${appointment.date} at ${appointment.startTime}`,
        appointmentId
      ));
    } else if (newStatus === 'cancelled') {
      // Appointment cancelled - notify other party
      const notifyUserId = user?.role === 'client' ? appointment.providerId : appointment.clientId;
      newNotifications.push(createNotification(
        notifyUserId,
        'appointment_cancelled',
        'Appointment Cancelled',
        `An appointment for ${appointment.date} at ${appointment.startTime} has been cancelled`,
        appointmentId
      ));
    }

    if (newNotifications.length > 0) {
      const updatedNotifications = [...notifications, ...newNotifications];
      setNotifications(updatedNotifications);
      await saveNotifications(updatedNotifications);
    }

    console.log('Updated appointment status:', appointmentId, newStatus);
  }, [appointments, notifications, user, createStatusChange, createNotification, saveAppointments, saveNotifications]);

  // Role-Based UI (RBUI) - appointment filtering
  const getAppointmentsForUser = useCallback((userRole: UserRole, userId: string) => {
    switch (userRole) {
      case 'client':
        return appointments.filter(apt => apt.clientId === userId);
      case 'provider':
        return appointments.filter(apt => apt.providerId === userId);
      case 'owner':
        // Shop owners see all appointments in their shops
        // In real implementation, this would filter by shopId based on user's owned shops
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
    
    // Notify provider of new request
    const notification = createNotification(
      newAppointment.providerId,
      'appointment_requested',
      'New Appointment Request',
      `You have a new appointment request for ${newAppointment.date} at ${newAppointment.startTime}`,
      newAppointment.id
    );
    
    const updatedNotifications = [...notifications, notification];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
    
    console.log('Created new appointment request:', newAppointment.id);
    return newAppointment;
  }, [appointments, notifications, createNotification, saveAppointments, saveNotifications]);

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

  // Real-time sync simulation (in production, this would use WebSockets)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Simulating real-time sync check...');
      // In real implementation, this would check for updates from server
      // and update local state accordingly to prevent double-booking
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Convert appointments to booking requests format for compatibility
  const bookingRequests = useMemo((): BookingRequest[] => {
    if (!user || user.role !== 'provider') return [];
    
    return appointments
      .filter(apt => apt.providerId === user.id && apt.status === 'requested')
      .map(apt => ({
        id: apt.id,
        clientId: apt.clientId,
        clientName: `Client ${apt.clientId}`, // In real app, this would be fetched from user data
        clientImage: undefined,
        providerId: apt.providerId,
        serviceName: `Service ${apt.serviceId}`, // In real app, this would be fetched from service data
        date: apt.date,
        time: apt.startTime,
        duration: 60, // Default duration, in real app this would come from service data
        price: 50, // Default price, in real app this would come from service data
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

  const contextValue = useMemo(() => ({
    appointments,
    notifications,
    unreadNotifications,
    isLoading,
    // Core appointment management
    requestAppointment,
    updateAppointmentStatus,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    markNoShow,
    // Booking requests (for compatibility)
    bookingRequests,
    confirmBookingRequest,
    declineBookingRequest,
    // Filtering and querying
    getAppointmentsForUser,
    getAppointmentsByStatus,
    getAppointmentsWithColors,
    // Notifications
    markNotificationRead,
    // Constants
    APPOINTMENT_COLORS,
  }), [
    appointments,
    notifications,
    unreadNotifications,
    isLoading,
    requestAppointment,
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

// Helper hook for filtering appointments by user role and status
export function useFilteredAppointments(status?: AppointmentStatus) {
  const { getAppointmentsForUser, getAppointmentsByStatus } = useAppointments();
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return [];
    
    if (status) {
      return getAppointmentsByStatus(status);
    }
    
    return getAppointmentsForUser(user.role, user.id || '');
  }, [getAppointmentsForUser, getAppointmentsByStatus, status, user]);
}

// Helper hook for real-time appointment updates (simulated)
export function useRealTimeAppointments() {
  const { appointments, notifications } = useAppointments();
  
  // In a real implementation, this would connect to WebSocket or Server-Sent Events
  // For now, we simulate real-time updates through the notification system
  
  useEffect(() => {
    // Simulate periodic sync with server
    const interval = setInterval(() => {
      console.log('Simulating real-time sync...');
      // In real implementation, this would fetch latest data from server
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return { appointments, notifications };
}

// Helper hook for provider-specific appointment management (Provider Flow)
export function useProviderAppointments() {
  const { 
    getAppointmentsForUser, 
    getAppointmentsByStatus, 
    confirmAppointment, 
    cancelAppointment, 
    completeAppointment,
    markNoShow,
    unreadNotifications
  } = useAppointments();
  const { user } = useAuth();

  const providerAppointments = useMemo(() => {
    if (user?.role !== 'provider' || !user.id) return [];
    return getAppointmentsForUser('provider', user.id);
  }, [getAppointmentsForUser, user]);

  const pendingRequests = useMemo(() => {
    return getAppointmentsByStatus('requested');
  }, [getAppointmentsByStatus]);

  const confirmedAppointments = useMemo(() => {
    return getAppointmentsByStatus('confirmed');
  }, [getAppointmentsByStatus]);

  const todaysAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return confirmedAppointments.filter(apt => apt.date === today);
  }, [confirmedAppointments]);

  const appointmentNotifications = useMemo(() => {
    return unreadNotifications.filter(notif => 
      notif.type === 'appointment_requested' || 
      notif.type === 'appointment_cancelled'
    );
  }, [unreadNotifications]);

  return {
    providerAppointments,
    pendingRequests,
    confirmedAppointments,
    todaysAppointments,
    appointmentNotifications,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    markNoShow,
  };
}

// Helper hook for shop owner appointment oversight (Shop Owner Flow)
export function useShopOwnerAppointments() {
  const { 
    getAppointmentsForUser, 
    getAppointmentsByStatus,
    getAppointmentsWithColors,
    unreadNotifications 
  } = useAppointments();
  const { user } = useAuth();

  const allShopAppointments = useMemo(() => {
    if (user?.role !== 'owner' || !user.id) return [];
    return getAppointmentsForUser('owner', user.id);
  }, [getAppointmentsForUser, user]);

  const appointmentsWithColors = useMemo(() => {
    return getAppointmentsWithColors();
  }, [getAppointmentsWithColors]);

  const appointmentsByStatus = useMemo(() => {
    return {
      requested: getAppointmentsByStatus('requested'),
      confirmed: getAppointmentsByStatus('confirmed'),
      completed: getAppointmentsByStatus('completed'),
      cancelled: getAppointmentsByStatus('cancelled'),
      'no-show': getAppointmentsByStatus('no-show'),
    };
  }, [getAppointmentsByStatus]);

  const todaysAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allShopAppointments.filter(apt => apt.date === today);
  }, [allShopAppointments]);

  const revenueData = useMemo(() => {
    const completedAppointments = appointmentsByStatus.completed;
    // In real implementation, this would calculate actual revenue from payment data
    return {
      totalAppointments: completedAppointments.length,
      estimatedRevenue: completedAppointments.length * 50, // Mock calculation
    };
  }, [appointmentsByStatus.completed]);

  return {
    allShopAppointments,
    appointmentsWithColors,
    appointmentsByStatus,
    todaysAppointments,
    revenueData,
    unreadNotifications,
  };
}

// Helper hook for client appointment management (Client Flow)
export function useClientAppointments() {
  const { 
    getAppointmentsForUser, 
    requestAppointment, 
    cancelAppointment,
    unreadNotifications 
  } = useAppointments();
  const { user } = useAuth();

  const clientAppointments = useMemo(() => {
    if (user?.role !== 'client' || !user.id) return [];
    return getAppointmentsForUser('client', user.id);
  }, [getAppointmentsForUser, user]);

  const upcomingAppointments = useMemo(() => {
    return clientAppointments.filter(apt => 
      apt.status === 'confirmed' || apt.status === 'requested'
    );
  }, [clientAppointments]);

  const pastAppointments = useMemo(() => {
    return clientAppointments.filter(apt => 
      apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no-show'
    );
  }, [clientAppointments]);

  const pendingRequests = useMemo(() => {
    return clientAppointments.filter(apt => apt.status === 'requested');
  }, [clientAppointments]);

  const appointmentNotifications = useMemo(() => {
    return unreadNotifications.filter(notif => 
      notif.type === 'appointment_confirmed' || 
      notif.type === 'appointment_cancelled' ||
      notif.type === 'appointment_reminder'
    );
  }, [unreadNotifications]);

  return {
    clientAppointments,
    upcomingAppointments,
    pastAppointments,
    pendingRequests,
    appointmentNotifications,
    requestAppointment,
    cancelAppointment,
  };
}