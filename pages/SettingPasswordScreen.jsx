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

const SettingPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { phone, customerId } = route.params || {};

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
      minLength,
      hasUppercase,
      hasNumber,
      isValid: minLength && hasUppercase && hasNumber
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSetPassword = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (!passwordValidation.isValid) {
      Alert.alert('Error', 'Password does not meet requirements');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/customers/set-password`, {
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
        Alert.alert(
          'Success', 
          'Password set successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // After setting password, perform a login to get the token
                performLoginAfterPasswordSet();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to set password');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const performLoginAfterPasswordSet = async () => {
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
        // Login successful with token
        const customerData = {
          ...data.customer,
          ...(data.token && { token: data.token })
        };
        
        await login(customerData);
        navigation.reset({ 
          index: 0, 
          routes: [{ name: 'Home' }] 
        });
      } else {
        // If login fails, just navigate without login (shouldn't happen)
        console.error('Login after password set failed:', data.error);
        navigation.reset({ 
          index: 0, 
          routes: [{ name: 'Home' }] 
        });
      }
    } catch (error) {
      console.error('Error logging in after password set:', error);
      // Navigate anyway since password was set successfully
      navigation.reset({ 
        index: 0, 
        routes: [{ name: 'Home' }] 
      });
    }
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
              <Text style={styles.title}>Set Your Password</Text>
              <Text style={styles.subtitle}>
                Create a secure password for your account
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <View style={styles.requirement}>
                <Text style={[styles.requirementText, passwordValidation.minLength && styles.requirementMet]}>
                  ✓ At least 8 characters
                </Text>
              </View>
              <View style={styles.requirement}>
                <Text style={[styles.requirementText, passwordValidation.hasUppercase && styles.requirementMet]}>
                  ✓ One uppercase letter
                </Text>
              </View>
              <View style={styles.requirement}>
                <Text style={[styles.requirementText, passwordValidation.hasNumber && styles.requirementMet]}>
                  ✓ One number
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.button, 
                (!passwordValidation.isValid || password !== confirmPassword || isLoading) && styles.buttonDisabled
              ]}
              onPress={handleSetPassword}
              disabled={!passwordValidation.isValid || password !== confirmPassword || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#333" />
              ) : (
                <Text style={styles.buttonText}>Set Password</Text>
              )}
            </TouchableOpacity>
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
    marginBottom: 15,
    fontSize: 20,
    backgroundColor: '#fff',
    fontFamily: 'DarkerGrotesque',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'DarkerGrotesque-Bold',
  },
  requirement: {
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DarkerGrotesque',
  },
  requirementMet: {
    color: '#28a745',
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
});

export default SettingPasswordScreen;
