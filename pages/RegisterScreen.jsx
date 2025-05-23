import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Linking, 
  Dimensions,
  Image,
  TouchableWithoutFeedback 
} from 'react-native';
import Background from '../components/Icons/Background';
import { useFonts } from 'expo-font';
import MediMaster from '../assets/MediMaster.png'

const { width, height } = Dimensions.get('window')
const RegisterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fontsLoaded] = useFonts({
      'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
      'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
    });
  
    if (!fontsLoaded) {
      return null;
    }
  return (
    <View style={styles.container}>
      {/* Background elements */}
      <View style={StyleSheet.absoluteFill} />
      <Background width={width} height={height} style={[StyleSheet.absoluteFillObject, {left: 0}]} />
      
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <Image source={MediMaster} style={styles.logo} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}> Register Now </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  logoWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
    //paddingVertical: 10,
    marginBottom: 25,
    fontSize: 16,
    backgroundColor: '#fff',
    fontFamily: 'DarkerGrotesque',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#51ffc6',
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 150,
  },
  buttonText: {
    marginBottom: 5,
    color: '#333',
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
  },
});

export default RegisterScreen;