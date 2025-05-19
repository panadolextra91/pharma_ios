import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../components/ui/SearchBar';
import BottomMenu from '../components/ui/BottomMenu';
import ScheduleIcon from '../assets/052_Medical_App.png'
import PharmaciesIcon from '../assets/Location.png'
import HealthRecordsIcon from '../assets/Records.png'
import NewsIcon from '../assets/Defibrillator.png'
const { width } = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Load fonts
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const quickActions = [
    { id: 1, title: 'Schedule', icon: ScheduleIcon, screen: 'Schedule' },
    { id: 2, title: 'Pharmacies', icon: PharmaciesIcon, screen: 'Pharmacies' },
    { id: 3, title: 'Health Records', icon: HealthRecordsIcon, screen: 'HealthRecords' },
    { id: 4, title: 'News', icon: NewsIcon, screen: 'News' },
  ];

  const recentMeds = [
    { id: 1, name: 'Paracetamol', time: '08:00 AM', dosage: '500mg' },
    { id: 2, name: 'Vitamin C', time: '12:00 PM', dosage: '1000mg' },
    { id: 3, name: 'Omega-3', time: '06:00 PM', dosage: '1000mg' },
  ];

  return (
      <View style={styles.container}>
      <ScrollView >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>User</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
        <SearchBar
          placeholder="What are you looking for?"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => console.log('Searching for:', searchQuery)}
        />

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id} 
              style={styles.actionButton}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Image source={action.icon} style={styles.actionIcon} />
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Medications */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Medications</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentMeds.map((med) => (
          <View key={med.id} style={styles.medicationCard}>
            <View style={styles.medicationInfo}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDosage}>{med.dosage}</Text>
            </View>
            <View style={styles.medicationTime}>
              <Text style={styles.timeText}>{med.time}</Text>
              <TouchableOpacity style={styles.takeButton}>
                <Text style={styles.takeButtonText}>Take</Text>
              </TouchableOpacity>
            </View>
          </View>
          
        ))}
        </View>
      </ScrollView>
      {/* Bottom Menu */}
      <BottomMenu activeRoute="Home" />
      </View>
      
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0, // Add padding to prevent content from being hidden behind the bottom menu
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 50,
    paddingBottom: 20,
    marginBottom: 20,
    backgroundColor: '#51ffc6',
    borderRadius: 20,
    elevation: 5,
  },
  greeting: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'DarkerGrotesque',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  profileIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 80,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    width: width * 0.43,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAll: {
    color: '#51ffc6',
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
  },
  medicationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicationInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 5,
  },
  medDosage: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
  },
  medicationTime: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'DarkerGrotesque-Bold',
    marginBottom: 5,
    color: '#333',
  },
  takeButton: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 15,
    borderRadius: 15,
    justifyContent: 'center',
    paddingBottom: 5,
  },
  takeButtonText: {
    color: '#000',
    fontFamily: 'DarkerGrotesque-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default Home;