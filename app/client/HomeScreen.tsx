import { View, Text, FlatList, StyleSheet } from 'react-native';
import React from 'react';

import SearchBar from '../../components/dashboard/SearchBar';
import Category from '../../components/dashboard/Category';
import Doctors from '../../components/dashboard/Doctors';
import Clinics from '../../components/dashboard/Clinics';
import Colors from '../../components/Shared/Colors';

export default function Home() {
  const data = [{ key: 'searchBar' }, { key: 'category' }, { key: 'doctors' }, { key: 'clinics' }];

  const renderItem = ({ item }) => {
    if (item.key === 'searchBar') {
      return <SearchBar />;
    } else if (item.key === 'category') {
      return <Category />;
    } else if (item.key === 'doctors') {
      return <Doctors />;
    } else if (item.key === 'clinics') {
      return <Clinics />;
    }
    return null;
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.scrollView}
    />
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