import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Background from '../components/Icons/Background';
import NotificationSkeleton from '../components/ui/notifications/NotificationSkeleton';

const { width, height } = Dimensions.get('window');

const Notification = () => {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  // Callback to handle notification updates
  const handleNotificationUpdate = useCallback(() => {
    // This could trigger a refresh of the notification count in the Home screen
    // For now, we'll just log it - you could implement a global state update here
    console.log('Notification marked as read - should refresh count');
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#51ffc6" />
      
      {/* Background */}
      <View style={StyleSheet.absoluteFill} />
      <Background width={width} height={height} style={[StyleSheet.absoluteFillObject, {left: 0}]} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notifications</Text>
        
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <NotificationSkeleton onNotificationUpdate={handleNotificationUpdate} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#51ffc6',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default Notification;
