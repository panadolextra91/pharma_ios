import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Image } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Background from '../components/Icons/Background';
import MediMaster from '../assets/MediMaster.png'
import Pill from '../assets/Frame1.png'
import MedicalRecord from '../assets/Medical_Record.png'
import { useNavigation } from '@react-navigation/native';

// Simple debug logging
console.log('[Opening] Debug logging initialized');

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Opening = () => {
  console.log('[Opening] Component function called');
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  console.log('[Opening] Fonts loaded:', fontsLoaded);
  const navigation = useNavigation();
  
  // Log navigation object to check if it's valid
  useEffect(() => {
    console.log('[Opening] Navigation object:', navigation ? 'Valid' : 'Invalid');
  }, [navigation]);

  const handleScreenPress = useCallback(() => {
    console.log('[Opening] Screen pressed, navigating to LoginScreen');
    try {
      navigation.navigate('LoginScreen');
      console.log('[Opening] Navigation successful');
    } catch (error) {
      console.error('[Opening] Navigation error:', error);
    }
  }, [navigation]);

  useEffect(() => {
    console.log('[Opening] Component mounted');
    
    async function prepare() {
      console.log('[Opening] Starting resource preparation');
      try {
        // Pre-load any resources here
        console.log('[Opening] Resources loaded successfully');
      } catch (e) {
        console.error('[Opening] Error loading resources:', e);
      } finally {
        console.log('[Opening] Setting appIsReady to true');
        setAppIsReady(true);
      }
    }

    prepare();

    return () => {
      console.log('[Opening] Component unmounting');
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    console.log('[Opening] onLayoutRootView called', { appIsReady, fontsLoaded });
    if (appIsReady && fontsLoaded) {
      console.log('[Opening] Hiding splash screen');
      await SplashScreen.hideAsync();
      console.log('[Opening] Splash screen hidden');
    }
  }, [appIsReady, fontsLoaded]);

  console.log('[Opening] Rendering check', { appIsReady, fontsLoaded });
  
  if (!appIsReady || !fontsLoaded) {
    console.log('[Opening] Returning null - app not ready or fonts not loaded');
    return null;
  }
  
  console.log('[Opening] Rendering main component');

  console.log('[Opening] Rendering main component UI');
  
  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        {/* Background elements */}
        <View style={StyleSheet.absoluteFill} />
        <Background width={width} height={height} style={[StyleSheet.absoluteFillObject, {left: 0}]} />
        <Image source={Pill} style={styles.pill} />
        <Image source={MedicalRecord} style={styles.medicalRecord} />
        <View style={styles.content}>
          <View style={styles.logoWrapper}>
            <Image source={MediMaster} />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 300 
  },
  logoWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: width * 0.15,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  pill: {
    position: 'absolute',
    bottom: 0,
    left: 200,
  },
  medicalRecord: {
    position: 'absolute',
    top: 10,
    left: -10,
  },
});

export default Opening;
