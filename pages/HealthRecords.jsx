import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import BottomMenu from '../components/ui/BottomMenu';
const { width } = Dimensions.get('window');

const HealthRecords = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [records, setRecords] = useState([
    { 
      id: '1', 
      type: 'lab', 
      title: 'Blood Test Results', 
      date: '2023-05-15', 
      doctor: 'Dr. Sarah Johnson',
      description: 'Complete blood count and metabolic panel results.'
    },
    { 
      id: '2', 
      type: 'prescription', 
      title: 'Prescription', 
      date: '2023-05-10', 
      doctor: 'Dr. Michael Chen',
      description: 'Amoxicillin 500mg - Take twice daily for 10 days.'
    },
    { 
      id: '3', 
      type: 'note', 
      title: 'Doctor\'s Note', 
      date: '2023-05-05', 
      doctor: 'Dr. Emily Wilson',
      description: 'Follow-up appointment scheduled for June 5th, 2023.'
    },
    { 
        id: '4', 
        type: 'prescription', 
        title: 'Prescription', 
        date: '2023-05-10', 
        doctor: 'Dr. Michael Chen',
        description: 'Paracetamol 500mg - Take twice daily for 10 days.'
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Image source={require('../assets/Records.png')} style={styles.icon} />
          <Text style={styles.header}>Health Records</Text>
        </View>
        
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
      
      <TouchableOpacity style={styles.addButton}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
      
      <BottomMenu activeRoute="HealthRecords" />
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
    fontSize: 24,
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
    width: 56,
    height: 56,
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
});

export default HealthRecords;