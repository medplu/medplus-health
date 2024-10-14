import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import Colors from '../Shared/Colors'; // Import your Colors object

export default class App extends React.Component {
  state = {
    search: '',
  };

  updateSearch = (search) => {
    this.setState({ search });
  };

  render() {
    const { search } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            placeholder="Type Here..."
            onChangeText={this.updateSearch}
            value={search}
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
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray, // Ensure this matches your overall background color
    padding: 16,
    borderRadius: 10,
  },
  searchBarContainer: {
    flex: 1, // Take up the remaining space
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0, // Remove padding to align with the filter button
  },
  inputContainer: {
    backgroundColor: Colors.white, // Adjust this to blend with your overall background
    borderRadius: 10,
  },
  filterBtn: {
    backgroundColor: Colors.secondary,
    padding: 10,
    borderRadius: 10,
    marginLeft: 10, // Add margin to separate from the search bar
  },
  input: {
    color: Colors.black, // Adjust this to match your text color
  },
});