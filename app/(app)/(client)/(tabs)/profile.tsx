import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  Settings, 
  LogOut, 
  Share2, 
  UserPlus, 
  CreditCard, 
  Gift, 
  Hash, 
  HelpCircle, 
  MoreHorizontal,
  Edit3
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}

interface SocialLink {
  id: string;
  name: string;
  url: string;
  backgroundColor: string;
  textColor: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profileImage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const menuItems: MenuItem[] = [
    {
      id: "share",
      title: "Share With Friends",
      icon: Share2,
      onPress: () => Alert.alert("Share", "Share the app with friends"),
    },
    {
      id: "invite",
      title: "Invite My Barber",
      icon: UserPlus,
      onPress: () => Alert.alert("Invite", "Invite your barber to join"),
    },
    {
      id: "payment",
      title: "Payment Method",
      icon: CreditCard,
      onPress: () => Alert.alert("Payment", "Manage payment methods"),
    },
    {
      id: "vouchers",
      title: "Vouchers",
      icon: Gift,
      onPress: () => Alert.alert("Vouchers", "View your vouchers"),
    },
    {
      id: "redeem",
      title: "Redeem Code",
      icon: Hash,
      onPress: () => Alert.alert("Redeem", "Enter a redeem code"),
    },
    {
      id: "help",
      title: "Help & Resources",
      icon: HelpCircle,
      onPress: () => Alert.alert("Help", "Get help and support"),
    },
    {
      id: "more",
      title: "More",
      icon: MoreHorizontal,
      onPress: () => Alert.alert("More", "Additional options"),
    },
  ];

  const socialLinks: SocialLink[] = [
    {
      id: "facebook",
      name: "f",
      url: "https://facebook.com",
      backgroundColor: "#1877F2",
      textColor: "#FFFFFF",
    },
    {
      id: "instagram",
      name: "IG",
      url: "https://instagram.com",
      backgroundColor: "#E4405F",
      textColor: "#FFFFFF",
    },
    {
      id: "snapchat",
      name: "👻",
      url: "https://snapchat.com",
      backgroundColor: "#FFFC00",
      textColor: "#000000",
    },
    {
      id: "tiktok",
      name: "♪",
      url: "https://tiktok.com",
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
    {
      id: "twitter",
      name: "X",
      url: "https://twitter.com",
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  ];

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Edit your client profile");
  };

  const handleSocialLink = (url: string) => {
    Linking.openURL(url);
  };

  const handleTermsPress = () => {
    Alert.alert("Terms of Service", "View terms of service");
  };

  const handlePrivacyPress = () => {
    Alert.alert("Privacy Policy", "View privacy policy");
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out", 
      "Are you sure you want to log out?", 
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              console.log('Profile: Starting logout process');
              console.log('Profile: Current user before logout:', user?.email);
              
              // Clear the user state - let the app layout handle navigation
              await logout();
              
              console.log('Profile: Logout completed successfully');
              console.log('Profile: App layout will handle navigation to index');
              
            } catch (error) {
              console.error('Profile: Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{user?.name || "Luis Martinez"}</Text>
            <Text style={styles.headerSubtitle}>Client</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0).toUpperCase() || "L"}
                </Text>
                <View style={styles.editIconContainer}>
                  <Edit3 size={16} color={COLORS.background} />
                </View>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileText}>EDIT CLIENT PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <IconComponent size={24} color={COLORS.white} />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Log Out */}
        <TouchableOpacity 
          style={[styles.logoutItem, isLoggingOut && styles.disabledItem]} 
          onPress={handleLogout}
          disabled={isLoggingOut}
          testID="logout-button"
        >
          <View style={styles.menuItemLeft}>
            <LogOut size={24} color={COLORS.error} />
            <Text style={[styles.menuItemText, { color: COLORS.error }]}>
              {isLoggingOut ? 'Logging Out...' : 'Log Out'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Social Links */}
        <View style={styles.socialSection}>
          {socialLinks.map((social) => (
            <TouchableOpacity
              key={social.id}
              style={[
                styles.socialButton,
                { backgroundColor: social.backgroundColor }
              ]}
              onPress={() => handleSocialLink(social.url)}
            >
              <Text style={[styles.socialText, { color: social.textColor }]}>
                {social.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Links */}
        <View style={styles.footerSection}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={handleTermsPress}>
              <Text style={styles.footerLinkText}>TERMS OF SERVICE</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePrivacyPress}>
              <Text style={styles.footerLinkText}>PRIVACY POLICY</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.versionText}>v1.81.0 (1269)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.white,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  editProfileButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  editProfileText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 16,
    fontWeight: "500",
  },
  logoutItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 30,
  },
  socialSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  socialText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footerSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 20,
  },
  footerLinkText: {
    fontSize: 12,
    color: COLORS.lightGray,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  disabledItem: {
    opacity: 0.5,
  },
});