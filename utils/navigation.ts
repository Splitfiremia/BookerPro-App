import { router } from 'expo-router';

/**
 * Handles navigation after successful logout
 * Ensures consistent behavior across all screens
 */
export const handlePostLogoutNavigation = async (): Promise<void> => {
  try {
    console.log('Navigation: Starting post-logout navigation');
    
    // Clear the navigation stack and go to root
    router.dismissAll();
    
    // Small delay to ensure navigation stack is cleared
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Navigate to the login/index screen
    router.replace('/');
    
    console.log('Navigation: Post-logout navigation completed');
  } catch (error) {
    console.error('Navigation: Post-logout navigation error:', error);
    
    // Fallback: force navigation to root
    try {
      router.replace('/');
    } catch (fallbackError) {
      console.error('Navigation: Fallback navigation also failed:', fallbackError);
    }
  }
};

/**
 * Performs a complete sign out process with proper error handling
 * @param logout - The logout function from AuthProvider
 * @returns Promise with success status and optional error message
 */
export const performSignOut = async (
  logout: () => Promise<{ success: boolean; error?: string }>
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('SignOut: Starting sign out process');
    
    // Step 1: Perform logout
    const logoutResult = await logout();
    
    if (!logoutResult.success) {
      console.error('SignOut: Logout failed:', logoutResult.error);
      return logoutResult;
    }
    
    console.log('SignOut: Logout successful, handling navigation');
    
    // Step 2: Handle navigation
    await handlePostLogoutNavigation();
    
    console.log('SignOut: Sign out process completed successfully');
    return { success: true };
    
  } catch (error) {
    console.error('SignOut: Sign out process error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
    return { success: false, error: errorMessage };
  }
};
