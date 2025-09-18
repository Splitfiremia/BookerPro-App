import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Bell, Lock, CreditCard, HelpCircle, LogOut, Store, Users, Calendar, Plus, Edit, Trash2, DollarSign } from 'lucide-react-native';
import { useServices } from '@/providers/ServicesProvider';
import { useAuth } from '@/providers/AuthProvider';
import ServiceEditModal from '@/components/ServiceEditModal';
import { Service } from '@/models/database';
import { COLORS } from '@/constants/theme';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    masterServices,
    addMasterService,
    updateMasterService,
    deleteMasterService,
    isLoading: servicesLoading,
  } = useServices();
  const [notifications, setNotifications] = useState(true);
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out", 
      "Are you sure you want to sign out?", 
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              console.log('Shop Owner Settings: Starting logout process');
              await logout();
              console.log('Shop Owner Settings: Logout completed, navigating to index');
              router.replace('/');
            } catch (error) {
              console.error('Shop Owner Settings: Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleSaveService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingService) {
        await updateMasterService(editingService.id, serviceData);
      } else {
        await addMasterService(serviceData);
      }
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteMasterService(serviceId);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const renderMasterServices = () => {
    if (masterServices.length === 0) {
      return (
        <View style={styles.emptyState}>
          <DollarSign size={48} color="#666" />
          <Text style={styles.emptyStateText}>No services added yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first service to get started</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={masterServices.filter(s => s.isActive)}
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
                <Edit size={16} color="#007AFF" />
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

  const settingSections = [
    {
      title: 'Shop Management',
      items: [
        {
          id: 'shop-info',
          title: 'Shop Information',
          subtitle: 'Update shop details and hours',
          icon: Store,
          type: 'navigate' as const,
          onPress: () => console.log('Shop info'),
        },
        {
          id: 'shop-services',
          title: 'Shop Services & Pricing',
          subtitle: 'Manage your master service list',
          icon: DollarSign,
          type: 'navigate' as const,
          onPress: () => console.log('Shop services'),
        },
        {
          id: 'team-permissions',
          title: 'Team Permissions',
          subtitle: 'Manage staff access levels',
          icon: Users,
          type: 'navigate' as const,
          onPress: () => console.log('Team permissions'),
        },
        {
          id: 'booking-settings',
          title: 'Booking Settings',
          subtitle: 'Configure appointment rules',
          icon: Calendar,
          type: 'navigate' as const,
          onPress: () => console.log('Booking settings'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          icon: Bell,
          type: 'toggle' as const,
          value: notifications,
          onPress: () => setNotifications(!notifications),
        },
        {
          id: 'auto-accept',
          title: 'Auto-Accept Bookings',
          subtitle: 'Automatically confirm new appointments',
          icon: Calendar,
          type: 'toggle' as const,
          value: autoAcceptBookings,
          onPress: () => setAutoAcceptBookings(!autoAcceptBookings),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage billing and payouts',
          icon: CreditCard,
          type: 'navigate' as const,
          onPress: () => console.log('Payment methods'),
        },
        {
          id: 'security',
          title: 'Security',
          subtitle: 'Password and authentication',
          icon: Lock,
          type: 'navigate' as const,
          onPress: () => console.log('Security'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          icon: HelpCircle,
          type: 'navigate' as const,
          onPress: () => console.log('Help center'),
        },
        {
          id: 'signout',
          title: 'Sign Out',
          icon: LogOut,
          type: 'action' as const,
          onPress: handleSignOut,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    if (item.type === 'toggle') {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <item.icon size={20} color="#666" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
      >
        <View style={styles.settingItemLeft}>
          <item.icon size={20} color={item.id === 'signout' ? '#FF3B30' : '#666'} />
          <View style={styles.settingTextContainer}>
            <Text style={[
              styles.settingTitle,
              item.id === 'signout' && styles.signOutText
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        {item.type === 'navigate' && (
          <ChevronRight size={20} color="#999" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {settingSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map(renderSettingItem)}
          </View>
        </View>
      ))}
      
      {/* Shop Services & Pricing Section */}
      <View style={styles.section}>
        <View style={styles.servicesHeader}>
          <Text style={styles.sectionTitle}>Shop Services & Pricing</Text>
          <TouchableOpacity
            style={styles.addServiceButton}
            onPress={() => {
              setEditingService(null);
              setShowServiceModal(true);
            }}
          >
            <Plus size={20} color="#007AFF" />
            <Text style={styles.addServiceButtonText}>Add Service</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.servicesContent}>
          {servicesLoading ? (
            <Text style={styles.loadingText}>Loading services...</Text>
          ) : (
            renderMasterServices()
          )}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
      
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginLeft: 20,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  signOutText: {
    color: '#FF3B30',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 8,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addServiceButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  servicesContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
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
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});