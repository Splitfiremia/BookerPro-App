import { router } from "expo-router";

// Navigation utility for BookerPro app
// This utility provides a consistent way to navigate between screens

// Define params for routes that need them
type NavigationParams = {
  email?: string;
  role?: "client" | "provider" | "owner";
  id?: string | number;
  status?: string;
};

/**
 * Navigate to a screen
 * @param path The path to navigate to
 * @param params Optional parameters to pass to the screen
 */
export const navigate = (path: string, params?: NavigationParams) => {
  if (params) {
    router.push({
      pathname: path as any,
      params: params as any,
    });
  } else {
    router.push(path as any);
  }
};

/**
 * Navigate to a screen and replace the current screen in the history
 * @param path The path to navigate to
 * @param params Optional parameters to pass to the screen
 */
export const navigateAndReplace = (path: string, params?: NavigationParams) => {
  if (params) {
    router.replace({
      pathname: path as any,
      params: params as any,
    });
  } else {
    router.replace(path as any);
  }
};

/**
 * Navigate back to the previous screen
 */
export const goBack = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    // Fallback to home if no previous screen
    router.replace("/");
  }
};

/**
 * Navigate to the home screen
 */
export const goHome = () => {
  router.replace("/" as any);
};

/**
 * Navigate to the login screen
 */
export const goToLogin = () => {
  router.replace("/(auth)/login" as any);
};

/**
 * Navigate to the signup screen
 */
export const goToSignup = (email: string, role: "client" | "provider" | "owner") => {
  router.push({
    pathname: "/(auth)/signup" as any,
    params: { email, role } as any,
  });
};

/**
 * Navigate to the role selection screen
 */
export const goToRoleSelection = () => {
  router.push("/(auth)/role-selection" as any);
};

/**
 * Navigate to the booking screen
 */
export const goToBooking = () => {
  router.push("/booking" as any);
};

/**
 * Navigate to the appointment details screen
 */
export const goToAppointmentDetails = (id: string, status: string) => {
  router.push({
    pathname: "/appointment-details" as any,
    params: { id, status } as any,
  });
};

/**
 * Navigate to a provider's profile
 */
export const goToProviderProfile = (id: string) => {
  router.push({
    pathname: "/provider/[id]" as any,
    params: { id } as any,
  });
};