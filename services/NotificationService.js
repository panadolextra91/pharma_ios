import * as Notifications from 'expo-notifications';
import { Platform, AppState } from 'react-native';
import { API_URL } from '../config';

// Configure notifications - simple configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permissions and register for push notifications
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicine-reminders', {
      name: 'Medicine Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#51ffc6',
      sound: 'default',
    });
  }
  
  return true;
};

// Get push notification token for backend registration
export const getPushNotificationToken = async () => {
  try {
    // For Expo managed workflow, you can get the project ID from app.json/app.config.js
    // or use the default behavior without specifying projectId
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    // If projectId is missing, just skip push notifications and use local notifications only
    if (error.message.includes('projectId')) {
      console.log('ℹ️ Push notifications not available (no projectId), using local notifications only');
      return null;
    }
    console.error('Error getting push notification token:', error);
    // Return null instead of throwing to prevent app crashes
    return null;
  }
};

// Register device for push notifications with backend
export const registerDeviceForPushNotifications = async (userToken, pushToken) => {
  try {
    const response = await fetch(`${API_URL}/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        push_token: pushToken,
        platform: Platform.OS,
        device_info: {
          platform: Platform.OS,
          version: Platform.Version,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register device');
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering device for push notifications:', error);
    throw error;
  }
};

// Schedule local notifications for a medicine (fallback/immediate notifications)
export const scheduleLocalMedicineReminder = async (medicine) => {
  const { id, name, time, days, dosage } = medicine;
  
  // Cancel any existing local notifications for this medicine
  await cancelLocalMedicineReminder(id);
  
  // Create local notifications for each selected day (as backup)
  const notificationIds = [];
  
  for (const day of days) {
    const notificationTime = new Date(time);
    const currentDay = new Date().getDay();
    
    // Calculate days until the next occurrence of this day
    let daysUntil = (day - currentDay + 7) % 7;
    if (daysUntil === 0) {
      // If it's today, check if the time has already passed
      const now = new Date();
      if (notificationTime.getHours() < now.getHours() || 
          (notificationTime.getHours() === now.getHours() && 
           notificationTime.getMinutes() <= now.getMinutes())) {
        // Time has passed, schedule for next week
        daysUntil = 7;
      }
    }
    
    // Schedule the local notification as backup
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medicine Reminder',
        body: `Time to take ${name} (${dosage})`,
        data: { 
          medicineId: id,
          scheduleId: id,
          type: 'medicine_reminder',
          action_buttons: ['taken', 'skip', 'snooze']
        },
        sound: 'default',
      },
      trigger: {
        hour: notificationTime.getHours(),
        minute: notificationTime.getMinutes(),
        weekday: day + 1, // Expo uses 1-7 for days, we use 0-6
        repeats: true,
      },
    });
    
    notificationIds.push(notificationId);
  }
  
  return notificationIds;
};

// Schedule medicine reminder (hybrid: backend + local)
export const scheduleMedicineReminder = async (medicine, userToken = null) => {
  try {
    // Always schedule local notifications as backup
    const localNotificationIds = await scheduleLocalMedicineReminder(medicine);
    
    // If we have a user token, also ensure backend notifications are set up
    if (userToken) {
      try {
        // Get push token and register device if needed
        const pushToken = await getPushNotificationToken();
        if (pushToken) {
          await registerDeviceForPushNotifications(userToken, pushToken);
        }
        
        // Backend automatically generates notifications when schedule is created/updated
        // So we don't need to manually create them here
        console.log('✅ Backend notifications will be automatically generated for schedule:', medicine.id);
      } catch (error) {
        console.error('⚠️ Backend notification setup failed, using local notifications only:', error);
      }
    }
    
    return localNotificationIds;
  } catch (error) {
    console.error('Error scheduling medicine reminder:', error);
    throw error;
  }
};

// Cancel local notifications for a medicine
export const cancelLocalMedicineReminder = async (medicineId) => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.medicineId === medicineId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

// Cancel medicine reminder (both local and backend)
export const cancelMedicineReminder = async (medicineId, userToken = null) => {
  try {
    // Cancel local notifications
    await cancelLocalMedicineReminder(medicineId);
    
    // Cancel backend notifications if user token is available
    if (userToken) {
      try {
        const response = await fetch(`${API_URL}/schedules/${medicineId}/notifications/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        });
        
        if (response.ok) {
          console.log('✅ Backend notifications cancelled for schedule:', medicineId);
        }
      } catch (error) {
        console.error('⚠️ Failed to cancel backend notifications:', error);
      }
    }
  } catch (error) {
    console.error('Error cancelling medicine reminder:', error);
    throw error;
  }
};

// Cancel all medicine reminders
export const cancelAllMedicineReminders = async (userToken = null) => {
  try {
    // Cancel all local notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Cancel all backend notifications if user token is available
    if (userToken) {
      try {
        const response = await fetch(`${API_URL}/schedules/notifications/cancel-all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        });
        
        if (response.ok) {
          console.log('✅ All backend notifications cancelled');
        }
      } catch (error) {
        console.error('⚠️ Failed to cancel all backend notifications:', error);
      }
    }
  } catch (error) {
    console.error('Error cancelling all medicine reminders:', error);
    throw error;
  }
};

// Handle notification response (when user taps notification)
export const handleNotificationResponse = async (response, userToken) => {
  const { notification } = response;
  const { data } = notification.request.content;
  
  if (data?.type === 'medicine_reminder' && data?.scheduleId) {
    // Log that user opened the notification
    try {
      const logResponse = await fetch(`${API_URL}/schedules/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          schedule_id: data.scheduleId,
          schedule_notification_id: data.notificationId,
          action_type: 'acknowledged',
          scheduled_time: new Date().toISOString(),
          notes: 'Notification opened by user'
        }),
      });
      
      if (logResponse.ok) {
        console.log('✅ Notification acknowledgment logged');
      }
    } catch (error) {
      console.error('⚠️ Failed to log notification acknowledgment:', error);
    }
  }
  
  return data;
};

// Log medication action from notification
export const logMedicationActionFromNotification = async (userToken, scheduleId, actionType, notificationId = null) => {
  try {
    const response = await fetch(`${API_URL}/schedules/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        schedule_id: scheduleId,
        schedule_notification_id: notificationId,
        action_type: actionType, // 'taken', 'skipped', 'snoozed', 'missed'
        scheduled_time: new Date().toISOString(),
        notes: `Action taken from notification: ${actionType}`
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to log medication action');
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging medication action:', error);
    throw error;
  }
};

// Get pending notifications from backend
export const getPendingNotifications = async (userToken) => {
  try {
    const response = await fetch(`${API_URL}/schedules/notifications/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch pending notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    throw error;
  }
};

// Sync local notifications with backend
export const syncNotificationsWithBackend = async (userToken) => {
  try {
    // Clear existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🧹 Cleared all existing local notifications');
    
    // Get pending notifications from backend
    const pendingNotifications = await getPendingNotifications(userToken);
    
    let scheduledCount = 0;
    let skippedCount = 0;
    const now = new Date();
    
    // Schedule local notifications for backend notifications
    for (const notification of pendingNotifications.notifications || []) {
      const notificationTime = new Date(notification.notification_datetime);
      
      // Check if this notification is for today and in the future
      const today = new Date();
      const isToday = notificationTime.getDate() === today.getDate() &&
                      notificationTime.getMonth() === today.getMonth() &&
                      notificationTime.getFullYear() === today.getFullYear();
      
      const timeDiff = notificationTime.getTime() - now.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (isToday && timeDiff > fiveMinutes) {
        const scheduledNotification = {
          content: {
            title: '💊 Medicine Reminder',
            body: `Time to take your medicine`,
            data: {
              scheduleId: notification.schedule_id,
              notificationId: notification.id,
              type: 'medicine_reminder'
            },
            sound: 'default',
          },
          trigger: {
            date: new Date(notificationTime.getTime()),
          },
        };
        
        await Notifications.scheduleNotificationAsync(scheduledNotification);
        scheduledCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ Notifications synced: ${scheduledCount} scheduled, ${skippedCount} skipped`);
  } catch (error) {
    console.error('⚠️ Failed to sync notifications with backend:', error);
  }
};