import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Modal, TextInput, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import BottomMenu from '../components/ui/BottomMenu';
import AddNewRecord from '../components/ui/health-records/AddNewRecord';
import AddNewAllergy from '../components/ui/health-records/AddNewAllergy';
import Fontisto from '@expo/vector-icons/Fontisto';
import UpdateBMI from '../components/ui/health-records/UpdateBMI';
import UpdateBloodPressure from '../components/ui/health-records/UpdateBloodPressure';
import UpdateBloodType from '../components/ui/health-records/UpdateBloodType';
import UpdateBMR from '../components/ui/health-records/UpdateBMR';
const { width } = Dimensions.get('window');

const HealthRecords = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showUpdateBMIModal, setShowUpdateBMIModal] = useState(false);
  const [showUpdateBPModal, setShowUpdateBPModal] = useState(false);
  const [showUpdateBloodTypeModal, setShowUpdateBloodTypeModal] = useState(false);
  const [showUpdateBMRModal, setShowUpdateBMRModal] = useState(false);

  const [healthMetrics, setHealthMetrics] = useState({
    bmi: { value: '22.5', category: 'Normal', date: '2024-03-15' },
    bmr: { value: '1800', category: 'High', date: '2024-03-15' },
    bloodPressure: { systolic: '120', diastolic: '80', date: '2024-03-15' },
    bloodType: 'O+',
    allergies: ['Penicillin', 'Pollen', 'Shellfish', 'Dust mites']
  });

  const [records, setRecords] = useState([
    { 
      id: '1', 
      type: 'lab', 
      title: 'Complete Blood Count', 
      date: '2024-03-15', 
      doctor: 'Dr. Sarah Johnson',
      description: 'Hemoglobin: 14.2 g/dL, WBC: 7.5 K/µL'
    },
    { 
      id: '2', 
      type: 'prescription', 
      title: 'Amoxicillin', 
      date: '2024-03-10', 
      doctor: 'Dr. Michael Chen',
      description: '500mg - Take twice daily for 10 days'
    },
    { 
      id: '3', 
      type: 'lab', 
      title: 'Lipid Panel', 
      date: '2024-03-05', 
      doctor: 'Dr. Emily Wilson',
      description: 'Cholesterol: 180 mg/dL, Triglycerides: 120 mg/dL'
    },
    { 
      id: '4', 
      type: 'prescription', 
      title: 'Ibuprofen', 
      date: '2024-03-01', 
      doctor: 'Dr. Michael Chen',
      description: '400mg - Take as needed for pain'
    },
  ]);

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const filteredRecords = activeTab === 'all' 
    ? records 
    : records.filter(record => record.type === activeTab);

  const getIconName = (type) => {
    switch(type) {
      case 'lab': return 'science';
      case 'prescription': return 'medication';
      case 'note': return 'note';
      default: return 'description';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'lab': return 'Lab Results';
      case 'prescription': return 'Prescription';
      case 'note': return 'Doctor\'s Note';
      default: return 'Record';
    }
  };

  const handleAddAllergy = (allergy) => {
    setHealthMetrics(prev => ({
      ...prev,
      allergies: [...prev.allergies, allergy]
    }));
  };

  const handleAddRecord = (newRecord) => {
    // Add the new record to the records state
    setRecords(prev => {
      const updatedRecords = [...prev, newRecord];
      return updatedRecords;
    });
    
    // Close the modal after adding
    setShowRecordModal(false);
  };

  const handleUpdateBP = (data) => {
    setHealthMetrics(prev => ({
      ...prev,
      bloodPressure: {
        systolic: data.systolic,
        diastolic: data.diastolic,
        date: data.date,
        pulse: data.pulse || ''
      }
    }));
  };
  
  // Common function to calculate both BMI and BMR
  const calculateMetrics = (data) => {
    console.log('Calculating metrics with data:', data);
    
    // Replace commas with periods for decimal parsing
    const weightStr = data.weight.replace(',', '.');
    const heightStr = data.height.replace(',', '.');
    
    const weightKg = parseFloat(weightStr);
    const heightM = parseFloat(heightStr);
    
    console.log('Parsed values:', { weightKg, heightM });
    
    // Validate inputs
    if (isNaN(weightKg) || isNaN(heightM) || heightM === 0 || !data.dob || !data.gender) {
      console.log('Invalid inputs, calculation aborted');
      return null;
    }
    
    // Calculate BMI
    const bmi = weightKg / (heightM * heightM);
    const roundedBMI = Math.round(bmi * 10) / 10; // Round to 1 decimal place
    
    // Determine BMI category
    let bmiCategory;
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
    
    // Calculate BMR
    const age = new Date().getFullYear() - parseInt(data.dob.split('-')[0]);
    const heightCm = heightM * 100;
    
    let bmr;
    if (data.gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
    
    bmr = Math.round(bmr);
    
    // Determine BMR category
    let bmrCategory;
    if (data.gender === 'male') {
      if (bmr < 1600) bmrCategory = 'Low';
      else if (bmr > 2200) bmrCategory = 'High';
      else bmrCategory = 'Normal';
    } else {
      if (bmr < 1400) bmrCategory = 'Low';
      else if (bmr > 1800) bmrCategory = 'High';
      else bmrCategory = 'Normal';
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    return {
      bmi: {
        value: roundedBMI.toString(),
        category: bmiCategory,
        date: today
      },
      bmr: {
        value: bmr.toString(),
        category: bmrCategory,
        date: today
      }
    };
  };
  
  const handleUpdateBMI = (data) => {
    console.log('BMI update triggered with data:', data);
    
    const metrics = calculateMetrics(data);
    if (!metrics) return;
    
    setHealthMetrics(prev => {
      const newMetrics = {
        ...prev,
        ...metrics
      };
      console.log('Updated metrics:', newMetrics);
      return newMetrics;
    });
  };
  
  const handleUpdateBloodType = (bloodType) => {
    setHealthMetrics(prev => ({
      ...prev,
      bloodType: bloodType
    }));
  };
  
  const handleUpdateBMR = (data) => {
    console.log('BMR update triggered with data:', data);
    
    const metrics = calculateMetrics(data);
    if (!metrics) return;
    
    setHealthMetrics(prev => {
      const newMetrics = {
        ...prev,
        ...metrics
      };
      console.log('Updated metrics:', newMetrics);
      return newMetrics;
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Image source={require('../assets/Records.png')} style={styles.icon} />
          <Text style={styles.header}>Health Records</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll} contentContainerStyle={styles.metricsContainer}>
          <TouchableOpacity onPress={() => setShowUpdateBMIModal(true)} activeOpacity={0.8}>
            <View style={styles.metricCard}>
              <MaterialIcons name="monitor-weight" size={24} color="#51ffb4" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={1}/>
              <Text style={styles.metricTitle}>BMI</Text>
              <Text style={styles.metricValue}>{healthMetrics.bmi.value}</Text>
              <Text style={styles.metricSubtext}>{healthMetrics.bmi.category}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowUpdateBPModal(true)} activeOpacity={0.8}>
            <View style={styles.metricCard}>
              <MaterialIcons name="favorite" size={24} color="#51ffb4" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={1}/>
              <Text style={styles.metricTitle}>Blood Pressure</Text>
              <Text style={styles.metricValue}>{healthMetrics.bloodPressure.systolic}/{healthMetrics.bloodPressure.diastolic}</Text>
              <Text style={styles.metricSubtext}>{healthMetrics.bloodPressure.date}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowUpdateBloodTypeModal(true)} activeOpacity={0.8}>
            <View style={styles.metricCard}>
              <MaterialIcons name="bloodtype" size={24} color="#51ffb4" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={1}/>
              <Text style={styles.metricTitle}>Blood Type</Text>
              <Text style={styles.metricValue}>{healthMetrics.bloodType}</Text>
              <Text style={styles.metricSubtext}>{healthMetrics.bloodType.includes('O-') ? 'Universal donor' : healthMetrics.bloodType.includes('AB+') ? 'Universal recipient' : ''}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowUpdateBMRModal(true)} activeOpacity={0.8}>
            <View style={styles.metricCard}>
              <Fontisto name="fire" size={24} color="#51ffb4" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={1}/>
              <Text style={styles.metricTitle}>BMR</Text>
              <Text style={styles.metricValue}>{healthMetrics.bmr.value}</Text>
              <Text style={styles.metricSubtext}>{healthMetrics.bmr.category}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.sectionTitle}>Allergies</Text>
        <View style={styles.allergiesContainer}>
          <View style={styles.allergiesList}>
            {healthMetrics.allergies.map((allergy, index) => (
              <View key={index} style={styles.allergyTag}>
                <Text style={styles.allergyText}>{allergy}</Text>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.addAllergyButton} 
              onPress={() => setShowAllergyModal(true)}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Clinical Summary</Text>
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollView}
          >
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'lab' && styles.activeTab]} 
              onPress={() => setActiveTab('lab')}
            >
              <Text style={[styles.tabText, activeTab === 'lab' && styles.activeTabText]}>Labs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'prescription' && styles.activeTab]} 
              onPress={() => setActiveTab('prescription')}
            >
              <Text style={[styles.tabText, activeTab === 'prescription' && styles.activeTabText]}>Prescriptions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'note' && styles.activeTab]} 
              onPress={() => setActiveTab('note')}
            >
              <Text style={[styles.tabText, activeTab === 'note' && styles.activeTabText]}>Notes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <View style={styles.recordsContainer}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordIcon}>
                  <MaterialIcons name={getIconName(record.type)} size={24} color="#51ffb4" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={1}/>
                </View>
                <View style={styles.recordInfo}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDate}>{new Date(record.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.recordDoctor}>{record.doctor}</Text>
                  <Text style={styles.recordDescription} numberOfLines={1}>
                    {record.description}
                  </Text>
                  <View style={styles.recordType}>
                    <Text style={styles.recordTypeText}>{getTypeLabel(record.type)}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="folder-open" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>No records found</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.addButton} onPress={() => setShowRecordModal(true)}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
      
      <BottomMenu activeRoute="HealthRecords" />

      <AddNewAllergy
        visible={showAllergyModal}
        onClose={() => setShowAllergyModal(false)}
        onAdd={handleAddAllergy}
      />

      <AddNewRecord 
        visible={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onAdd={handleAddRecord}
      />

      <UpdateBMI 
        visible={showUpdateBMIModal}
        onClose={() => setShowUpdateBMIModal(false)}
        onUpdate={handleUpdateBMI}
      />

      <UpdateBloodPressure
        visible={showUpdateBPModal}
        onClose={() => setShowUpdateBPModal(false)}
        onUpdate={handleUpdateBP}
      />
      
      <UpdateBloodType
        visible={showUpdateBloodTypeModal}
        onClose={() => setShowUpdateBloodTypeModal(false)}
        onUpdate={handleUpdateBloodType}
      />
      
      <UpdateBMR
        visible={showUpdateBMRModal}
        onClose={() => setShowUpdateBMRModal(false)}
        onUpdate={handleUpdateBMR}
      />
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
    marginRight: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
  tabsContainer: {
    marginBottom: 20,
    //backgroundColor: 'green',
    marginTop: -10,
  },
  tabsScrollView: {
    paddingVertical: 8,
  },
  tab: {
    //paddingVertical: 8,
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'white',
  },
  activeTab: {
    backgroundColor: '#51ffc6',
  },
  tabText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  recordsContainer: {
    paddingBottom: 100,
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8faf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  recordInfo: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recordTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    color: '#333',
  },
  recordDate: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 12,
    color: '#666',
  },
  recordDoctor: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recordDescription: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  recordType: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8faf4',
    borderRadius: 12,
    paddingBottom: 8,
    paddingTop: 4,
    paddingHorizontal: 10,
  },
  recordTypeText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 12,
    color: '#0a7c53',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 28,
    backgroundColor: '#51ffc6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  metricsScroll: {
    marginBottom: 20,
    //backgroundColor: 'red',
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    //backgroundColor: 'blue',
    height: 130,
  },
  metricCard: {
    width: 140,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricTitle: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 15,
    color: '#666',
    marginTop: 8,
  },
  metricValue: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 20,
    color: '#333',
    marginTop: 4,
  },
  metricSubtext: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  allergiesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    //backgroundColor: 'green',
    fontSize: 22,
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyTag: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingTop: 7,
    paddingBottom: 8,
    paddingHorizontal: 15,
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
  },
  metricIcon: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalAddButton: {
    backgroundColor: '#51ffc6',
  },
  modalButtonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    textAlign: 'center',
    color: '#666',

  },
  addButtonText: {
    color: '#000',
    marginBottom: 5,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#51ffb4',
  },
  selectedType: {
    backgroundColor: '#51ffb4',
  },
  typeText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#51ffb4',
    marginTop: 5,
  },
  selectedTypeText: {
    color: 'white',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});

export default HealthRecords;