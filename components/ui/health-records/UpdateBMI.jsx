import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const UpdateBMI = ({ visible, onClose, onUpdate }) => {
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);

  useEffect(() => {
    // Reset form when modal is closed
    if (!visible) {
      setDob('');
    }
  }, [visible]);

  const handleUpdate = () => {
    if (!dob || !gender || !weight || !height) return;
    onUpdate && onUpdate({ dob, gender, weight, height });
    onClose();
  };

  const validateDateFormat = (text) => {
    // Basic validation for YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(text)) return false;
    
    const [year, month, day] = text.split('-').map(Number);
    
    // Check if date is valid
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return false;
    }
    
    // Check if date is not in the future
    if (date > new Date()) return false;
    
    return true;
  };
  
  const handleDobChange = (text) => {
    // Allow typing the date format
    setDob(text);
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
              <Text style={styles.modalTitle}>Calculate BMI</Text>
              <Text style={styles.modalSubtitle}>Body mass index (BMI) is a measure of body fat based on height and weight that applies to adult men and women.</Text>
              <TextInput
                  style={[styles.modalInput, !validateDateFormat(dob) && dob.length > 0 && styles.inputError]}
                  value={dob}
                  onChangeText={handleDobChange}
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  placeholderTextColor="#999"
                  keyboardType="numbers-and-punctuation"
                />
                {!validateDateFormat(dob) && dob.length > 0 && (
                  <Text style={styles.errorText}>Please enter a valid date in YYYY-MM-DD format</Text>
                )}
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowGenderModal(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownText, !gender && styles.dropdownPlaceholder]}>
                  {gender ? GENDER_OPTIONS.find(opt => opt.value === gender)?.label : 'Select Gender'}
                </Text>
              </TouchableOpacity>
              <Modal
                visible={showGenderModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowGenderModal(false)}
              >
                <TouchableWithoutFeedback onPress={() => setShowGenderModal(false)}>
                  <View style={styles.genderModalOverlay}>
                    <View style={styles.genderModalContent}>
                      {GENDER_OPTIONS.map(opt => (
                        <TouchableOpacity
                          key={opt.value}
                          style={styles.genderOption}
                          onPress={() => {
                            setGender(opt.value);
                            setShowGenderModal(false);
                          }}
                        >
                          <Text style={styles.genderOptionText}>{opt.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
              <TextInput
                style={styles.modalInput}
                value={weight}
                onChangeText={setWeight}
                placeholder="Weight (kg)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.modalInput}
                value={height}
                onChangeText={setHeight}
                placeholder="Height (m)"
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
                  disabled={!(dob && gender && weight && height)}
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
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  genderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 10,
    width: 250,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  genderOptionText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#333',
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    marginTop: 5,
  },
});

export default UpdateBMI;
