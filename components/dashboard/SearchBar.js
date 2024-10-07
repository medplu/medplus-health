import { View, TextInput, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Colors from '../Shared/Colors';


export default function SearchBar() {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <EvilIcons name="search" size={24} color={Colors.PRIMARY} />
        <TextInput
          style={{ width: '100%', fontWeight: 'Inter-Black' }}
          placeholder="Search"
          placeholderTextColor="gray"
          value={searchText}
          onChangeText={(value) => setSearchText(value)}
          onSubmitEditing={() => console.log(searchText)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  icon: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    borderWidth: 0.7,
    borderColor: '#000',
    borderRadius: 8,
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});