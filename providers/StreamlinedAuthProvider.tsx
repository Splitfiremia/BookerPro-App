import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { testUsers } from "@/mocks/users";
import type { UserRole } from "@/models/database";
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

const [StreamlinedAuthProviderInternal, useStreamlinedAuthInternal] = createContextHook(() => {
  console.log('[PERF] StreamlinedAuthProvider: Initializing (optimized)');
  const initStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  
  const [user, setUser] = useState<User | null>(null);
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { multiGet, set, remove } = useAsyncStorageBatch();
  
  useEffect(() => {
    let isMounted = true;
    
    console.log('[PERF] StreamlinedAuthProvider: Setting initialized immediately (non-blocking)');
    setIsInitialized(true);
    
    const loadStoredDataInBackground = async () => {
      if (!isMounted) return;
      
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Storage timeout')), 200);
        });
        
        const dataPromise = multiGet(['user', 'developerMode']);
        const data = await Promise.race([dataPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;
        
        if (data.user && typeof data.user === 'object' && data.user.email) {
          console.log('[PERF] StreamlinedAuthProvider: Restored user from storage');
          setUser(data.user);
        }
        
        if (typeof data.developerMode === 'boolean') {
          setIsDeveloperMode(data.developerMode);
        }
        
        const initEndTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        console.log(`[PERF] StreamlinedAuthProvider: Background load completed in ${(initEndTime - initStartTime).toFixed(2)}ms`);
        
      } catch {
        console.log('[PERF] StreamlinedAuthProvider: Using defaults (timeout/error)');
      }
    };
    
    requestAnimationFrame(() => loadStoredDataInBackground());
    
    return () => {
      isMounted = false;
    };
  }, [multiGet, initStartTime]);

  const setDeveloperMode = useCallback(async (value: boolean) => {
    try {
      await set("developerMode", value);
      setIsDeveloperMode(value);
    } catch (error) {
      console.error('[PERF] StreamlinedAuthProvider: Failed to update developer mode:', error);
    }
  }, [set]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[PERF] StreamlinedAuthProvider: Login started');
    const loginStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const foundUser = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser || foundUser.password !== password) {
        return { success: false, error: foundUser ? 'Invalid password' : 'User not found' };
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      
      const userData: User = {
        ...userWithoutPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUser(userData);
      
      set("user", userData).catch(error => {
        console.warn('[PERF] StreamlinedAuthProvider: Storage failed, continuing with memory-only auth:', error);
      });
      
      const loginEndTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      console.log(`[PERF] StreamlinedAuthProvider: Login completed in ${(loginEndTime - loginStartTime).toFixed(2)}ms`);
      
      return { success: true };
      
    } catch (error) {
      console.error('[PERF] StreamlinedAuthProvider: Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, [set]);

  const register = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const existingUser = testUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }
      
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await set("user", newUser);
      setUser(newUser);
      
      return { success: true };
      
    } catch (error) {
      console.error('[PERF] StreamlinedAuthProvider: Registration error:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  }, [set]);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    
    setIsLoading(true);
    
    try {
      const newUser: User = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await set("user", newUser);
      setUser(newUser);
      
      return { success: true };
      
    } catch (error) {
      console.error('[PERF] StreamlinedAuthProvider: Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    } finally {
      setIsLoading(false);
    }
  }, [user, set]);

  const logout = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[PERF] StreamlinedAuthProvider: Logout started');
    
    try {
      setIsLoading(true);
      setUser(null);
      await remove("user");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[PERF] StreamlinedAuthProvider: Logout completed');
      return { success: true };
      
    } catch (error) {
      console.error('[PERF] StreamlinedAuthProvider: Logout error:', error);
      setUser(null);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [remove]);

  const isAuthenticated = useMemo(() => user !== null, [user]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isDeveloperMode,
    isLoading,
    isInitialized,
    setDeveloperMode,
    checkDeveloperMode: async () => isDeveloperMode,
    login,
    logout,
    register,
    updateProfile,
  }), [user, isAuthenticated, isDeveloperMode, isLoading, isInitialized, setDeveloperMode, login, logout, register, updateProfile]);
  
  return contextValue;
});

export const StreamlinedAuthProvider = StreamlinedAuthProviderInternal;
export const useStreamlinedAuth = useStreamlinedAuthInternal;
