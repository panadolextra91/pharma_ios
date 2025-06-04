import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Background from '../components/Icons/Background';
import { useFonts } from 'expo-font';
import MediMaster from '../assets/MediMaster.png'
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';
import { KeyboardAvoidingView } from 'react-native';
import { ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { Keyboard } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';

const { width, height } = Dimensions.get('window')
const LoginScreen = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [requiresEmail, setRequiresEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('phone'); // 'phone' or 'email'
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const handlePhoneCheck = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/otps/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.exists && data.verified && data.hasPassword) {
          // User has account with password → Navigate to password login
          navigation.navigate('PasswordLoginScreen', { phone: phoneNumber });
        } else if (data.exists && data.hasEmail) {
          // User exists and has email → Send OTP directly
          await handleSendOTP();
        } else {
          // User doesn't exist or needs email → Show email input
          setRequiresEmail(true);
          setCurrentStep('email');
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to check phone number');
      }
    } catch (error) {
      console.error('Error checking phone:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (requiresEmail && !email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { phone: phoneNumber };
      if (requiresEmail || email) {
        payload.email = email;
      }

      const response = await fetch(`${API_URL}/otps/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        navigation.navigate('OTPScreen', { 
          phone: phoneNumber, 
          email: email || data.email,
          isNewCustomer: data.isNewCustomer 
        });
      } else if (data.requiresEmail) {
        setRequiresEmail(true);
        setCurrentStep('email');
        Alert.alert('Email Required', data.error || 'Please enter your email address to continue');
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (currentStep === 'phone') {
      handlePhoneCheck();
    } else {
      handleSendOTP();
    }
  };

  const handleBackToPhone = () => {
    setCurrentStep('phone');
    setRequiresEmail(false);
    setEmail('');
  };
  
  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Background elements */}
          <View style={StyleSheet.absoluteFill} />
          <Background width={width} height={height} style={[StyleSheet.absoluteFillObject, {left: 0}]} />
          
          {/* Content */}
          <ScrollView 
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoWrapper}>
              <Image source={MediMaster} style={styles.logo} />
            </View>

            {currentStep === 'phone' ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor="#888"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoFocus={true}
                />
                
                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleContinue}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#333" />
                  ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Email Required</Text>
                  <Text style={styles.subtitle}>
                    Please enter your email to continue with {phoneNumber}
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true}
                />
                
                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleContinue}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#333" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleBackToPhone} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← Back to Phone Number</Text>
                </TouchableOpacity>
              </>
            )}

            <Text 
              style={styles.registerLink}
            >
              Worry less, live healthier!
            </Text>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'DarkerGrotesque-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'DarkerGrotesque',
  },
  input: {
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 15,
    //paddingVertical: 10,
    marginBottom: 25,
    fontSize: 20,
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
  buttonDisabled: {
    backgroundColor: 'transparent',
    
  },
  buttonText: {
    marginBottom: 5,
    color: '#333',
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  backButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'DarkerGrotesque',
    textDecorationLine: 'underline',
  },
  registerLink: {
    color: '#333',
    textAlign: 'center',
    fontSize: 20,
    textDecorationLine: 'underline',
    fontFamily: 'DarkerGrotesque',
  },
});

export default LoginScreen;