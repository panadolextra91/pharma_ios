import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../../../config';
import { useAuth } from '../../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const RecordDetailModal = ({ visible, recordId, onClose, onRecordUpdated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordData, setRecordData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    provider_name: '',
    description: '',
    date_recorded: '',
  });

  useEffect(() => {
    if (visible && recordId) {
      fetchRecordDetails();
      setIsEditing(false);
      // Reset image states when modal opens with new record
      setImageLoading(true);
      setImageError(false);
      setCurrentImageUrl(null);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else if (!visible && (fadeAnim._value === 1 || slideAnim._value !== height)) {
      // Reverse animations when closing
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, recordId, fadeAnim, slideAnim]);

  useEffect(() => {
    if (recordData && isEditing) {
      setEditForm({
        title: recordData.title || '',
        provider_name: recordData.provider_name || '',
        description: recordData.description || '',
        date_recorded: recordData.date_recorded ? recordData.date_recorded.split('T')[0] : '',
      });
    }
  }, [recordData, isEditing]);

  // Reset image loading state only when image URL actually changes
  useEffect(() => {
    if (recordData) {
      const imageUrl = recordData.fileUrl || recordData.file_url;
      if (imageUrl && imageUrl !== currentImageUrl) {
        setCurrentImageUrl(imageUrl);
        setImageLoading(true);
        setImageError(false);
      } else if (imageUrl === currentImageUrl && currentImageUrl) {
        // Same image URL, no need to show loading
        setImageLoading(false);
        setImageError(false);
      }
    }
  }, [recordData]);

  const fetchRecordDetails = async () => {
    if (!user?.token || !recordId) return;

    try {
      setLoading(true);
      console.log('📋 Fetching record details for ID:', recordId);
      
      const response = await fetch(`${API_URL}/health-records/${recordId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Record details fetched successfully:', data);
        setRecordData(data);
      } else {
        console.error('❌ Failed to fetch record details:', data.error);
        Alert.alert('Error', data.error || 'Failed to load record details');
      }
    } catch (error) {
      console.error('❌ Error fetching record details:', error);
      Alert.alert('Error', 'Failed to load record details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async () => {
    if (!user?.token || !recordId) return;

    try {
      setSaving(true);
      console.log('📝 Updating record:', recordId, editForm);

      const response = await fetch(`${API_URL}/health-records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Record updated successfully:', data);
        setRecordData(data);
        setIsEditing(false);
        Alert.alert('Success', 'Record updated successfully');
        // Notify parent component about the update
        onRecordUpdated && onRecordUpdated();
      } else {
        console.error('❌ Failed to update record:', data.error);
        Alert.alert('Error', data.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('❌ Error updating record:', error);
      Alert.alert('Error', 'Failed to update record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!editForm.title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }
    updateRecord();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: recordData?.title || '',
      provider_name: recordData?.provider_name || '',
      description: recordData?.description || '',
      date_recorded: recordData?.date_recorded ? recordData.date_recorded.split('T')[0] : '',
    });
  };

  const getIconName = (type) => {
    switch(type) {
      case 'LAB_RESULT': return 'science';
      case 'PRESCRIPTION': return 'medication';
      case 'DOCTOR_NOTE': return 'description';
      default: return 'folder';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'LAB_RESULT': return 'Lab Results';
      case 'PRESCRIPTION': return 'Prescription';
      case 'DOCTOR_NOTE': return 'Doctor\'s Note';
      default: return 'Record';
    }
  };

  const getRecordIconStyle = (type) => {
    switch(type) {
      case 'LAB_RESULT':
        return {
          iconColor: '#3498db',
          backgroundColor: '#ebf3fd',
          typeColor: '#2980b9'
        };
      case 'PRESCRIPTION':
        return {
          iconColor: '#27ae60',
          backgroundColor: '#eafaf1',
          typeColor: '#229954'
        };
      case 'DOCTOR_NOTE':
        return {
          iconColor: '#f39c12',
          backgroundColor: '#fef9e7',
          typeColor: '#e67e22'
        };
      default:
        return {
          iconColor: '#95a5a6',
          backgroundColor: '#f8f9fa',
          typeColor: '#7f8c8d'
        };
    }
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowercaseUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowercaseUrl.includes(ext));
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const resetImageStates = () => {
    setImageLoading(true);
    setImageError(false);
  };

  const handleClose = () => {
    setRecordData(null);
    setImageLoading(true);
    setImageError(false);
    setIsEditing(false);
    setCurrentImageUrl(null);
    onClose();
  };

  if (!recordData && !loading) {
    return null;
  }

  const iconStyle = recordData ? getRecordIconStyle(recordData.record_type) : {};

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}> 
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView 
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Record' : 'Record Details'}
                </Text>
                <View style={styles.headerActions}>
                  {!isEditing && (
                    <TouchableOpacity 
                      style={styles.editButton} 
                      onPress={() => setIsEditing(true)}
                    >
                      <MaterialIcons name="edit" size={20} color="#51ffc6" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <MaterialIcons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#51ffc6" />
                  <Text style={styles.loadingText}>Loading record details...</Text>
                </View>
              ) : recordData ? (
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.recordHeader}>
                    <View style={[styles.recordIcon, { backgroundColor: iconStyle.backgroundColor }]}>
                      <MaterialIcons 
                        name={getIconName(recordData.record_type)} 
                        size={32} 
                        color={iconStyle.iconColor}
                      />
                    </View>
                    <View style={styles.recordHeaderInfo}>
                      {isEditing ? (
                        <TextInput
                          style={styles.editTitleInput}
                          value={editForm.title}
                          onChangeText={(text) => setEditForm(prev => ({ ...prev, title: text }))}
                          placeholder="Record title"
                          placeholderTextColor="#999"
                        />
                      ) : (
                        <Text style={styles.recordTitle}>{recordData.title}</Text>
                      )}
                      <View style={[styles.recordType, { backgroundColor: iconStyle.backgroundColor }]}>
                        <Text style={[styles.recordTypeText, { color: iconStyle.typeColor }]}>
                          {getTypeLabel(recordData.record_type)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date Recorded:</Text>
                      {isEditing ? (
                        <TextInput
                          style={styles.editInput}
                          value={editForm.date_recorded}
                          onChangeText={(text) => setEditForm(prev => ({ ...prev, date_recorded: text }))}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="#999"
                        />
                      ) : (
                        <Text style={styles.detailValue}>
                          {new Date(recordData.date_recorded).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Provider:</Text>
                      {isEditing ? (
                        <TextInput
                          style={styles.editInput}
                          value={editForm.provider_name}
                          onChangeText={(text) => setEditForm(prev => ({ ...prev, provider_name: text }))}
                          placeholder="Provider name"
                          placeholderTextColor="#999"
                        />
                      ) : (
                        <Text style={styles.detailValue}>
                          {recordData.provider_name || 'Unknown Provider'}
                        </Text>
                      )}
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      {isEditing ? (
                        <TextInput
                          style={[styles.editInput, styles.editTextArea]}
                          value={editForm.description}
                          onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                          placeholder="Description or notes"
                          placeholderTextColor="#999"
                          multiline={true}
                          numberOfLines={4}
                        />
                      ) : (
                        <Text style={styles.detailValue}>
                          {recordData.description || 'No description available'}
                        </Text>
                      )}
                    </View>

                    {!isEditing && (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Created:</Text>
                          <Text style={styles.detailValue}>
                            {new Date(recordData.createdAt || recordData.created_at).toLocaleDateString()}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Last Updated:</Text>
                          <Text style={styles.detailValue}>
                            {new Date(recordData.updatedAt || recordData.updated_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  {(recordData.fileUrl || recordData.file_url) && (
                    <View style={styles.fileContainer}>
                      <Text style={styles.fileLabel}>Attached File:</Text>
                      
                      {isImageFile(recordData.fileUrl || recordData.file_url) ? (
                        <View style={styles.imageContainer}>
                          {imageLoading && (
                            <View style={styles.imageLoadingContainer}>
                              <ActivityIndicator size="large" color="#51ffc6" />
                              <Text style={styles.imageLoadingText}>Loading image...</Text>
                            </View>
                          )}
                          
                          {imageError ? (
                            <View style={styles.imageErrorContainer}>
                              <MaterialIcons name="broken-image" size={64} color="#ccc" />
                              <Text style={styles.imageErrorText}>Failed to load image</Text>
                              <TouchableOpacity style={styles.retryButton} onPress={resetImageStates}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <Image
                              source={{ uri: recordData.fileUrl || recordData.file_url }}
                              style={styles.recordImage}
                              resizeMode="contain"
                              onLoad={handleImageLoad}
                              onError={handleImageError}
                            />
                          )}
                        </View>
                      ) : (
                        <View style={styles.nonImageFileContainer}>
                          <MaterialIcons name="attach-file" size={48} color="#666" />
                          <Text style={styles.nonImageFileText}>
                            File attached (cannot preview)
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {isEditing && (
                    <View style={styles.editActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]} 
                        onPress={handleCancelEdit}
                        disabled={saving}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.saveButton, saving && styles.disabledButton]} 
                        onPress={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <ActivityIndicator size={20} color="white" />
                        ) : (
                          <Text style={styles.saveButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              ) : null}
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordHeaderInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 20,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
    marginBottom: 8,
  },
  recordType: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  recordTypeText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
  },
  detailsContainer: {
    paddingVertical: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  fileContainer: {
    marginTop: 1,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 20,
  },
  fileLabel: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  imageLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    marginTop: 8,
  },
  imageErrorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  recordImage: {
    width: '100%',
    height: 250,
  },
  nonImageFileContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  nonImageFileText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    marginTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  editTitleInput: {
    fontSize: 20,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
    marginBottom: 8,
  },
  editInput: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    color: '#333',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  editTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#51ffc6',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#51ffc6',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
});

export default RecordDetailModal; 