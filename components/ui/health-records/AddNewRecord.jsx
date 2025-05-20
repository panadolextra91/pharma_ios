import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const AddNewRecord = ({ visible, onClose, onAdd }) => {
  const [newRecord, setNewRecord] = useState({
    type: '',
    doctor: '',
    title: '',
    date: '',
    description: '',
    image: null
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setNewRecord(prev => ({
        ...prev,
        image: result.assets[0].uri
      }));
    }
  };
  
  const handleAddRecord = () => {
    if (newRecord.type && newRecord.doctor && newRecord.title && newRecord.date && newRecord.description) {
      // For prescription type, image is optional but encouraged
      onAdd({
        id: Date.now().toString(),
        ...newRecord
      });
      setNewRecord({
        type: '',
        doctor: '',
        title: '',
        date: '',
        description: '',
        image: null
      });
      onClose();
    }
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
                style={styles.scrollView}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add New Clinical Record</Text>
                  
                  <View style={styles.typeSelector}>
                    <TouchableOpacity 
                      style={[styles.typeButton, newRecord.type === 'lab' && styles.selectedType]} 
                      onPress={() => setNewRecord(prev => ({...prev, type: 'lab'}))}
                    >
                      <MaterialIcons name="science" size={24} color={newRecord.type === 'lab' ? '#51ffb4' : '#888'} />
                      <Text style={[styles.typeText, newRecord.type === 'lab' && styles.selectedTypeText]}>Lab</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.typeButton, newRecord.type === 'prescription' && styles.selectedType]} 
                      onPress={() => setNewRecord(prev => ({...prev, type: 'prescription'}))}
                    >
                      <MaterialIcons name="medication" size={24} color={newRecord.type === 'prescription' ? '#51ffb4' : '#888'} />
                      <Text style={[styles.typeText, newRecord.type === 'prescription' && styles.selectedTypeText]}>Prescription</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.typeButton, newRecord.type === 'note' && styles.selectedType]} 
                      onPress={() => setNewRecord(prev => ({...prev, type: 'note'}))}
                    >
                      <MaterialIcons name="note" size={24} color={newRecord.type === 'note' ? '#51ffb4' : '#888'} />
                      <Text style={[styles.typeText, newRecord.type === 'note' && styles.selectedTypeText]}>Note</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.modalInput}
                    value={newRecord.doctor}
                    onChangeText={(text) => setNewRecord(prev => ({...prev, doctor: text}))}
                    placeholder="Doctor's Name"
                    placeholderTextColor="#999"
                  />

                  <TextInput
                    style={styles.modalInput}
                    value={newRecord.title}
                    onChangeText={(text) => setNewRecord(prev => ({...prev, title: text}))}
                    placeholder="Title"
                    placeholderTextColor="#999"
                  />

                  <TextInput
                    style={styles.modalInput}
                    value={newRecord.date}
                    onChangeText={(text) => setNewRecord(prev => ({...prev, date: text}))}
                    placeholder="Date (YYYY-MM-DD)"
                    placeholderTextColor="#999"
                  />

                  <TextInput
                    style={[styles.modalInput, styles.descriptionInput]}
                    value={newRecord.description}
                    onChangeText={(text) => setNewRecord(prev => ({...prev, description: text}))}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={4}
                  />
                  
                  {newRecord.type === 'prescription' && (
                    <View style={styles.imageUploadContainer}>
                      <Text style={styles.imageUploadLabel}>Upload Prescription Image (Optional)</Text>
                      
                      <TouchableOpacity 
                        style={styles.imageUploadButton} 
                        onPress={pickImage}
                      >
                        <MaterialIcons name="photo-camera" size={24} color="#666" />
                        <Text style={styles.imageUploadButtonText}>
                          {newRecord.image ? 'Change Image' : 'Select Image'}
                        </Text>
                      </TouchableOpacity>
                      
                      {newRecord.image && (
                        <View style={styles.imagePreviewContainer}>
                          <Image 
                            source={{ uri: newRecord.image }} 
                            style={styles.imagePreview} 
                            resizeMode="cover"
                          />
                          <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={() => setNewRecord(prev => ({ ...prev, image: null }))}
                          >
                            <MaterialIcons name="close" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]} 
                      onPress={onClose}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalAddButton]} 
                      onPress={handleAddRecord}
                    >
                      <Text style={[styles.modalButtonText, styles.addButtonText]}>Add</Text>
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
    width: '85%',
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedType: {
    backgroundColor: '#e8faf4',
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  typeText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  selectedTypeText: {
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
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
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
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
  modalAddButton: {
    backgroundColor: '#51ffc6',
  },
  modalButtonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
  },
  addButtonText: {
    color: '#000',
    marginBottom: 5,
  },
  imageUploadContainer: {
    marginBottom: 20,
  },
  imageUploadLabel: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imageUploadButtonText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginTop: 10,
    position: 'relative',
    alignSelf: 'center',
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ff6b6b',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddNewRecord;
