import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditMedicineSchedule = ({ visible, onClose, onUpdate, medicine }) => {
  const [editedMedicine, setEditedMedicine] = useState({
    name: '',
    time: new Date(),
    days: [],
    dosage: '',
    notes: '',
    startDate: new Date(),
    endDate: null,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState('AM');
  
  // Date picker state
  const [selectedStartDay, setSelectedStartDay] = useState(1);
  const [selectedStartMonth, setSelectedStartMonth] = useState(0);
  const [selectedStartYear, setSelectedStartYear] = useState(new Date().getFullYear());
  const [selectedEndDay, setSelectedEndDay] = useState(1);
  const [selectedEndMonth, setSelectedEndMonth] = useState(0);
  const [selectedEndYear, setSelectedEndYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (medicine && visible) {
      const startDate = medicine.startDate ? new Date(medicine.startDate) : new Date();
      const endDate = medicine.endDate ? new Date(medicine.endDate) : null;
      
      setEditedMedicine({
        id: medicine.id,
        name: medicine.name,
        time: new Date(medicine.time),
        days: [...medicine.days],
        dosage: medicine.dosage,
        notes: medicine.notes || '',
        startDate: startDate,
        endDate: endDate,
      });
      
      // Set time picker values
      const hours = new Date(medicine.time).getHours();
      const minutes = new Date(medicine.time).getMinutes();
      
      setSelectedHour(hours % 12 === 0 ? 12 : hours % 12);
      setSelectedMinute(minutes);
      setSelectedAmPm(hours >= 12 ? 'PM' : 'AM');

      // Set start date picker values
      setSelectedStartDay(startDate.getDate());
      setSelectedStartMonth(startDate.getMonth());
      setSelectedStartYear(startDate.getFullYear());

      // Set end date picker values if end date exists
      if (endDate) {
        setSelectedEndDay(endDate.getDate());
        setSelectedEndMonth(endDate.getMonth());
        setSelectedEndYear(endDate.getFullYear());
      } else {
        const today = new Date();
        setSelectedEndDay(today.getDate());
        setSelectedEndMonth(today.getMonth());
        setSelectedEndYear(today.getFullYear());
      }
    }
  }, [medicine, visible]);

  // Update time picker values when time picker is opened
  useEffect(() => {
    if (showTimePicker && editedMedicine.time) {
      const hours = editedMedicine.time.getHours();
      const minutes = editedMedicine.time.getMinutes();
      
      if (hours === 0) {
        setSelectedHour(12);
        setSelectedAmPm('AM');
      } else if (hours < 12) {
        setSelectedHour(hours);
        setSelectedAmPm('AM');
      } else if (hours === 12) {
        setSelectedHour(12);
        setSelectedAmPm('PM');
      } else {
        setSelectedHour(hours - 12);
        setSelectedAmPm('PM');
      }
      
      setSelectedMinute(minutes);
    }
  }, [showTimePicker, editedMedicine.time]);

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

  const handleStartDateChange = () => {
    const selectedDate = new Date(selectedStartYear, selectedStartMonth, selectedStartDay);
    const updatedMedicine = { ...editedMedicine, startDate: selectedDate };
    
    // If end date is set and is before the new start date, clear it
    if (editedMedicine.endDate && selectedDate > editedMedicine.endDate) {
      updatedMedicine.endDate = null;
    }
    
    setEditedMedicine(updatedMedicine);
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = () => {
    const selectedDate = new Date(selectedEndYear, selectedEndMonth, selectedEndDay);
    setEditedMedicine({ ...editedMedicine, endDate: selectedDate });
    setShowEndDatePicker(false);
  };

  const toggleDay = (dayId) => {
    const newDays = editedMedicine.days.includes(dayId)
      ? editedMedicine.days.filter(id => id !== dayId)
      : [...editedMedicine.days, dayId];
    setEditedMedicine({ ...editedMedicine, days: newDays });
  };

  const handleUpdateMedicine = () => {
    if (!editedMedicine.name || !editedMedicine.dosage || editedMedicine.days.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields and select at least one day');
      return;
    }

    // Validate end date is after start date
    if (editedMedicine.endDate && editedMedicine.endDate <= editedMedicine.startDate) {
      Alert.alert('Error', 'End date must be after start date');
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

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = () => {
    if (!editedMedicine.endDate) return '';
    const diffTime = Math.abs(editedMedicine.endDate - editedMedicine.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const generateDays = (month, year) => {
    const daysInMonth = getDaysInMonth(month, year);
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Medicine</Text>
              </View>
              
              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Medicine Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMedicine.name}
                    onChangeText={(text) => setEditedMedicine({...editedMedicine, name: text})}
                    placeholder="Enter medicine name"
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dosage *</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMedicine.dosage}
                    onChangeText={(text) => setEditedMedicine({...editedMedicine, dosage: text})}
                    placeholder="e.g., 1 pill, 5ml, 2 tablets"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Start Date *</Text>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={styles.dateText}>{formatDate(editedMedicine.startDate)}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                  
                  {showStartDatePicker && (
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <Text style={styles.datePickerTitle}>Select Start Date</Text>
                        <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                          <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.datePickerContent}>
                        {/* Day picker */}
                        <View style={styles.datePickerColumn}>
                          <Text style={styles.datePickerLabel}>Day</Text>
                          <ScrollView style={styles.datePickerScroll}>
                            {generateDays(selectedStartMonth, selectedStartYear).map((day) => (
                              <TouchableOpacity
                                key={`start-day-${day}`}
                                style={[styles.datePickerItem, selectedStartDay === day && styles.datePickerItemSelected]}
                                onPress={() => setSelectedStartDay(day)}
                              >
                                <Text style={[styles.datePickerItemText, selectedStartDay === day && styles.datePickerItemTextSelected]}>
                                  {day}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                        
                        {/* Month picker */}
                        <View style={styles.datePickerColumn}>
                          <Text style={styles.datePickerLabel}>Month</Text>
                          <ScrollView style={styles.datePickerScroll}>
                            {months.map((month, index) => (
                              <TouchableOpacity
                                key={`start-month-${index}`}
                                style={[styles.datePickerItem, selectedStartMonth === index && styles.datePickerItemSelected]}
                                onPress={() => {
                                  setSelectedStartMonth(index);
                                  // Adjust day if it's invalid for the new month
                                  const daysInNewMonth = getDaysInMonth(index, selectedStartYear);
                                  if (selectedStartDay > daysInNewMonth) {
                                    setSelectedStartDay(daysInNewMonth);
                                  }
                                }}
                              >
                                <Text style={[styles.datePickerItemText, selectedStartMonth === index && styles.datePickerItemTextSelected]}>
                                  {month}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                        
                        {/* Year picker */}
                        <View style={styles.datePickerColumn}>
                          <Text style={styles.datePickerLabel}>Year</Text>
                          <ScrollView style={styles.datePickerScroll}>
                            {generateYears().map((year) => (
                              <TouchableOpacity
                                key={`start-year-${year}`}
                                style={[styles.datePickerItem, selectedStartYear === year && styles.datePickerItemSelected]}
                                onPress={() => {
                                  setSelectedStartYear(year);
                                  // Adjust day if it's invalid for the new year (leap year consideration)
                                  const daysInNewMonth = getDaysInMonth(selectedStartMonth, year);
                                  if (selectedStartDay > daysInNewMonth) {
                                    setSelectedStartDay(daysInNewMonth);
                                  }
                                }}
                              >
                                <Text style={[styles.datePickerItemText, selectedStartYear === year && styles.datePickerItemTextSelected]}>
                                  {year}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.datePickerConfirmButton}
                        onPress={handleStartDateChange}
                      >
                        <Text style={styles.datePickerConfirmButtonText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>End Date (Optional)</Text>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={[styles.dateText, !editedMedicine.endDate && styles.placeholderText]}>
                      {editedMedicine.endDate ? formatDate(editedMedicine.endDate) : 'No end date'}
                    </Text>
                    <View style={styles.dateInputActions}>
                      {editedMedicine.endDate && (
                        <TouchableOpacity 
                          onPress={() => setEditedMedicine({...editedMedicine, endDate: null})}
                          style={styles.clearButton}
                        >
                          <Ionicons name="close-circle" size={20} color="#ff6b6b" />
                        </TouchableOpacity>
                      )}
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                  
                  {calculateDuration() && (
                    <Text style={styles.durationText}>Duration: {calculateDuration()}</Text>
                  )}
                  
                  {showEndDatePicker && (
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <Text style={styles.datePickerTitle}>Select End Date</Text>
                        <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                          <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.datePickerContent}>
                        {/* Day picker */}
                        <View style={styles.datePickerColumn}>
                          <Text style={styles.datePickerLabel}>Day</Text>
                          <ScrollView style={styles.datePickerScroll}>
                            {generateDays(selectedEndMonth, selectedEndYear).map((day) => (
                              <TouchableOpacity
                                key={`end-day-${day}`}
                                style={[styles.datePickerItem, selectedEndDay === day && styles.datePickerItemSelected]}
                                onPress={() => setSelectedEndDay(day)}
                              >
                                <Text style={[styles.datePickerItemText, selectedEndDay === day && styles.datePickerItemTextSelected]}>
                                  {day}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                        
                        {/* Month picker */}
                        <View style={styles.datePickerColumn}>
                          <Text style={styles.datePickerLabel}>Month</Text>
                          <ScrollView style={styles.datePickerScroll}>
                            {months.map((month, index) => (
                              <TouchableOpacity
                                key={`end-month-${index}`}
                                style={[styles.datePickerItem, selectedEndMonth === index && styles.datePickerItemSelected]}
                                onPress={() => {
                                  setSelectedEndMonth(index);
                                  // Adjust day if it's invalid for the new month
                                  const daysInNewMonth = getDaysInMonth(index, selectedEndYear);
                                  if (selectedEndDay > daysInNewMonth) {
                                    setSelectedEndDay(daysInNewMonth);
                                  }
                                }}
                              >
                                <Text style={[styles.datePickerItemText, selectedEndMonth === index && styles.datePickerItemTextSelected]}>
                                  {month}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                        
                        {/* Year picker */}
                        <View style={styles.datePickerColumn}>
                          <Text style={styles.datePickerLabel}>Year</Text>
                          <ScrollView style={styles.datePickerScroll}>
                            {generateYears().map((year) => (
                              <TouchableOpacity
                                key={`end-year-${year}`}
                                style={[styles.datePickerItem, selectedEndYear === year && styles.datePickerItemSelected]}
                                onPress={() => {
                                  setSelectedEndYear(year);
                                  // Adjust day if it's invalid for the new year (leap year consideration)
                                  const daysInNewMonth = getDaysInMonth(selectedEndMonth, year);
                                  if (selectedEndDay > daysInNewMonth) {
                                    setSelectedEndDay(daysInNewMonth);
                                  }
                                }}
                              >
                                <Text style={[styles.datePickerItemText, selectedEndYear === year && styles.datePickerItemTextSelected]}>
                                  {year}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.datePickerConfirmButton}
                        onPress={handleEndDateChange}
                      >
                        <Text style={styles.datePickerConfirmButtonText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Time *</Text>
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
                  <Text style={styles.label}>Days *</Text>
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

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.notesInput]}
                    value={editedMedicine.notes}
                    onChangeText={(text) => setEditedMedicine({...editedMedicine, notes: text})}
                    placeholder="Additional instructions or notes"
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
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
                    <Text style={styles.buttonText}>Update Medicine</Text>
                  </TouchableOpacity>
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
    paddingVertical: 40,
  },
  modalContainer: {
    width: '90%',
    height: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 10,
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
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
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dateInputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 2,
  },
  durationText: {
    fontSize: 14,
    color: '#51ffc6',
    marginTop: 4,
    fontWeight: '600',
  },
  datePickerContainer: {
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
    maxHeight: 250,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  datePickerScroll: {
    height: 100,
    width: '100%',
  },
  datePickerItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 1,
  },
  datePickerItemSelected: {
    backgroundColor: '#e8faf4',
  },
  datePickerItemText: {
    fontSize: 14,
    color: '#666',
  },
  datePickerItemTextSelected: {
    color: '#333',
    fontWeight: 'bold',
  },
  datePickerConfirmButton: {
    backgroundColor: '#51ffc6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerConfirmButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
    maxHeight: 250,
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
    height: 100,
    width: '100%',
  },
  timePickerItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerItemSelected: {
    backgroundColor: '#e8faf4',
    borderRadius: 8,
  },
  timePickerItemText: {
    fontSize: 16,
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
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerConfirmButtonText: {
    fontSize: 14,
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
    marginBottom: 20,
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