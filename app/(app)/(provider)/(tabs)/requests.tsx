import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Clock, User, CheckCircle, XCircle, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '@/constants/theme';
import { useAppointments, BookingRequest } from '@/providers/AppointmentProvider';

export default function BookingRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { bookingRequests, confirmBookingRequest, declineBookingRequest } = useAppointments();
  const [filterStatus, setFilterStatus] = useState<'all' | 'requested' | 'confirmed' | 'declined'>('all');

  // Filter requests based on status
  const filteredRequests = useMemo(() => {
    if (!bookingRequests || !Array.isArray(bookingRequests)) return [];
    
    if (filterStatus === 'all') {
      return bookingRequests;
    }
    return bookingRequests.filter(req => req.status === filterStatus);
  }, [bookingRequests, filterStatus]);



  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'requested':
        return COLORS.warning;
      case 'confirmed':
        return COLORS.success;
      case 'declined':
        return COLORS.error;
      default:
        return COLORS.text;
    }
  };

  const getStatusText = (status: BookingRequest['status']) => {
    switch (status) {
      case 'requested':
        return 'PENDING';
      case 'confirmed':
        return 'CONFIRMED';
      case 'declined':
        return 'DECLINED';
      default:
        return 'UNKNOWN';
    }
  };

  const handleConfirm = async (requestId: string) => {
    try {
      await confirmBookingRequest(requestId);
      console.log('Booking request confirmed and appointment created');
    } catch (error) {
      console.error('Error confirming request:', error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineBookingRequest(requestId);
      console.log('Booking request declined');
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const renderRequest = (request: BookingRequest) => (
    <View key={request.id} style={styles.requestCard}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
        <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
      </View>

      {/* Request Header */}
      <View style={styles.requestHeader}>
        <View style={styles.clientInfo}>
          <Image 
            source={{ uri: request.clientImage || 'https://i.pravatar.cc/150?img=1' }} 
            style={styles.clientImage} 
          />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{request.clientName}</Text>
            <Text style={styles.requestService}>{request.serviceName}</Text>
          </View>
        </View>
        <Text style={styles.requestPrice}>${request.price}</Text>
      </View>

      {/* Request Details */}
      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color={COLORS.text} />
          <Text style={styles.detailText}>{request.time}</Text>
          <Text style={styles.durationText}>({request.duration} min)</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color={COLORS.text} />
          <Text style={styles.detailText}>{new Date(request.date).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Notes */}
      {request.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Client Notes:</Text>
          <Text style={styles.notesText}>{request.notes}</Text>
        </View>
      )}

      {/* Action Buttons - Only show for pending requests */}
      {request.status === 'requested' && (
        <View style={styles.requestActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDecline(request.id)}
          >
            <XCircle size={18} color={COLORS.error} />
            <Text style={[styles.actionButtonText, styles.declineButtonText]}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleConfirm(request.id)}
          >
            <CheckCircle size={18} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, styles.confirmButtonText]}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        Requested {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Requests</Text>
        <Text style={styles.subtitle}>Manage your appointment requests</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'requested', 'confirmed', 'declined'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.activeFilterButton,
              ]}
              onPress={() => {
                if (status && status.trim() && status.length <= 20) {
                  setFilterStatus(status);
                }
              }}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.activeFilterButtonText,
              ]}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}

      >
        {!filteredRequests || filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User size={48} color={COLORS.text} />
            <Text style={styles.emptyText}>No booking requests</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'all' 
                ? 'You have no booking requests yet'
                : `No ${filterStatus} requests found`
              }
            </Text>
          </View>
        ) : (
          filteredRequests.map(renderRequest)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 60, // Space for status badge
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  requestService: {
    fontSize: 16,
    color: COLORS.primary,
  },
  requestPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  requestDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  durationText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.6,
    marginLeft: 4,
  },
  notesContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.error,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  declineButtonText: {
    color: COLORS.error,
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.5,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
});