import * as React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  category: string;
  contactInfo?: string;
  image?: string;
}

interface ClinicCardItemProps {
  clinic: Clinic;
}

const ClinicCardItem: React.FC<ClinicCardItemProps> = ({ clinic }) => {
  return (
    <View style={styles.cardContainer}>
      {clinic.image && <Image source={{ uri: clinic.image }} style={styles.clinicImage} />}
      <Text style={styles.clinicName}>{clinic.name}</Text>
      <Text style={styles.clinicCategory}>{clinic.category}</Text>
      {clinic.contactInfo && <Text style={styles.clinicContact}>{clinic.contactInfo}</Text>}
      <Text style={styles.clinicAddress}>{clinic.address}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  clinicImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  clinicName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  clinicCategory: {
    fontSize: 14,
    color: '#666',
  },
  clinicContact: {
    fontSize: 14,
    color: '#333',
  },
  clinicAddress: {
    fontSize: 14,
    color: '#333',
  },
});

export default ClinicCardItem;