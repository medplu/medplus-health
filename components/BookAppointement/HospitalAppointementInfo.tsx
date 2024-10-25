import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Colors from '../Shared/Colors';
import ClinicSubHeading from '../clinics/ClinicSubHeading';

interface Doctor {
  _id: string;
  name: string;
  specialties: string[];
  experience: string;
}

interface Clinic {
  _id: string;
  name: string;
  contactInfo: string;
  address: string;
  image?: string;
  category: string;
  doctors: Doctor[];
  description?: string;
  __v: number;
}

interface HospitalAppointementInfoProps {
  clinic: Clinic;
}

const HospitalAppointementInfo: React.FC<HospitalAppointementInfoProps> = ({ clinic }) => {
  const [showFullDesc, setShowFullDesc] = useState(false);

  const truncatedDesc = showFullDesc 
    ? clinic.description || "No description available."
    : (clinic.description ? clinic.description.split(" ").slice(0, 18).join(" ") : 'No description available.');

  return (
    <View style={styles.container}>
      {clinic.image && <Image source={{ uri: clinic.image }} style={styles.image} />}
      
      <View style={styles.headerRow}>
        <Text style={styles.title}>{clinic.name}</Text>
        <View style={styles.infoRow}>
          <EvilIcons name="location" size={16} color={Colors.gray} />
          <Text style={styles.title}>{clinic.address}</Text>
        </View>
      </View>

      <FlatList
        data={[{ name: clinic.category }]}
        horizontal={true}
        renderItem={({ item }) => (
          <Text style={styles.category}>{item.name}</Text>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.categoryList}
      />

      <ClinicSubHeading subHeadingTitle={'About'} />

      <Text style={styles.description}>{truncatedDesc}</Text>

      <TouchableOpacity onPress={() => setShowFullDesc(prev => !prev)}>
        <Text style={styles.seeMoreText}>
          {showFullDesc ? 'Hide' : 'See More'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Black-Semi',
    flexShrink: 1,
    marginRight: 10,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Inter-Black',
    color: Colors.gray,
    flexShrink: 1,
  },
  category: {
    marginTop: 5,
    color: Colors.gray,
    marginRight: 6,
    fontSize: 13,
  },
  categoryList: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  seeMoreText: {
    color: Colors.primary,
    fontFamily: 'Inter-Black-Semi',
    fontSize: 14,
  },
});

export default HospitalAppointementInfo;
