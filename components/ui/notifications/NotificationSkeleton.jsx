import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';

const { width } = Dimensions.get('window');

const NotificationSkeleton = ({ onNotificationUpdate }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const fetchNotifications = async (isRefresh = false) => {
    if (!user?.id || !user?.token) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notifications/customer/${user.id}?include_resolved=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (isRefresh) {
          // For manual refresh, replace all notifications
          setNotifications(data);
        } else {
          // For automatic updates, merge new notifications with existing ones
          setNotifications(prevNotifications => {
            const existingIds = new Set(prevNotifications.map(n => n.id));
            const newNotifications = data.filter(notification => !existingIds.has(notification.id));
            
            // Add new notifications at the beginning, keep existing ones
            return [...newNotifications, ...prevNotifications];
          });
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!user?.token) return;

    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        
        // Notify parent component to refresh notification count
        if (onNotificationUpdate) {
          onNotificationUpdate();
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications(true); // Initial load with full refresh

    // Set up automatic check for new notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications(false); // Auto-update without replacing existing
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true); // Manual refresh replaces all notifications
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_placed':
        return 'shopping';
      case 'order_approved':
        return 'check-circle';
      case 'order_cancelled':
        return 'close-circle';
      case 'order_denied':
        return 'cancel';
      case 'order_status_changed':
        return 'update';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_placed': //pending
        return '#ffc107';
      case 'order_approved': //approved
        return '#007bff';
      case 'order_cancelled': //cancelled
        return '#6c757d';
      case 'order_denied': //denied
        return '#dc3545';
      case 'order_status_changed': //completed
        return 'green';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.is_read && styles.unreadNotification]}
      onPress={() => {
        if (!item.is_read) {
          markAsRead(item.id);
        }
      }}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getNotificationIcon(item.type)}
              size={24}
              color={getNotificationColor(item.type)}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>{formatDate(item.created_at)}</Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        {item.metadata && (
          <View style={styles.metadataContainer}>
            {item.metadata.order_id && (
              <Text style={styles.metadataText}>Order #{item.metadata.order_id}</Text>
            )}
            {item.metadata.total_amount && typeof item.metadata.total_amount === 'number' && (
              <Text style={styles.metadataText}>
                Amount: ${item.metadata.total_amount.toFixed(2)}
              </Text>
            )}
            {item.metadata.pharmacy_name && (
              <Text style={styles.metadataText}>
                Pharmacy: {item.metadata.pharmacy_name}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#51ffc6" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMessage}>You're all caught up! No new notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  listContainer: {
    padding: 16,
  },
  notificationItem: {
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
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#51ffc6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#51ffc6',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'DarkerGrotesque',
    lineHeight: 20,
    marginBottom: 8,
  },
  metadataContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginBottom: 2,
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
});

export default NotificationSkeleton;
