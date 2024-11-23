import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import SubHeading from './SubHeading';
import Colors from '../Shared/Colors';
import GlobalApi from '../../Services/GlobalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Category() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null); // State to track active index
  const router = useRouter();

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      // Check AsyncStorage for cached categories
      const cachedCategories = await AsyncStorage.getItem('categories');
      if (cachedCategories) {
        setCategoryList(JSON.parse(cachedCategories));
        setLoading(false);
        return;
      }

      // Fetch categories from API if not in AsyncStorage
      const resp = await GlobalApi.getCategories();
      const categories = resp.data || [];
      setCategoryList(categories);

      // Store categories in AsyncStorage
      await AsyncStorage.setItem('categories', JSON.stringify(categories));
    } catch (error) {
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle={"Let's Find You a Specialist"} />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      ) : !categoryList.length ? (
        <View style={styles.centered}>
          <Text>No categories available</Text>
        </View>
      ) : (
        <FlatList
          data={categoryList}
          horizontal={true} // Enable horizontal scrolling
          showsHorizontalScrollIndicator={false} // Hide horizontal scroll indicator
          style={styles.flatList}
          contentContainerStyle={styles.contentContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={styles.categoryItem} 
              onPress={() => {
                setActiveIndex(index); // Set active index on press
                router.push(`/search?specialty=${item.name}`); // Navigate to search page with selected category
              }}
            >
              <View style={activeIndex == index ? styles.categoryIconContainerActive : styles.categoryIconContainer}>
                <Image
                  source={{ uri: item.icon }}
                  style={styles.categoryIcon}
                />
              </View>
              <Text style={activeIndex == index ? styles.categoryBtnActive : styles.categoryBtnTxt}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: Colors.SECONDARY,
    padding: 15,
    borderRadius: 99,
  },
  categoryIconContainerActive: {
    backgroundColor: Colors.PRIMARY, // Change background color for active state
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
    color: Colors.black,
  },
  categoryBtnActive: {
    marginTop: 5,
    textAlign: 'center',
    color: Colors.PRIMARY, // Change text color for active state
  },
});