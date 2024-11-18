import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';

const PharmacistDashboardScreen = () => {
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
      <Text>PharmacistDashboardScreen</Text>
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
});