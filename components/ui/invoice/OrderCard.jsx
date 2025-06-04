import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const OrderCard = ({ item, onPress }) => {
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'order_placed':
        return '#ffc107';
      case 'approved':
      case 'order_approved':
        return '#007bff';
      case 'cancelled':
      case 'order_cancelled':
        return '#6c757d';
      case 'denied':
      case 'order_denied':
        return '#dc3545';
      case 'completed':
      case 'order_status_changed':
        return 'green';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'approved':
        return 'check-circle';
      case 'denied':
        return 'close-circle';
      case 'completed':
        return 'package-variant';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.orderCard} onPress={() => onPress && onPress(item)}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Invoice #{item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <MaterialCommunityIcons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color="white" 
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.pharmacyInfo}>
        <MaterialCommunityIcons name="store" size={16} color="#666" />
        <Text style={styles.pharmacyName}>{item.pharmacy.name}</Text>
      </View>

      {item.shipping_address && (
        <View style={styles.addressInfo}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
          <Text style={styles.addressText}>{item.shipping_address}</Text>
        </View>
      )}

      <View style={styles.itemsSection}>
        <Text style={styles.itemsTitle}>Items ({item.items.length})</Text>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Image 
              source={{ uri: orderItem.medicine.imageUrl || orderItem.medicine.image }} 
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>
                {orderItem.medicine.name}
              </Text>
              <Text style={styles.itemQuantity}>Qty: {orderItem.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${parseFloat(orderItem.price).toFixed(2)}</Text>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>${parseFloat(item.total_amount).toFixed(2)}</Text>
        </View>
      </View>

      {item.note && (
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Note:</Text>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 4,
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginLeft: 6,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginLeft: 6,
    flex: 1,
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '##333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  noteSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    lineHeight: 18,
  },
});

export default OrderCard;
