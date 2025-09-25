import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { testUsers } from "@/mocks/users";
import { clientData, providerData, ownerData } from "@/mocks/userSpecificData";
import { UserRole } from "@/models/database";

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
  
  // Initialize auth state - prevent hydration timeout by setting defaults immediately
  useEffect(() => {
    let isMounted = true;
    
    // Set initialized immediately with defaults to prevent hydration timeout
    setIsInitialized(true);
    
    // Load stored data asynchronously without blocking render
    const loadStoredData = async () => {
      if (!isMounted) return;
      
      try {
        // Load data with a reasonable timeout
        const loadPromise = Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("developerMode")
        ]);
        
        const timeoutPromise = new Promise<[string | null, string | null]>((_, reject) => 
          setTimeout(() => reject(new Error('Storage timeout')), 1000)
        );
        
        const [storedUser, storedDevMode] = await Promise.race([
          loadPromise,
          timeoutPromise
        ]);
        
        if (!isMounted) return;
        
        // Parse and set user data
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('AuthProvider: Loaded user from storage:', userData.email);
            setUser(userData);
          } catch (error) {
            console.log('AuthProvider: Error parsing stored user data, clearing storage');
            await AsyncStorage.removeItem("user");
          }
        }
        
        // Parse and set developer mode
        if (storedDevMode) {
          try {
            const devMode = JSON.parse(storedDevMode);
            console.log('AuthProvider: Loaded developer mode from storage:', devMode);
            setIsDeveloperMode(devMode);
          } catch (error) {
            console.log('AuthProvider: Error parsing developer mode, using default');
          }
        }
        
      } catch (error) {
        console.log('AuthProvider: Storage load failed, using defaults:', error instanceof Error ? error.message : 'Unknown error');
        // Continue with default values - app should still work
      }
    };
    
    // Start loading after component mounts
    loadStoredData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Set developer mode with persistence
  const setDeveloperMode = useCallback(async (value: boolean) => {
    console.log('Setting developer mode:', value);
    setIsDeveloperMode(value);
    try {
      await AsyncStorage.setItem("developerMode", JSON.stringify(value));
    } catch (error) {
      console.error('Error saving developer mode:', error);
    }
  }, []);

  // Login function that handles both developer and live mode
  const login = useCallback(async (email: string, password: string) => {
    console.log('Login attempt for email:', email);
    setIsLoading(true);
    try {
      // Check if this is a test user email
      const isTestUserEmail = testUsers.some(
        (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      
      // Get current developer mode from storage as well to ensure consistency
      const storedDevMode = await AsyncStorage.getItem("developerMode");
      const currentDevMode = storedDevMode ? JSON.parse(storedDevMode) : isDeveloperMode;
      
      console.log('Is test user email:', isTestUserEmail, 'Current dev mode:', currentDevMode);
      
      if (isTestUserEmail || currentDevMode) {
        // In developer mode or for test users, check against mock data
        const testUser = testUsers.find(
          (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
        );
        
        if (!testUser) {
          console.error("Invalid credentials for test user");
          throw new Error("Invalid credentials. Test passwords: client123, provider123, owner123");
        }
        
        // Add role-specific mock data
        let mockData;
        switch (testUser.role) {
          case "client":
            mockData = clientData;
            break;
          case "provider":
            mockData = providerData;
            break;
          case "owner":
            mockData = ownerData;
            break;
          default:
            mockData = {};
        }

        const userData: User = {
          id: testUser.id,
          email: testUser.email,
          role: testUser.role,
          name: testUser.name,
          profileImage: testUser.profileImage,
          phone: testUser.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          mockData
        };
        
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        console.log('Login successful (demo mode):', userData.email);
      } else {
        // In live mode, would connect to Supabase or other backend
        // For now, just simulate a successful login with basic validation
        if (email && password.length >= 6) {
          const userData: User = {
            id: "live-user-1",
            email,
            role: "client", // Default role for live mode
            name: email.split("@")[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          setUser(userData);
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          console.log('Login successful (live mode):', userData.email);
        } else {
          throw new Error("Invalid credentials");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isDeveloperMode]);

  // Register function for new users
  const register = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string) => {
    console.log('Register attempt:', userData.email);
    setIsLoading(true);
    try {
      if (isDeveloperMode) {
        // In developer mode, just create a mock user
        const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add role-specific mock data
        let mockData;
        switch (newUser.role) {
          case "client":
            mockData = clientData;
            break;
          case "provider":
            mockData = providerData;
            break;
          case "owner":
            mockData = ownerData;
            break;
          default:
            mockData = {};
        }

        newUser.mockData = mockData;
        
        setUser(newUser);
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        console.log('Registration successful (demo mode):', newUser.email);
        return newUser;
      } else {
        // In live mode, would connect to Supabase or other backend
        // For now, just simulate a successful registration
        const newUser: User = {
          ...userData,
          id: `live-user-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setUser(newUser);
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        console.log('Registration successful (live mode):', newUser.email);
        return newUser;
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isDeveloperMode]);

  const logout = useCallback(async () => {
    console.log('AuthProvider: Starting logout process');
    setIsLoading(true);
    try {
      // Clear user state first to trigger immediate UI updates
      setUser(null);
      console.log('AuthProvider: User state cleared');
      
      // Clear user from AsyncStorage
      await AsyncStorage.removeItem("user");
      console.log('AuthProvider: User removed from AsyncStorage');
      
    } catch (error) {
      console.error("AuthProvider: Logout error:", error);
      // Even if AsyncStorage fails, ensure user state is cleared
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('AuthProvider: Logout completed');
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isDeveloperMode,
    isLoading,
    isInitialized,
    setDeveloperMode,
    login,
    logout,
    register,
  }), [user, isDeveloperMode, isLoading, isInitialized, setDeveloperMode, login, logout, register]);

  return contextValue;
});