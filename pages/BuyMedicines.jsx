import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../config';
import MedicineCard from '../components/ui/buy-medicines/MedicineCard';
import SearchBar from '../components/ui/SearchBar';
import BottomMenu from '../components/ui/BottomMenu';
import MedicineDetails from '../components/ui/order/MedicineDetails';
import BuyMedicinesIcon from '../assets/medicine.png'

const BuyMedicines = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineDetailVisible, setMedicineDetailVisible] = useState(false);
  const [loadingMedicineDetail, setLoadingMedicineDetail] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const categories = [
    'All', 'Analgesics', 'Antibiotics', 'Antihistamines', 'Cough & Cold', 
    'Digestive Health', 'Heart & Blood Pressure', 'Diabetes', 'Antiseptics', 
    'Vitamins & Supplements', 'First Aid', 'Antifungal', 'Antacids', 
    'Antiviral', 'Antimalarial', 'Antispasmodics', 'Neuro', 
    'Topical Treatment', 'Antipyretics', 'Sexual Health'
  ];

  const fetchMedicines = async () => {
    try {
      const response = await fetch(`${API_URL}/medicines`);
      if (!response.ok) {
        throw new Error('Failed to fetch medicines');
      }
      const data = await response.json();
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      Alert.alert('Error', 'Failed to load medicines. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Handle search query from navigation params
  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
      // Clear the param to avoid re-triggering
      navigation.setParams({ searchQuery: undefined });
    }
  }, [route.params?.searchQuery]);

  useEffect(() => {
    let filtered = medicines;

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(medicine =>
        medicine.category_name.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.category_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMedicines(filtered);
  }, [searchQuery, medicines, activeCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedicines();
  };

  const fetchMedicineById = async (medicineId) => {
    try {
      setLoadingMedicineDetail(true);
      const response = await fetch(`${API_URL}/medicines/${medicineId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch medicine details');
      }
      const data = await response.json();
      setSelectedMedicine(data);
      setMedicineDetailVisible(true);
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      Alert.alert('Error', 'Failed to load medicine details. Please try again.');
    } finally {
      setLoadingMedicineDetail(false);
    }
  };

  const handleMedicinePress = (medicine) => {
    fetchMedicineById(medicine.id);
  };

  const handleCloseMedicineDetail = () => {
    setMedicineDetailVisible(false);
    setSelectedMedicine(null);
  };

  const renderStaggeredLayout = () => {
    const leftColumn = [];
    const rightColumn = [];
    
    filteredMedicines.forEach((medicine, index) => {
      const targetColumn = index % 2 === 0 ? leftColumn : rightColumn;
      
      targetColumn.push(
        <View key={medicine.id} style={styles.cardContainer}>
          <MedicineCard 
            medicine={medicine} 
            onPress={handleMedicinePress}
          />
        </View>
      );
    });

    return (
      <View style={styles.staggeredContainer}>
        <View style={[styles.column, styles.leftColumn]}>
          {leftColumn}
        </View>
        <View style={[styles.column, styles.rightColumn]}>
          {rightColumn}
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Image source={BuyMedicinesIcon} style={styles.icon} />
          <Text style={styles.header}>Buy Medicines</Text>
        </View>
        
        <SearchBar
          placeholder="Search medicines, brands, categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => console.log('Searching for:', searchQuery)}
        />

        {/* Category Filter Tags */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollView}
          >
            {categories.map((category) => (
              <TouchableOpacity 
                key={category}
                style={[styles.categoryTag, activeCategory === category && styles.activeCategoryTag]} 
                onPress={() => setActiveCategory(category)}
              >
                <Text style={[styles.categoryText, activeCategory === category && styles.activeCategoryText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#51ffc6" />
            <Text style={styles.loadingText}>Loading medicines...</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredMedicines.length} medicine{filteredMedicines.length !== 1 ? 's' : ''} found
            </Text>
            {filteredMedicines.length > 0 ? (
              renderStaggeredLayout()
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No medicines found</Text>
                <Text style={styles.emptySubText}>Try adjusting your search criteria</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Menu */}
      <BottomMenu activeRoute="BuyMedicines" />

      {/* Medicine Details Modal */}
      <MedicineDetails 
        visible={medicineDetailVisible}
        product={selectedMedicine}
        onClose={handleCloseMedicineDetail}
      />

      {/* Loading overlay for medicine details */}
      {loadingMedicineDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#51ffc6" />
          <Text style={styles.loadingOverlayText}>Loading details...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginLeft: 5,
    fontFamily: 'DarkerGrotesque-Bold',
  },
  icon: {
    width: 40,
    height: 40,
  },
  resultsContainer: {
    marginBottom: 100, // Space for bottom menu
  },
  categoriesContainer: {
    marginBottom: 20,
    marginTop: -10,
  },
  categoriesScrollView: {
    paddingVertical: 8,
  },
  categoryTag: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeCategoryTag: {
    backgroundColor: '#51ffc6',
  },
  categoryText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 15,
    color: '#666',
  },
  activeCategoryText: {
    color: '#000',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  resultsText: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    marginTop: 10,
  },
  staggeredContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  column: {
    flex: 1,
  },
  leftColumn: {
    paddingRight: 8,
  },
  rightColumn: {
    paddingLeft: 8,
  },
  cardContainer: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    color: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    color: '#fff',
    marginTop: 10,
  },
});

export default BuyMedicines;
