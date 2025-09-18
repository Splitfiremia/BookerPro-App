import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@/utils/contextHook";
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
  // Always call hooks in the same order
  const [user, setUser] = useState<User | null>(null);
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize on mount
  useEffect(() => {
    const loadUserAndSettings = async () => {
      try {
        console.log('AuthProvider: Loading user and settings...');
        
        // Load stored user data and developer mode in parallel with timeout
        const loadWithTimeout = (promise: Promise<any>, timeout: number = 3000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ]);
        };
        
        const [storedUser, storedDevMode] = await Promise.allSettled([
          loadWithTimeout(AsyncStorage.getItem("user").catch(() => null)),
          loadWithTimeout(AsyncStorage.getItem("developerMode").catch(() => null))
        ]);
        
        // Handle stored user
        if (storedUser.status === 'fulfilled' && storedUser.value) {
          try {
            const userData = JSON.parse(storedUser.value);
            console.log('AuthProvider: Loaded stored user:', userData.email);
            setUser(userData);
          } catch (parseError) {
            console.error('AuthProvider: Error parsing stored user:', parseError);
            try {
              await AsyncStorage.removeItem("user");
            } catch (removeError) {
              console.error('AuthProvider: Error removing invalid user data:', removeError);
            }
          }
        } else {
          console.log('AuthProvider: No stored user found or failed to load');
        }
        
        // Handle developer mode
        if (storedDevMode.status === 'fulfilled' && storedDevMode.value) {
          try {
            const devMode = JSON.parse(storedDevMode.value);
            console.log('AuthProvider: Loaded developer mode:', devMode);
            setIsDeveloperMode(devMode);
          } catch (parseError) {
            console.error('AuthProvider: Error parsing developer mode:', parseError);
            try {
              await AsyncStorage.removeItem("developerMode");
            } catch (removeError) {
              console.error('AuthProvider: Error removing invalid dev mode data:', removeError);
            }
          }
        }
        
      } catch (error) {
        console.error("AuthProvider: Error loading settings:", error);
      } finally {
        console.log('AuthProvider: Finished loading, setting isLoading to false');
        setIsLoading(false);
      }
    };
    
    // Load immediately but with error handling and timeout
    loadUserAndSettings();
    
    // Fallback timeout to ensure loading state doesn't hang
    const fallbackTimeout = setTimeout(() => {
      console.warn('AuthProvider: Fallback timeout triggered, forcing isLoading to false');
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(fallbackTimeout);
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
    setDeveloperMode,
    login,
    logout,
    register,
  }), [user, isDeveloperMode, isLoading, setDeveloperMode, login, logout, register]);

  return contextValue;
});