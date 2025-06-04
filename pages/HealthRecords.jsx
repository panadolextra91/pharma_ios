import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Modal, TextInput, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import BottomMenu from '../components/ui/BottomMenu';
import AddNewRecord from '../components/ui/health-records/AddNewRecord';
import AddNewAllergy from '../components/ui/health-records/AddNewAllergy';
import MetricsCard from '../components/ui/health-records/MetricsCard';
import AllergiesList from '../components/ui/health-records/AllergiesList';
import RecordCard from '../components/ui/health-records/RecordCard';
import Fontisto from '@expo/vector-icons/Fontisto';
import UpdateBMI from '../components/ui/health-records/UpdateBMI';
import UpdateBloodPressure from '../components/ui/health-records/UpdateBloodPressure';
import UpdateBloodType from '../components/ui/health-records/UpdateBloodType';
import UpdateBMR from '../components/ui/health-records/UpdateBMR';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HealthRecords = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showUpdateBMIModal, setShowUpdateBMIModal] = useState(false);
  const [showUpdateBPModal, setShowUpdateBPModal] = useState(false);
  const [showUpdateBloodTypeModal, setShowUpdateBloodTypeModal] = useState(false);
  const [showUpdateBMRModal, setShowUpdateBMRModal] = useState(false);
  
  // Loading and refresh states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [uploadingRecord, setUploadingRecord] = useState(false);

  // Data states
  const [healthMetrics, setHealthMetrics] = useState({
    bmi: { value: 'N/A', category: 'Unknown', date: null },
    bmr: { value: 'N/A', category: 'Unknown', date: null },
    bloodPressure: { systolic: 'N/A', diastolic: 'N/A', date: null },
    bloodType: 'Unknown',
    allergies: []
  });

  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]); // Store all records for filtering
  const [rawHealthData, setRawHealthData] = useState(null); // Store raw data from backend

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  // Fetch health metrics from backend
  const fetchHealthMetrics = async () => {
    if (!user?.token || !user?.id) return;

    try {
      console.log('🏥 Fetching health metrics for customer:', user.id);
      
      const response = await fetch(`${API_URL}/health-metrics/customer/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Health metrics fetched successfully:', data);
        
        // Update health metrics state
        setHealthMetrics(prev => ({
          ...prev,
          bmi: {
            value: data.bmi ? data.bmi.toString() : 'N/A',
            category: getBMICategory(data.bmi),
            date: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : null
          },
          bmr: {
            value: data.bmr ? data.bmr.toString() : 'N/A',
            category: getBMRCategory(data.bmr, data.gender),
            date: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : null
          },
          bloodPressure: {
            systolic: data.blood_pressure_systolic || 'N/A',
            diastolic: data.blood_pressure_diastolic || 'N/A',
            date: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : null
          },
          bloodType: data.blood_type || 'Unknown'
        }));
        setRawHealthData(data);
      } else {
        console.log('ℹ️ No health metrics found for customer');
        // Keep default values if no metrics found
      }
    } catch (error) {
      console.error('❌ Error fetching health metrics:', error);
    }
  };

  // Fetch allergies from backend
  const fetchAllergies = async () => {
    if (!user?.token) return;

    try {
      console.log('🤧 Fetching allergies for customer:', user.id);
      
      const response = await fetch(`${API_URL}/allergies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        console.log('✅ Allergies fetched successfully:', result.data);
        
        // Store full allergy objects for delete operations
        setHealthMetrics(prev => ({
          ...prev,
          allergies: result.data
        }));
      } else {
        console.log('ℹ️ No allergies found for customer');
      }
    } catch (error) {
      console.error('❌ Error fetching allergies:', error);
    }
  };

  // Delete allergy
  const deleteAllergy = async (allergyId) => {
    if (!user?.token) return false;

    try {
      console.log('🗑️ Deleting allergy:', allergyId);

      const response = await fetch(`${API_URL}/allergies/${allergyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        console.log('✅ Allergy deleted successfully');
        
        // Refresh allergies
        await fetchAllergies();
        return true;
      } else {
        console.error('❌ Failed to delete allergy:', result.message);
        Alert.alert('Error', result.message || 'Failed to delete allergy');
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting allergy:', error);
      Alert.alert('Error', 'Failed to delete allergy. Please try again.');
      return false;
    }
  };

  // Fetch health records from backend
  const fetchHealthRecords = async () => {
    if (!user?.token || !user?.id) return;

    try {
      console.log('📋 Fetching health records for customer:', user.id);
      
      const response = await fetch(`${API_URL}/health-records/customer/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Health records fetched successfully:', data.length, 'records');
        
        // Transform backend data to match frontend format
        const transformedRecords = data.map(record => ({
          id: record.id.toString(),
          type: getFrontendRecordType(record.record_type),
          title: record.title,
          date: record.date_recorded,
          doctor: record.provider_name || 'Unknown Provider',
          description: record.description || 'No description available',
          fileUrl: record.fileUrl || null
        }));

        setAllRecords(transformedRecords);
        setRecords(transformedRecords);
      } else {
        console.log('ℹ️ No health records found for customer');
        setAllRecords([]);
        setRecords([]);
      }
    } catch (error) {
      console.error('❌ Error fetching health records:', error);
      Alert.alert('Error', 'Failed to load health records. Please try again.');
    }
  };

  // Fetch health records by type from backend
  const fetchHealthRecordsByType = async (recordType) => {
    if (!user?.token) return;

    try {
      console.log('📋 Fetching health records by type:', recordType);
      
      const response = await fetch(`${API_URL}/health-records/type/${recordType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Health records by type fetched successfully:', data.length, 'records');
        
        // Transform backend data to match frontend format
        const transformedRecords = data.map(record => ({
          id: record.id.toString(),
          type: getFrontendRecordType(record.record_type),
          title: record.title,
          date: record.date_recorded,
          doctor: record.provider_name || 'Unknown Provider',
          description: record.description || 'No description available',
          fileUrl: record.fileUrl || null
        }));

        setRecords(transformedRecords);
      } else {
        console.log('ℹ️ No health records found for type:', recordType);
        setRecords([]);
      }
    } catch (error) {
      console.error('❌ Error fetching health records by type:', error);
      Alert.alert('Error', 'Failed to load health records. Please try again.');
    }
  };

  // Map frontend tab values to backend record types
  const getBackendRecordType = (tabType) => {
    switch(tabType) {
      case 'lab': return 'LAB_RESULT';
      case 'prescription': return 'PRESCRIPTION';
      case 'note': return 'DOCTOR_NOTE';
      default: return null;
    }
  };

  // Map backend record types to frontend display types
  const getFrontendRecordType = (backendType) => {
    switch(backendType) {
      case 'LAB_RESULT': return 'lab';
      case 'PRESCRIPTION': return 'prescription';
      case 'DOCTOR_NOTE': return 'note';
      default: return 'unknown';
    }
  };

  // Create new health record with file upload
  const createHealthRecord = async (recordData, file = null) => {
    if (!user?.token || !user?.id) return false;

    try {
      setUploadingRecord(true);
      console.log('📋 Creating health record:', recordData);

      const backendRecordType = getBackendRecordType(recordData.type);
      if (!backendRecordType) {
        Alert.alert('Error', 'Invalid record type selected.');
        setUploadingRecord(false);
        return false;
      }

      const formData = new FormData();
      formData.append('customer_id', user.id.toString());
      formData.append('record_type', backendRecordType);
      formData.append('title', recordData.title);
      formData.append('description', recordData.description || '');
      formData.append('provider_name', recordData.doctor || '');
      formData.append('date_recorded', recordData.date || new Date().toISOString().split('T')[0]);

      if (file) {
        console.log('📎 Adding file to form data:', file.name);
        formData.append('file', {
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
        });
      }

      const response = await fetch(`${API_URL}/health-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Health record created successfully:', data);
        
        // Refresh records
        await fetchHealthRecords();
        return true;
      } else {
        console.error('❌ Failed to create health record:', data.error);
        Alert.alert('Error', data.error || 'Failed to create health record');
        return false;
      }
    } catch (error) {
      console.error('❌ Error creating health record:', error);
      Alert.alert('Error', 'Failed to create health record. Please try again.');
      return false;
    } finally {
      setUploadingRecord(false);
    }
  };

  // Helper functions for categorizing metrics
  const getBMICategory = (bmi) => {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMRCategory = (bmr, gender) => {
    if (!bmr) return 'Unknown';
    if (gender === 'MALE') {
      if (bmr < 1600) return 'Low';
      if (bmr > 2200) return 'High';
      return 'Normal';
    } else {
      if (bmr < 1400) return 'Low';
      if (bmr > 1800) return 'High';
      return 'Normal';
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchHealthMetrics(),
        fetchAllergies(),
        fetchHealthRecords()
      ]);
      setLoading(false);
    };

    if (user?.token && user?.id) {
      initializeData();
    }
  }, [user]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchHealthMetrics(),
      fetchAllergies(),
      fetchHealthRecords()
    ]);
    setRefreshing(false);
  };

  // Handle tab change for record filtering
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    
    if (newTab === 'all') {
      // Show all records that were fetched initially
      setRecords(allRecords);
    } else {
      // Fetch records for specific type
      const backendType = getBackendRecordType(newTab);
      if (backendType) {
        fetchHealthRecordsByType(backendType);
      }
    }
  };

  // Update health metrics via API
  const updateHealthMetrics = async (metricsData) => {
    if (!user?.token || !user?.id) return false;

    try {
      setMetricsLoading(true);
      console.log('📊 Updating health metrics:', metricsData);

      const response = await fetch(`${API_URL}/health-metrics/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          customer_id: user.id,
          ...metricsData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Health metrics updated successfully:', data);
        
        // Refresh metrics data
        await fetchHealthMetrics();
        return true;
      } else {
        console.error('❌ Failed to update health metrics:', data.error);
        Alert.alert('Error', data.error || 'Failed to update health metrics');
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating health metrics:', error);
      Alert.alert('Error', 'Failed to update health metrics. Please try again.');
      return false;
    } finally {
      setMetricsLoading(false);
    }
  };

  // Add new allergy via API
  const addAllergy = async (allergyName) => {
    if (!user?.token || !user?.id) return false;

    try {
      console.log('🤧 Adding new allergy:', allergyName);

      const response = await fetch(`${API_URL}/allergies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: allergyName,
          description: `Allergy to ${allergyName}`,
          customer_id: user.id
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        console.log('✅ Allergy added successfully:', result.data);
        
        // Refresh allergies
        await fetchAllergies();
        return true;
      } else {
        console.error('❌ Failed to add allergy:', result.message);
        Alert.alert('Error', result.message || 'Failed to add allergy');
        return false;
      }
    } catch (error) {
      console.error('❌ Error adding allergy:', error);
      Alert.alert('Error', 'Failed to add allergy. Please try again.');
      return false;
    }
  };

  // Event handlers
  const handleAddAllergy = async (allergy) => {
    const success = await addAllergy(allergy);
    if (success) {
      setShowAllergyModal(false);
    }
  };

  const handleDeleteAllergy = (allergyId, allergyName) => {
    Alert.alert(
      'Delete Allergy',
      `Are you sure you want to delete "${allergyName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteAllergy(allergyId)
        }
      ]
    );
  };

  const handleAddRecord = async (recordData, file) => {
    const success = await createHealthRecord(recordData, file);
    if (success) {
      setShowRecordModal(false);
    }
  };

  const handleUpdateBMI = async (data) => {
    console.log('📊 BMI update triggered with data:', data);
    
    const metricsData = {
      weight: parseFloat(data.weight.replace(',', '.')),
      height: parseFloat(data.height.replace(',', '.')),
      gender: data.gender?.toUpperCase(),
      date_of_birth: data.dob
    };

    const success = await updateHealthMetrics(metricsData);
    if (success) {
      setShowUpdateBMIModal(false);
    }
  };

  const handleUpdateBP = async (data) => {
    console.log('🩺 Blood pressure update triggered with data:', data);
    
    const metricsData = {
      blood_pressure_systolic: parseInt(data.systolic),
      blood_pressure_diastolic: parseInt(data.diastolic)
    };

    const success = await updateHealthMetrics(metricsData);
    if (success) {
      setShowUpdateBPModal(false);
    }
  };

  const handleUpdateBloodType = async (bloodType) => {
    console.log('🩸 Blood type update triggered:', bloodType);
    
    const metricsData = {
      blood_type: bloodType
    };

    const success = await updateHealthMetrics(metricsData);
    if (success) {
      setShowUpdateBloodTypeModal(false);
    }
  };

  const handleUpdateBMR = async (data) => {
    console.log('🔥 BMR update triggered with data:', data);
    
    const metricsData = {
      weight: parseFloat(data.weight.replace(',', '.')),
      height: parseFloat(data.height.replace(',', '.')),
      gender: data.gender?.toUpperCase(),
      date_of_birth: data.dob
    };

    const success = await updateHealthMetrics(metricsData);
    if (success) {
      setShowUpdateBMRModal(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#51ffc6" />
          <Text style={styles.loadingText}>Loading health records...</Text>
        </View>
        <BottomMenu activeRoute="HealthRecords" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Image source={require('../assets/Records.png')} style={styles.icon} />
          <Text style={styles.header}>Health Records</Text>
        </View>
        
        <MetricsCard 
          healthMetrics={healthMetrics}
          metricsLoading={metricsLoading}
          onUpdateBMI={() => setShowUpdateBMIModal(true)}
          onUpdateBP={() => setShowUpdateBPModal(true)}
          onUpdateBloodType={() => setShowUpdateBloodTypeModal(true)}
          onUpdateBMR={() => setShowUpdateBMRModal(true)}
        />

        
        <AllergiesList 
          allergies={healthMetrics.allergies}
          onDeleteAllergy={handleDeleteAllergy}
          onAddAllergy={() => setShowAllergyModal(true)}
        />

        <RecordCard 
          records={records}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          emptyStateText="No health records found"
          onRecordUpdated={fetchHealthRecords}
        />
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.addButton, uploadingRecord && styles.addButtonDisabled]} 
        onPress={() => setShowRecordModal(true)}
        disabled={uploadingRecord}
      >
        {uploadingRecord ? (
          <ActivityIndicator size={24} color="white" />
        ) : (
          <MaterialIcons name="add" size={24} color="white" />
        )}
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
        uploading={uploadingRecord}
      />

      <UpdateBMI 
        visible={showUpdateBMIModal}
        onClose={() => setShowUpdateBMIModal(false)}
        onUpdate={handleUpdateBMI}
        currentData={rawHealthData}
      />

      <UpdateBloodPressure
        visible={showUpdateBPModal}
        onClose={() => setShowUpdateBPModal(false)}
        onUpdate={handleUpdateBP}
        currentData={rawHealthData}
      />
      
      <UpdateBloodType
        visible={showUpdateBloodTypeModal}
        onClose={() => setShowUpdateBloodTypeModal(false)}
        onUpdate={handleUpdateBloodType}
        currentData={rawHealthData}
      />
      
      <UpdateBMR
        visible={showUpdateBMRModal}
        onClose={() => setShowUpdateBMRModal(false)}
        onUpdate={handleUpdateBMR}
        currentData={rawHealthData}
      />
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
  sectionTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 22,
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  allergiesContainer: {
    marginBottom: 20,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default HealthRecords;