import { API_URL } from '../config';

// Get customer's cart with all items
export const getCart = async (userToken) => {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting cart:', error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (userToken, medicineId, quantity = 1) => {
  try {
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        medicine_id: medicineId,
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (userToken, cartItemId, quantity) => {
  try {
    const response = await fetch(`${API_URL}/cart/item/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Toggle cart item selection
export const toggleItemSelection = async (userToken, cartItemId, isSelected) => {
  try {
    const response = await fetch(`${API_URL}/cart/item/${cartItemId}/select`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        is_selected: isSelected,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling item selection:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (userToken, cartItemId) => {
  try {
    const response = await fetch(`${API_URL}/cart/item/${cartItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Clear entire cart
export const clearCart = async (userToken) => {
  try {
    const response = await fetch(`${API_URL}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Get selected items for checkout
export const getSelectedItems = async (userToken) => {
  try {
    const response = await fetch(`${API_URL}/cart/checkout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting selected items:', error);
    throw error;
  }
};

// Remove selected items after checkout
export const removeSelectedItems = async (userToken) => {
  try {
    const response = await fetch(`${API_URL}/cart/checkout`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing selected items:', error);
    throw error;
  }
};

// Get cart item count
export const getCartItemCount = async (userToken) => {
  try {
    const response = await fetch(`${API_URL}/cart/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting cart item count:', error);
    throw error;
  }
};

// Checkout selected items - Create order from cart
export const checkout = async (userToken, checkoutData) => {
  try {
    if (!checkoutData) {
      throw new Error('Checkout data is required');
    }

    if (!checkoutData.pharmacy_id || !checkoutData.shipping_address) {
      throw new Error('Pharmacy ID and shipping address are required');
    }

    const response = await fetch(`${API_URL}/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during checkout:', error);
    throw error;
  }
}; 