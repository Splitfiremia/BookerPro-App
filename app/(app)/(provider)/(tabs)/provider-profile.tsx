import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Switch, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { Clock, Settings, Edit, LogOut, CreditCard, Search, Users, Award, Store, QrCode, Gift, HelpCircle, Banknote, X, Plus, DollarSign, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useServices } from '@/providers/ServicesProvider';
import { router } from 'expo-router';
import ServiceEditModal from '@/components/ServiceEditModal';
import { Service } from '@/models/database';

export default function ProviderProfileScreen() {
  const { logout, user } = useAuth();
  const {
    services,
    masterServices,
    serviceOfferings,
    addService,
    updateService,
    deleteService,
    addMasterService,
    updateMasterService,
    deleteMasterService,
    toggleServiceOffering,
    isLoading: servicesLoading,
  } = useServices();
  const insets = useSafeAreaInsets();

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setErrorMessage('Failed to sign out. Please try again.');
      setShowErrorModal(true);
    } finally {
      setShowSignOutModal(false);
    }
  };



  // Validate screen parameter before navigation
  const navigateTo = (screen: string) => {
    if (!screen || screen.trim() === '') return;
    if (screen.length > 100) return;
    router.push(screen.trim() as any);
  };

  const isIndependentProvider = () => {
    return user?.mockData?.profile?.isIndependent !== false;
  };

  const handleSaveService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingService) {
        if (isIndependentProvider()) {
          await updateService(editingService.id, serviceData);
        } else {
          await updateMasterService(editingService.id, serviceData);
        }
      } else {
        if (isIndependentProvider()) {
          await addService(serviceData);
        } else {
          await addMasterService(serviceData);
        }
      }
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      if (isIndependentProvider()) {
        await deleteService(serviceId);
      } else {
        await deleteMasterService(serviceId);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleServiceOffering = async (serviceId: string, isOffered: boolean) => {
    try {
      await toggleServiceOffering(serviceId, isOffered);
    } catch (error) {
      console.error('Error toggling service offering:', error);
    }
  };

  const renderIndependentServices = () => {
    if (services.length === 0) {
      return (
        <View style={styles.emptyState}>
          <DollarSign size={48} color={COLORS.secondary} />
          <Text style={styles.emptyStateText}>No services added yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first service to start accepting bookings</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={services.filter(s => s.isActive)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.serviceItem}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceDetails}>
                {item.duration} min • ${item.price}
              </Text>
              {item.description && (
                <Text style={styles.serviceDescription}>{item.description}</Text>
              )}
            </View>
            <View style={styles.serviceActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setEditingService(item);
                  setShowServiceModal(true);
                }}
              >
                <Edit size={16} color={COLORS.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteService(item.id)}
              >
                <Trash2 size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    );
  };

  const renderShopBasedServices = () => {
    if (masterServices.length === 0) {
      return (
        <View style={styles.emptyState}>
          <DollarSign size={48} color={COLORS.secondary} />
          <Text style={styles.emptyStateText}>No shop services available</Text>
          <Text style={styles.emptyStateSubtext}>Contact your shop owner to add services</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={masterServices.filter(s => s.isActive)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const offering = serviceOfferings.find(o => o.serviceId === item.id);
          const isOffered = offering?.isOffered || false;
          
          return (
            <View style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceDetails}>
                  {item.duration} min • ${item.price}
                </Text>
                {item.description && (
                  <Text style={styles.serviceDescription}>{item.description}</Text>
                )}
              </View>
              <View style={styles.serviceToggle}>
                <Text style={styles.toggleLabel}>I offer this</Text>
                <Switch
                  value={isOffered}
                  onValueChange={(value) => handleToggleServiceOffering(item.id, value)}
                  trackColor={{ false: '#e0e0e0', true: COLORS.accent }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          );
        }}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="provider-profile-screen">
      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalText}>Are you sure you want to sign out?</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmSignOut}
              >
                <Text style={styles.confirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Error</Text>
              <TouchableOpacity onPress={() => setShowErrorModal(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity 
              style={[styles.modalButton, styles.fullWidthButton]} 
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView>
        {/* Header with profile info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.settingsIcon}>
              <Settings size={24} color={COLORS.accent} />
            </TouchableOpacity>
            <View style={styles.qrCodeContainer}>
              <QrCode size={24} color={COLORS.accent} />
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Luis Martinez'}</Text>
            <Text style={styles.title}>Barber</Text>
          </View>
          
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileInitial}>L</Text>
            <View style={styles.editProfileBadge}>
              <Edit size={16} color={COLORS.background} />
            </View>
          </View>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>EDIT BARBER PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription and Payments section */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/subscription')}>
            <View style={styles.menuIconContainer}>
              <Award size={24} color={COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Subscription</Text>
              <View style={styles.menuSubtitleRow}>
                <Text style={styles.menuSubtitle}>Pro (Trial - 15 days)</Text>
                <View style={styles.notificationDot} />
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/payments')}>
            <View style={styles.menuIconContainer}>
              <CreditCard size={24} color={COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Payments</Text>
              <View style={styles.menuSubtitleRow}>
                <Text style={styles.menuSubtitle}>Setup Required</Text>
                <View style={styles.notificationDot} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Discovery and Bookings section */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/discovery')}>
            <View style={styles.menuIconContainer}>
              <Search size={24} color={COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Discovery</Text>
              <View style={styles.menuSubtitleRow}>
                <View style={styles.notificationDot} />
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/bookings')}>
            <View style={styles.menuIconContainer}>
              <Clock size={24} color={COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Bookings</Text>
              <View style={styles.menuSubtitleRow}>
                <View style={styles.notificationDot} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Single row menu items */}
        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/refer')}>
          <View style={styles.singleMenuIconContainer}>
            <Users size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Refer a Barber</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/invite')}>
          <View style={styles.singleMenuIconContainer}>
            <Users size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Invite Your Clients</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/client-referral')}>
          <View style={styles.singleMenuIconContainer}>
            <Users size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Client Referral Program</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/loyalty')}>
          <View style={styles.singleMenuIconContainer}>
            <Award size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Client Loyalty Program</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/booth-rent')}>
          <View style={styles.singleMenuIconContainer}>
            <Banknote size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Booth Rent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/find-booth')}>
          <View style={styles.singleMenuIconContainer}>
            <Store size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Find A New Booth</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/redeem')}>
          <View style={styles.singleMenuIconContainer}>
            <Gift size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Redeem Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/help')}>
          <View style={styles.singleMenuIconContainer}>
            <HelpCircle size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Help & Resources</Text>
        </TouchableOpacity>

        {/* Services Section */}
        {user?.role === 'provider' && (
          <View style={styles.servicesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Services</Text>
              {isIndependentProvider() && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setEditingService(null);
                    setShowServiceModal(true);
                  }}
                >
                  <Plus size={20} color={COLORS.accent} />
                  <Text style={styles.addButtonText}>Add Service</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {servicesLoading ? (
              <Text style={styles.loadingText}>Loading services...</Text>
            ) : (
              <View style={styles.servicesList}>
                {isIndependentProvider() ? renderIndependentServices() : renderShopBasedServices()}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#FFFFFF" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
        {/* Service Edit Modal */}
        <ServiceEditModal
          visible={showServiceModal}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
          service={editingService}
          onSave={handleSaveService}
          title={editingService ? 'Edit Service' : 'Add New Service'}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  fullWidthButton: {
    marginHorizontal: 0,
  },
  cancelButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: '#DC2626',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsIcon: {
    padding: 5,
  },
  qrCodeContainer: {
    padding: 5,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
    position: 'relative',
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editProfileBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  editProfileButton: {
    alignItems: 'center',
    marginTop: 5,
  },
  editProfileText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 5,
  },
  menuIconContainer: {
    marginBottom: 10,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  singleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  singleMenuIconContainer: {
    marginRight: 16,
  },
  singleMenuText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  signOutText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  servicesSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  servicesList: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: 16,
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  serviceToggle: {
    alignItems: 'center',
    gap: 4,
  },
  toggleLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});