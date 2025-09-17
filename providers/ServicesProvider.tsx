import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@/utils/contextHook';
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
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load based on user role and provider type
      if (user.role === 'provider') {
        const mockData = user.mockData;
        if (mockData?.profile?.isIndependent !== false) {
          // Independent provider - load personal services
          const storedServices = await AsyncStorage.getItem(`services_${user.id}`);
          if (storedServices) {
            setServices(JSON.parse(storedServices));
          } else {
            // Initialize with mock data
            const initialServices: Service[] = mockData?.profile?.services?.map((s: any, index: number) => ({
              id: `service_${index + 1}`,
              name: s.name,
              description: s.description || '',
              duration: parseInt(s.duration) || 30,
              price: s.price,
              isActive: true,
              providerId: user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })) || [];
            setServices(initialServices);
            await AsyncStorage.setItem(`services_${user.id}`, JSON.stringify(initialServices));
          }
        } else {
          // Shop-based provider - load shop master services and offerings
          const shopId = mockData?.profile?.shopId || 'shop_1';
          const storedMasterServices = await AsyncStorage.getItem(`master_services_${shopId}`);
          const storedOfferings = await AsyncStorage.getItem(`service_offerings_${user.id}`);
          
          if (storedMasterServices) {
            setMasterServices(JSON.parse(storedMasterServices));
          } else {
            // Initialize with default shop services
            const defaultMasterServices: Service[] = [
              {
                id: 'master_1',
                name: "Women's Haircut",
                description: 'Professional haircut and styling',
                duration: 45,
                price: 75,
                isActive: true,
                shopId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'master_2',
                name: "Men's Haircut",
                description: 'Classic and modern cuts',
                duration: 30,
                price: 55,
                isActive: true,
                shopId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'master_3',
                name: 'Color & Highlights',
                description: 'Full color service with highlights',
                duration: 120,
                price: 150,
                isActive: true,
                shopId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'master_4',
                name: 'Blowout',
                description: 'Professional styling and blowout',
                duration: 30,
                price: 45,
                isActive: true,
                shopId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];
            setMasterServices(defaultMasterServices);
            await AsyncStorage.setItem(`master_services_${shopId}`, JSON.stringify(defaultMasterServices));
          }
          
          if (storedOfferings) {
            setServiceOfferings(JSON.parse(storedOfferings));
          } else {
            // Initialize with default offerings (all services offered)
            const defaultOfferings: ProviderServiceOffering[] = [
              {
                id: 'offering_1',
                providerId: user.id!,
                serviceId: 'master_1',
                isOffered: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'offering_2',
                providerId: user.id!,
                serviceId: 'master_2',
                isOffered: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'offering_3',
                providerId: user.id!,
                serviceId: 'master_3',
                isOffered: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'offering_4',
                providerId: user.id!,
                serviceId: 'master_4',
                isOffered: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];
            setServiceOfferings(defaultOfferings);
            await AsyncStorage.setItem(`service_offerings_${user.id}`, JSON.stringify(defaultOfferings));
          }
        }
      } else if (user.role === 'owner') {
        // Shop owner - load master services for their shops
        const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
        const storedMasterServices = await AsyncStorage.getItem(`master_services_${shopId}`);
        
        if (storedMasterServices) {
          setMasterServices(JSON.parse(storedMasterServices));
        } else {
          // Initialize with default services
          const defaultMasterServices: Service[] = [
            {
              id: 'master_1',
              name: "Women's Haircut",
              description: 'Professional haircut and styling',
              duration: 45,
              price: 75,
              isActive: true,
              shopId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'master_2',
              name: "Men's Haircut",
              description: 'Classic and modern cuts',
              duration: 30,
              price: 55,
              isActive: true,
              shopId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'master_3',
              name: 'Color & Highlights',
              description: 'Full color service with highlights',
              duration: 120,
              price: 150,
              isActive: true,
              shopId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'master_4',
              name: 'Blowout',
              description: 'Professional styling and blowout',
              duration: 30,
              price: 45,
              isActive: true,
              shopId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setMasterServices(defaultMasterServices);
          await AsyncStorage.setItem(`master_services_${shopId}`, JSON.stringify(defaultMasterServices));
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load services on mount
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    loadServices();
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
      const newOffering: ProviderServiceOffering = {
        id: `offering_${Date.now()}`,
        providerId: user.id,
        serviceId,
        isOffered,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedOfferings = [...serviceOfferings, newOffering];
    }
    
    setServiceOfferings(updatedOfferings);
    await AsyncStorage.setItem(`service_offerings_${user.id}`, JSON.stringify(updatedOfferings));
  }, [user, serviceOfferings]);

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