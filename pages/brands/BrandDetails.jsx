import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BrandDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { brand } = route.params;

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Extract first line as title and rest as description
  const getDescriptionParts = () => {
    if (!brand.description) return { title: null, content: null };
    
    const lines = brand.description.split('\n');
    const title = lines[0];
    const content = lines.slice(1).join('\n').trim();
    
    return { title, content };
  };

  const { title: descriptionTitle, content: descriptionContent } = getDescriptionParts();

  // Calculate medicine count from medicines array
  const medicineCount = brand.medicines ? brand.medicines.length : (brand.medicineCount || 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Image - Brand Logo as Hero */}
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: brand.logoUrl || brand.logo }} 
            style={styles.headerImage} 
            resizeMode="contain"
          />
        </View>
        
        {/* Floating Back Button */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Brand Category/Type Tag */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>Pharmaceutical Brand</Text>
          </View>
          
          {/* Brand Name */}
          <Text style={styles.title}>{brand.name}</Text>
          
          {/* Meta Info */}
          <View style={styles.metaInfo}>
            <Text style={styles.manufacturer}>{brand.manufacturer}</Text>
            <Text style={styles.country}>{brand.country}</Text>
          </View>
          
          {/* Brand Information */}
          <View style={styles.infoSection}>
            {descriptionTitle && (
              <View>
                <Text style={styles.descriptionTitle}>{descriptionTitle}</Text>
                <Text style={styles.description}>{descriptionContent}</Text>
              </View>
            )}
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Manufacturer</Text>
                <Text style={styles.infoValue}>{brand.manufacturer}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Country of Origin</Text>
                <Text style={styles.infoValue}>{brand.country}</Text>
              </View>
              
              {medicineCount > 0 && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Available Medicines</Text>
                  <Text style={styles.infoValue}>{medicineCount} product{medicineCount !== 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Action Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.viewMedicinesButton}
              onPress={() => {
                navigation.navigate('BuyMedicines', { searchQuery: brand.name });
              }}
            >
              <MaterialIcons name="medical-services" size={20} color="#000" />
              <Text style={styles.buttonText}>View {brand.name} Medicines</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 18,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  headerImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '80%',
    height: '80%',
    maxWidth: 250,
    maxHeight: 250,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  categoryTag: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 32,
    color: '#333',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  manufacturer: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
    marginRight: 16,
  },
  country: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    marginBottom: 30,
  },
  descriptionTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 25,
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    marginBottom: 20,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#51ffc6',
  },
  infoLabel: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 18,
    color: '#333',
  },
  actionSection: {
    marginBottom: 30,
  },
  viewMedicinesButton: {
    backgroundColor: '#51ffc6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#000',
    marginLeft: 8,
  },
});

export default BrandDetails;
