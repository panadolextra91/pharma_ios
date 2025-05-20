import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomMenu from '../components/ui/BottomMenu';
import ScheduleIcon from '../assets/052_Medical_App.png';
import AddNewMedicineSchedule from '../components/ui/schedule/AddNewMedicineSchedule';
import EditMedicineSchedule from '../components/ui/schedule/EditMedicineSchedule';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions, scheduleMedicineReminder, cancelMedicineReminder } from '../services/NotificationService';


const Schedule = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [medicines, setMedicines] = useState([
    { id: 1, name: 'Paracetamol', time: new Date(), days: [1, 2, 3, 4, 5], dosage: '1 pill' },
    { id: 2, name: 'Vitamin C', time: new Date(), days: [0, 2, 4, 6], dosage: '2 pills' },
  ]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    time: new Date(),
    days: [],
    dosage: '',
  });

  const daysOfWeek = [
    { id: 0, label: 'Sun' },
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
  ];
  
  useEffect(() => {
    // Check notification permissions when component mounts
    checkNotificationPermissions();
    
    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        // Handle received notification
        console.log('Notification received:', notification);
      }
    );
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        // Handle user response to notification
        console.log('Notification response:', response);
        navigation.navigate('Schedule');
      }
    );
    
    return () => {
      // Clean up listeners when component unmounts
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  
  const checkNotificationPermissions = async () => {
    const hasPermission = await requestNotificationPermissions();
    setNotificationsEnabled(hasPermission);
  };

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
    const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
    const newMedicine = { ...medicineData, id: newId };
    
    setMedicines(prev => [...prev, newMedicine]);
    
    // Schedule notifications if enabled
    if (notificationsEnabled) {
      try {
        await scheduleMedicineReminder(newMedicine);
      } catch (error) {
        console.error('Failed to schedule notification:', error);
      }
    }
  };

  const deleteMedicine = (id) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Cancel notifications for this medicine
            if (notificationsEnabled) {
              try {
                await cancelMedicineReminder(id);
              } catch (error) {
                console.error('Failed to cancel notification:', error);
              }
            }
            
            setMedicines(medicines.filter(med => med.id !== id));
            if (editingId === id) setEditingId(null);
          },
        },
      ]
    );
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Image source={ScheduleIcon} style={styles.icon} />
          <Text style={styles.header}>Medicine Schedule</Text>
          <View style={styles.notificationToggle}>
            <Text style={styles.notificationText}>Reminders</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={async (value) => {
                if (value) {
                  // Request permissions if turning on
                  const hasPermission = await requestNotificationPermissions();
                  if (hasPermission) {
                    setNotificationsEnabled(true);
                    // Schedule notifications for all medicines
                    for (const medicine of medicines) {
                      await scheduleMedicineReminder(medicine);
                    }
                  } else {
                    Alert.alert(
                      'Permission Required',
                      'Notification permission is required to enable reminders.'
                    );
                  }
                } else {
                  // Cancel all notifications if turning off
                  setNotificationsEnabled(false);
                  for (const medicine of medicines) {
                    await cancelMedicineReminder(medicine.id);
                  }
                }
              }}
              trackColor={{ false: '#d1d1d1', true: '#a9ffe1' }}
              thumbColor={notificationsEnabled ? '#51ffc6' : '#f4f3f4'}
            />
          </View>
        </View>
        
        {medicines.map(medicine => (
          <View key={medicine.id} style={styles.medicineCard}>
            <View style={styles.medicineHeader}>
              <Text style={styles.medicineName}>{medicine.name}</Text>
              <View style={styles.medicineActions}>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedMedicine(medicine);
                    setShowEditModal(true);
                  }}
                >
                  <Ionicons 
                    name="pencil" 
                    size={24} 
                    color="#51ffc6" 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMedicine(medicine.id)}>
                  <Ionicons name="trash" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.medicineDetail}>
              <Ionicons name="time" size={20} color="#666" />
              <TouchableOpacity 
                onPress={() => {
                  setEditingId(medicine.id);
                  setShowTimePicker(true);
                }}
              >
                <Text style={styles.detailText}>{formatTime(medicine.time)}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.medicineDetail}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.detailText}>{formatDays(medicine.days)}</Text>
            </View>
            
            <View style={styles.medicineDetail}>
              <Ionicons name="medical" size={20} color="#666" />
              <Text style={styles.detailText}>{medicine.dosage}</Text>
            </View>
            
            {editingId === medicine.id && (
              <View style={styles.daysContainer}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      medicine.days.includes(day.id) && styles.dayButtonActive
                    ]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text style={medicine.days.includes(day.id) ? styles.dayTextActive : styles.dayText}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        

        
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
        onUpdate={async (updatedMedicine) => {
          const updatedMedicines = medicines.map(med => 
            med.id === updatedMedicine.id ? updatedMedicine : med
          );
          setMedicines(updatedMedicines);
          
          // Update notifications if enabled
          if (notificationsEnabled) {
            try {
              await scheduleMedicineReminder(updatedMedicine);
            } catch (error) {
              console.error('Failed to update notification:', error);
            }
          }
        }}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  medicineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  medicineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  detailText: {
    color: '#666',
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  dayButtonActive: {
    backgroundColor: '#51ffc6',
  },
  dayText: {
    color: '#666',
  },
  dayTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#51ffc6',
    padding: 16,
    borderRadius: 50,
    marginTop: 8,
    gap: 8,
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
  addForm: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 20,
  },
  addHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 50,
    marginTop: 8,
    gap: 8,
  },
  buttonText: {
    color: '#333',
    fontWeight: '600',
  },
});

export default Schedule;