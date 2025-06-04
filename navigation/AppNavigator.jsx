import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import your screens
import LoginScreen from '../pages/LoginScreen';
import PasswordLoginScreen from '../pages/PasswordLoginScreen';
import OTPScreen from '../pages/OTPScreen';
import SettingPasswordScreen from '../pages/SettingPasswordScreen';
// Import your other screens like Home, etc.

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{
          headerShown: false, // Hide headers for all screens
        }}
      >
        {/* Authentication Flow */}
        <Stack.Screen 
          name="LoginScreen" 
          component={LoginScreen} 
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="PasswordLoginScreen" 
          component={PasswordLoginScreen} 
          options={{ title: 'Enter Password' }}
        />
        <Stack.Screen 
          name="OTPScreen" 
          component={OTPScreen} 
          options={{ title: 'Verify OTP' }}
        />
        <Stack.Screen 
          name="SettingPasswordScreen" 
          component={SettingPasswordScreen} 
          options={{ title: 'Set Password' }}
        />
        
        {/* Add your other screens here */}
        {/* 
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Home' }}
        />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 