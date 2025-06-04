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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Background from '../components/Icons/Background';
import { useFonts } from 'expo-font';
import MediMaster from '../assets/MediMaster.png';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const PasswordLoginScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { phone } = route.params || {};

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phone,
          password: password 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Login successful
        // Only pass customer data, handle token separately if it exists
        const customerData = {
          ...data.customer,
          // Add token only if it exists in the response
          ...(data.token && { token: data.token })
        };
        
        await login(customerData);
        navigation.reset({ 
          index: 0, 
          routes: [{ name: 'Home' }] 
        });
      } else {
        Alert.alert('Error', data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Would you like to reset your password using OTP?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            // Navigate back to LoginScreen to start OTP flow
            navigation.navigate('LoginScreen');
          },
        },
      ]
    );
  };

  const handleBackToPhoneEntry = () => {
    navigation.goBack();
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

            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Enter your password for {phone}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
            />

            <TouchableOpacity 
              style={[styles.button, (!password.trim() || isLoading) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={!password.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#333" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={handleBackToPhoneEntry}>
                <Text style={styles.linkText}>Use Different Phone Number</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'DarkerGrotesque-Bold',
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
    backgroundColor: '#cdfff3',
  },
  buttonText: {
    marginBottom: 5,
    color: '#333',
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  linkContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  linkText: {
    color: '#333',
    fontSize: 18,
    textDecorationLine: 'underline',
    fontFamily: 'DarkerGrotesque',
  },
});

export default PasswordLoginScreen; 