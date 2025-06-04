import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const PharmacyCard = ({ pharmacy }) => {
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.pharmacyCard}>
      <View style={styles.pharmacyHeader}>
        <View>
          <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <MaterialIcons 
                key={i} 
                name="star" 
                size={16} 
                color={i < Math.floor(pharmacy.rating) ? '#FFD700' : '#e0e0e0'} 
              />
            ))}
            <Text style={styles.ratingText}>{pharmacy.rating}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, pharmacy.isOpen ? styles.openBadge : styles.closedBadge]}>
          <Text style={styles.statusText}>{pharmacy.isOpen ? 'Open' : 'Closed'}</Text>
        </View>
      </View>
      
      <View style={styles.pharmacyDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={18} color="#666" />
          <Text style={styles.detailText}>{pharmacy.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="phone" size={18} color="#666" />
          <Text style={styles.detailText}>{pharmacy.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={18} color="#666" />
          <Text style={styles.detailText}>{pharmacy.hours}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="directions" size={18} color="#666" />
          <Text style={styles.detailText}>{pharmacy.distance}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="directions" size={20} color="#51ffc6" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="phone" size={20} color="#51ffc6" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="shopping-cart" size={20} color="#51ffc6" />
          <Text style={styles.actionButtonText}>Order</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pharmacyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pharmacyName: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: '#e8faf4',
  },
  closedBadge: {
    backgroundColor: '#ffe8e8',
  },
  statusText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 14,
    color: '#333',
  },
  pharmacyDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionButtonText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default PharmacyCard;
