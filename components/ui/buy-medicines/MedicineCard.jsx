import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');

const MedicineCard = ({ medicine, onPress }) => {
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(medicine)}>
      <Image 
        source={{ uri: medicine.imageUrl || medicine.image }} 
        style={styles.medicineImage} 
        resizeMode="contain"
      />
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName} numberOfLines={2} ellipsizeMode="tail">
          {medicine.name}
        </Text>
        <Text style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
          Brand: {medicine.brand_name || medicine.brand}
        </Text>
        <Text style={styles.categoryName} numberOfLines={1} ellipsizeMode="tail">
          Category: {medicine.category_name || medicine.category}
        </Text>
        <Text style={styles.price}>${medicine.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%', // Use full width of the column
    height: 280, // Fixed height for consistent layout
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicineImage: {
    width: '100%',
    height: 140,

  },
  medicineInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  medicineName: {
    fontSize: 20,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
    marginBottom: 1,
    height: 25, // Fixed height for 2 lines
  },
  brandName: {
    fontSize: 18,
    fontFamily: 'DarkerGrotesque',
    color: '#555'
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
    color: '#666',
  },
  price: {
    fontSize: 22,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
});

export default MedicineCard;
