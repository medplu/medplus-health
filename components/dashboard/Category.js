import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import SubHeading from './SubHeading';
import Colors from '../Shared/Colors';
import GlobalApi from '../../Services/GlobalApi';

export default function Category() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const resp = await GlobalApi.getCategories();
      setCategoryList(resp.data || []);
    } catch (error) {
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle={""} />
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
                onPress={() => router.push(`/clinics/${item.name}`)}
              >
                <View style={{
                  backgroundColor: Colors.SECONDARY,
                  padding: 15,
                  borderRadius: 99,
                }}>
                  <Image
                    source={{
                      uri: item.icon
                    }}
                    style={{ width: 30, height: 30 }}
                  />
                </View>
                <Text>{item.name}</Text>
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