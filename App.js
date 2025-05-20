import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import Opening from './pages/Opening';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import HealthRecords from './pages/HealthRecords';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import OTPScreen from './pages/OTPScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  
  console.log('[AppNavigator] Rendering with state:', { 
    hasUser: !!user, 
    isLoading 
  });

  if (isLoading) {
    console.log('[AppNavigator] Showing loading indicator');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#51ffc6" />
      </View>
    );
  }

  console.log('[AppNavigator] User state:', user ? 'Logged in' : 'Not logged in');
  
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? "Home" : "Opening"}
    >
      {/* Auth Stack */}
      <Stack.Screen name="Opening" component={Opening} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      
      {/* App Stack */}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Schedule" component={Schedule} />
      <Stack.Screen name="HealthRecords" component={HealthRecords} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
