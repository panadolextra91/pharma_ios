import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const SearchBar = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSearch = () => {},
  containerStyle = {},
  inputStyle = {},
  buttonStyle = {},
  icon = '🔍',
}) => {
  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <TextInput
        style={[styles.searchInput, inputStyle]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
      />
      <TouchableOpacity 
        style={[styles.searchButton, buttonStyle]}
        onPress={onSearch}
      >
        <Text style={styles.searchIcon}>{icon}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#e3e3e3',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    fontFamily: 'DarkerGrotesque',
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#51ffc6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchIcon: {
    fontSize: 20,
  },
});

export default SearchBar;