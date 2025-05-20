import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permissions
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
    Notifications.setNotificationChannelAsync('medicine-reminders', {
      name: 'Medicine Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#51ffc6',
    });
  }
  
  return true;
};

// Schedule a notification for a medicine
export const scheduleMedicineReminder = async (medicine) => {
  const { id, name, time, days, dosage } = medicine;
  
  // Cancel any existing notifications for this medicine
  await cancelMedicineReminder(id);
  
  // Create notifications for each selected day
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
    
    // Set the notification date
    const scheduledDate = new Date(notificationTime);
    scheduledDate.setDate(scheduledDate.getDate() + daysUntil);
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medicine Reminder',
        body: `Time to take ${name} (${dosage})`,
        data: { medicineId: id },
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

// Cancel notifications for a medicine
export const cancelMedicineReminder = async (medicineId) => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.medicineId === medicineId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

// Cancel all medicine reminders
export const cancelAllMedicineReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
