import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { CheckCircle, X, Clock, AlertCircle, Calendar } from 'lucide-react-native';
import { useAppointments, APPOINTMENT_COLORS } from '@/providers/AppointmentProvider';
import { Appointment, AppointmentStatus } from '@/models/database';
import { useAuth } from '@/providers/AuthProvider';

interface AppointmentStatusManagerProps {
  appointment: Appointment;
  onStatusChange?: (newStatus: AppointmentStatus) => void;
  showAllActions?: boolean;
  compact?: boolean;
}

export const AppointmentStatusManager: React.FC<AppointmentStatusManagerProps> = ({
  appointment,
  onStatusChange,
  showAllActions = false,
  compact = false
}) => {
  const { user } = useAuth();
  const { updateAppointmentStatus } = useAppointments();
  const [showReasonModal, setShowReasonModal] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleStatusChange = async (newStatus: AppointmentStatus, requiresReason = false) => {
    console.log('Attempting status change:', appointment.id, newStatus);
    
    if (requiresReason) {
      setPendingStatus(newStatus);
      setShowReasonModal(true);
      return;
    }

    setIsLoading(true);
    try {
      await updateAppointmentStatus(appointment.id, newStatus);
      onStatusChange?.(newStatus);
      console.log('Status updated successfully:', newStatus);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Error', 'Failed to update appointment status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReasonSubmit = async () => {
    if (!pendingStatus) return;

    setIsLoading(true);
    try {
      await updateAppointmentStatus(appointment.id, pendingStatus, reason);
      onStatusChange?.(pendingStatus);
      setShowReasonModal(false);
      setReason('');
      setPendingStatus(null);
      console.log('Status updated with reason:', pendingStatus, reason);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Error', 'Failed to update appointment status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Role-based action permissions with unified data model
  const getAvailableActions = () => {
    const actions: Array<{
      status: AppointmentStatus;
      label: string;
      icon: React.ReactNode;
      color: string;
      requiresReason?: boolean;
    }> = [];

    if (!user) return actions;

    const currentStatus = appointment.status;
    const userRole = user.role;

    // Client Flow: Discovery and Booking
    if (userRole === 'client') {
      if (currentStatus === 'requested' || currentStatus === 'confirmed') {
        actions.push({
          status: 'cancelled',
          label: 'Cancel',
          icon: <X size={16} color="#fff" />,
          color: APPOINTMENT_COLORS.cancelled,
          requiresReason: true
        });
      }
    }

    // Provider Flow: Request Management and Schedule Control
    if (userRole === 'provider') {
      if (currentStatus === 'requested') {
        actions.push(
          {
            status: 'confirmed',
            label: 'Confirm',
            icon: <CheckCircle size={16} color="#fff" />,
            color: APPOINTMENT_COLORS.confirmed
          },
          {
            status: 'cancelled',
            label: 'Decline',
            icon: <X size={16} color="#fff" />,
            color: APPOINTMENT_COLORS.cancelled,
            requiresReason: true
          }
        );
      } else if (currentStatus === 'confirmed') {
        actions.push(
          {
            status: 'completed',
            label: 'Complete',
            icon: <CheckCircle size={16} color="#fff" />,
            color: APPOINTMENT_COLORS.completed
          },
          {
            status: 'no-show',
            label: 'No-show',
            icon: <AlertCircle size={16} color="#fff" />,
            color: APPOINTMENT_COLORS['no-show'],
            requiresReason: true
          },
          {
            status: 'cancelled',
            label: 'Cancel',
            icon: <X size={16} color="#fff" />,
            color: APPOINTMENT_COLORS.cancelled,
            requiresReason: true
          }
        );
      }
    }

    // Shop Owner Flow: Oversight and Business Intelligence
    if (userRole === 'owner') {
      if (showAllActions) {
        if (currentStatus === 'requested') {
          actions.push(
            {
              status: 'confirmed',
              label: 'Override Confirm',
              icon: <CheckCircle size={16} color="#fff" />,
              color: APPOINTMENT_COLORS.confirmed
            },
            {
              status: 'cancelled',
              label: 'Override Cancel',
              icon: <X size={16} color="#fff" />,
              color: APPOINTMENT_COLORS.cancelled,
              requiresReason: true
            }
          );
        } else if (currentStatus === 'confirmed') {
          actions.push(
            {
              status: 'completed',
              label: 'Mark Complete',
              icon: <CheckCircle size={16} color="#fff" />,
              color: APPOINTMENT_COLORS.completed
            },
            {
              status: 'no-show',
              label: 'Mark No-show',
              icon: <AlertCircle size={16} color="#fff" />,
              color: APPOINTMENT_COLORS['no-show'],
              requiresReason: true
            }
          );
        }
      }
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  // Compact view for lists
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.compactStatusBadge, { backgroundColor: APPOINTMENT_COLORS[appointment.status] }]}>
          <Text style={styles.compactStatusText}>{appointment.status.toUpperCase()}</Text>
        </View>
        {availableActions.length > 0 && (
          <View style={styles.compactActions}>
            {availableActions.slice(0, 2).map((action) => (
              <TouchableOpacity
                key={action.status}
                style={[styles.compactActionButton, { backgroundColor: action.color }]}
                onPress={() => handleStatusChange(action.status, action.requiresReason)}
                disabled={isLoading}
                testID={`compact-action-${action.status}`}
              >
                {action.icon}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  // Read-only status display for completed/cancelled appointments or when no actions available
  if (availableActions.length === 0 || ['completed', 'cancelled', 'no-show'].includes(appointment.status)) {
    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: APPOINTMENT_COLORS[appointment.status] }]}>
          <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
        </View>
        {appointment.cancellationReason && (
          <Text style={styles.reasonText}>Reason: {appointment.cancellationReason}</Text>
        )}
        {appointment.noShowReason && (
          <Text style={styles.reasonText}>No-show: {appointment.noShowReason}</Text>
        )}
        {appointment.statusHistory.length > 1 && (
          <Text style={styles.historyText}>
            {appointment.statusHistory.length} status changes
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.currentStatus}>
        <Text style={styles.currentStatusLabel}>Status:</Text>
        <View style={[styles.statusBadge, { backgroundColor: APPOINTMENT_COLORS[appointment.status] }]}>
          <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.actionsLabel}>Available Actions:</Text>
        <View style={styles.actionButtons}>
          {availableActions.map((action) => (
            <TouchableOpacity
              key={action.status}
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: isLoading ? '#F5F5F5' : action.color
                }
              ]}
              onPress={() => handleStatusChange(action.status, action.requiresReason)}
              disabled={isLoading}
              testID={`action-${action.status}`}
            >
              <View style={styles.actionContent}>
                {action.icon}
                <Text style={styles.actionText}>
                  {isLoading ? 'Processing...' : action.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reason Modal for cancellations and no-shows */}
      <Modal
        visible={showReasonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReasonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {pendingStatus === 'cancelled' ? 'Cancellation Reason' : 
               pendingStatus === 'no-show' ? 'No-show Reason' : 'Reason'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for this action (optional)
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Enter reason..."
              multiline
              numberOfLines={3}
              maxLength={200}
              testID="reason-input"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowReasonModal(false);
                  setReason('');
                  setPendingStatus(null);
                }}
                disabled={isLoading}
                testID="cancel-reason"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  { backgroundColor: isLoading ? '#CCC' : '#007AFF' }
                ]}
                onPress={handleReasonSubmit}
                disabled={isLoading}
                testID="confirm-reason"
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Processing...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginVertical: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  compactStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  compactActions: {
    flexDirection: 'row',
    gap: 4,
  },
  compactActionButton: {
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 16,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentStatusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reasonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  historyText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AppointmentStatusManager;