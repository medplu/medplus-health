import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import SubHeading from '../../components/dashboard/SubHeading';
import Colors from '../Shared/Colors';

interface CategoryItem {
  name: string;
  icon: string;
}

interface StaticCategoryProps {
  categories: string[];
}

const categoryIcons: { [key: string]: string } = {
  'Pharmacist': 'https://example.com/icons/pharmacist.png',
  'Eye': 'https://example.com/icons/ophthalmologist.png',
  // Add more mappings as needed
};

const StaticCategory: React.FC<StaticCategoryProps> = ({ categories }) => {
  const [loading] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const categoryList: CategoryItem[] = categories.map(category => ({
    name: category,
    icon: categoryIcons[category] || 'https://example.com/icons/default.png', // Default icon if not found
  }));

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle={"Explore Categories"} />
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
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.flatList}
          contentContainerStyle={styles.contentContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={styles.categoryItem} 
              onPress={() => setActiveIndex(index)}
            >
              <View style={styles.categoryIconContainer}>
                <Image
                  source={{ uri: item.icon }}
                  style={styles.categoryIcon}
                />
              </View>
              <Text style={activeIndex === index ? styles.categoryBtnActive : styles.categoryBtnTxt}>{item.name}</Text>
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
    backgroundColor: Colors.PRIMARY,
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
    color: Colors.PRIMARY,
  },
});

export default StaticCategory;