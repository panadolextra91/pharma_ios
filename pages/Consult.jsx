import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { RECOMMENDATION_API_URL, API_URL } from '../config';
import ConsultIcon from '../assets/050_Medical_Chat.png';
import MedicineCard from '../components/ui/buy-medicines/MedicineCard';
import MedicineDetails from '../components/ui/order/MedicineDetails';

const Consult = ({ navigation }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendedMedicines, setRecommendedMedicines] = useState({});
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineDetailVisible, setMedicineDetailVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  // Symptoms dictionary from the Flask API - exact match with backend
  const symptoms = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
    'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue',
    'vomiting', 'burning_micturition', 'spotting_ urination', 'fatigue', 'anxiety',
    'weight_loss', 'lethargy', 'cough', 'high_fever', 'sunken_eyes',
    'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache',
    'nausea', 'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'diarrhoea',
    'mild_fever', 'yellowing_of_eyes', 'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision',
    'phlegm', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'neck_pain',
    'dizziness', 'excessive_hunger', 'drying_and_tingling_lips', 'slurred_speech', 'stiff_neck',
    'loss_of_balance', 'bladder_discomfort', 'foul_smell_of urine', 'continuous_feel_of_urine', 'depression',
    'irritability', 'muscle_pain', 'red_spots_over_body', 'dischromic _patches', 'watering_from_eyes',
    'rusty_sputum', 'visual_disturbances', 'blood_in_sputum', 'palpitations', 'pus_filled_pimples',
    'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails',
    'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
  ];

  // Group symptoms by category while maintaining original order
  const symptomGroups = {
    'Skin & External': [
      'itching', 'skin_rash', 'nodal_skin_eruptions', 'red_spots_over_body', 'dischromic _patches',
      'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting',
      'small_dents_in_nails', 'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
    ],
    'Respiratory': [
      'continuous_sneezing', 'cough', 'breathlessness', 'phlegm', 'rusty_sputum', 'blood_in_sputum'
    ],
    'Digestive': [
      'stomach_pain', 'acidity', 'ulcers_on_tongue', 'vomiting', 'indigestion', 'nausea',
      'loss_of_appetite', 'diarrhoea'
    ],
    'Fever & General': [
      'shivering', 'chills', 'high_fever', 'mild_fever', 'sweating', 'fatigue', 'lethargy',
      'weight_loss', 'dehydration', 'malaise'
    ],
    'Pain & Discomfort': [
      'joint_pain', 'headache', 'pain_behind_the_eyes', 'back_pain', 'chest_pain', 'neck_pain',
      'muscle_pain'
    ],
    'Urinary': [
      'burning_micturition', 'spotting_ urination', 'bladder_discomfort', 'foul_smell_of urine',
      'continuous_feel_of_urine'
    ],
    'Eyes & Vision': [
      'sunken_eyes', 'yellowing_of_eyes', 'blurred_and_distorted_vision', 'watering_from_eyes',
      'visual_disturbances'
    ],
    'Neurological': [
      'anxiety', 'dizziness', 'drying_and_tingling_lips', 'slurred_speech', 'stiff_neck',
      'loss_of_balance', 'depression', 'irritability', 'weakness_in_limbs'
    ],
    'Cardiovascular': [
      'fast_heart_rate', 'palpitations'
    ],
    'Other': [
      'excessive_hunger', 'swelled_lymph_nodes'
    ]
  };

  // Format symptom names for display
  const formatSymptomName = (symptom) => {
    return symptom
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Toggle symptom selection
  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedSymptoms([]);
    setRecommendations(null);
    setRecommendedMedicines({});
  };

  // Handle medicine card press
  const handleMedicinePress = (medicine) => {
    setSelectedMedicine(medicine);
    setMedicineDetailVisible(true);
  };

  // Handle closing medicine detail modal
  const handleCloseMedicineDetail = () => {
    setMedicineDetailVisible(false);
    setSelectedMedicine(null);
  };

  // Get recommendations from API
  const getRecommendations = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms Selected', 'Please select at least one symptom to get recommendations.');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Sending symptoms to API:', selectedSymptoms);
      console.log('API URL:', RECOMMENDATION_API_URL);
      
      const response = await fetch(RECOMMENDATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let data;
      try {
        // Fix NaN values in the response before parsing
        const cleanedResponse = responseText.replace(/,NaN/g, ',null').replace(/NaN,/g, 'null,').replace(/NaN/g, 'null');
        console.log('Cleaned response text:', cleanedResponse);
        data = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Response that failed to parse:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Parsed response data:', data);
      setRecommendations(data);
      
      // Fetch recommended medicines if medications are available
      if (data.medications && data.medications.length > 0) {
        await fetchRecommendedMedicines(data.medications);
      }
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      Alert.alert('Error', `Failed to get recommendations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Parse array strings from API response
  const parseArrayString = (arrayString) => {
    if (typeof arrayString === 'string') {
      try {
        // Remove brackets and quotes, then split by comma
        const cleaned = arrayString.replace(/[\[\]']/g, '');
        return cleaned.split(',').map(item => item.trim()).filter(item => item);
      } catch (error) {
        return [arrayString];
      }
    }
    return Array.isArray(arrayString) ? arrayString : [arrayString];
  };

  // Capitalize first letter of each sentence
  const capitalizeFirstLetter = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Fetch medicines by category
  const fetchMedicinesByCategory = async (category) => {
    try {
      const response = await fetch(`${API_URL}/medicines`);
      if (!response.ok) {
        throw new Error('Failed to fetch medicines');
      }
      const medicines = await response.json();
      
      // Filter medicines by category (case insensitive)
      const filteredMedicines = medicines.filter(medicine => 
        medicine.category_name && 
        medicine.category_name.toLowerCase().includes(category.toLowerCase())
      );
      
      // Return first 3 medicines
      return filteredMedicines.slice(0, 3);
    } catch (error) {
      console.error('Error fetching medicines for category:', category, error);
      return [];
    }
  };

  // Fetch recommended medicines for all medication categories
  const fetchRecommendedMedicines = async (medications) => {
    try {
      setLoadingMedicines(true);
      const medicinesByCategory = {};
      
      for (const med of medications) {
        const medicationCategories = parseArrayString(med);
        
        for (const category of medicationCategories) {
          if (category && !medicinesByCategory[category]) {
            const medicines = await fetchMedicinesByCategory(category);
            if (medicines.length > 0) {
              medicinesByCategory[category] = medicines;
            }
          }
        }
      }
      
      setRecommendedMedicines(medicinesByCategory);
    } catch (error) {
      console.error('Error fetching recommended medicines:', error);
    } finally {
      setLoadingMedicines(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image source={ConsultIcon} style={styles.icon} />
        <Text style={styles.header}>Health Consultation</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearSelections}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <MaterialCommunityIcons name="information" size={24} color="#51ffc6" />
          <Text style={styles.instructionsText}>
            Select the symptoms you are experiencing to get personalized health recommendations.
          </Text>
        </View>

        {/* Selected Count */}
        {selectedSymptoms.length > 0 && (
          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>
              {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {/* Symptoms Grid */}
        <View style={styles.symptomsContainer}>
          <Text style={styles.sectionTitle}>Select Your Symptoms</Text>
          
          {Object.entries(symptomGroups).map(([groupName, groupSymptoms]) => (
            <View key={groupName} style={styles.symptomGroup}>
              <Text style={styles.groupTitle}>{groupName}</Text>
              <View style={styles.symptomsGrid}>
                {groupSymptoms.map((symptom, index) => (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.symptomCard,
                      selectedSymptoms.includes(symptom) && styles.selectedSymptomCard
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <View style={styles.symptomContent}>
                      <MaterialCommunityIcons
                        name={selectedSymptoms.includes(symptom) ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={20}
                        color={selectedSymptoms.includes(symptom) ? "#51ffc6" : "#666"}
                      />
                      <Text style={[
                        styles.symptomText,
                        selectedSymptoms.includes(symptom) && styles.selectedSymptomText
                      ]}>
                        {formatSymptomName(symptom)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Get Recommendations Button */}
        <TouchableOpacity
          style={[
            styles.recommendButton,
            selectedSymptoms.length === 0 && styles.disabledButton
          ]}
          onPress={getRecommendations}
          disabled={loading || selectedSymptoms.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#333" />
          ) : (
            <>
              <MaterialCommunityIcons name="medical-bag" size={20} color="#333" />
              <Text style={styles.recommendButtonText}>Get Recommendations</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Recommendations Display */}
        {recommendations && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Health Recommendations</Text>
            
            {/* Medications */}
            {recommendations.medications && recommendations.medications.length > 0 && (
              <View style={styles.recommendationSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="pill" size={20} color="#51ffc6" />
                  <Text style={styles.sectionHeaderText}>Medications</Text>
                </View>
                {recommendations.medications.map((med, index) => {
                  const medications = parseArrayString(med);
                  return medications.map((medication, medIndex) => (
                    <View key={`${index}-${medIndex}`}>
                      <View style={styles.recommendationItem}>
                        <Text style={styles.recommendationText}>• {medication}</Text>
                      </View>
                      
                      {/* Display medicine cards for this category */}
                      {recommendedMedicines[medication] && recommendedMedicines[medication].length > 0 && (
                        <View style={styles.medicineCardsContainer}>
                          <Text style={styles.medicineCardsTitle}>Available {medication} medicines:</Text>
                          {loadingMedicines ? (
                            <View style={styles.medicineLoadingContainer}>
                              <ActivityIndicator size="small" color="#51ffc6" />
                              <Text style={styles.medicineLoadingText}>Loading medicines...</Text>
                            </View>
                          ) : (
                            <ScrollView 
                              horizontal 
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.medicineCardsScrollView}
                            >
                              {recommendedMedicines[medication].map((medicine, cardIndex) => (
                                <View key={medicine.id} style={styles.medicineCardWrapper}>
                                  <MedicineCard 
                                    medicine={medicine} 
                                    onPress={handleMedicinePress}
                                  />
                                </View>
                              ))}
                            </ScrollView>
                          )}
                        </View>
                      )}
                    </View>
                  ));
                })}
              </View>
            )}

            {/* Precautions */}
            {recommendations.precautions && recommendations.precautions.length > 0 && (
              <View style={styles.recommendationSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="shield-alert" size={20} color="#ff6b6b" />
                  <Text style={styles.sectionHeaderText}>Precautions</Text>
                </View>
                {recommendations.precautions.filter(precaution => precaution && precaution !== 'NaN' && precaution !== null).map((precaution, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationText}>• {capitalizeFirstLetter(precaution)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Diets */}
            {recommendations.diets && recommendations.diets.length > 0 && (
              <View style={styles.recommendationSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="food-apple" size={20} color="#4ecdc4" />
                  <Text style={styles.sectionHeaderText}>Recommended Diet</Text>
                </View>
                {recommendations.diets.map((diet, index) => {
                  const diets = parseArrayString(diet);
                  return diets.map((dietItem, dietIndex) => (
                    <View key={`${index}-${dietIndex}`} style={styles.recommendationItem}>
                      <Text style={styles.recommendationText}>• {dietItem}</Text>
                    </View>
                  ));
                })}
              </View>
            )}

            {/* Workouts */}
            {recommendations.workouts && recommendations.workouts.length > 0 && (
              <View style={styles.recommendationSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={20} color="#ffa726" />
                  <Text style={styles.sectionHeaderText}>Lifestyle & Exercise</Text>
                </View>
                {recommendations.workouts.map((workout, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationText}>• {workout}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#ff6b6b" />
              <Text style={styles.disclaimerText}>
                This is for informational purposes only. Please consult with a healthcare professional for proper medical advice.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Medicine Details Modal */}
      <MedicineDetails 
        visible={medicineDetailVisible}
        product={selectedMedicine}
        onClose={handleCloseMedicineDetail}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  icon: {
    width: 50,
    height: 50,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    flex: 1,
    marginLeft: 5,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 15,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  instructionsText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginLeft: 12,
    lineHeight: 22,
  },
  selectedCount: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginHorizontal: 16,
  },
  selectedCountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  symptomsContainer: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 16,
  },
  symptomGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 12,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: '48%',
    maxWidth: '48%',
  },
  selectedSymptomCard: {
    borderColor: '#51ffc6',
    backgroundColor: '#f0fff4',
  },
  symptomContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomText: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginLeft: 8,
    flex: 1,
  },
  selectedSymptomText: {
    color: '#333',
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  recommendButton: {
    backgroundColor: '#51ffc6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  recommendButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 8,
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  recommendationsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  recommendationSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 8,
  },
  recommendationItem: {
    paddingVertical: 4,
  },
  recommendationText: {
    fontSize: 18,
    color: '#555',
    fontFamily: 'DarkerGrotesque',
    lineHeight: 22,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    marginTop: 10,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  medicineCardsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  medicineCardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 10,
  },
  medicineLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  medicineLoadingText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
    marginLeft: 10,
  },
  medicineCardsScrollView: {
    paddingHorizontal: 10,
  },
  medicineCardWrapper: {
    marginRight: 10,
  },
});

export default Consult;
