import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import React from 'react';

import Header from '../../components/dashboard/Header';
import SearchBar from '../../components/dashboard/SearchBar';

import Category from '../../components/dashboard/Category';
import Doctors from '../../components/dashboard/Doctors';
import Clinics from '../../components/dashboard/Clinics';
import Colors from '../../components/Shared/Colors';

const Home = () => {
  const data = [{ key: 'dummy' }]; // Dummy data to render FlatList

  return (
    <FlatList
      data={data}
      renderItem={null} // No need to render any item
      ListHeaderComponent={
        <>
          <SearchBar />
          <Category />
          <Doctors />
          
          <Clinics />
        </>
      }
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.scrollView}
    />
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: 20,
    backgroundColor: Colors.ligh_gray,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
});

export default Home;