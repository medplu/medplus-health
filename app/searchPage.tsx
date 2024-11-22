
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import FullScreenSearch from './fullScreenSearch';
import axios from 'axios';
import Colors from '../Shared/Colors';

const SearchPage = ({ route }) => {
  const { specialty } = route.params;
  const [searchResults, setSearchResults] = useState({ clinics: [], professionals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearchResults(specialty);
  }, [specialty]);

  const fetchSearchResults = async (specialty) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/search?specialty=${specialty}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : (
        <FullScreenSearch searchResults={searchResults} initialSpecialty={specialty} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default SearchPage;