import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';
import BrandCard from '../components/ui/brands/BrandCard';
import SearchBar from '../components/ui/SearchBar';
import BottomMenu from '../components/ui/BottomMenu';
import BrandsIcon from '../assets/020_Medical_Tag.png';

const Brands = () => {
  const navigation = useNavigation();
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/brands`);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      setBrands(data);
      setFilteredBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      Alert.alert('Error', 'Failed to load brands. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [searchQuery, brands]);

  const handleBrandPress = (brand) => {
    navigation.navigate('BrandDetails', { brand });
  };

  const renderStaggeredLayout = () => {
    const leftColumn = [];
    const rightColumn = [];
    
    filteredBrands.forEach((brand, index) => {
      const isLargeCard = index % 3 === 0; // Every 3rd card is large
      const targetColumn = index % 2 === 0 ? leftColumn : rightColumn;
      
      targetColumn.push(
        <View key={brand.id} style={[
          styles.cardContainer,
          isLargeCard ? styles.largeCardContainer : styles.smallCardContainer
        ]}>
          <BrandCard 
            brand={brand} 
            onPress={handleBrandPress}
            isLarge={isLargeCard}
            showExtraInfo={false}
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
          <Image source={BrandsIcon} style={styles.icon} />
          <Text style={styles.header}>Brands</Text>
        </View>
        
        <SearchBar
          placeholder="Search brands, manufacturers, countries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => console.log('Searching for:', searchQuery)}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#51ffc6" />
            <Text style={styles.loadingText}>Loading brands...</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''} found
            </Text>
            {filteredBrands.length > 0 ? (
              renderStaggeredLayout()
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No brands found</Text>
                <Text style={styles.emptySubText}>Try adjusting your search criteria</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Menu */}
      <BottomMenu activeRoute="Brands" />
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
    paddingTop: 100,
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
    paddingRight: 4,
  },
  rightColumn: {
    paddingLeft: 4,
  },
  cardContainer: {
    width: '100%',
  },
  largeCardContainer: {
    marginBottom: 8, // Reduced from 24 to 8
  },
  smallCardContainer: {
    marginBottom: 8, // Reduced from 16 to 8
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
});

export default Brands;
