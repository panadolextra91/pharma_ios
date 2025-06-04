import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');

const BrandCard = ({ brand, onPress, isLarge = false, showExtraInfo = false }) => {
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        isLarge ? styles.largeCard : styles.smallCard
      ]} 
      onPress={() => onPress && onPress(brand)}
    >
      <View style={[
        styles.logoContainer,
        isLarge ? styles.largeLogo : styles.smallLogo
      ]}>
        <Image 
          source={{ uri: brand.logoUrl || brand.logo }} 
          style={styles.brandLogo} 
          resizeMode="contain"
        />
      </View>
      <Text 
        style={[
          styles.brandName,
          isLarge ? styles.largeBrandName : styles.smallBrandName
        ]} 
        numberOfLines={2} 
        ellipsizeMode="tail"
      >
        {brand.name}
      </Text>
      {showExtraInfo && !isLarge && (
        <View style={styles.extraInfo}>
          <Text style={styles.manufacturer} numberOfLines={1} ellipsizeMode="tail">
            {brand.manufacturer}
          </Text>
          <Text style={styles.medicineCount}>
            {brand.medicineCount} medicine{brand.medicineCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%', // Use full width of the column
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12, // Reduced from 16 to 12
    marginBottom: 8, // Reduced from 16 to 8
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  smallCard: {
    height: 180, // Compact height for small cards
  },
  largeCard: {
    height: 280, // Taller height for featured cards
    elevation: 5, // More prominent shadow
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8, // Reduced from 12 to 8
    marginBottom: 8, // Reduced from 12 to 8
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flex: 1, // Allow logo container to expand in large cards
  },
  smallLogo: {
    height: 120, // Smaller logo for compact cards
    flex: 0, // Don't expand for small cards
  },
  largeLogo: {
    flex: 1, // Expand to fill available space in large cards
    minHeight: 200, // Minimum height for large logos
  },
  brandLogo: {
    width: '100%',
    height: '100%',
    maxWidth: 120,
    maxHeight: 120,
  },
  brandName: {
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  smallBrandName: {
    fontSize: 20, // Smaller text for compact cards
  },
  largeBrandName: {
    fontSize: 20, // Larger text for featured cards
    marginBottom: 4, // Reduced from 8 to 4
  },
  extraInfo: {
    width: '100%',
    alignItems: 'center',
  },
  manufacturer: {
    fontSize: 14,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
    textAlign: 'center',
    marginBottom: 2, // Reduced from 4 to 2
  },
  medicineCount: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#51ffc6',
    textAlign: 'center',
  },
});

export default BrandCard;
