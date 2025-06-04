import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Opening from './pages/Opening';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import HealthRecords from './pages/HealthRecords';
import LoginScreen from './pages/LoginScreen';
import PasswordLoginScreen from './pages/PasswordLoginScreen';
import OTPScreen from './pages/OTPScreen';
import Pharmacies from './pages/Pharmacies';
import News from './pages/News'
import NewsDetail from './pages/news/NewsDetail'
import BuyMedicines from './pages/BuyMedicines'
import Brands from './pages/Brands'
import BrandDetails from './pages/brands/BrandDetails'
import SettingPasswordScreen from './pages/SettingPasswordScreen';
import Profile from './pages/Profile';
import Notification from './pages/Notification';
import Invoice from './pages/Invoice';
import Cart from './pages/Cart';
import Consult from './pages/Consult';  

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
      <Stack.Screen name="PasswordLoginScreen" component={PasswordLoginScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="SettingPasswordScreen" component={SettingPasswordScreen} />
      {/* App Stack */}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Schedule" component={Schedule} />
      <Stack.Screen name="HealthRecords" component={HealthRecords} />
      <Stack.Screen name="Pharmacies" component={Pharmacies} />
      <Stack.Screen name="News" component={News}/>
      <Stack.Screen name="NewsDetail" component={NewsDetail}/>
      <Stack.Screen name="BuyMedicines" component={BuyMedicines}/>
      <Stack.Screen name="Brands" component={Brands}/>
      <Stack.Screen name="BrandDetails" component={BrandDetails}/>
      <Stack.Screen name="Profile" component={Profile}/>
      <Stack.Screen name="Notification" component={Notification}/>
      <Stack.Screen name="Invoice" component={Invoice}/>
      <Stack.Screen name="Cart" component={Cart}/>
      <Stack.Screen name="Consult" component={Consult}/>
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
