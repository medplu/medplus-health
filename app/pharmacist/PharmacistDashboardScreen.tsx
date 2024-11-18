import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useNavigation } from '@react-navigation/native';

const PharmacistDashboardScreen = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const professionalId = user.professional?._id;
  const [pharmacy, setPharmacy] = useState(null);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        const response = await fetch(`https://medplus-health.onrender.com/api/pharmacies/professional/${professionalId}`);
        const data = await response.json();
        setPharmacy(data);
      } catch (error) {
        console.error('Error fetching pharmacy:', error);
      }
    };

    if (professionalId) {
      fetchPharmacy();
    }
  }, [professionalId]);

  return (
    <View style={styles.container}>
      <View style={styles.introSection}>
        <Image
          source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/men/46.jpg' }}
          style={styles.profileImage}
        />
        <Text style={styles.welcomeText}>Welcome, {user.professional?.firstName || 'Pharmacist'}!</Text>
      </View>
      {pharmacy && <Text style={styles.pharmacyText}>Pharmacy: {pharmacy.name}</Text>}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DrugScreen', { pharmacyId: pharmacy?._id })}
      >
        <Text style={styles.cardText}>Catalogue</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PrescriptionScreen', { pharmacyId: pharmacy?._id })}
      >
        <Text style={styles.cardText}>View Prescriptions</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PharmacistDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  introSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pharmacyText: {
    fontSize: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
