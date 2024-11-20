import { StyleSheet, TextInput, SafeAreaView, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import GlobalApi from '../../Services/GlobalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const index = () => {
  const route = useRoute();
  const { categoryQuery } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [filter, setFilter] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(categoryQuery ? [categoryQuery] : []);

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (categoryQuery) {
      handleSearch(searchQuery, categoryQuery);
    }
  }, [categoryQuery]);

  const getCategories = async () => {
    try {
      const cachedCategories = await AsyncStorage.getItem('categories');
      if (cachedCategories) {
        setCategoryList(JSON.parse(cachedCategories));
        setLoading(false);
        return;
      }

      const resp = await GlobalApi.getCategories();
      const categories = resp.data || [];
      setCategoryList(categories);
      await AsyncStorage.setItem('categories', JSON.stringify(categories));
    } catch (error) {
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query, selectedSpecialty = specialty) => {
    setSearchQuery(query);
    fetchData(query, selectedSpecialty, filter);
  };

  const handleSpecialtyPress = (selectedSpecialty) => {
    setSpecialty(selectedSpecialty);
    fetchData(searchQuery, selectedSpecialty, filter);
  };

  const fetchData = (query, specialty, filter) => {
    setIsLoading(true);
    fetch(`http://localhost:3000/api/search?query=${query}&specialty=${specialty}&filter=${filter}`)
      .then((response) => response.json())
      .then((json) => {
        setData(json);
      })
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  };

  return (
    <SafeAreaView style={{ flex: 1, marginHorizontal: 20 }}>
      <TextInput
        placeholder="Search"
        clearButtonMode="always"
        style={styles.searchBox}
        autoCapitalize="none"
        autoCorrect={false}
        value={searchQuery}
        onChangeText={(query) => handleSearch(query)}
      />
      <TextInput
        placeholder="Filter"
        style={styles.filterBox}
        value={filter}
        onChangeText={setFilter}
      />
      <View style={styles.selectedCategoriesContainer}>
        {selectedCategories.map((category) => (
          <Text key={category} style={styles.selectedCategory}>
            {category}
          </Text>
        ))}
      </View>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error.message}</Text>
      ) : (
        <FlatList
          data={
            data && data.professionals && data.clinics
              ? data.professionals.concat(data.clinics)
              : []
          }
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{item.name}</Text>
              {/* Add other fields as needed */}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
  },
  filterBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10,
  },
  selectedCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  selectedCategory: {
    backgroundColor: '#ddd',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});