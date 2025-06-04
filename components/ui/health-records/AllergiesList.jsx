import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AllergiesList = ({ allergies, onDeleteAllergy, onAddAllergy }) => {
  return (
    <View style={styles.allergiesContainer}>
      <Text style={styles.sectionTitle}>Allergies</Text>
      <View style={styles.allergiesList}>
        {allergies && allergies.length > 0 ? (
          allergies.map((allergy) => (
            <View key={allergy.id} style={styles.allergyTag}>
              <Text style={styles.allergyText}>{allergy.name}</Text>
              <TouchableOpacity 
                style={styles.deleteAllergyButton}
                onPress={() => onDeleteAllergy(allergy.id, allergy.name)}
              >
                <MaterialIcons name="close" size={12} color="#666" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noAllergiesText}>No known allergies</Text>
        )}
        
        <TouchableOpacity 
          style={styles.addAllergyButton}
          onPress={onAddAllergy}
        >
          <MaterialIcons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  allergiesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 22,
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingTop: 7,
    paddingBottom: 8,
    paddingLeft: 15,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  allergyText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  deleteAllergyButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAllergyButton: {
    backgroundColor: '#51ffc6',
    borderRadius: 20,
    paddingTop: 7,
    paddingBottom: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  noAllergiesText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
    marginRight: 8,
  },
});

export default AllergiesList; 