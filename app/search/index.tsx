import { StyleSheet, TextInput, SafeAreaView, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import GlobalApi from '../../Services/GlobalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [filter, setFilter] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories();
  }, []);

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
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View>
          <FlatList
            data={categoryList}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.flatList}
            contentContainerStyle={styles.contentContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => handleSpecialtyPress(item.name)}
              >
                <View style={specialty === item.name ? styles.categoryIconContainerActive : styles.categoryIconContainer}>
                  <Image
                    source={{ uri: item.icon }}
                    style={styles.categoryIcon}
                  />
                </View>
                <Text style={specialty === item.name ? styles.categoryBtnActive : styles.categoryBtnTxt}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.name}
          />
          <TextInput
            placeholder="Filter"
            style={styles.filterBox}
            value={filter}
            onChangeText={setFilter}
          />
        </View>
      )}
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
  flatList: {
    marginTop: 5,
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIconContainer: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 99,
  },
  categoryIconContainerActive: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 99,
  },
  categoryIcon: {
    width: 30,
    height: 30,
  },
  categoryBtnTxt: {
    marginTop: 5,
    textAlign: 'center',
    color: '#000',
  },
  categoryBtnActive: {
    marginTop: 5,
    textAlign: 'center',
    color: '#000',
  },
  filterBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});