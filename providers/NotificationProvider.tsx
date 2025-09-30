import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import createContextHook from '@nkzw/create-context-hook';
import NotificationService from '@/services/NotificationService';

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('NotificationProvider: Initializing notification provider...');
        
        if (Platform.OS === 'web') {
          console.log('NotificationProvider: Skipping notification initialization on web');
          setIsInitialized(true);
          return;
        }
        
        await NotificationService.initialize();
        const token = NotificationService.getPushToken();
        setPushToken(token);
        setIsInitialized(true);
        console.log('NotificationProvider: Notification provider initialized successfully');
      } catch (error) {
        console.error('NotificationProvider: Failed to initialize notification provider:', error);
        setIsInitialized(true);
      }
    };

    initializeNotifications();
  }, []);

  useEffect(() => {
    if (!isInitialized || Platform.OS === 'web') return;

    try {
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        if (notification) {
          console.log('NotificationProvider: Notification received:', notification);
          setLastNotification(notification);
          setUnreadCount(prev => prev + 1);
        }
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        if (response) {
          console.log('NotificationProvider: Notification response received:', response);
          const data = response.notification.request.content.data;
          
          if (data && typeof data === 'object' && 'type' in data && data.type === 'appointment_reminder' && 'appointmentId' in data) {
            console.log('NotificationProvider: Appointment reminder tapped:', data.appointmentId);
          }
        }
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    } catch (error) {
      console.error('NotificationProvider: Failed to setup notification listeners:', error);
    }
  }, [isInitialized]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('NotificationProvider: Notifications not supported on web');
      return false;
    }
    
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('NotificationProvider: Failed to request notification permissions:', error);
      return false;
    }
  }, []);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      await NotificationService.scheduleLocalNotification({
        type: 'general',
        title: 'Test Notification',
        body: 'This is a test notification from your app!',
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }, []);

  const scheduleAppointmentReminder = useCallback(async (
    appointmentId: string,
    title: string,
    body: string,
    reminderTime: Date
  ): Promise<void> => {
    try {
      if (!appointmentId?.trim() || !title?.trim() || !body?.trim() || !reminderTime) {
        console.error('Invalid parameters for appointment reminder');
        return;
      }
      
      await NotificationService.scheduleAppointmentReminder(
        appointmentId,
        title,
        body,
        reminderTime
      );
    } catch (error) {
      console.error('Failed to schedule appointment reminder:', error);
    }
  }, []);

  const clearBadge = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.setBadgeCountAsync(0);
      }
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear badge:', error);
    }
  }, []);

  return {
    isInitialized,
    pushToken,
    unreadCount,
    lastNotification,
    sendTestNotification,
    scheduleAppointmentReminder,
    clearBadge,
    requestPermissions,
  };
});