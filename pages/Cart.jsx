import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartItemCard from '../components/ui/cart/CartItemCard';
import CartIcon from '../assets/6.png';
import {
  getCart,
  updateCartItem,
  toggleItemSelection,
  removeFromCart,
  clearCart,
  getSelectedItems,
  checkout,
} from '../services/CartService';

const Cart = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { refreshCartCount } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  useEffect(() => {
    if (user?.token) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart(user.token);
      console.log('Cart response:', JSON.stringify(response, null, 2));
      
      // Log medicine data structure for debugging
      if (response.cart?.items?.length > 0) {
        console.log('First cart item medicine data:', JSON.stringify(response.cart.items[0].medicine, null, 2));
      }
      
      setCart(response.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    try {
      await updateCartItem(user.token, cartItemId, newQuantity);
      // Refresh cart to get updated totals
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', error.message || 'Failed to update quantity');
    }
  };

  const handleSelectionChange = async (cartItemId, isSelected) => {
    try {
      await toggleItemSelection(user.token, cartItemId, isSelected);
      // Update local state immediately for better UX
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item =>
          item.id === cartItemId ? { ...item, is_selected: isSelected } : item
        ),
        summary: {
          ...prevCart.summary,
          selected_amount: prevCart.items
            .map(item => 
              item.id === cartItemId 
                ? { ...item, is_selected: isSelected }
                : item
            )
            .filter(item => item.is_selected)
            .reduce((sum, item) => sum + parseFloat(item.total_price), 0)
            .toFixed(2)
        }
      }));
    } catch (error) {
      console.error('Error toggling selection:', error);
      Alert.alert('Error', 'Failed to update selection');
      // Refresh cart to revert changes
      await fetchCart();
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(user.token, cartItemId);
      await fetchCart();
      // Refresh cart count in bottom menu
      refreshCartCount();
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart(user.token);
              await fetchCart();
              // Refresh cart count in bottom menu
              refreshCartCount();
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      
      // Get selected items first to validate
      const selectedItemsResponse = await getSelectedItems(user.token);
      
      if (!selectedItemsResponse.selected_items || selectedItemsResponse.selected_items.length === 0) {
        Alert.alert('No Items Selected', 'Please select items to checkout');
        return;
      }

      // Initialize shipping address with user's existing address if available
      setShippingAddress(user.address || '');
      
      // Show address input modal
      setShowAddressModal(true);
      
    } catch (error) {
      console.error('Error preparing checkout:', error);
      Alert.alert('Error', error.message || 'Failed to prepare checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleAddressSubmit = async () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Address Required', 'Please enter your shipping address');
      return;
    }

    try {
      setCheckingOut(true);
      setShowAddressModal(false);
      
      // Get selected items again to ensure they're still valid
      const selectedItemsResponse = await getSelectedItems(user.token);
      
      if (!selectedItemsResponse.selected_items || selectedItemsResponse.selected_items.length === 0) {
        Alert.alert('No Items Selected', 'Please select items to checkout');
        return;
      }

      const checkoutData = {
        pharmacy_id: 1, // Default pharmacy - should be selected by user in a real app
        shipping_address: shippingAddress.trim(),
        note: `Order for ${selectedItemsResponse.selected_items.length} items`
      };
      
      proceedWithCheckout(checkoutData, selectedItemsResponse);
      
    } catch (error) {
      console.error('Error preparing checkout:', error);
      Alert.alert('Error', error.message || 'Failed to prepare checkout');
      setCheckingOut(false);
    }
  };

  const proceedWithCheckout = async (checkoutData, selectedItemsResponse) => {
    try {
      setCheckingOut(true);
      
      // Show final confirmation
      Alert.alert(
        'Confirm Checkout',
        `Proceed with checkout for ${selectedItemsResponse.selected_items.length} items?\nTotal: $${selectedItemsResponse.summary.total_amount}\nShipping to: ${checkoutData.shipping_address}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Place Order',
            onPress: async () => {
              try {
                // Create order from selected cart items
                const orderResponse = await checkout(user.token, checkoutData);
                
                // Refresh cart to remove checked out items
                await fetchCart();
                
                // Refresh cart count in bottom menu
                refreshCartCount();
                
                Alert.alert(
                  'Order Placed Successfully!',
                  `Order #${orderResponse.order.id} has been created.\nTotal: $${orderResponse.order.total_amount}`,
                  [
                    {
                      text: 'View Orders',
                      onPress: () => navigation.navigate('Invoice')
                    },
                    {
                      text: 'Continue Shopping',
                      onPress: () => navigation.navigate('BuyMedicines')
                    }
                  ]
                );
              } catch (error) {
                console.error('Error during checkout:', error);
                Alert.alert('Checkout Failed', error.message || 'Please try again');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', error.message || 'Failed to process checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <CartItemCard
      item={item}
      onQuantityChange={handleQuantityChange}
      onSelectionChange={handleSelectionChange}
      onRemove={handleRemoveItem}
    />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="cart-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyMessage}>
        Add some medicines to get started shopping.
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('BuyMedicines')}
      >
        <MaterialCommunityIcons name="shopping" size={20} color="#333" />
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const selectedItemsCount = cart?.items?.filter(item => item.is_selected).length || 0;
  const hasSelectedItems = selectedItemsCount > 0;

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#51ffc6" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image source={CartIcon} style={styles.icon} />
        <Text style={styles.header}>Shopping Cart</Text>
        {cart?.items?.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!cart?.items || cart.items.length === 0 ? (
          renderEmptyCart()
        ) : (
          <>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {cart.summary.total_items} item{cart.summary.total_items !== 1 ? 's' : ''} in cart
              </Text>
            </View>

            {/* Cart Items List */}
            <FlatList
              data={cart.items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />

            {/* Checkout Button with Summary */}
            {hasSelectedItems && (
              <View style={styles.checkoutContainer}>
                {/* Cart Summary in Checkout */}
                <View style={styles.checkoutSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Items: {cart.summary.total_items}</Text>
                    <Text style={styles.summaryLabel}>Qty: {cart.summary.total_quantity}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Cart Total: ${cart.summary.total_amount}</Text>
                    <Text style={styles.selectedLabel}>Selected ({selectedItemsCount}): ${cart.summary.selected_amount}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.checkoutButton,
                    !hasSelectedItems && styles.disabledButton
                  ]}
                  onPress={handleCheckout}
                  disabled={!hasSelectedItems || checkingOut}
                >
                  {checkingOut ? (
                    <ActivityIndicator color="#333" />
                  ) : (
                    <>
                      <View style={styles.checkoutInfo}>
                        <MaterialCommunityIcons name="cart-check" size={18} color="#333" />
                        <Text style={styles.checkoutButtonText}>
                          Checkout
                        </Text>
                      </View>
                      <Text style={styles.checkoutAmount}>
                        ${cart.summary.selected_amount}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Shipping Address Modal */}
      <Modal
        visible={showAddressModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addressModal}>
            <Text style={styles.modalTitle}>Shipping Address</Text>
            <Text style={styles.modalSubtitle}>
              Please enter your complete shipping address
            </Text>
            
            <TextInput
              style={styles.addressInput}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              placeholder="Enter your full shipping address..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddressModal(false);
                  setCheckingOut(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddressSubmit}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={styles.confirmButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  icon: {
    width: 50,
    height: 50,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    flex: 1,
    marginLeft: 5,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 15,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultsText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
  },
  listContainer: {
    paddingBottom: 140, // Increased to accommodate larger checkout container
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#51ffc6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 15,
  },
  shopButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 8,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkoutSummary: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
  },
  selectedLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  checkoutButton: {
    backgroundColor: '#51ffc6',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  checkoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 6,
  },
  checkoutAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    color: '#333',
    minHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    borderWidth: 0,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  confirmButton: {
    backgroundColor: '#51ffc6',
    borderWidth: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
});

export default Cart;
