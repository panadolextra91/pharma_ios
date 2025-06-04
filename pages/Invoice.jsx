import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import InvoiceIcon from '../assets/list_assets 1.png';
import OrderCards from '../components/ui/invoice/OrderCard';

const { width, height } = Dimensions.get('window');

const Invoice = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const statusTabs = [
    { key: 'pending', label: 'Pending', icon: 'clock-outline' },
    { key: 'approved', label: 'Approved', icon: 'check-circle-outline' },
    { key: 'denied', label: 'Denied', icon: 'close-circle-outline' },
    { key: 'completed', label: 'Completed', icon: 'package-variant' },
  ];

  const fetchOrdersByStatus = async (status) => {
    if (!user?.id || !user?.token) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/orders/customer/${user.id}/status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalOrders(data.total_orders || 0);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrdersByStatus(selectedStatus);
  }, [selectedStatus]);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrdersByStatus(selectedStatus);
    }, [selectedStatus])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrdersByStatus(selectedStatus);
  };

  const handleOrderPress = (order) => {
    // Handle order press - could navigate to order details
    console.log('Order pressed:', order.id);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image source={InvoiceIcon} style={styles.icon} />
        <Text style={styles.header}>My Invoices</Text>
      </View>

      {/* Status Tabs - iOS Segmented Control Style */}
      <View style={styles.tabsContainer}>
        <View style={styles.segmentedControl}>
          {statusTabs.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.segmentButton,
                selectedStatus === item.key && styles.activeSegment
              ]}
              onPress={() => setSelectedStatus(item.key)}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedStatus === item.key && styles.activeSegmentText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#51ffc6" />
            <Text style={styles.loadingText}>Loading invoices...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="receipt" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No {selectedStatus} invoices</Text>
            <Text style={styles.emptyMessage}>
              You don't have any {selectedStatus} invoices at the moment.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {totalOrders} {selectedStatus} invoice{totalOrders !== 1 ? 's' : ''}
              </Text>
            </View>
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <OrderCards item={item} onPress={handleOrderPress} />
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  icon: {
    width: 40,
    height: 40,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 10,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  activeSegment: {
    backgroundColor: '#51ffc6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    textAlign: 'center',
  },
  activeSegmentText: {
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

export default Invoice;
