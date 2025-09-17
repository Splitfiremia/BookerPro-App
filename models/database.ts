// Database models for TheCut app

// User types
export type UserRole = 'client' | 'provider' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Shop model
export interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  image?: string;
  ownerId: string;
  masterServiceList: Service[]; // Shop's master service list
  createdAt: string;
  updatedAt: string;
}

// Provider model (service provider)
export interface Provider {
  id: string;
  userId: string;
  shopId?: string; // Optional - null for independent providers
  isIndependent: boolean;
  specialties: string[];
  bio?: string;
  experience?: string;
  portfolio?: string[];
  boothRentAmount?: number;
  boothRentDueDate?: string;
  boothRentFrequency?: 'weekly' | 'monthly';
  payoutSchedule: 'daily' | 'weekly' | 'monthly' | 'instant';
  services?: Service[]; // For independent providers
  createdAt: string;
  updatedAt: string;
}

// Service model
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  isActive: boolean;
  providerId?: string; // For independent providers
  shopId?: string; // For shop master service lists
  createdAt: string;
  updatedAt: string;
}

// Provider service offering (for shop-based providers)
export interface ProviderServiceOffering {
  id: string;
  providerId: string;
  serviceId: string; // References shop's master service
  isOffered: boolean;
  customPrice?: number; // Optional custom pricing
  createdAt: string;
  updatedAt: string;
}

// Unified Appointment model with comprehensive status management
export type AppointmentStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  shopId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  clientNotes?: string;
  providerNotes?: string;
  cancellationReason?: string;
  noShowReason?: string;
  reminderSent?: boolean;
  confirmationSent?: boolean;
  createdAt: string;
  updatedAt: string;
  statusHistory: AppointmentStatusChange[];
}

// Status change tracking for audit trail
export interface AppointmentStatusChange {
  id: string;
  appointmentId: string;
  fromStatus: AppointmentStatus | null;
  toStatus: AppointmentStatus;
  changedBy: string; // userId
  changedByRole: UserRole;
  reason?: string;
  timestamp: string;
}

// Notification model for real-time updates
export interface Notification {
  id: string;
  userId: string;
  type: 'appointment_requested' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder' | 'payment_received';
  title: string;
  message: string;
  appointmentId?: string;
  read: boolean;
  createdAt: string;
}

// Payment model
export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  tipAmount: number;
  status: 'pending' | 'completed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Review model
export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Team member model (for shop owners)
export interface TeamMember {
  id: string;
  providerId: string;
  shopId: string;
  role: 'provider' | 'manager' | 'receptionist';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics model
export interface Analytics {
  id: string;
  shopId?: string;
  stylistId?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalAppointments: number;
  totalRevenue: number;
  averageRating: number;
  topServices: {
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Booth rent tracking model
export interface BoothRent {
  id: string;
  providerId: string;
  shopId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// Availability models
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeInterval {
  start: string; // Format: "HH:MM" (24-hour)
  end: string;   // Format: "HH:MM" (24-hour)
}

export interface DayAvailability {
  day: DayOfWeek;
  isEnabled: boolean;
  intervals: TimeInterval[];
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  weeklySchedule: DayAvailability[];
  breaks?: {
    day: DayOfWeek;
    intervals: TimeInterval[];
  }[];
  createdAt: string;
  updatedAt: string;
}

// Shop operating hours (constrains provider availability)
export interface ShopOperatingHours {
  id: string;
  shopId: string;
  weeklyHours: DayAvailability[];
  createdAt: string;
  updatedAt: string;
}

// Available time slots for booking (generated from availability)
export interface AvailableTimeSlot {
  date: string;     // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  duration: number;  // in minutes
  isAvailable: boolean;
  providerId: string;
}