import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BottomMenu from '../components/ui/BottomMenu';
import SearchBar from '../components/ui/SearchBar';
import PharmacyCard from '../components/ui/pharmacies/PharmacyCard';
import PharmaciesIcon from '../assets/Location.png';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const Pharmacies = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  // Request location permission and get current location
  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status !== 'granted') {
        console.log('📍 Location permission denied by user');
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find nearby pharmacies and calculate distances.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return null;
      }

      console.log('📍 Location permission granted, getting current position...');

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
      console.log('📍 Customer phone location obtained:');
      console.log(`   Latitude: ${coords.latitude}`);
      console.log(`   Longitude: ${coords.longitude}`);
      console.log(`   Accuracy: ${location.coords.accuracy}m`);
      console.log(`   Timestamp: ${new Date(location.timestamp).toLocaleString()}`);
      
      setCurrentLocation(coords);
      return coords;
      
    } catch (error) {
      console.error('❌ Error getting customer location:', error);
      console.log('📍 Location error details:', {
        message: error.message,
        code: error.code
      });
      Alert.alert('Location Error', 'Failed to get your current location. Showing all pharmacies without distance calculation.');
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // Fetch pharmacies from backend
  const fetchPharmacies = async (location = null) => {
    if (!user?.token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      setLoading(true);
      let url, options;

      if (location) {
        console.log('🌐 Sending location to backend for distance calculation:');
        console.log(`   API Endpoint: ${API_URL}/pharmacies/with-distance`);
        console.log(`   Customer Latitude: ${location.latitude}`);
        console.log(`   Customer Longitude: ${location.longitude}`);
        
        // Use location-based API to get pharmacies with distances
        url = `${API_URL}/pharmacies/with-distance`;
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude
          })
        };
      } else {
        console.log('🌐 Fetching pharmacies without location data');
        console.log(`   API Endpoint: ${API_URL}/pharmacies`);
        
        // Get all pharmacies without distance calculation
        url = `${API_URL}/pharmacies`;
        options = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          }
        };
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Backend response received: ${data.pharmacies?.length || 0} pharmacies`);
        
        if (location && data.pharmacies?.length > 0) {
          console.log('📊 Distance calculation results:');
          data.pharmacies.slice(0, 3).forEach((pharmacy, index) => {
            console.log(`   ${index + 1}. ${pharmacy.name}: ${pharmacy.distance_km}km`);
          });
        }
        
        let pharmacyData = [];
        
        if (location) {
          // Data from with-distance endpoint
          pharmacyData = data.pharmacies.map(pharmacy => ({
            id: pharmacy.id.toString(),
            name: pharmacy.name,
            address: pharmacy.address,
            phone: pharmacy.phone || 'N/A',
            hours: pharmacy.hours || '8:00 AM - 10:00 PM',
            distance: `${pharmacy.distance_km} km`,
            distanceValue: pharmacy.distance_km,
            rating: 4.5, // Default rating since not in database
            isOpen: isPharmacyOpen(pharmacy.hours),
            contact_email: pharmacy.contact_email,
            latitude: pharmacy.latitude,
            longitude: pharmacy.longitude
          }));
        } else {
          // Data from regular endpoint
          pharmacyData = data.pharmacies.map(pharmacy => ({
            id: pharmacy.id.toString(),
            name: pharmacy.name,
            address: pharmacy.address,
            phone: pharmacy.phone || 'N/A',
            hours: pharmacy.hours || '8:00 AM - 10:00 PM',
            distance: 'Distance unavailable',
            distanceValue: null,
            rating: 4.5, // Default rating
            isOpen: isPharmacyOpen(pharmacy.hours),
            contact_email: pharmacy.contact_email,
            latitude: pharmacy.latitude,
            longitude: pharmacy.longitude
          }));
        }

        setPharmacies(pharmacyData);
        setFilteredPharmacies(pharmacyData);
      } else {
        console.error('❌ Backend API error:', data.error);
        throw new Error(data.error || 'Failed to fetch pharmacies');
      }
    } catch (error) {
      console.error('❌ Error fetching pharmacies:', error);
      Alert.alert('Error', 'Failed to load pharmacies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simple function to determine if pharmacy is open (you can enhance this)
  const isPharmacyOpen = (hours) => {
    if (!hours || hours === '24 hours') return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simple logic - assumes most pharmacies are open 8 AM - 10 PM
    // You can enhance this to parse actual hours
    return currentHour >= 8 && currentHour < 22;
  };

  // Initialize component
  useEffect(() => {
    const initializePharmacies = async () => {
      console.log('🚀 Initializing Pharmacies component...');
      
      // First, try to get location
      const location = await requestLocationPermission();
      
      // Then fetch pharmacies (with or without location)
      await fetchPharmacies(location);
      
      console.log('✅ Pharmacies component initialization complete');
    };

    initializePharmacies();
  }, []);

  // Filter pharmacies based on search and status
  useEffect(() => {
    filterPharmacies(searchQuery, activeFilter);
  }, [searchQuery, activeFilter, pharmacies]);

  const filterPharmacies = (query, filter) => {
    let filtered = [...pharmacies];
    
    // Apply search query filter
    if (query) {
      filtered = filtered.filter(pharmacy => 
        pharmacy.name.toLowerCase().includes(query.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filter === 'open') {
      filtered = filtered.filter(pharmacy => pharmacy.isOpen);
    } else if (filter === 'closed') {
      filtered = filtered.filter(pharmacy => !pharmacy.isOpen);
    }
    
    // Sort by distance if available, otherwise by name
    filtered.sort((a, b) => {
      if (a.distanceValue !== null && b.distanceValue !== null) {
        return a.distanceValue - b.distanceValue;
      } else if (a.distanceValue !== null) {
        return -1;
      } else if (b.distanceValue !== null) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredPharmacies(filtered);
  };

  const handleSearch = () => {
    filterPharmacies(searchQuery, activeFilter);
  };

  const handleRefreshLocation = async () => {
    console.log('🔄 User requested location refresh...');
    const location = await requestLocationPermission();
    if (location) {
      await fetchPharmacies(location);
    }
  };

  const renderPharmacyItem = ({ item }) => (
    <PharmacyCard pharmacy={item} />
  );

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#51ffc6" />
          <Text style={styles.loadingText}>Loading pharmacies...</Text>
          {locationLoading && (
            <Text style={styles.loadingSubText}>Getting your location...</Text>
          )}
        </View>
        <BottomMenu activeRoute="Pharmacies" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Image source={PharmaciesIcon} style={styles.icon} />
          <Text style={styles.header}>Pharmacies</Text>
        </View>
        
        <SearchBar
          placeholder="Search pharmacies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          icon="🔍"
        />
        
        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'open' && styles.activeFilterButton]}
            onPress={() => setActiveFilter('open')}
          >
            <Text style={[styles.filterText, activeFilter === 'open' && styles.activeFilterText]}>Open Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'closed' && styles.activeFilterButton]}
            onPress={() => setActiveFilter('closed')}
          >
            <Text style={[styles.filterText, activeFilter === 'closed' && styles.activeFilterText]}>Closed</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredPharmacies.length} pharmacies found
            {currentLocation && ' (sorted by distance)'}
          </Text>
          
          <FlatList
            data={filteredPharmacies}
            renderItem={renderPharmacyItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="local-pharmacy" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No pharmacies found</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery ? 'Try adjusting your search terms' : 'No pharmacies available at the moment'}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
      
      <BottomMenu activeRoute="Pharmacies" />
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
    paddingHorizontal: 20,
  },
  loadingText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
    marginTop: 16,
  },
  loadingSubText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
    fontFamily: 'DarkerGrotesque-Bold',
  },
  icon: {
    width: 40,
    height: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButton: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activeFilterButton: {
    backgroundColor: '#51ffc6',
  },
  filterText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
  },
  activeFilterText: {
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  resultsContainer: {
    marginBottom: 100, // Space for bottom menu
  },
  resultsText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Pharmacies;