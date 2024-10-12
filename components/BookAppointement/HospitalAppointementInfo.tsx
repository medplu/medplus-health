import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import ActionButton from '../common/ActionButton';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { AntDesign } from '@expo/vector-icons';
import HorizontalLine from '../common/HorizontalLine';
import Colors from '../Shared/Colors';
import SubHeading from '../../components/dashboard/SubHeading';

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
      <Text style={styles.title}>{clinic.name}</Text>

      <FlatList
        data={[{ name: clinic.category }]}
        horizontal={true}
        renderItem={({ item }) => (
          <Text style={styles.category}>{item.name}</Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <HorizontalLine />

      <View style={styles.infoRow}>
        <EvilIcons name="location" size={24} color="black" />
        <Text style={styles.infoText}>{clinic.address}</Text>
      </View>

      <View style={styles.infoRow}>
        <AntDesign name="clockcircle" size={16} color={Colors.primary} />
        <Text style={styles.infoText}>Mon - Sun | 11 AM - 8 PM</Text>
      </View>

      <ActionButton />

      <HorizontalLine />

      <SubHeading subHeadingTitle={'About'} />

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
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%'
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 23,
    fontFamily: 'Inter-Black-Semi',
    marginBottom: 10,
  },
  category: {
    marginTop: 10,
    color: Colors.gray,
    marginRight: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoText: {
    fontSize: 18,
    fontFamily: 'Inter-Black',
    color: Colors.gray,
    marginLeft: 9,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  seeMoreText: {
    color: Colors.primary,
    fontFamily: 'Inter-Black-Semi',
  },
});

export default HospitalAppointementInfo;