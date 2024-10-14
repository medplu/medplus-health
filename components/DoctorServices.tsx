// app/components/DoctorServices.tsx
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Colors from './Shared/Colors';
import SubHeading from '../components/dashboard/SubHeading';

const dummyServices = [
  { name: 'General Consultation', icon: 'https://via.placeholder.com/30' },
  { name: 'Pediatrics', icon: 'https://via.placeholder.com/30' },
  { name: 'Cardiology', icon: 'https://via.placeholder.com/30' },
  { name: 'Dermatology', icon: 'https://via.placeholder.com/30' },
];

const DoctorServices = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle={"Services Offered"} />
      <FlatList
        data={dummyServices}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.serviceItem} 
            onPress={() => setActiveIndex(index)}
          >
            <View style={activeIndex === index ? styles.serviceIconContainerActive : styles.serviceIconContainer}>
              <Image
                source={{ uri: item.icon }}
                style={styles.serviceIcon}
              />
            </View>
            <Text style={activeIndex === index ? styles.serviceBtnActive : styles.serviceBtnTxt}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatList: {
    marginTop: 5,
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  serviceItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  serviceIconContainer: {
    backgroundColor: Colors.SECONDARY,
    padding: 15,
    borderRadius: 99,
  },
  serviceIconContainerActive: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 99,
  },
  serviceIcon: {
    width: 30,
    height: 30,
  },
  serviceBtnTxt: {
    marginTop: 5,
    textAlign: 'center',
    color: Colors.black,
  },
  serviceBtnActive: {
    marginTop: 5,
    textAlign: 'center',
    color: Colors.PRIMARY,
  },
});

export default DoctorServices;