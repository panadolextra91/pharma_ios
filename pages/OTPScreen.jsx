import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Background from '../components/Icons/Background';
import { API_URL } from '../config';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const OTPScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const otpInputs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();

  useEffect(() => {
    console.log('[OTPScreen] Received route params:', route.params);
    
    if (route.params?.phone) {
      console.log('[OTPScreen] Setting phone from params:', route.params.phone);
      setPhone(route.params.phone);
    }
    if (route.params?.email) {
      console.log('[OTPScreen] Setting email from params:', route.params.email);
      setEmail(route.params.email);
    }
    
    // Log current state after updates
    console.log('[OTPScreen] Current state - phone:', phone, 'email:', email);
  }, [route.params]);
  
  // Log state changes
  useEffect(() => {
    console.log('[OTPScreen] State updated - phone:', phone, 'email:', email);
  }, [phone, email]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      // const response = await fetch(`${API_URL}/otps/verify-otp`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ 
      //     phone: phone,
      //     otp: code 
      //   }),
      // });

      // const data = await response.json();
      // if (response.ok) {
      //   await login({ ...data.customer, token: data.token });
      //   navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      // } else {
      //   Alert.alert('Error', data.error || 'Verification failed');
      // }

      // Simulate success and navigate to Home
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phone) {
      Alert.alert('Error', 'Phone number not found');
      return;
    }

    setResendDisabled(true);
    let timeLeft = 30;
    
    try {
      const response = await fetch(`${API_URL}/otps/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'New OTP has been sent to your registered email');
        
        // Start countdown
        const timer = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          
          if (timeLeft <= 0) {
            clearInterval(timer);
            setResendDisabled(false);
            setCountdown(30);
          }
        }, 1000);
      } else {
        Alert.alert('Error', data.error || 'Failed to resend OTP');
        setResendDisabled(false);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      setResendDisabled(false);
    }
  };

  

  return (
    <View style={styles.container}>
      {/* Background elements */}
      <View style={StyleSheet.absoluteFill} />
      <Background width={width} height={height} style={[StyleSheet.absoluteFillObject, {left: 0}]} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {email || 'your registered email'}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (otpInputs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textContentType="oneTimeCode"
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, (!otp.every(digit => digit) || isVerifying) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={!otp.every(digit => digit) || isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#333" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={resendDisabled}>
            <Text style={[styles.resendLink, resendDisabled && styles.resendLinkDisabled]}>
              {resendDisabled ? `Resend in ${countdown}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#51ffc6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cdfff3',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#666',
  },
  resendLink: {
    color: '#51ffc6',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#aaa',
  },
});

export default OTPScreen;