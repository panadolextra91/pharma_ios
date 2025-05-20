import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditMedicineSchedule = ({ visible, onClose, onUpdate, medicine }) => {
  const [editedMedicine, setEditedMedicine] = useState({
    name: '',
    time: new Date(),
    days: [],
    dosage: '',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState('AM');

  useEffect(() => {
    if (medicine && visible) {
      setEditedMedicine({
        id: medicine.id,
        name: medicine.name,
        time: new Date(medicine.time),
        days: [...medicine.days],
        dosage: medicine.dosage
      });
      
      // Set time picker values
      const hours = new Date(medicine.time).getHours();
      const minutes = new Date(medicine.time).getMinutes();
      
      setSelectedHour(hours % 12 === 0 ? 12 : hours % 12);
      setSelectedMinute(minutes);
      setSelectedAmPm(hours >= 12 ? 'PM' : 'AM');
    }
  }, [medicine, visible]);

  const daysOfWeek = [
    { id: 0, label: 'Sun' },
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
  ];

  const handleTimeChange = () => {
    const hours = selectedAmPm === 'PM' && selectedHour !== 12 
      ? selectedHour + 12 
      : (selectedAmPm === 'AM' && selectedHour === 12 ? 0 : selectedHour);
    
    const newTime = new Date();
    newTime.setHours(hours);
    newTime.setMinutes(selectedMinute);
    newTime.setSeconds(0);
    
    setEditedMedicine({ ...editedMedicine, time: newTime });
    setShowTimePicker(false);
  };

  const toggleDay = (dayId) => {
    const newDays = editedMedicine.days.includes(dayId)
      ? editedMedicine.days.filter(id => id !== dayId)
      : [...editedMedicine.days, dayId];
    setEditedMedicine({ ...editedMedicine, days: newDays });
  };

  const handleUpdateMedicine = () => {
    if (!editedMedicine.name || !editedMedicine.dosage || editedMedicine.days.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and select at least one day');
      return;
    }
    onUpdate(editedMedicine);
    onClose();
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Medicine</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Medicine Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editedMedicine.name}
                      onChangeText={(text) => setEditedMedicine({...editedMedicine, name: text})}
                      placeholder="Enter medicine name"
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dosage</Text>
                    <TextInput
                      style={styles.input}
                      value={editedMedicine.dosage}
                      onChangeText={(text) => setEditedMedicine({...editedMedicine, dosage: text})}
                      placeholder="e.g., 1 pill, 5ml"
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Time</Text>
                    <TouchableOpacity 
                      style={styles.timeInput}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text>{formatTime(editedMedicine.time)}</Text>
                      <Ionicons name="time-outline" size={20} color="#666" />
                    </TouchableOpacity>
                    
                    {showTimePicker && (
                      <View style={styles.timePickerContainer}>
                        <View style={styles.timePickerHeader}>
                          <Text style={styles.timePickerTitle}>Select Time</Text>
                          <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                            <Ionicons name="close" size={24} color="#666" />
                          </TouchableOpacity>
                        </View>
                        
                        <View style={styles.timePickerContent}>
                          {/* Hour picker */}
                          <View style={styles.timePickerColumn}>
                            <Text style={styles.timePickerLabel}>Hour</Text>
                            <ScrollView style={styles.timePickerScroll}>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                <TouchableOpacity
                                  key={`hour-${hour}`}
                                  style={[styles.timePickerItem, selectedHour === hour && styles.timePickerItemSelected]}
                                  onPress={() => setSelectedHour(hour)}
                                >
                                  <Text style={[styles.timePickerItemText, selectedHour === hour && styles.timePickerItemTextSelected]}>
                                    {hour}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                          
                          {/* Minute picker */}
                          <View style={styles.timePickerColumn}>
                            <Text style={styles.timePickerLabel}>Minute</Text>
                            <ScrollView style={styles.timePickerScroll}>
                              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                                <TouchableOpacity
                                  key={`minute-${minute}`}
                                  style={[styles.timePickerItem, selectedMinute === minute && styles.timePickerItemSelected]}
                                  onPress={() => setSelectedMinute(minute)}
                                >
                                  <Text style={[styles.timePickerItemText, selectedMinute === minute && styles.timePickerItemTextSelected]}>
                                    {minute < 10 ? `0${minute}` : minute}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                          
                          {/* AM/PM picker */}
                          <View style={styles.timePickerColumn}>
                            <Text style={styles.timePickerLabel}>AM/PM</Text>
                            <View style={styles.amPmContainer}>
                              <TouchableOpacity
                                style={[styles.amPmButton, selectedAmPm === 'AM' && styles.amPmButtonSelected]}
                                onPress={() => setSelectedAmPm('AM')}
                              >
                                <Text style={[styles.amPmButtonText, selectedAmPm === 'AM' && styles.amPmButtonTextSelected]}>AM</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.amPmButton, selectedAmPm === 'PM' && styles.amPmButtonSelected]}
                                onPress={() => setSelectedAmPm('PM')}
                              >
                                <Text style={[styles.amPmButtonText, selectedAmPm === 'PM' && styles.amPmButtonTextSelected]}>PM</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                        
                        <TouchableOpacity 
                          style={styles.timePickerConfirmButton}
                          onPress={handleTimeChange}
                        >
                          <Text style={styles.timePickerConfirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Days</Text>
                    <View style={styles.daysContainer}>
                      {daysOfWeek.map(day => (
                        <TouchableOpacity
                          key={day.id}
                          style={[
                            styles.dayButton,
                            editedMedicine.days.includes(day.id) && styles.dayButtonActive
                          ]}
                          onPress={() => toggleDay(day.id)}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              editedMedicine.days.includes(day.id) && styles.dayTextActive
                            ]}
                          >
                            {day.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity 
                      style={[styles.button, styles.cancelButton]} 
                      onPress={onClose}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.updateButton]} 
                      onPress={handleUpdateMedicine}
                    >
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
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
  timePickerContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timePickerScroll: {
    height: 150,
    width: '100%',
  },
  timePickerItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerItemSelected: {
    backgroundColor: '#e8faf4',
    borderRadius: 8,
  },
  timePickerItemText: {
    fontSize: 18,
    color: '#666',
  },
  timePickerItemTextSelected: {
    color: '#333',
    fontWeight: 'bold',
  },
  amPmContainer: {
    marginTop: 20,
  },
  amPmButton: {
    padding: 10,
    width: 60,
    alignItems: 'center',
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  amPmButtonSelected: {
    backgroundColor: '#51ffc6',
  },
  amPmButtonText: {
    fontSize: 16,
    color: '#666',
  },
  amPmButtonTextSelected: {
    color: '#333',
    fontWeight: 'bold',
  },
  timePickerConfirmButton: {
    backgroundColor: '#51ffc6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  },
  updateButton: {
    backgroundColor: '#51ffc6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default EditMedicineSchedule;