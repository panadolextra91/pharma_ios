import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;

const CartItemCard = ({ 
  item, 
  onQuantityChange, 
  onSelectionChange, 
  onRemove 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await onQuantityChange(item.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${item.medicine.name} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            // Reset position first
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            onRemove(item.id);
          }
        }
      ]
    );
  };

  // Get the best available image URL
  const getImageUrl = () => {
    const medicine = item.medicine;
    return medicine.imageUrl || 
           medicine.image_url || 
           medicine.image || 
           'https://via.placeholder.com/80x80?text=Medicine';
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      if (translationX < SWIPE_THRESHOLD) {
        // Swipe far enough, show delete button
        Animated.spring(translateX, {
          toValue: SWIPE_THRESHOLD,
          useNativeDriver: true,
        }).start();
      } else {
        // Snap back to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.cardWrapper}>
      {/* Delete Button (behind the card) */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleRemove}>
          <MaterialCommunityIcons name="delete" size={24} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card with Swipe Gesture */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ translateX }]
            }
          ]}
        >
          {/* Checkbox in top right corner */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={item.is_selected}
              onValueChange={(value) => onSelectionChange(item.id, value)}
              color={item.is_selected ? '#51ffc6' : undefined}
              style={styles.checkbox}
            />
          </View>

          {/* Medicine Image */}
          <View style={styles.imageContainer}>
            {imageError ? (
              <View style={[styles.medicineImage, styles.placeholderContainer]}>
                <MaterialCommunityIcons name="pill" size={24} color="#ccc" />
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            ) : (
              <Image
                source={{ uri: getImageUrl() }}
                style={styles.medicineImage}
                onError={handleImageError}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Medicine Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.medicineName} numberOfLines={2}>
                {item.medicine.name}
              </Text>
            </View>
            
            {item.medicine.description && (
              <Text style={styles.medicineDescription} numberOfLines={1}>
                {item.medicine.description}
              </Text>
            )}

            {/* Price Information */}
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.unitPrice}>
                  ${parseFloat(item.unit_price).toFixed(2)} each
                </Text>
              </View>
              <Text style={styles.totalPrice}>
                Total: ${parseFloat(item.total_price).toFixed(2)}
              </Text>
            </View>

            {/* Quantity and Stock Info */}
            <View style={styles.bottomRow}>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Qty:</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                  onPress={() => handleQuantityChange(item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                >
                  <MaterialCommunityIcons name="minus" size={16} color="#333" />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                  onPress={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.stockContainer}>
                <MaterialCommunityIcons name="package-variant" size={14} color="#666" />
                <Text style={styles.stockInfo}>
                  Stock: {item.medicine.quantity}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    borderRadius: 12,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'DarkerGrotesque-Bold',
    marginTop: 4,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    backgroundColor: 'green',
    marginRight: 12,
  },
  medicineImage: {
    width: 80,
    height: 80,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 10,
    color: '#ccc',
    fontFamily: 'DarkerGrotesque',
    marginTop: 2,
  },
  detailsContainer: {
    flex: 1,
    paddingRight: 30, // Add padding to avoid overlap with checkbox
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    flex: 1,
  },
  medicineDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unitPrice: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginLeft: 4,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginRight: 8,
  },
  quantityButton: {
    width: 25,
    height: 25,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockInfo: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginLeft: 4,
  },
});

export default CartItemCard;
