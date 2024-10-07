import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import React from 'react';

import Header from '../../components/dashboard/Header';
import SearchBar from '../../components/dashboard/SearchBar';
import Slider from '../../components/Slider';
import Category from '../../components/dashboard/Category';
import Doctors from '../../components/dashboard/Doctors'
import Clinics from '../../components/dashboard/Clinics';
import Colors from '../../components/Shared/Colors';

export default function Home() {
 
   
  return (
    <ScrollView style={styles.scrollView}>
    
      <SearchBar />
      <Category />
      <Doctors />
      <Slider />
      
      <Clinics />
    </ScrollView>
  );
}

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