import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "@/providers/AuthProvider";

interface SocialState {
  followedProviderIds: string[];
  isLoading: boolean;
}

interface SocialContextValue {
  followedProviderIds: string[];
  isLoading: boolean;
  followProvider: (providerId: string) => Promise<void>;
  unfollowProvider: (providerId: string) => Promise<void>;
  isFollowing: (providerId: string) => boolean;
  getFollowedCount: () => number;
}

const STORAGE_KEY = "social_followed_providers";

export const [SocialProvider, useSocial] = createContextHook(() => {
  const { user } = useAuth();
  const [socialState, setSocialState] = useState<SocialState>({
    followedProviderIds: [],
    isLoading: true,
  });

  // Load followed providers from AsyncStorage on mount
  useEffect(() => {
    const loadFollowedProviders = async () => {
      if (!user?.id) {
        setSocialState({ followedProviderIds: [], isLoading: false });
        return;
      }

      try {
        console.log('SocialProvider: Loading followed providers for user:', user.id);
        const userStorageKey = `${STORAGE_KEY}_${user.id}`;
        const storedData = await AsyncStorage.getItem(userStorageKey);
        
        if (storedData) {
          const followedIds = JSON.parse(storedData) as string[];
          console.log('SocialProvider: Loaded followed providers:', followedIds.length);
          setSocialState({ followedProviderIds: followedIds, isLoading: false });
        } else {
          console.log('SocialProvider: No followed providers found');
          setSocialState({ followedProviderIds: [], isLoading: false });
        }
      } catch (error) {
        console.error('SocialProvider: Error loading followed providers:', error);
        setSocialState({ followedProviderIds: [], isLoading: false });
      }
    };

    loadFollowedProviders();
  }, [user?.id]);

  // Save followed providers to AsyncStorage
  const saveFollowedProviders = useCallback(async (followedIds: string[]) => {
    if (!user?.id) return;

    try {
      const userStorageKey = `${STORAGE_KEY}_${user.id}`;
      await AsyncStorage.setItem(userStorageKey, JSON.stringify(followedIds));
      console.log('SocialProvider: Saved followed providers:', followedIds.length);
    } catch (error) {
      console.error('SocialProvider: Error saving followed providers:', error);
    }
  }, [user?.id]);

  // Follow a provider
  const followProvider = useCallback(async (providerId: string) => {
    if (!user?.id) {
      console.warn('SocialProvider: Cannot follow provider - user not authenticated');
      return;
    }

    if (socialState.followedProviderIds.includes(providerId)) {
      console.log('SocialProvider: Already following provider:', providerId);
      return;
    }

    try {
      console.log('SocialProvider: Following provider:', providerId);
      const updatedFollowedIds = [...socialState.followedProviderIds, providerId];
      
      setSocialState(prev => ({
        ...prev,
        followedProviderIds: updatedFollowedIds,
      }));
      
      await saveFollowedProviders(updatedFollowedIds);
      console.log('SocialProvider: Successfully followed provider:', providerId);
    } catch (error) {
      console.error('SocialProvider: Error following provider:', error);
      // Revert state on error
      setSocialState(prev => ({
        ...prev,
        followedProviderIds: prev.followedProviderIds.filter(id => id !== providerId),
      }));
    }
  }, [user?.id, socialState.followedProviderIds, saveFollowedProviders]);

  // Unfollow a provider
  const unfollowProvider = useCallback(async (providerId: string) => {
    if (!user?.id) {
      console.warn('SocialProvider: Cannot unfollow provider - user not authenticated');
      return;
    }

    if (!socialState.followedProviderIds.includes(providerId)) {
      console.log('SocialProvider: Not following provider:', providerId);
      return;
    }

    try {
      console.log('SocialProvider: Unfollowing provider:', providerId);
      const updatedFollowedIds = socialState.followedProviderIds.filter(id => id !== providerId);
      
      setSocialState(prev => ({
        ...prev,
        followedProviderIds: updatedFollowedIds,
      }));
      
      await saveFollowedProviders(updatedFollowedIds);
      console.log('SocialProvider: Successfully unfollowed provider:', providerId);
    } catch (error) {
      console.error('SocialProvider: Error unfollowing provider:', error);
      // Revert state on error
      setSocialState(prev => ({
        ...prev,
        followedProviderIds: [...prev.followedProviderIds, providerId],
      }));
    }
  }, [user?.id, socialState.followedProviderIds, saveFollowedProviders]);

  // Check if following a provider
  const isFollowing = useCallback((providerId: string) => {
    return socialState.followedProviderIds.includes(providerId);
  }, [socialState.followedProviderIds]);

  // Get count of followed providers
  const getFollowedCount = useCallback(() => {
    return socialState.followedProviderIds.length;
  }, [socialState.followedProviderIds]);

  const contextValue = useMemo((): SocialContextValue => ({
    followedProviderIds: socialState.followedProviderIds,
    isLoading: socialState.isLoading,
    followProvider,
    unfollowProvider,
    isFollowing,
    getFollowedCount,
  }), [socialState, followProvider, unfollowProvider, isFollowing, getFollowedCount]);

  return contextValue;
});