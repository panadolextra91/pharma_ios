import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Background from '../components/Icons/Background';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Profile = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const fetchCustomerData = async () => {
    if (!user?.id || !user?.token) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customers/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setCustomerData(data);
      } else {
        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please login again', [
            {
              text: 'OK',
              onPress: () => {
                logout();
                navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
              }
            }
          ]);
        } else {
          Alert.alert('Error', data.error || 'Failed to fetch profile data');
        }
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomerData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
          },
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={StyleSheet.absoluteFill} />
        <Background width={width} height={height} style={[StyleSheet.absoluteFillObject, {left: 0}]} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#51ffc6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background elements */}
      <View style={StyleSheet.absoluteFill} />
      <Background width={width} height={height} style={[StyleSheet.absoluteFillObject, {left: 0}]} />
      
      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.nameText}>
            {customerData?.name || 'User'}
          </Text>
        </View>

        {/* Profile Information Card */}
        {customerData && (
          <View style={styles.profileCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Account Information</Text>
            </View>

            <View style={styles.profileItem}>
              <View style={styles.itemIcon}>
                <MaterialCommunityIcons name="account" size={20} color="#666" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.label}>Full Name</Text>
                <Text style={styles.value}>{customerData.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.profileItem}>
              <View style={styles.itemIcon}>
                <MaterialCommunityIcons name="phone" size={20} color="#666" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{customerData.phone}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.profileItem}>
              <View style={styles.itemIcon}>
                <MaterialCommunityIcons name="email" size={20} color="#666" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>{customerData.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.profileItem}>
              <View style={styles.itemIcon}>
                <MaterialCommunityIcons 
                  name={customerData.verified ? "shield-check" : "shield-alert"} 
                  size={20} 
                  color={customerData.verified ? "#28a745" : "#ffc107"} 
                />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.label}>Account Status</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, customerData.verified && styles.verifiedBadge]}>
                    <Text style={[styles.statusText, customerData.verified && styles.verifiedText]}>
                      {customerData.verified ? 'Verified' : 'Not Verified'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'transparent',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
    fontFamily: 'DarkerGrotesque',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    marginTop: 80,
    fontSize: 24,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginBottom: 5,
  },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    fontFamily: 'DarkerGrotesque-Bold',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  itemIcon: {
    width: 50,
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
    fontFamily: 'DarkerGrotesque',
  },
  value: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 50,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  verifiedBadge: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  statusText: {
    fontSize: 14,
    color: '#856404',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  verifiedText: {
    color: '#155724',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 150,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 8,
  },
});

export default Profile;
