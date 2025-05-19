import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Image } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Background from '../components/Icons/Background';
import MediMaster from '../assets/MediMaster.png'
import Pill from '../assets/Frame1.png'
import MedicalRecord from '../assets/Medical_Record.png'
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Opening = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  const navigation = useNavigation();

  const handleScreenPress = useCallback(() => {
    navigation.navigate('LoginScreen');
  }, [navigation]);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any resources here
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

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
