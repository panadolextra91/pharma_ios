import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Easing 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const menuItems = [
  { name: 'Home', icon: 'home', label: 'Homepage', iconType: 'ant' },
  { name: 'Order', icon: 'shoppingcart', label: 'Order', iconType: 'ant' },
  { name: 'Consult', icon: 'customerservice', label: 'Consult', iconType: 'ant' },
  { name: 'Invoice', icon: 'clipboard-text-outline', label: 'Invoice', iconType: 'material-community' },
  { name: 'Profile', icon: 'account-circle-outline', label: 'Profile', iconType: 'material-community' },
];

const BottomMenu = ({ activeRoute }) => {
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        })
      ]).start(({ finished }) => {
        if (finished) pulse();
      });
    };

    pulse();
    return () => pulseAnim.stopAnimation();
  }, []);

  const renderIcon = (item) => {
    const isActive = activeRoute === item.name;
    const isConsult = item.name === 'Consult';
    const color = isConsult ? '#000' : (isActive ? '#51ffc6' : '#888');
    const size = 24;

    const icon = () => {
      if (item.iconType === 'material') {
        return <MaterialIcons name={item.icon} size={size} color={color} />;
      } else if (item.iconType === 'ant') {
        return <AntDesign name={item.icon} size={size} color={color} />;
      } else if (item.iconType === 'material-community') {
        return <MaterialCommunityIcons name={item.icon} size={size} color={color} />;
      }
      return <Ionicons name={item.icon} size={size} color={color} />;
    };

    if (isConsult) {
      return (
        <View style={styles.consultIconContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            {icon()}
          </Animated.View>
        </View>
      );
    }
    
    return icon();
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item) => {
        const isActive = activeRoute === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.menuItem,
              item.name === 'Consult' && styles.consultMenuItem
            ]}
            onPress={() => navigation.navigate(item.name)}
            activeOpacity={0.7}
          >
            {renderIcon(item)}
            <Text style={[
              styles.label, 
              isActive && styles.activeLabel,
              item.name === 'Consult' && styles.consultLabel
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  menuItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: 15,
    marginTop: 4,
    color: '#888',
    fontFamily: 'DarkerGrotesque',
  },
  activeLabel: {
    color: '#51ffc6',
    fontWeight: 'bold',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  consultMenuItem: {
    marginTop: -29,
  },
  consultIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#51ffc6',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1.5,
  },
  consultLabel: {
    marginTop: 2,
    color: '#888',
    fontFamily: 'DarkerGrotesque',
    fontSize: 15,
  },
});

export default BottomMenu;