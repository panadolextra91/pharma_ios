import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';

const UpdateBloodPressure = ({ visible, onClose, onUpdate, currentData }) => {
  const [date, setDate] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');

  useEffect(() => {
    // Reset form when modal is closed or populate with current data when opened
    if (!visible) {
      setDate('');
      setSystolic('');
      setDiastolic('');
      setPulse('');
    } else if (currentData) {
      // Pre-populate with current data if available
      setDate(currentData.updated_at ? new Date(currentData.updated_at).toISOString().split('T')[0] : '');
      setSystolic(currentData.blood_pressure_systolic?.toString() || '');
      setDiastolic(currentData.blood_pressure_diastolic?.toString() || '');
      setPulse(''); // Pulse is not stored in current data structure
    }
  }, [visible, currentData]);

  const handleUpdate = () => {
    if (!date || !systolic || !diastolic) return;
    onUpdate && onUpdate({ date, systolic, diastolic, pulse });
    onClose();
  };

  const validateDateFormat = (text) => {
    // Basic validation for YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(text)) return false;
    
    const [year, month, day] = text.split('-').map(Number);
    
    // Check if date is valid
    const dateObj = new Date(year, month - 1, day);
    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
      return false;
    }
    
    // Check if date is not in the future
    if (dateObj > new Date()) return false;
    
    return true;
  };
  
  const handleDateChange = (text) => {
    setDate(text);
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Blood Pressure</Text>
              <Text style={styles.modalSubtitle}>Record your blood pressure readings to track your cardiovascular health over time.</Text>
              
              {currentData && (currentData.blood_pressure_systolic || currentData.blood_pressure_diastolic) && (
                <View style={styles.currentDataContainer}>
                  <Text style={styles.currentDataTitle}>Current Blood Pressure:</Text>
                  <Text style={styles.currentDataText}>
                    {currentData.blood_pressure_systolic || 'N/A'}/{currentData.blood_pressure_diastolic || 'N/A'} mmHg
                  </Text>
                  <Text style={styles.currentDataText}>Last Updated: {currentData.updated_at ? new Date(currentData.updated_at).toLocaleDateString() : 'Never'}</Text>
                </View>
              )}
              
              <TextInput
                style={[styles.modalInput, !validateDateFormat(date) && date.length > 0 && styles.inputError]}
                value={date}
                onChangeText={handleDateChange}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor="#999"
                keyboardType="numbers-and-punctuation"
              />
              {!validateDateFormat(date) && date.length > 0 && (
                <Text style={styles.errorText}>Please enter a valid date in YYYY-MM-DD format</Text>
              )}
              
              <View style={styles.bpContainer}>
                <View style={styles.bpInputContainer}>
                  <TextInput
                    style={styles.bpInput}
                    value={systolic}
                    onChangeText={setSystolic}
                    placeholder="Systolic"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  <Text style={styles.bpUnit}>mmHg</Text>
                </View>
                <Text style={styles.bpSeparator}>/</Text>
                <View style={styles.bpInputContainer}>
                  <TextInput
                    style={styles.bpInput}
                    value={diastolic}
                    onChangeText={setDiastolic}
                    placeholder="Diastolic"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  <Text style={styles.bpUnit}>mmHg</Text>
                </View>
              </View>
              
              <TextInput
                style={styles.modalInput}
                value={pulse}
                onChangeText={setPulse}
                placeholder="Pulse (optional)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.updateButton]}
                  onPress={handleUpdate}
                  disabled={!(date && systolic && diastolic && validateDateFormat(date))}
                >
                  <Text style={[styles.modalButtonText, styles.updateButtonText]}>Update</Text>
                </TouchableOpacity>
              </View>
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
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
  },
  bpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bpInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
  },
  bpInput: {
    flex: 1,
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    padding: 0,
  },
  bpUnit: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#999',
  },
  bpSeparator: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 24,
    marginHorizontal: 10,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  updateButton: {
    backgroundColor: '#51ffc6',
  },
  modalButtonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 5,
  },
  updateButtonText: {
    color: '#000',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    marginTop: -15,
    marginBottom: 15,
  },
  currentDataContainer: {
    marginBottom: 20,
  },
  currentDataTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  currentDataText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
  },
});

export default UpdateBloodPressure;