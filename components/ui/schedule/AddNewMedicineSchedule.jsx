import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddNewMedicineSchedule = ({ visible, onClose, onAdd }) => {
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    time: new Date(),
    days: [],
    dosage: '',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());
  const [selectedAmPm, setSelectedAmPm] = useState(new Date().getHours() >= 12 ? 'PM' : 'AM');

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
    
    setNewMedicine({ ...newMedicine, time: newTime });
    setShowTimePicker(false);
  };

  const toggleDay = (dayId) => {
    const newDays = newMedicine.days.includes(dayId)
      ? newMedicine.days.filter(id => id !== dayId)
      : [...newMedicine.days, dayId];
    setNewMedicine({ ...newMedicine, days: newDays });
  };

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage || newMedicine.days.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and select at least one day');
      return;
    }
    onAdd(newMedicine);
    resetForm();
  };

  const resetForm = () => {
    setNewMedicine({
      name: '',
      time: new Date(),
      days: [],
      dosage: '',
    });
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
                  <Text style={styles.modalTitle}>Add New Medicine</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Medicine Name</Text>
                    <TextInput
                      style={styles.input}
                      value={newMedicine.name}
                      onChangeText={(text) => setNewMedicine({...newMedicine, name: text})}
                      placeholder="Enter medicine name"
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dosage</Text>
                    <TextInput
                      style={styles.input}
                      value={newMedicine.dosage}
                      onChangeText={(text) => setNewMedicine({...newMedicine, dosage: text})}
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
                      <Text>{formatTime(newMedicine.time)}</Text>
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
                            newMedicine.days.includes(day.id) && styles.dayButtonActive
                          ]}
                          onPress={() => toggleDay(day.id)}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              newMedicine.days.includes(day.id) && styles.dayTextActive
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
                      onPress={resetForm}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.addButton]} 
                      onPress={handleAddMedicine}
                    >
                      <Text style={styles.buttonText}>Add Medicine</Text>
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
    //maxHeight: '80%',
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
  addButton: {
    backgroundColor: '#51ffc6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default AddNewMedicineSchedule;