import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { testUsers } from "@/mocks/users";
import { clientData, providerData, ownerData } from "@/mocks/userSpecificData";
import { UserRole } from "@/models/database";
import { useAsyncStorageBatch } from "@/utils/asyncStorageUtils";

export interface User {
  id?: string;
  email: string;
  role: UserRole;
  name: string;
  profileImage?: string;
  phone?: string;
  mockData?: any;
  createdAt?: string;
  updatedAt?: string;
}

// Performance-optimized auth context
export const [OptimizedAuthProvider, useOptimizedAuth] = createContextHook(() => {
  console.log('OptimizedAuthProvider: Initializing with performance optimizations');
  
  const [user, setUser] = useState<User | null>(null);
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { multiGet, set, remove, getWithDefault } = useAsyncStorageBatch();
  
  // Optimized initialization with immediate defaults
  useEffect(() => {
    let isMounted = true;
    
    // Set initialized immediately to prevent hydration timeout
    setIsInitialized(true);
    
    // Parallel data loading with timeout protection
    const loadStoredData = async () => {
      if (!isMounted) return;
      
      try {
        // Use Promise.race to timeout after 2 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Storage timeout')), 2000)
        );
        
        const dataPromise = multiGet(['user', 'developerMode']);
        const data = await Promise.race([dataPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;
        
        // Batch state updates to prevent multiple re-renders
        const updates: (() => void)[] = [];
        
        if (data.user) {
          console.log('OptimizedAuthProvider: Loaded user from storage:', data.user.email);
          updates.push(() => setUser(data.user));
        }
        
        if (data.developerMode !== null) {
          console.log('OptimizedAuthProvider: Loaded developer mode from storage:', data.developerMode);
          updates.push(() => setIsDeveloperMode(data.developerMode));
        }
        
        // Apply all updates in a single batch
        updates.forEach(update => update());
        
      } catch (error) {
        console.log('OptimizedAuthProvider: Storage load failed, using defaults:', error instanceof Error ? error.message : 'Unknown error');
      }
    };
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (isMounted) {
        loadStoredData();
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Optimized login with parallel data loading
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('OptimizedAuthProvider: Starting optimized login for:', email);
    setIsLoading(true);
    
    try {
      // Parallel operations for better performance
      const [authResult, roleDataResult] = await Promise.allSettled([
        // Authentication check
        new Promise<User>((resolve, reject) => {
          setTimeout(() => {
            const foundUser = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!foundUser) {
              reject(new Error('User not found'));
              return;
            }
            
            if (foundUser.password !== password) {
              reject(new Error('Invalid password'));
              return;
            }
            
            const { password: _, ...userWithoutPassword } = foundUser;
            resolve({
              ...userWithoutPassword,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }, 500); // Reduced delay for better UX
        }),
        
        // Pre-load role-specific data
        new Promise<any>((resolve) => {
          setTimeout(() => {
            const foundUser = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!foundUser) {
              resolve(null);
              return;
            }
            
            switch (foundUser.role) {
              case 'client':
                resolve(clientData);
                break;
              case 'provider':
                resolve(providerData);
                break;
              case 'owner':
                resolve(ownerData);
                break;
              default:
                resolve(null);
            }
          }, 300); // Parallel loading
        })
      ]);
      
      if (authResult.status === 'rejected') {
        console.log('OptimizedAuthProvider: Authentication failed:', authResult.reason.message);
        return { success: false, error: authResult.reason.message };
      }
      
      const userData = authResult.value;
      
      // Add role-specific data if available
      if (roleDataResult.status === 'fulfilled' && roleDataResult.value) {
        userData.mockData = roleDataResult.value;
      }
      
      // Parallel storage and state update
      await Promise.all([
        set("user", userData),
        new Promise<void>((resolve) => {
          setUser(userData);
          resolve();
        })
      ]);
      
      console.log('OptimizedAuthProvider: Login successful for:', userData.email, 'Role:', userData.role);
      return { success: true };
      
    } catch (error) {
      console.error('OptimizedAuthProvider: Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, [set]);

  // Optimized logout with cleanup
  const logout = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('OptimizedAuthProvider: Starting optimized logout');
    
    try {
      setIsLoading(true);
      
      // Immediate state clear for better UX
      setUser(null);
      
      // Parallel cleanup operations
      await Promise.allSettled([
        remove("user"),
        // Clear any cached data
        new Promise<void>((resolve) => {
          setTimeout(resolve, 100); // Allow state propagation
        })
      ]);
      
      console.log('OptimizedAuthProvider: Logout completed successfully');
      return { success: true };
      
    } catch (error) {
      console.error('OptimizedAuthProvider: Logout error:', error);
      setUser(null); // Ensure state is cleared
      return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
    } finally {
      setIsLoading(false);
    }
  }, [remove]);

  // Memoized computed values
  const isAuthenticated = useMemo(() => user !== null, [user]);
  
  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isDeveloperMode,
    isLoading,
    isInitialized,
    setDeveloperMode: async (value: boolean) => {
      try {
        await set("developerMode", value);
        setIsDeveloperMode(value);
      } catch (error) {
        console.error('OptimizedAuthProvider: Failed to update developer mode:', error);
      }
    },
    checkDeveloperMode: async (): Promise<boolean> => {
      try {
        return await getWithDefault("developerMode", false);
      } catch (error) {
        console.error('OptimizedAuthProvider: Failed to check developer mode:', error);
        return false;
      }
    },
    login,
    logout,
    register: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> => {
      console.log('OptimizedAuthProvider: Registration not implemented in optimized version');
      return { success: false, error: 'Registration not implemented' };
    },
    updateProfile: async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }
      
      try {
        const newUser: User = {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        await Promise.all([
          set("user", newUser),
          new Promise<void>((resolve) => {
            setUser(newUser);
            resolve();
          })
        ]);
        
        return { success: true };
      } catch (error) {
        console.error('OptimizedAuthProvider: Profile update error:', error);
        return { success: false, error: 'Profile update failed' };
      }
    },
  }), [user, isAuthenticated, isDeveloperMode, isLoading, isInitialized, login, logout, set, getWithDefault, remove]);

  return contextValue;
});