import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ProductDetail from '../components/ui/order/MedicineDetails';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/ui/SearchBar';
import BottomMenu from '../components/ui/BottomMenu';
import MedicineCard from '../components/ui/buy-medicines/MedicineCard';
import { API_URL } from '../config';
import ScheduleIcon from '../assets/052_Medical_App.png'
import PharmaciesIcon from '../assets/Location.png'
import HealthRecordsIcon from '../assets/Records.png'
import NewsIcon from '../assets/Defibrillator.png'
import BuyMedicinesIcon from '../assets/medicine.png'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getSchedules, logMedicationAction, transformScheduleForFrontend } from '../services/ScheduleService';
const { width } = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [topBrands, setTopBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [topMedicines, setTopMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('This Month');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [upcomingMedications, setUpcomingMedications] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [processingAction, setProcessingAction] = useState({});
  const productListRef = React.useRef(null);

  // Load fonts
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  // Fetch upcoming medications from schedules
  const fetchUpcomingMedications = async () => {
    if (!user?.token) {
      setLoadingSchedules(false);
      return;
    }

    try {
      setLoadingSchedules(true);
      const response = await getSchedules(user.token);
      
      if (response.schedules) {
        const schedules = response.schedules.map(transformScheduleForFrontend);
        
        // Get current day and time
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes for comparison
        
        // Filter active schedules for today that haven't passed yet
        const todaysMedications = schedules
          .filter(schedule => {
            // Check if schedule is active
            if (!schedule.isActive) return false;
            
            // Check if today is in the scheduled days
            if (!schedule.days.includes(currentDay)) return false;
            
            // Parse the scheduled time
            const scheduledHours = schedule.time.getHours();
            const scheduledMinutes = schedule.time.getMinutes();
            const scheduledTimeInMinutes = scheduledHours * 60 + scheduledMinutes;
            
            // Only show medications that haven't been taken yet today
            // For now, we'll show all of today's medications, but in a real app
            // you'd want to check the logs to see if it's already been taken
            return true;
          })
          .map(schedule => ({
            id: schedule.id,
            name: schedule.name,
            dosage: schedule.dosage,
            time: schedule.time,
            formattedTime: formatMedicationTime(schedule.time),
            scheduleId: schedule.id,
            notes: schedule.notes
          }))
          .sort((a, b) => {
            // Sort by time
            const timeA = a.time.getHours() * 60 + a.time.getMinutes();
            const timeB = b.time.getHours() * 60 + b.time.getMinutes();
            return timeA - timeB;
          })
          .slice(0, 3); // Show only the next 3 medications
        
        setUpcomingMedications(todaysMedications);
      }
    } catch (error) {
      console.error('Error fetching upcoming medications:', error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Format time for display
  const formatMedicationTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Handle medication action (Taken or Skipped)
  const handleMedicationAction = async (medication, actionType) => {
    if (!user?.token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    setProcessingAction(prev => ({ ...prev, [medication.id]: true }));

    try {
      const logData = {
        schedule_id: medication.scheduleId,
        action_type: actionType.toLowerCase(), // 'taken' or 'skipped'
        scheduled_time: new Date().toISOString(),
        notes: `Marked as ${actionType} from home screen`
      };

      await logMedicationAction(user.token, logData);

      Alert.alert(
        'Success',
        `${medication.name} marked as ${actionType.toLowerCase()}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Refresh the upcoming medications list
              fetchUpcomingMedications();
            }
          }
        ]
      );
    } catch (error) {
      console.error(`Error marking medication as ${actionType}:`, error);
      Alert.alert('Error', `Failed to mark medication as ${actionType.toLowerCase()}. Please try again.`);
    } finally {
      setProcessingAction(prev => ({ ...prev, [medication.id]: false }));
    }
  };

  // Fetch top brands from API
  const fetchTopBrands = async () => {
    try {
      setLoadingBrands(true);
      const response = await fetch(`${API_URL}/invoices/sales/top-brands`);
      if (!response.ok) {
        throw new Error('Failed to fetch top brands');
      }
      const data = await response.json();
      if (data.success) {
        setTopBrands(data.data);
      }
    } catch (error) {
      console.error('Error fetching top brands:', error);
      // Keep the fallback brands if API fails
      setTopBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Fetch top medicines from API
  const fetchTopMedicines = async (period = 'This Month') => {
    try {
      setLoadingMedicines(true);
      const endpoint = period === 'This Week' 
        ? `${API_URL}/invoices/sales/top-medicines/week`
        : `${API_URL}/invoices/sales/top-medicines/month`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch top medicines');
      }
      const data = await response.json();
      if (data.success) {
        // Fetch full medicine data for each medicine_id
        const medicinesWithFullData = await Promise.all(
          data.data.map(async (item) => {
            try {
              const medicineResponse = await fetch(`${API_URL}/medicines/${item.medicine_id}`);
              if (medicineResponse.ok) {
                const medicineData = await medicineResponse.json();
                console.log('Medicine API response:', medicineData); // Debug log
                // Combine sales data with full medicine data
                return {
                  ...medicineData,
                  rank: item.rank,
                  total_quantity_sold: item.total_quantity_sold,
                  sales_data: item,
                  // Ensure image field is properly set
                  image: medicineData.imageUrl || medicineData.image,
                  imageUrl: medicineData.imageUrl || medicineData.image
                };
              } else {
                // Fallback to original data if medicine fetch fails
                return {
                  id: item.medicine_id,
                  name: item.medicine_name,
                  price: item.medicine_price,
                  imageUrl: item.medicine_image,
                  image: item.medicine_image,
                  rank: item.rank,
                  total_quantity_sold: item.total_quantity_sold,
                  brand_name: item.brand_name,
                  category_name: item.category_name,
                  description: 'No description available.'
                };
              }
            } catch (error) {
              console.error(`Error fetching medicine ${item.medicine_id}:`, error);
              // Fallback to original data
              return {
                id: item.medicine_id,
                name: item.medicine_name,
                price: item.medicine_price,
                imageUrl: item.medicine_image,
                image: item.medicine_image,
                rank: item.rank,
                total_quantity_sold: item.total_quantity_sold,
                brand_name: item.brand_name,
                category_name: item.category_name,
                description: 'No description available.'
              };
            }
          })
        );
        setTopMedicines(medicinesWithFullData);
      }
    } catch (error) {
      console.error('Error fetching top medicines:', error);
      // Keep empty array if API fails
      setTopMedicines([]);
    } finally {
      setLoadingMedicines(false);
    }
  };

  // Fetch unread notifications count
  const fetchUnreadNotificationsCount = async () => {
    if (!user?.id || !user?.token) {
      return;
    }

    try {
      setLoadingNotifications(true);
      const response = await fetch(`${API_URL}/notifications/customer/${user.id}/unread/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      } else {
        console.error('Failed to fetch unread notifications count');
      }
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchTopBrands();
    fetchTopMedicines();
    fetchUnreadNotificationsCount();
    fetchUpcomingMedications();

    // Set up automatic refresh for notification count every 2 minutes
    const notificationInterval = setInterval(() => {
      fetchUnreadNotificationsCount();
    }, 120000); // 2 minutes = 120,000 milliseconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

  // Refresh notification count and upcoming medications when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadNotificationsCount();
      fetchUpcomingMedications();
    }, [])
  );

  // Refetch medicines when time period changes
  useEffect(() => {
    fetchTopMedicines(selectedTimePeriod);
  }, [selectedTimePeriod]);

  if (!fontsLoaded) {
    return null;
  }

  const quickActions = [
    { id: 1, title: 'Schedule', icon: ScheduleIcon, screen: 'Schedule' },
    { id: 2, title: 'Pharmacies', icon: PharmaciesIcon, screen: 'Pharmacies' },
    { id: 3, title: 'Health Records', icon: HealthRecordsIcon, screen: 'HealthRecords' },
    { id: 4, title: 'News', icon: NewsIcon, screen: 'News' },
    { id: 5, title: 'Buy Medicines', icon: BuyMedicinesIcon, screen: 'BuyMedicines' },
  ];

  const timePeriods = ['This Month', 'This Week'];

  return (
      <View style={styles.container}>
      <ScrollView >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notification')}
          >
            <MaterialCommunityIcons 
              name="bell" 
              size={24} 
              color="#333" 
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount.toString()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
        <SearchBar
          placeholder="What are you looking for?"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => console.log('Searching for:', searchQuery)}
        />

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={quickActions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Image source={item.icon} style={styles.actionIcon} />
              <Text style={styles.actionText}>{item.title}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.quickActionsContainer}
        />

        {/* Upcoming Medications */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Medications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingSchedules ? (
          <View style={styles.medicationLoadingContainer}>
            <ActivityIndicator size="small" color="#51ffc6" />
            <Text style={styles.loadingText}>Loading medications...</Text>
          </View>
        ) : upcomingMedications.length === 0 ? (
          <View style={styles.noMedicationsContainer}>
            <MaterialCommunityIcons name="pill-off" size={48} color="#ccc" />
            <Text style={styles.noMedicationsText}>No upcoming medications today</Text>
            <TouchableOpacity 
              style={styles.addMedicationButton}
              onPress={() => navigation.navigate('Schedule')}
            >
              <Text style={styles.addMedicationButtonText}>Add Medication Schedule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          upcomingMedications.map((med) => (
            <View key={med.id} style={styles.medicationCard}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>{med.dosage}</Text>
                {med.notes && (
                  <Text style={styles.medNotes}>{med.notes}</Text>
                )}
              </View>
              <View style={styles.medicationActions}>
                <Text style={styles.timeText}>{med.formattedTime}</Text>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.medicationActionButton, styles.takenButton]}
                    onPress={() => handleMedicationAction(med, 'Taken')}
                    disabled={processingAction[med.id]}
                  >
                    {processingAction[med.id] ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.medicationActionButtonText}>Taken</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.medicationActionButton, styles.skippedButton]}
                    onPress={() => handleMedicationAction(med, 'Skipped')}
                    disabled={processingAction[med.id]}
                  >
                    {processingAction[med.id] ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.medicationActionButtonText}>Skip</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Top Selling Brands */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Selling Brands</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Brands')}>
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>
        {loadingBrands ? (
          <View style={styles.brandsLoadingContainer}>
            <ActivityIndicator size="small" color="#51ffc6" />
            <Text style={styles.loadingText}>Loading brands...</Text>
          </View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={topBrands}
            keyExtractor={(item) => item.brand_id ? item.brand_id.toString() : item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.brandCard}
                onPress={async () => {
                  try {
                    // Fetch complete brand information using brand_id
                    const brandId = item.brand_id || item.id;
                    const response = await fetch(`${API_URL}/brands/${brandId}`);
                    
                    if (!response.ok) {
                      throw new Error('Failed to fetch brand details');
                    }
                    
                    const brandData = await response.json();
                    navigation.navigate('BrandDetails', { brand: brandData });
                  } catch (error) {
                    console.error('Error fetching brand details:', error);
                    // Fallback to basic brand info if API fails
                    const fallbackBrand = {
                      id: item.brand_id || item.id,
                      name: item.brand_name || item.name,
                      logoUrl: item.brand_logo || item.logo,
                      logo: item.brand_logo || item.logo,
                      manufacturer: 'N/A',
                      country: 'N/A',
                      description: `${item.brand_name || item.name} is one of our top-selling pharmaceutical brands.`,
                      medicineCount: item.medicine_count || item.medicineCount
                    };
                    navigation.navigate('BrandDetails', { brand: fallbackBrand });
                  }
                }}
              >
                <Image 
                  source={{ uri: item.brand_logo || item.logo }} 
                  style={styles.brandLogo} 
                  resizeMode="contain"
                />
                <Text style={styles.brandName}>{item.brand_name || item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.horizontalList}
          />
        )}

        {/* Top Selling Medicines */}
        <Text style={styles.sectionTitle}>Top Selling Medicines</Text>
        <View style={styles.tagContainer}>
          {timePeriods.map((tag) => (
            <TouchableOpacity 
              key={tag} 
              style={[
                styles.tagButton, 
                selectedTimePeriod === tag && styles.selectedTagButton
              ]}
              onPress={() => {
                setSelectedTimePeriod(tag);
                if (productListRef.current) {
                  productListRef.current.scrollToOffset({ offset: 0, animated: true });
                }
              }}
            >
              <Text 
                style={[
                  styles.tagText, 
                  selectedTimePeriod === tag && styles.selectedTagText
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loadingMedicines ? (
          <View style={styles.brandsLoadingContainer}>
            <ActivityIndicator size="small" color="#51ffc6" />
            <Text style={styles.loadingText}>Loading medicines...</Text>
          </View>
        ) : (
          <FlatList
            ref={productListRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={topMedicines}
            keyExtractor={(item) => item.id ? item.id.toString() : item.medicine_id.toString()}
            key={selectedTimePeriod}
            renderItem={({ item }) => (
              <View style={styles.medicineCardContainer}>
                <MedicineCard 
                  medicine={{
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.imageUrl || item.image,
                    imageUrl: item.imageUrl || item.image,
                    brand_name: item.brand_name,
                    brand: item.brand_name,
                    category_name: item.category_name,
                    category: item.category_name
                  }}
                  onPress={() => {
                    // Pass the full medicine data to the modal
                    const product = {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.imageUrl || item.image,
                      brand_name: item.brand_name,
                      brand: item.brand_name,
                      category_name: item.category_name,
                      category: item.category_name,
                      description: item.description || 'No description available.',
                      unit: `Rank #${item.rank} • ${item.total_quantity_sold} sold`
                    };
                    console.log('Product data for modal:', product); // Debug log
                    setSelectedProduct(product);
                    setProductModalVisible(true);
                  }}
                />
              </View>
            )}
            contentContainerStyle={styles.horizontalList}
          />
        )}
        </View>
      </ScrollView>
      {/* Bottom Menu */}
      <BottomMenu activeRoute="Home" />

      {/* Product Detail Modal */}
      <ProductDetail 
        visible={productModalVisible}
        product={selectedProduct}
        onClose={() => {
          setProductModalVisible(false);
          setSelectedProduct(null);
        }}
      />
      </View>
      
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0, // Add padding to prevent content from being hidden behind the bottom menu
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 50,
    paddingBottom: 20,
    marginBottom: 20,
    backgroundColor: '#51ffc6',
    borderRadius: 20,
    elevation: 5,
  },
  greeting: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'DarkerGrotesque',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  content: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 80,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  seeAllLink: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    color: '#333',
  },
  quickActionsContainer: {
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 25,
  },
  actionButton: {
    width: width * 0.43,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginRight: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginLeft: 5,
  },
  actionIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
    textAlign: 'center',
  },
  medicationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicationInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 5,
  },
  medDosage: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
  },
  medNotes: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'DarkerGrotesque',
    fontStyle: 'italic',
    marginTop: 2,
  },
  medicationActions: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 8,
    color: '#333',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  medicationActionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    minWidth: 60,
    alignItems: 'center',
  },
  takenButton: {
    backgroundColor: '#51ffc6',
  },
  skippedButton: {
    backgroundColor: '#ff6b6b',
  },
  medicationActionButtonText: {
    color: '#fff',
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 14,
  },
  medicationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
  },
  noMedicationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
  },
  noMedicationsText: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    color: '#999',
    marginTop: 10,
    marginBottom: 15,
  },
  addMedicationButton: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addMedicationButtonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    color: '#333',
  },
  horizontalList: {
    paddingRight: 16,
    paddingTop: 10,
    //backgroundColor: 'red',
  },
  brandCard: {
    width: 120,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 15,
    marginLeft: 5,
  },
  brandLogo: {
    width: 100,
    height: 80,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
    textAlign: 'center',
  },

  brandsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    marginLeft: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 15,
  },
  tagButton: {
    paddingHorizontal: 15,
    paddingBottom: 6,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedTagButton: {
    backgroundColor: '#51ffc6',
  },
  tagText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
  },
  selectedTagText: {
    fontFamily: 'DarkerGrotesque-Bold',
  },
  medicineCardContainer: {
    width: 160,
    marginRight: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
});

export default Home;