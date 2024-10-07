import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import SubHeading from './SubHeading';
import Colors from '../Shared/Colors';
import GlobalApi from '../../Services/GlobalApi';

export default function Category() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter(); // Get the router

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const resp = await GlobalApi.getCategories();
      console.log(resp.data);
      setCategoryList(resp.data || []); // Ensure categoryList is always an array
    } catch (error) {
      console.error(error);
      setCategoryList([]); // Set categoryList to an empty array on error
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle={""} />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} /> {/* Show loading indicator */}
        </View>
      ) : !categoryList.length ? (
        <View style={styles.centered}>
          <Text>No categories available</Text> {/* Show message if no categories are available */}
        </View>
      ) : (
        <FlatList
          data={categoryList}
          numColumns={4}
          style={{
            marginTop: 5
          }}
          columnWrapperStyle={{
            flex: 1,
            justifyContent: 'space-between'
          }}
          renderItem={({ item, index }) => (
            index < 4 ? (
              <TouchableOpacity 
                style={{ alignItems: 'center' }} 
                onPress={() => router.push(`/clinics/${item.name}`)} // Use router.push for navigation
              >
                <View style={{
                  backgroundColor: Colors.SECONDARY,
                  padding: 15,
                  borderRadius: 99,
                }}>
                  <Image
                    source={{
                      uri: item.icon // Use item.icon for the icon URL
                    }}
                    style={{ width: 30, height: 30 }}
                  />
                </View>
                <Text>{item.name}</Text> {/* Use item.name for the category name */}
              </TouchableOpacity>
            ) : null
          )}
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
});