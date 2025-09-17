import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Provider } from '@/components/EditProviderModal';
import { Service, Shop, Appointment, mockTeamProviders, mockMasterServiceList, mockShop, mockProviderAppointments } from '@/mocks/teamData';

export const [TeamManagementProvider, useTeamManagement] = createContextHook(() => {
  const [providers, setProviders] = useState<Provider[]>(mockTeamProviders);
  const [shop, setShop] = useState<Shop>(mockShop);
  const [masterServiceList, setMasterServiceList] = useState<Service[]>(mockMasterServiceList);
  const [appointments, setAppointments] = useState<Appointment[]>(mockProviderAppointments);
  const [isLoading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const updateProvider = useCallback((updatedProvider: Provider) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === updatedProvider.id ? updatedProvider : provider
      )
    );
    console.log('Provider updated:', updatedProvider);
  }, []);

  const addProvider = useCallback((newProviderData: Omit<Provider, 'id'>) => {
    const newProvider: Provider = {
      ...newProviderData,
      id: `provider_${Date.now()}`,
    };
    setProviders(prev => [...prev, newProvider]);
    console.log('Provider added:', newProvider);
  }, []);

  const removeProvider = useCallback((providerId: string) => {
    setProviders(prev => prev.filter(provider => provider.id !== providerId));
    // Also remove their appointments
    setAppointments(prev => prev.filter(appointment => appointment.providerId !== providerId));
    console.log('Provider removed:', providerId);
  }, []);

  const updateMasterServiceList = useCallback((services: Service[]) => {
    if (!services || !Array.isArray(services)) {
      console.error('Invalid services array provided');
      return;
    }
    setMasterServiceList(services);
    setShop(prev => ({ ...prev, masterServiceList: services }));
    console.log('Master service list updated:', services);
  }, []);

  const getProviderAppointments = useCallback((providerId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.providerId === providerId);
  }, [appointments]);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `appointment_${Date.now()}`,
    };
    setAppointments(prev => [...prev, newAppointment]);
    console.log('Appointment added:', newAppointment);
  }, []);

  const generateInviteLink = useCallback((): string => {
    const baseUrl = 'https://myapp.com/join';
    const shopId = shop.id;
    const inviteCode = `${shopId}_${Date.now()}`;
    return `${baseUrl}/${inviteCode}`;
  }, [shop.id]);

  return useMemo(() => ({
    // Providers
    providers,
    updateProvider,
    addProvider,
    removeProvider,
    
    // Shop & Services
    shop,
    masterServiceList,
    updateMasterServiceList,
    
    // Appointments
    appointments,
    getProviderAppointments,
    addAppointment,
    
    // Invitation
    generateInviteLink,
    
    // Loading states
    isLoading,
    error,
  }), [providers, updateProvider, addProvider, removeProvider, shop, masterServiceList, updateMasterServiceList, appointments, getProviderAppointments, addAppointment, generateInviteLink, isLoading, error]);
});