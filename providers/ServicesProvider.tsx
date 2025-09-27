import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Service, ProviderServiceOffering } from '@/models/database';
import { useAuth } from './AuthProvider';



export const [ServicesProvider, useServices] = createContextHook(() => {
  console.log('ServicesProvider: Initializing context...');
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [masterServices, setMasterServices] = useState<Service[]>([]);
  const [serviceOfferings, setServiceOfferings] = useState<ProviderServiceOffering[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadServices = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    // Set loading to false immediately to prevent blocking UI
    setIsLoading(false);
    
    try {
      // Load based on user role and provider type - set defaults synchronously
      if (user.role === 'provider') {
        const mockData = user.mockData;
        if (mockData?.profile?.isIndependent !== false) {
          // Independent provider - initialize with mock data immediately
          const initialServices: Service[] = mockData?.profile?.services?.map((s: any, index: number) => ({
            id: `service_${index + 1}`,
            name: s.name,
            description: s.description || '',
            baseDuration: parseInt(s.duration) || 30,
            basePrice: s.price,
            isActive: true,
            providerId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) || [];
          setServices(initialServices);
          
          // Load from storage asynchronously without blocking
          setTimeout(async () => {
            try {
              const storedServices = await AsyncStorage.getItem(`services_${user.id}`);
              if (storedServices) {
                setServices(JSON.parse(storedServices));
              }
            } catch (error) {
              console.log('Could not load stored services, using defaults');
            }
          }, 0);
        } else {
          // Shop-based provider - set defaults immediately
          const defaultMasterServices: Service[] = [
            {
              id: 'master_1',
              name: "Women's Haircut",
              description: 'Professional haircut and styling',
              baseDuration: 45,
              basePrice: 75,
              isActive: true,
              shopId: 'shop_1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'master_2',
              name: "Men's Haircut",
              description: 'Classic and modern cuts',
              baseDuration: 30,
              basePrice: 55,
              isActive: true,
              shopId: 'shop_1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setMasterServices(defaultMasterServices);
          
          const defaultOfferings: ProviderServiceOffering[] = [
            {
              id: 'offering_1',
              providerId: user.id!,
              serviceId: 'master_1',
              service: defaultMasterServices[0],
              isOffered: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'offering_2',
              providerId: user.id!,
              serviceId: 'master_2',
              service: defaultMasterServices[1],
              isOffered: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setServiceOfferings(defaultOfferings);
        }
      } else if (user.role === 'owner') {
        // Shop owner - set defaults immediately
        const defaultMasterServices: Service[] = [
          {
            id: 'master_1',
            name: "Women's Haircut",
            description: 'Professional haircut and styling',
            baseDuration: 45,
            basePrice: 75,
            isActive: true,
            shopId: 'shop_1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'master_2',
            name: "Men's Haircut",
            description: 'Classic and modern cuts',
            baseDuration: 30,
            basePrice: 55,
            isActive: true,
            shopId: 'shop_1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setMasterServices(defaultMasterServices);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setIsLoading(false);
    }
  }, [user]);

  // Load services on mount with timeout to prevent blocking
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(loadServices, 0);
      return () => clearTimeout(timeoutId);
    } else {
      setIsLoading(false);
    }
  }, [user, loadServices]);

  // Independent provider service management
  const addService = useCallback(async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;
    
    const newService: Service = {
      ...serviceData,
      id: `service_${Date.now()}`,
      providerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    await AsyncStorage.setItem(`services_${user.id}`, JSON.stringify(updatedServices));
  }, [user, services]);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    if (!user?.id) return;
    
    const updatedServices = services.map(service => 
      service.id === id 
        ? { ...service, ...updates, updatedAt: new Date().toISOString() }
        : service
    );
    
    setServices(updatedServices);
    await AsyncStorage.setItem(`services_${user.id}`, JSON.stringify(updatedServices));
  }, [user, services]);

  const deleteService = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    const updatedServices = services.filter(service => service.id !== id);
    setServices(updatedServices);
    await AsyncStorage.setItem(`services_${user.id}`, JSON.stringify(updatedServices));
  }, [user, services]);

  // Shop master service management
  const addMasterService = useCallback(async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;
    
    const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
    const newService: Service = {
      ...serviceData,
      id: `master_${Date.now()}`,
      shopId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedServices = [...masterServices, newService];
    setMasterServices(updatedServices);
    await AsyncStorage.setItem(`master_services_${shopId}`, JSON.stringify(updatedServices));
  }, [user, masterServices]);

  const updateMasterService = useCallback(async (id: string, updates: Partial<Service>) => {
    if (!user?.id) return;
    
    const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
    const updatedServices = masterServices.map(service => 
      service.id === id 
        ? { ...service, ...updates, updatedAt: new Date().toISOString() }
        : service
    );
    
    setMasterServices(updatedServices);
    await AsyncStorage.setItem(`master_services_${shopId}`, JSON.stringify(updatedServices));
  }, [user, masterServices]);

  const deleteMasterService = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
    const updatedServices = masterServices.filter(service => service.id !== id);
    setMasterServices(updatedServices);
    await AsyncStorage.setItem(`master_services_${shopId}`, JSON.stringify(updatedServices));
  }, [user, masterServices]);

  // Provider service offering management
  const toggleServiceOffering = useCallback(async (serviceId: string, isOffered: boolean) => {
    if (!user?.id) return;
    
    const existingOffering = serviceOfferings.find(o => o.serviceId === serviceId);
    let updatedOfferings: ProviderServiceOffering[];
    
    if (existingOffering) {
      updatedOfferings = serviceOfferings.map(offering => 
        offering.serviceId === serviceId 
          ? { ...offering, isOffered, updatedAt: new Date().toISOString() }
          : offering
      );
    } else {
      const service = masterServices.find(s => s.id === serviceId);
      if (!service) return;
      
      const newOffering: ProviderServiceOffering = {
        id: `offering_${Date.now()}`,
        providerId: user.id,
        serviceId,
        service,
        isOffered,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedOfferings = [...serviceOfferings, newOffering];
    }
    
    setServiceOfferings(updatedOfferings);
    await AsyncStorage.setItem(`service_offerings_${user.id}`, JSON.stringify(updatedOfferings));
  }, [user, serviceOfferings, masterServices]);

  // Get services for display based on provider type
  const getProviderServices = useCallback((): Service[] => {
    if (!user) return [];
    
    if (user.role === 'provider') {
      const mockData = user.mockData;
      if (mockData?.profile?.isIndependent !== false) {
        // Independent provider - return their personal services
        return services.filter(s => s.isActive);
      } else {
        // Shop-based provider - return shop services they offer
        return masterServices.filter(service => {
          const offering = serviceOfferings.find(o => o.serviceId === service.id);
          return service.isActive && offering?.isOffered;
        });
      }
    }
    
    return [];
  }, [user, services, masterServices, serviceOfferings]);

  const contextValue = useMemo(() => {
    const value = {
      services,
      addService,
      updateService,
      deleteService,
      masterServices,
      addMasterService,
      updateMasterService,
      deleteMasterService,
      serviceOfferings,
      toggleServiceOffering,
      getProviderServices,
      isLoading,
    };
    console.log('ServicesProvider: Context value created with getProviderServices:', !!value.getProviderServices);
    return value;
  }, [
    services,
    addService,
    updateService,
    deleteService,
    masterServices,
    addMasterService,
    updateMasterService,
    deleteMasterService,
    serviceOfferings,
    toggleServiceOffering,
    getProviderServices,
    isLoading,
  ]);

  return contextValue;
});