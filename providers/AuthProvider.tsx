import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { testUsers } from "@/mocks/users";
import { clientData, providerData, ownerData } from "@/mocks/userSpecificData";
import { UserRole } from "@/models/database";
import { useAsyncStorageBatch } from "@/utils/asyncStorageUtils";
import { measureAsyncOperation } from "@/utils/loginPerformanceUtils";

export interface User {
  id?: string;
  email: string;
  role: UserRole;
  name: string;
  profileImage?: string;
  phone?: string;
  mockData?: any; // For storing role-specific mock data in developer mode
  createdAt?: string;
  updatedAt?: string;
}

// The auth context provides these values
// user: Current logged in user or null
// isAuthenticated: Boolean indicating if user is logged in
// isDeveloperMode: Boolean indicating if app is in developer mode
// setDeveloperMode: Function to toggle developer mode
// login: Function to authenticate user
// logout: Function to sign out user
// register: Function to register a new user

// Using createContextHook with a default value to avoid 'undefined' errors
export const [AuthProvider, useAuth] = createContextHook(() => {
  console.log('AuthProvider: Initializing context');
  
  // Always call hooks in the same order
  const [user, setUser] = useState<User | null>(null);
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { multiGet, set, remove, getWithDefault } = useAsyncStorageBatch();
  
  // Initialize auth state - IMMEDIATE initialization to prevent hydration timeout
  useEffect(() => {
    let isMounted = true;
    
    // CRITICAL: Set initialized SYNCHRONOUSLY before any async operations
    console.log('AuthProvider: IMMEDIATE initialization - no blocking');
    setIsInitialized(true);
    
    // Load stored data in background - NEVER block render
    const loadStoredDataInBackground = async () => {
      if (!isMounted) return;
      
      try {
        console.log('AuthProvider: Background data load starting (non-blocking)');
        
        // Ultra-short timeout - 500ms max
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Storage timeout'));
          }, 500);
        });
        
        const dataPromise = multiGet(['user', 'developerMode']);
        const data = await Promise.race([dataPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;
        
        // Parse and set user data with validation
        if (data.user && typeof data.user === 'object' && data.user.email) {
          console.log('AuthProvider: Restored user from storage:', data.user.email);
          setUser(data.user);
        }
        
        // Parse and set developer mode
        if (typeof data.developerMode === 'boolean') {
          setIsDeveloperMode(data.developerMode);
        }
        
        console.log('AuthProvider: Background data load completed');
        
      } catch (error) {
        console.log('AuthProvider: Background load failed, using defaults');
        // App continues with default values - no blocking
      }
    };
    
    // Fire and forget - don't await
    loadStoredDataInBackground();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty deps - run once only

  // Set developer mode with persistence
  const setDeveloperMode = useCallback(async (value: boolean) => {
    console.log('Setting developer mode:', value);
    try {
      await set("developerMode", value);
      setIsDeveloperMode(value);
      console.log('AuthProvider: Developer mode updated successfully');
    } catch (error) {
      console.error('AuthProvider: Failed to update developer mode:', error);
    }
  }, [set]);

  // Check developer mode from storage
  const checkDeveloperMode = useCallback(async (): Promise<boolean> => {
    try {
      return await getWithDefault("developerMode", false);
    } catch (error) {
      console.error('AuthProvider: Failed to check developer mode:', error);
      return false;
    }
  }, [getWithDefault]);

  // Optimized login function with faster performance
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('AuthProvider: Attempting optimized login for:', email);
    setIsLoading(true);
    
    return measureAsyncOperation('user_authentication', async () => {
      try {
        // Reduced API simulation delay for faster login
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Find user in test data
        const foundUser = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!foundUser) {
          console.log('AuthProvider: User not found');
          return { success: false, error: 'User not found' };
        }
        
        if (foundUser.password !== password) {
          console.log('AuthProvider: Invalid password');
          return { success: false, error: 'Invalid password' };
        }
        
        // Create user object without password
        const { password: _, ...userWithoutPassword } = foundUser;
        
        // Optimized user data creation - load mock data lazily
        const userData = await measureAsyncOperation('create_user_data', async () => {
          const userData: User = {
            ...userWithoutPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Load minimal mock data initially - full data loaded later
          switch (userData.role) {
            case 'client':
              userData.mockData = { ...clientData, loaded: 'partial' };
              break;
            case 'provider':
              userData.mockData = { ...providerData, loaded: 'partial' };
              break;
            case 'owner':
              userData.mockData = { ...ownerData, loaded: 'partial' };
              break;
          }
          
          return userData;
        });
        
        // Store user data with timeout protection
        await measureAsyncOperation('store_user_data', async () => {
          const storePromise = set("user", userData);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Store timeout')), 2000)
          );
          
          try {
            await Promise.race([storePromise, timeoutPromise]);
          } catch (error) {
            console.warn('AuthProvider: Storage failed, continuing with memory-only auth:', error);
            // Continue without storage - user still logged in for session
          }
        });
        
        // Set user immediately for faster UI response
        setUser(userData);
        
        console.log('AuthProvider: Optimized login successful for:', userData.email, 'Role:', userData.role);
        return { success: true };
        
      } catch (error) {
        console.error('AuthProvider: Login error:', error);
        return { success: false, error: 'Login failed' };
      } finally {
        setIsLoading(false);
      }
    });
  }, [set]);

  // Register function
  const register = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> => {
    console.log('AuthProvider: Attempting registration for:', userData.email);
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = testUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        console.log('AuthProvider: User already exists');
        return { success: false, error: 'User already exists' };
      }
      
      // Create new user
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add role-specific mock data
      switch (newUser.role) {
        case 'client':
          newUser.mockData = clientData;
          break;
        case 'provider':
          newUser.mockData = providerData;
          break;
        case 'owner':
          newUser.mockData = ownerData;
          break;
      }
      
      // Store user data
      await set("user", newUser);
      setUser(newUser);
      
      console.log('AuthProvider: Registration successful for:', newUser.email, 'Role:', newUser.role);
      return { success: true };
      
    } catch (error) {
      console.error('AuthProvider: Registration error:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  }, [set]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    
    console.log('AuthProvider: Updating profile for:', user.email);
    setIsLoading(true);
    
    try {
      const newUser: User = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await set("user", newUser);
      setUser(newUser);
      
      console.log('AuthProvider: Profile updated successfully');
      return { success: true };
      
    } catch (error) {
      console.error('AuthProvider: Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    } finally {
      setIsLoading(false);
    }
  }, [user, set]);

  // Logout function - completely rebuilt
  const logout = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('AuthProvider: Starting fresh logout process');
    
    try {
      setIsLoading(true);
      
      // Step 1: Clear user state immediately
      console.log('AuthProvider: Clearing user state');
      setUser(null);
      
      // Step 2: Clear all stored authentication data
      console.log('AuthProvider: Clearing stored authentication data');
      await remove("user");
      
      // Step 3: Clear any other auth-related storage if needed
      // Add any additional cleanup here (tokens, session data, etc.)
      
      // Step 4: Wait for state propagation
      console.log('AuthProvider: Waiting for state updates to propagate');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('AuthProvider: Logout completed successfully');
      return { success: true };
      
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
      
      // Even if storage operations fail, ensure user state is cleared
      setUser(null);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('AuthProvider: User state cleared despite error:', errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      console.log('AuthProvider: Logout process completed');
    }
  }, [remove]);

  // Computed values
  const isAuthenticated = useMemo(() => user !== null, [user]);

  // Optimized memoization to prevent unnecessary re-renders during auth transitions
  const contextValue = useMemo(() => {
    console.log('AuthProvider: Context value updated - user:', user?.email, 'authenticated:', isAuthenticated, 'loading:', isLoading);
    return {
      user,
      isAuthenticated,
      isDeveloperMode,
      isLoading,
      isInitialized,
      setDeveloperMode,
      checkDeveloperMode,
      login,
      logout,
      register,
      updateProfile,
    };
  }, [user, isAuthenticated, isDeveloperMode, isLoading, isInitialized, setDeveloperMode, checkDeveloperMode, login, logout, register, updateProfile]);
  
  return contextValue;
});