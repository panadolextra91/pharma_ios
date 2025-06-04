import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

// Helper function for type-specific styles similar to RecordCard
const getTypeSpecificStyles = (type, selectedType) => {
  const isActive = type === selectedType;
  switch(type) {
    case 'lab': 
      return {
        iconColor: isActive ? '#3498db' : '#95a5a6',
        bgColor: isActive ? '#ebf3fd' : 'white',
        textColor: isActive ? '#2980b9' : '#666',
        borderColor: isActive ? '#3498db' : '#ddd',
      };
    case 'prescription': 
      return {
        iconColor: isActive ? '#27ae60' : '#95a5a6',
        bgColor: isActive ? '#eafaf1' : 'white',
        textColor: isActive ? '#229954' : '#666',
        borderColor: isActive ? '#27ae60' : '#ddd',
      };
    case 'note': 
      return {
        iconColor: isActive ? '#f39c12' : '#95a5a6',
        bgColor: isActive ? '#fef9e7' : 'white',
        textColor: isActive ? '#e67e22' : '#666',
        borderColor: isActive ? '#f39c12' : '#ddd',
      };
    default: 
      return {
        iconColor: '#95a5a6',
        bgColor: 'white',
        textColor: '#666',
        borderColor: '#ddd',
      };
  }
};

const AddNewRecord = ({ visible, onClose, onAdd, uploading }) => {
  const [newRecord, setNewRecord] = useState({
    type: '',
    doctor: '',
    title: '',
    date: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [pickingFile, setPickingFile] = useState(false);

  const pickFile = async () => {
    try {
      setPickingFile(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('📎 File selected:', file);
        
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      alert('Error selecting file. Please try again.');
    } finally {
      setPickingFile(false);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'picture-as-pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.startsWith('text/')) return 'text-snippet';
    return 'attach-file';
  };
  
  const handleAddRecord = async () => {
    if (!newRecord.type || !newRecord.title) {
      alert('Please fill in at least the record type and title.');
      return;
    }

    // Call the parent function with record data and file
    await onAdd(newRecord, selectedFile);
    
    // Reset form
    setNewRecord({
      type: '',
      doctor: '',
      title: '',
      date: '',
      description: ''
    });
    setSelectedFile(null);
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
                  <Text style={styles.modalTitle}>Add New Health Record</Text>
                  
                  <View style={styles.typeSelector}>
                    {['lab', 'prescription', 'note'].map(type => {
                      const typeStyle = getTypeSpecificStyles(type, newRecord.type);
                      let iconName = 'folder';
                      if (type === 'lab') iconName = 'science';
                      if (type === 'prescription') iconName = 'medication';
                      if (type === 'note') iconName = 'description';

                      return (
                        <TouchableOpacity 
                          key={type}
                          style={[
                            styles.typeButton,
                            { 
                              backgroundColor: typeStyle.bgColor,
                              borderColor: typeStyle.borderColor,
                            },
                            newRecord.type === type && styles.selectedType // Keep specific selectedType shadow/elevation if needed
                          ]} 
                          onPress={() => setNewRecord(prev => ({...prev, type: type}))}
                        >
                          <MaterialIcons name={iconName} size={24} color={typeStyle.iconColor} />
                          <Text style={[
                            styles.typeText, 
                            { color: typeStyle.textColor }, 
                            newRecord.type === type && styles.selectedTypeText
                          ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TextInput
                    style={styles.modalInput}
                    value={newRecord.title}
                    onChangeText={(text) => setNewRecord(prev => ({...prev, title: text}))}
                    placeholder="Title (required)"
                    placeholderTextColor="#999"
                  />

                  <TextInput
                    style={styles.modalInput}
                    value={newRecord.doctor}
                    onChangeText={(text) => setNewRecord(prev => ({...prev, doctor: text}))}
                    placeholder="Doctor/Provider Name"
                    placeholderTextColor="#999"
                  />

                  <TextInput
                    style={styles.modalInput}
                    value={newRecord.date}
                    onChangeText={(text) => setNewRecord(prev => ({...prev, date: text}))}
                    placeholder="Date (YYYY-MM-DD, optional)"
                    placeholderTextColor="#999"
                  />

                  <TextInput
                    style={[styles.modalInput, styles.descriptionInput]}
                    value={newRecord.description}
                    onChangeText={(text) => setNewRecord(prev => ({...prev, description: text}))}
                    placeholder="Description or notes"
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={4}
                  />
                  
                  <View style={styles.fileUploadContainer}>
                    <Text style={styles.fileUploadLabel}>Attach File (Optional)</Text>
                    <Text style={styles.fileUploadSubtext}>Images, PDFs, documents supported</Text>
                    
                    <TouchableOpacity 
                      style={styles.fileUploadButton} 
                      onPress={pickFile}
                      disabled={pickingFile}
                    >
                      {pickingFile ? (
                        <ActivityIndicator size={24} color="#666" />
                      ) : (
                        <MaterialIcons name="attach-file" size={24} color="#666" />
                      )}
                      <Text style={styles.fileUploadButtonText}>
                        {pickingFile ? 'Selecting...' : selectedFile ? 'Change File' : 'Select File'}
                      </Text>
                    </TouchableOpacity>
                    
                    {selectedFile && (
                      <View style={styles.filePreviewContainer}>
                        <View style={styles.filePreview}>
                          <MaterialIcons 
                            name={getFileIcon(selectedFile.mimeType)} 
                            size={32} 
                            color={newRecord.type ? getTypeSpecificStyles(newRecord.type, newRecord.type).iconColor : '#51ffc6'} 
                          />
                          <View style={styles.fileInfo}>
                            <Text style={styles.fileName} numberOfLines={1}>
                              {selectedFile.name}
                            </Text>
                            <Text style={styles.fileSize}>
                              {formatFileSize(selectedFile.size)}
                            </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.removeFileButton}
                            onPress={() => setSelectedFile(null)}
                          >
                            <MaterialIcons name="close" size={20} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]} 
                      onPress={onClose}
                      disabled={uploading}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalAddButton, uploading && styles.disabledButton]} 
                      onPress={handleAddRecord}
                      disabled={uploading || !newRecord.type || !newRecord.title}
                    >
                      {uploading ? (
                        <ActivityIndicator size={20} color="white" />
                      ) : (
                        <Text style={[styles.modalButtonText, styles.addButtonText]}>Add Record</Text>
                      )}
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
    maxHeight: '90%', // Add maxHeight to prevent overflow on smaller screens
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 15, // Match RecordCard borderRadius
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1, // Slight elevation for inactive
  },
  selectedType: {
    // Use typeSpecificStyles for background and border
    elevation: 3, // Higher elevation for active
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  typeText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  selectedTypeText: {
    // color will be set by typeSpecificStyles
    fontFamily: 'DarkerGrotesque-Bold',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15, // Match RecordCard
    padding: 15, // Slightly more padding
    marginBottom: 15, // Consistent margin
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15, // Match padding
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10, // Add some margin before buttons
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15, // More padding
    borderRadius: 15, // Match RecordCard
    marginHorizontal: 5,
    alignItems: 'center', // Center content
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5', // Light gray, good contrast
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalAddButton: {
    backgroundColor: '#51ffc6', // Main theme green from RecordCard active tab
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16, // Slightly smaller for better fit
    textAlign: 'center',
    color: '#666', // Default for cancel
  },
  addButtonText: {
    color: '#333', // Darker text for green button, like active tab
  },
  fileUploadContainer: {
    marginBottom: 20,
  },
  fileUploadLabel: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  fileUploadSubtext: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa', // Light background consistent with RecordCard default
    padding: 15,
    borderRadius: 15, // Match
    borderWidth: 1,
    borderColor: '#e0e0e0', // Softer border
    // borderStyle: 'dashed', // Dashed can look a bit busy, solid is cleaner
  },
  fileUploadButtonText: {
    fontFamily: 'DarkerGrotesque-Bold', // Bolder text
    fontSize: 16,
    color: '#555', // Darker gray
    marginLeft: 8,
  },
  filePreviewContainer: {
    marginTop: 15,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Consistent light background
    padding: 12,
    borderRadius: 15, // Match
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 14,
    color: '#333',
  },
  fileSize: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 5, // Slightly more touch area
    borderRadius: 15, // Match
    backgroundColor: '#e0e0e0', // Softer background for remove icon
  },
});

export default AddNewRecord;
