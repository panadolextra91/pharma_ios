import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import Opening from './pages/Opening';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import HealthRecords from './pages/HealthRecords';
import LoginScreen from './pages/LoginScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Opening"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Opening" component={Opening} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Schedule" component={Schedule} />
        <Stack.Screen name="HealthRecords" component={HealthRecords} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
