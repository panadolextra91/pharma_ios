import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';

const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const UpdateBloodType = ({ visible, onClose, onUpdate, currentData }) => {
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    // Reset form when modal is closed or populate with current data when opened
    if (!visible) {
      setSelectedType('');
    } else if (currentData && currentData.blood_type) {
      // Pre-populate with current blood type if available
      setSelectedType(currentData.blood_type);
    }
  }, [visible, currentData]);

  const handleUpdate = () => {
    if (!selectedType) return;
    onUpdate && onUpdate(selectedType);
    onClose();
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
              <Text style={styles.modalTitle}>Update Blood Type</Text>
              <Text style={styles.modalSubtitle}>Select your blood type to keep your medical information up to date.</Text>
              
              {currentData && currentData.blood_type && currentData.blood_type !== 'Unknown' && (
                <View style={styles.currentDataContainer}>
                  <Text style={styles.currentDataTitle}>Current Blood Type:</Text>
                  <Text style={styles.currentDataText}>{currentData.blood_type}</Text>
                  <Text style={styles.currentDataText}>Last Updated: {currentData.updated_at ? new Date(currentData.updated_at).toLocaleDateString() : 'Never'}</Text>
                </View>
              )}
              
              <View style={styles.bloodTypeGrid}>
                {BLOOD_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.bloodTypeButton, selectedType === type && styles.selectedBloodType]}
                    onPress={() => setSelectedType(type)}
                  >
                    <Text style={[styles.bloodTypeText, selectedType === type && styles.selectedBloodTypeText]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
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
                  disabled={!selectedType}
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
  currentDataContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  currentDataTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  currentDataText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bloodTypeButton: {
    width: '23%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedBloodType: {
    backgroundColor: '#51ffc6',
  },
  bloodTypeText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#666',
  },
  selectedBloodTypeText: {
    color: '#000',
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
});

export default UpdateBloodType;