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
  
  // Initialize auth state - prevent hydration timeout by setting defaults immediately
  useEffect(() => {
    let isMounted = true;
    
    // Set initialized immediately with defaults to prevent hydration timeout
    setIsInitialized(true);
    
    // Load stored data asynchronously without blocking render
    const loadStoredData = async () => {
      if (!isMounted) return;
      
      try {
        // Use batched read for better performance
        const data = await multiGet(['user', 'developerMode']);
        
        if (!isMounted) return;
        
        // Parse and set user data
        if (data.user) {
          console.log('AuthProvider: Loaded user from storage:', data.user.email);
          setUser(data.user);
        }
        
        // Parse and set developer mode
        if (data.developerMode !== null) {
          console.log('AuthProvider: Loaded developer mode from storage:', data.developerMode);
          setIsDeveloperMode(data.developerMode);
        }
        
      } catch (error) {
        console.log('AuthProvider: Storage load failed, using defaults:', error instanceof Error ? error.message : 'Unknown error');
        // Continue with default values - app should still work
      }
    };
    
    // Use setTimeout to defer loading and prevent blocking
    setTimeout(() => {
      if (isMounted) {
        loadStoredData();
      }
    }, 0);
    
    return () => {
      isMounted = false;
    };
  }, []); // Remove multiGet dependency to prevent infinite loop

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

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('AuthProvider: Attempting login for:', email);
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      // Add mock data based on role
      let userData: User = {
        ...userWithoutPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add role-specific mock data
      switch (userData.role) {
        case 'client':
          userData.mockData = clientData;
          break;
        case 'provider':
          userData.mockData = providerData;
          break;
        case 'owner':
          userData.mockData = ownerData;
          break;
      }
      
      // Store user data
      await set("user", userData);
      setUser(userData);
      
      console.log('AuthProvider: Login successful for:', userData.email, 'Role:', userData.role);
      return { success: true };
      
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
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

  // Logout function
  const logout = useCallback(async () => {
    console.log('AuthProvider: Logging out user');
    setIsLoading(true);
    
    try {
      // Clear user from storage
      await remove("user");
      console.log('AuthProvider: User removed from storage');
      
      setUser(null);
      // Even if storage fails, ensure user state is cleared
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
      // Even if AsyncStorage fails, ensure user state is cleared
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [remove]);

  // Computed values
  const isAuthenticated = useMemo(() => user !== null, [user]);

  // Return context value
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
});