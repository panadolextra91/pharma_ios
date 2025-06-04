import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Animated, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { addToCart } from '../../../services/CartService';

const { width, height } = Dimensions.get('window');

const ProductDetail = ({ visible, product, onClose, onAddToCart }) => {
  const { user } = useContext(AuthContext);
  const { refreshCartCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  useEffect(() => {
    if (visible) {
      // Reset quantity when modal opens
      setQuantity(1);
      
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
    } else {
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
  }, [visible, fadeAnim, slideAnim]);

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user?.token) {
      Alert.alert('Authentication Required', 'Please log in to add items to cart');
      return;
    }

    if (!product?.id) {
      Alert.alert('Error', 'Invalid product selected');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Add to backend cart
      const response = await addToCart(user.token, product.id, quantity);
      
      // Refresh cart count immediately
      refreshCartCount();
      
      // Show success message
      Alert.alert(
        'Added to Cart!',
        `${product.name} (${quantity}x) has been added to your cart.`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel'
          },
          {
            text: 'View Cart',
            onPress: () => {
              onClose();
              // Navigate to cart - you might need to pass navigation prop
              // navigation.navigate('Cart');
            }
          }
        ]
      );
      
      // Call the onAddToCart prop if provided (for any additional handling)
      if (onAddToCart) {
        onAddToCart({
          ...product,
          quantity
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', error.message || 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContent,
                { transform: [{ translateY: slideAnim }] }
              ]}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
              
              <Image 
                source={{ uri: product.image || product.imageUrl }} 
                style={styles.productImage} 
                resizeMode="contain"
              />
              
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.brandName}>Brand: {product.brand_name || product.brand || 'Premium Brand'}</Text>
                <Text style={styles.categoryName}>Category: {product.category_name || product.category || 'General'}</Text>
                <Text style={styles.price}>${product.price}</Text>
                
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.description}>{product.description}</Text>
                
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Quantity:</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={decrementQuantity}
                      disabled={addingToCart}
                    >
                      <MaterialIcons name="remove" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={incrementQuantity}
                      disabled={addingToCart}
                    >
                      <MaterialIcons name="add" size={20} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.addToCartButton, addingToCart && styles.disabledButton]} 
                  onPress={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <ActivityIndicator color="#333" />
                  ) : (
                    <>
                      <MaterialIcons name="shopping-cart" size={20} color="#333" />
                      <Text style={styles.addToCartText}>Add to Cart</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    height: height * 0.85,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: width * 0.6,
    height: width * 0.6,
    alignSelf: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 28,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  brandName: {
    fontSize: 20,
    fontFamily: 'DarkerGrotesque',
    color: '#555',
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    marginBottom: 10,
  },
  price: {
    fontSize: 26,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  descriptionTitle: {
    fontSize: 22,
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 18,
    fontFamily: 'DarkerGrotesque',
    color: '#444',
    lineHeight: 26,
    marginBottom: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 20,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
    marginRight: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  quantityValue: {
    fontSize: 20,
    fontFamily: 'DarkerGrotesque-Bold',
    paddingHorizontal: 15,
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#51ffc6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 15,
  },
  addToCartText: {
    fontSize: 22,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
});

export default ProductDetail;