import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ImageViewer = ({ visible, fileUrl, fileName, onClose }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowercaseUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowercaseUrl.includes(ext));
  };

  const getFileIcon = (url) => {
    if (!url) return 'insert-drive-file';
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('.pdf')) return 'picture-as-pdf';
    if (lowerUrl.includes('.doc') || lowerUrl.includes('.docx')) return 'description';
    if (lowerUrl.includes('.txt')) return 'text-snippet';
    if (lowerUrl.includes('.xls') || lowerUrl.includes('.xlsx')) return 'table-chart';
    return 'insert-drive-file';
  };

  const handleOpenExternal = async () => {
    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const resetStates = () => {
    setImageLoading(true);
    setImageError(false);
  };

  const handleModalShow = () => {
    resetStates();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      onShow={handleModalShow}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle} numberOfLines={1}>
            {fileName || 'File Preview'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {isImageFile(fileUrl) ? (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#51ffc6" />
                  <Text style={styles.loadingText}>Loading image...</Text>
                </View>
              )}
              
              {imageError ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="broken-image" size={64} color="#ccc" />
                  <Text style={styles.errorText}>Failed to load image</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={resetStates}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Image
                  source={{ uri: fileUrl }}
                  style={styles.image}
                  resizeMode="contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </View>
          ) : (
            <View style={styles.fileContainer}>
              <MaterialIcons 
                name={getFileIcon(fileUrl)} 
                size={80} 
                color="#51ffc6" 
              />
              <Text style={styles.fileText}>
                This file type cannot be previewed in the app
              </Text>
              <TouchableOpacity 
                style={styles.openExternalButton} 
                onPress={handleOpenExternal}
              >
                <MaterialIcons name="open-in-new" size={20} color="white" />
                <Text style={styles.openExternalText}>Open Externally</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.externalButton} 
            onPress={handleOpenExternal}
          >
            <MaterialIcons name="open-in-browser" size={20} color="#51ffc6" />
            <Text style={styles.externalButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'DarkerGrotesque-Bold',
    flex: 1,
    marginRight: 15,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width - 40,
    height: height * 0.7,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    marginTop: 10,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
  },
  fileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  fileText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  openExternalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#51ffc6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  openExternalText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 8,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    alignItems: 'center',
  },
  externalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#51ffc6',
  },
  externalButtonText: {
    color: '#51ffc6',
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    marginLeft: 8,
  },
});

export default ImageViewer; 