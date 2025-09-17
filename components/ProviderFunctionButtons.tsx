import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Share, Linking } from 'react-native';
import { CreditCard, Calendar, UserPlus, Radio } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { router } from 'expo-router';
import * as Contacts from 'expo-contacts';

interface ProviderFunctionButtonsProps {
  onChargePress?: () => void;
  onSchedulePress?: () => void;
  onInvitePress?: () => void;
  onBroadcastPress?: () => void;
}

const ProviderFunctionButtons: React.FC<ProviderFunctionButtonsProps> = ({
  onChargePress,
  onSchedulePress,
  onInvitePress,
  onBroadcastPress,
}) => {
  const handleChargePress = () => {
    if (onChargePress) {
      onChargePress();
    } else {
      router.push('/(app)/(provider)/complete-payment');
    }
  };

  const handleSchedulePress = () => {
    if (onSchedulePress) {
      onSchedulePress();
    } else {
      router.push('/(app)/(provider)/(tabs)/schedule');
    }
  };

  const handleInvitePress = async () => {
    if (onInvitePress) {
      onInvitePress();
    } else {
      try {
        // Different approach based on platform
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          // Request permission to access contacts
          const { status } = await Contacts.requestPermissionsAsync();
          
          if (status === 'granted') {
            // On mobile, we'll show a share dialog with the preset message
            const message = 'Check me out at the BookerPro to request an appointment booking.';
            
            try {
              await Share.share({
                message: message,
                // Optional URL if we have a website
                // Removed URL to simplify and avoid potential issues
              }, {
                dialogTitle: 'Invite to BookerPro'
              });
            } catch (error) {
              console.error('Error sharing:', error);
              Alert.alert('Error', 'There was an error sharing the invitation.');
            }
          } else {
            Alert.alert(
              'Permission Required',
              'Please grant permission to access your contacts to use this feature.',
              [{ text: 'OK' }]
            );
          }
        } else if (Platform.OS === 'web') {
          // Web doesn't support native contacts, use a different approach
          // We'll use mailto: link as a fallback
          const message = 'Check me out at the BookerPro to request an appointment booking.';
          
          // Use Web Share API if available (with type safety)
          if (typeof navigator !== 'undefined' && 'share' in navigator) {
            try {
              // Use a simpler share object to avoid permission issues
              await (navigator as any).share({
                title: 'BookerPro Invitation',
                text: message
                // Removed URL as it can cause permission issues in some browsers
              }).catch((error: any) => {
                console.log('Share API error:', error);
                throw error; // Re-throw to be caught by outer catch
              });
            } catch (error) {
              console.error('Error sharing:', error);
              // Show a user-friendly message
              Alert.alert(
                'Sharing Not Available',
                'Could not access sharing functionality. Would you like to share via email instead?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Use Email', 
                    onPress: () => Linking.openURL(`mailto:?subject=BookerPro Invitation&body=${encodeURIComponent(message)}`) 
                  }
                ]
              );
            }
          } else {
            // Fallback for browsers that don't support Web Share API
            Linking.openURL(`mailto:?subject=BookerPro Invitation&body=${encodeURIComponent(message)}`);
          }
        }
      } catch (error) {
        console.error('Error in invite process:', error);
        Alert.alert('Error', 'There was an error with the invitation process.');
      }
    }
  };

  const handleBroadcastPress = () => {
    if (onBroadcastPress) {
      onBroadcastPress();
    } else {
      router.push('/(app)/(provider)/broadcast');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.functionButtonsContainer}>
        <TouchableOpacity 
          style={styles.functionButton} 
          onPress={handleChargePress}
          testID="provider-function-charge"
        >
          <View style={styles.iconContainer}>
            <CreditCard size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.functionButtonText}>CHARGE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.functionButton} 
          onPress={handleSchedulePress}
          testID="provider-function-schedule"
        >
          <View style={styles.iconContainer}>
            <Calendar size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.functionButtonText}>SCHEDULE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.functionButton} 
          onPress={handleInvitePress}
          testID="provider-function-invite"
        >
          <View style={styles.iconContainer}>
            <UserPlus size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.functionButtonText}>INVITE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.functionButton} 
          onPress={handleBroadcastPress}
          testID="provider-function-broadcast"
        >
          <View style={styles.iconContainer}>
            <Radio size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.functionButtonText}>BROADCAST</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  functionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  functionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(240, 121, 69, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  functionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});

export default ProviderFunctionButtons;