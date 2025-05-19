import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomMenu from '../components/ui/BottomMenu';
import ScheduleIcon from '../assets/052_Medical_App.png'


const Schedule = ({ navigation }) => {
  const [medicines, setMedicines] = useState([
    { id: 1, name: 'Paracetamol', time: new Date(), days: [1, 2, 3, 4, 5], dosage: '1 pill' },
    { id: 2, name: 'Vitamin C', time: new Date(), days: [0, 2, 4, 6], dosage: '2 pills' },
  ]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
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

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      if (isAdding) {
        setNewMedicine({ ...newMedicine, time: selectedTime });
      } else {
        const updatedMedicines = medicines.map(med => 
          med.id === editingId ? { ...med, time: selectedTime } : med
        );
        setMedicines(updatedMedicines);
      }
    }
  };

  const toggleDay = (dayId) => {
    if (isAdding) {
      const newDays = newMedicine.days.includes(dayId)
        ? newMedicine.days.filter(id => id !== dayId)
        : [...newMedicine.days, dayId];
      setNewMedicine({ ...newMedicine, days: newDays });
    } else {
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
    }
  };

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage || newMedicine.days.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and select at least one day');
      return;
    }
    const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
    setMedicines([...medicines, { ...newMedicine, id: newId }]);
    setNewMedicine({ name: '', time: new Date(), days: [], dosage: '' });
    setIsAdding(false);
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
          onPress: () => {
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
          
        </View>
        
        {medicines.map(medicine => (
          <View key={medicine.id} style={styles.medicineCard}>
            <View style={styles.medicineHeader}>
              <Text style={styles.medicineName}>{medicine.name}</Text>
              <View style={styles.medicineActions}>
                <TouchableOpacity 
                  onPress={() => {
                    setEditingId(editingId === medicine.id ? null : medicine.id);
                    setIsAdding(false);
                  }}
                >
                  <Ionicons 
                    name={editingId === medicine.id ? 'close' : 'pencil'} 
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
        
        {isAdding && (
          <View style={[styles.medicineCard, styles.addForm]}>
            <Text style={styles.addHeader}>Add New Medicine</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medicine Name</Text>
              <TextInput
                style={styles.input}
                value={newMedicine.name}
                onChangeText={text => setNewMedicine({...newMedicine, name: text})}
                placeholder="e.g., Paracetamol"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>{formatTime(newMedicine.time)}</Text>
                <Ionicons name="time" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={newMedicine.dosage}
                onChangeText={text => setNewMedicine({...newMedicine, dosage: text})}
                placeholder="e.g., 1 pill, 5ml"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Days</Text>
              <View style={styles.daysContainer}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      newMedicine.days.includes(day.id) && styles.dayButtonActive
                    ]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text style={newMedicine.days.includes(day.id) ? styles.dayTextActive : styles.dayText}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsAdding(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.addButton]}
                onPress={addMedicine}
              >
                <Text style={styles.buttonText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {!isAdding && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setIsAdding(true);
              setEditingId(null);
            }}
          >
            <Ionicons name="add" size={24} color="#333" />
            <Text style={styles.addButtonText}>Add New Medicine Button</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      <BottomMenu activeRoute="Schedule" />
      
      {showTimePicker && (
        <DateTimePicker
          value={isAdding ? newMedicine.time : (medicines.find(m => m.id === editingId)?.time || new Date())}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
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
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
    
  },
  icon: {
    width: 40,
    height: 40,
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
  addButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
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