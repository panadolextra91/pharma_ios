import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logMedicationActionFromNotification } from '../../../services/NotificationService';

const MedicationActionModal = ({ visible, onClose, scheduleData, userToken, onActionComplete }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType) => {
    if (!userToken || !scheduleData) {
      Alert.alert('Error', 'Missing required data');
      return;
    }

    setLoading(true);
    try {
      await logMedicationActionFromNotification(
        userToken,
        scheduleData.scheduleId,
        actionType,
        scheduleData.notificationId
      );

      Alert.alert(
        'Success',
        `Medication marked as ${actionType}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setNotes('');
              onClose();
              if (onActionComplete) {
                onActionComplete(actionType);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error logging medication action:', error);
      Alert.alert('Error', 'Failed to log medication action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'taken':
        return 'checkmark-circle';
      case 'skipped':
        return 'close-circle';
      case 'snoozed':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'taken':
        return '#51ffc6';
      case 'skipped':
        return '#ff6b6b';
      case 'snoozed':
        return '#ffa726';
      default:
        return '#666';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Ionicons name="medical" size={32} color="#51ffc6" />
              <Text style={styles.title}>Medicine Reminder</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {scheduleData && (
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{scheduleData.medicineName || 'Medicine'}</Text>
                <Text style={styles.dosage}>{scheduleData.dosage || 'Take as prescribed'}</Text>
                <Text style={styles.time}>
                  Scheduled for: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}

            <Text style={styles.question}>What would you like to do?</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: getActionColor('taken') }]}
                onPress={() => handleAction('taken')}
                disabled={loading}
              >
                <Ionicons name={getActionIcon('taken')} size={24} color="white" />
                <Text style={styles.actionButtonText}>Taken</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: getActionColor('skipped') }]}
                onPress={() => handleAction('skipped')}
                disabled={loading}
              >
                <Ionicons name={getActionIcon('skipped')} size={24} color="white" />
                <Text style={styles.actionButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: getActionColor('snoozed') }]}
                onPress={() => handleAction('snoozed')}
                disabled={loading}
              >
                <Ionicons name={getActionIcon('snoozed')} size={24} color="white" />
                <Text style={styles.actionButtonText}>Snooze</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about taking this medication..."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.laterButtonText}>I'll decide later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    maxWidth: 400,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24, // Compensate for close button
  },
  closeButton: {
    padding: 4,
  },
  medicineInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    color: '#999',
  },
  question: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 80,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 14,
    height: 80,
    textAlignVertical: 'top',
  },
  laterButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MedicationActionModal; 