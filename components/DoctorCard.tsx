// DoctorCard.tsx
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

interface Doctor {
  id: string;
  name: string;
  title: string;
  rating: number;
  availability: boolean;
  fee: string;
  image: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
      <View style={styles.cardContent}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorTitle}>{doctor.title}</Text>
        <Text style={styles.doctorRating}>⭐ {doctor.rating}</Text>
        {doctor.availability && <Text style={styles.doctorAvailability}>Available</Text>}
        <Text style={styles.doctorFee}>Consultation: {doctor.fee}</Text>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    marginBottom: 15,
    marginTop: 0, // Ensure no extra margin at the top
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  doctorRating: {
    fontSize: 14,
    color: '#777',
  },
  doctorAvailability: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 5,
  },
  doctorFee: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DoctorCard;