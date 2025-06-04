import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image, Switch, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomMenu from '../components/ui/BottomMenu';
import ScheduleIcon from '../assets/052_Medical_App.png';
import AddNewMedicineSchedule from '../components/ui/schedule/AddNewMedicineSchedule';
import EditMedicineSchedule from '../components/ui/schedule/EditMedicineSchedule';
import ScheduleMedicineCard from '../components/ui/schedule/ScheduleMedicineCard';
import * as Notifications from 'expo-notifications';
import { 
  requestNotificationPermissions, 
  scheduleMedicineReminder, 
  cancelMedicineReminder,
  cancelAllMedicineReminders,
  handleNotificationResponse,
  syncNotificationsWithBackend,
  getPushNotificationToken,
  registerDeviceForPushNotifications
} from '../services/NotificationService';
import { useAuth } from '../context/AuthContext';
import { 
  getSchedules, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule,
  transformScheduleForBackend,
  transformScheduleForFrontend 
} from '../services/ScheduleService';

const Schedule = ({ navigation }) => {
  const { user } = useAuth();
  const notificationListener = useRef();
  const responseListener = useRef();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showExpired, setShowExpired] = useState(false);

  const daysOfWeek = [
    { id: 0, label: 'Sun' },
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
  ];

  // Check if a schedule is expired
  const isScheduleExpired = (schedule) => {
    if (!schedule.endDate) return false;
    const today = new Date();
    const endDate = new Date(schedule.endDate);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  // Filter schedules based on expiration status
  const getFilteredMedicines = () => {
    const activeMedicines = medicines.filter(med => !isScheduleExpired(med));
    const expiredMedicines = medicines.filter(med => isScheduleExpired(med));
    
    if (showExpired) {
      return [...activeMedicines, ...expiredMedicines];
    }
    return activeMedicines;
  };

  // Get counts for display
  const getScheduleCounts = () => {
    const activeMedicines = medicines.filter(med => !isScheduleExpired(med));
    const expiredMedicines = medicines.filter(med => isScheduleExpired(med));
    
    return {
      active: activeMedicines.length,
      expired: expiredMedicines.length,
      total: medicines.length
    };
  };

  // Initialize push notifications
  const initializePushNotifications = async () => {
    if (!user?.token) return;

    try {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        // Try to get push token and register device (optional)
        const pushToken = await getPushNotificationToken();
        if (pushToken) {
          try {
            await registerDeviceForPushNotifications(user.token, pushToken);
            console.log('✅ Device registered for push notifications');
          } catch (error) {
            console.log('ℹ️ Push notification registration failed, using local notifications only');
          }
        } else {
          console.log('ℹ️ No push token available, using local notifications only');
        }
        
        // Sync with backend notifications (this works regardless of push token)
        await syncNotificationsWithBackend(user.token);
      }
    } catch (error) {
      console.error('⚠️ Failed to initialize notifications:', error);
    }
  };

  // Fetch schedules from backend
  const fetchSchedules = async () => {
    if (!user?.token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      setError(null);
      const response = await getSchedules(user.token);
      
      if (response.schedules) {
        const transformedSchedules = response.schedules.map(transformScheduleForFrontend);
        setMedicines(transformedSchedules);
        
        // Initialize push notifications after medicines are loaded
        await initializePushNotifications();
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError(error.message);
      Alert.alert('Error', 'Failed to load schedules. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh schedules
  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };
  
  useEffect(() => {
    // Fetch schedules from backend (this will also initialize push notifications)
    fetchSchedules();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('💊 Medicine reminder notification received');
      }
    );
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        // Handle user response to notification
        console.log('👆 Notification response:', response);
        
        if (user?.token) {
          try {
            await handleNotificationResponse(response, user.token);
          } catch (error) {
            console.error('Error handling notification response:', error);
          }
        }
        
        // Navigate to Schedule screen
        navigation.navigate('Schedule');
      }
    );
    
    return () => {
      // Clean up listeners when component unmounts
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedMedicines = medicines.map(med => 
        med.id === editingId ? { ...med, time: selectedTime } : med
      );
      setMedicines(updatedMedicines);
    }
  };

  const toggleDay = (dayId) => {
    const updatedMedicines = medicines.map(med => {
      if (med.id === editingId) {
        const newDays = med.days.includes(dayId)
          ? med.days.filter(id => id !== dayId)
          : [...med.days, dayId];
        return { ...med, days: newDays };
      }
      return med;
    });
    setMedicines(updatedMedicines);
  };

  const addMedicine = async (medicineData) => {
    if (!user?.token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      const backendData = transformScheduleForBackend(medicineData);
      const response = await createSchedule(user.token, backendData);
      
      if (response.schedule) {
        const newMedicine = transformScheduleForFrontend(response.schedule);
        setMedicines(prev => [...prev, newMedicine]);
        
        // Backend automatically generates notifications, so just sync
        try {
          await syncNotificationsWithBackend(user.token);
          console.log('✅ Notifications synced for new medicine');
        } catch (error) {
          console.error('⚠️ Failed to sync notifications:', error);
        }
        
        Alert.alert('Success', 'Medicine schedule added successfully!');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      Alert.alert('Error', 'Failed to add medicine schedule. Please try again.');
    }
  };

  const updateMedicine = async (updatedMedicine) => {
    if (!user?.token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      const backendData = transformScheduleForBackend(updatedMedicine);
      const response = await updateSchedule(user.token, updatedMedicine.id, backendData);
      
      if (response.schedule) {
        const updated = transformScheduleForFrontend(response.schedule);
        setMedicines(prev => prev.map(med => 
          med.id === updatedMedicine.id ? updated : med
        ));
        
        // Backend automatically regenerates notifications, so just sync
        try {
          await syncNotificationsWithBackend(user.token);
          console.log('✅ Notifications synced for updated medicine');
        } catch (error) {
          console.error('⚠️ Failed to sync notifications:', error);
        }
        
        Alert.alert('Success', 'Medicine schedule updated successfully!');
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
      Alert.alert('Error', 'Failed to update medicine schedule. Please try again.');
    }
  };

  const deleteMedicine = (id) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (!user?.token) {
              Alert.alert('Error', 'Authentication required');
              return;
            }

            try {
              await deleteSchedule(user.token, id);
              setMedicines(prev => prev.filter(med => med.id !== id));
              
              // Backend automatically removes notifications, so just sync
              try {
                await syncNotificationsWithBackend(user.token);
                console.log('✅ Notifications synced after deletion');
              } catch (error) {
                console.error('⚠️ Failed to sync notifications:', error);
              }
              
              Alert.alert('Success', 'Medicine schedule deleted successfully!');
            } catch (error) {
              console.error('Error deleting medicine:', error);
              Alert.alert('Error', 'Failed to delete medicine schedule. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setShowEditModal(true);
  };

  const handleTimePress = (medicineId) => {
    setEditingId(medicineId);
    setShowTimePicker(true);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDays = (days) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#51ffc6" />
          <Text style={styles.loadingText}>Loading schedules...</Text>
        </View>
        <BottomMenu activeRoute="Schedule" />
      </View>
    );
  }

  const filteredMedicines = getFilteredMedicines();
  const counts = getScheduleCounts();

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#51ffc6']}
            tintColor="#51ffc6"
          />
        }
      >
        <View style={styles.headerContainer}>
          <Image source={ScheduleIcon} style={styles.icon} />
          <Text style={styles.header}>Medicine Schedule</Text>
        </View>

        {/* Schedule Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{counts.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ff6b6b' }]}>{counts.expired}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{counts.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Filter Toggle */}
        {counts.expired > 0 && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Show expired schedules</Text>
            <Switch
              value={showExpired}
              onValueChange={setShowExpired}
              trackColor={{ false: '#ddd', true: '#51ffc6' }}
              thumbColor={showExpired ? '#fff' : '#f4f3f4'}
            />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSchedules}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {filteredMedicines.length === 0 && !loading && !error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {medicines.length === 0 ? 'No medicine schedules yet' : 'No active schedules'}
            </Text>
            <Text style={styles.emptySubText}>
              {medicines.length === 0 
                ? 'Tap the + button to add your first medicine reminder'
                : 'All schedules have expired. Toggle to show expired schedules.'
              }
            </Text>
          </View>
        ) : (
          filteredMedicines.map(medicine => (
            <ScheduleMedicineCard
              key={medicine.id}
              medicine={medicine}
              onEdit={handleEditMedicine}
              onDelete={deleteMedicine}
              onTimePress={handleTimePress}
              formatTime={formatTime}
              formatDays={formatDays}
              isEditing={editingId === medicine.id}
              daysOfWeek={daysOfWeek}
              onToggleDay={toggleDay}
            />
          ))
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.floatingAddButton}
        onPress={() => setShowMedicineModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <BottomMenu activeRoute="Schedule" />
      
      {showTimePicker && (
        <DateTimePicker
          value={medicines.find(m => m.id === editingId)?.time || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
      
      <AddNewMedicineSchedule
        visible={showMedicineModal}
        onClose={() => setShowMedicineModal(false)}
        onAdd={addMedicine}
      />
      
      <EditMedicineSchedule
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={updateMedicine}
        medicine={selectedMedicine}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 60,
    paddingBottom: 80, // Space for bottom menu
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  retryButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#51ffc6',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 28,
    backgroundColor: '#51ffc6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Schedule;