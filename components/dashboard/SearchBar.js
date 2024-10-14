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
      <View>
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
          rightIconContainerStyle={styles.rightIconContainer}
         
        />
      </View>
      
        <View>
          <TouchableOpacity onPress={()=>{}} style={styles.filterBtn}>
            <Ionicons name='options' size={28} style color={Colors.PRIMARY}/>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.lightGray, // Ensure this matches your overall background color
    padding: 16,
    borderRadius: 10
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    width: '100%', // Make the search bar take the full width
  },
  inputContainer: {
    backgroundColor: Colors.white, // Adjust this to blend with your overall background
    borderRadius: 10,
    paddingRight: 50, // Add padding to make space for the filter icon
  },
filterBtn:{
  backgroundColor: Colors.SECONDARY,
  padding:10,
  borderRadius:10



},
  input: {
    color: Colors.black, // Adjust this to match your text color
  },
  rightIconContainer: {
    marginRight: 10, // Adjust the margin to position the icon correctly
  },
});