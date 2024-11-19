import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
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
  images?: string[];
  category: string;
  doctors: Doctor[];
  description?: string;
  education: {
    course: string;
    university: string;
  };
  experiences: {
    position: string;
    organization: string;
    startDate: string;
    endDate?: string;
  }[];
  insuranceCompanies: string[];
  languages: string;
  assistantName: string;
  assistantPhone: string;
  bio: string;
  referenceCode: string;
  __v: number;
}

interface HospitalAppointementInfoProps {
  clinic: Clinic;
}

const HospitalAppointementInfo: React.FC<HospitalAppointementInfoProps> = ({ clinic }) => {
  const [showFullDesc, setShowFullDesc] = useState(false);

  const truncatedDesc = showFullDesc 
    ? clinic.bio || "No bio available."
    : (clinic.bio ? clinic.bio.split(" ").slice(0, 18).join(" ") : 'No bio available.');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        {clinic.images && clinic.images.length > 0 && (
          <FlatList
            data={clinic.images}
            horizontal
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} />
            )}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.headerText}>
        <Text style={styles.title}>{clinic.name}</Text>
        <View style={styles.infoRow}>
          <EvilIcons name="location" size={16} color={Colors.gray} />
          <Text style={styles.address}>{clinic.address}</Text>
        </View>
        <Text style={styles.contactInfo}>{clinic.contactInfo}</Text>
      </View>

      <ClinicSubHeading subHeadingTitle={'About'} />
      <Text style={styles.description}>{truncatedDesc}</Text>
      <TouchableOpacity onPress={() => setShowFullDesc(prev => !prev)}>
        <Text style={styles.seeMoreText}>
          {showFullDesc ? 'Hide' : 'See More'}
        </Text>
      </TouchableOpacity>

      <ClinicSubHeading subHeadingTitle={'Insurance Companies'} />
      <FlatList
        data={clinic.insuranceCompanies}
        horizontal={true}
        renderItem={({ item }) => (
          <View style={styles.insuranceCard}>
            <Text style={styles.insurance}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.insuranceList}
      />

      <ClinicSubHeading subHeadingTitle={'Specialties'} />
      <FlatList
        data={clinic.specialties.split(',')}
        horizontal={true}
        renderItem={({ item }) => (
          <View style={styles.specialtyCard}>
            <Text style={styles.specialty}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtyList}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
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
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Black-Semi',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Inter-Black',
    color: Colors.gray,
  },
  contactInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Black',
    color: Colors.gray,
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
  insuranceCard: {
    backgroundColor: Colors.light_gray,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  insurance: {
    fontSize: 14,
    color: Colors.primary,
  },
  insuranceList: {
    marginBottom: 10,
  },
  specialtyCard: {
    backgroundColor: Colors.light_gray,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  specialty: {
    fontSize: 14,
    color: Colors.primary,
  },
  specialtyList: {
    marginBottom: 10,
  },
});

export default HospitalAppointementInfo;
