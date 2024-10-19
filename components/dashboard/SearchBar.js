import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../Shared/Colors';

const AppSearchBar = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <SearchBar
          placeholder="Type Here..."
          onChangeText={onChangeText} // Use the prop for handling search input
          value={value} // Use the prop for the search value
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.input}
          placeholderTextColor={Colors.gray}
          searchIcon={{ color: Colors.primary }}
          clearIcon={{ color: Colors.primary }}
        />
      </View>
      <TouchableOpacity onPress={() => {}} style={styles.filterBtn}>
        <Ionicons name='options' size={28} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default AppSearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ligh_gray,
    padding: 15,
    borderRadius: 10,
  },
  searchBarContainer: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  inputContainer: {
    backgroundColor: Colors.ligh_gray,
    borderRadius: 10,
  },
  filterBtn: {
    backgroundColor: Colors.SECONDARY,
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  input: {
    color: Colors.primary,
  },
});