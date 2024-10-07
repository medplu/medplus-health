// CategoryList.tsx
import React from 'react';
import { StyleSheet, FlatList, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categoriesData: Category[] = [
  { id: '1', name: 'Cardiologist', icon: 'heart' },
  { id: '2', name: 'Dermatologist', icon: 'color-palette' },
  { id: '3', name: 'Orthopedist', icon: 'medkit' },
  { id: '4', name: 'Neurologist', icon: 'brain' },
  { id: '5', name: 'Pediatrician', icon: 'happy' },
  { id: '6', name: 'Psychiatrist', icon: 'people' },
];

const CategoryList: React.FC = () => {
  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryContainer}>
      <Ionicons name={item.icon} size={24} color="#007bff" style={styles.categoryIcon} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </View>
  );

  return (
    <FlatList
      data={categoriesData}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryList}
    />
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIcon: {
    backgroundColor: '#e7f1ff',
    padding: 10,
    borderRadius: 50,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  categoryList: {
    paddingBottom: 0, // Reduce bottom padding
    marginBottom: 0, // Ensure no extra margin at the bottom
  },
});

export default CategoryList;