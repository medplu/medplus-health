import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';

interface CreatePharmacyProps {
  professionalId: string; // Prop for the professional's ID
}

const CreatePharmacy: React.FC<CreatePharmacyProps> = ({ professionalId }) => {
  const [name, setName] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [inventory, setInventory] = useState<string>('');
  const [operatingHours, setOperatingHours] = useState<string>('');
  const [services, setServices] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');

  const handleSubmit = async () => {
    if (!name || !contactNumber || !email || !street || !city || !state || !zipCode || !latitude || !longitude || !inventory || !operatingHours || !services || !licenseNumber) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('https://medplus-app.onrender.com/api/pharmacies', {
        name,
        contactNumber,
        email,
        street,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        inventory,
        operatingHours,
        services,
        licenseNumber,
        professionalId,
      });

      Alert.alert('Success', response.data.message);
    } catch (error: any) {
      const serverError = error.response?.data?.error || 'An error occurred while creating the pharmacy.';
      Alert.alert('Error', serverError);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Pharmacy</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Pharmacy Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Street"
        value={street}
        onChangeText={setStreet}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="State"
        value={state}
        onChangeText={setState}
      />
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        value={zipCode}
        onChangeText={setZipCode}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Inventory"
        value={inventory}
        onChangeText={setInventory}
      />
      <TextInput
        style={styles.input}
        placeholder="Operating Hours"
        value={operatingHours}
        onChangeText={setOperatingHours}
      />
      <TextInput
        style={styles.input}
        placeholder="Services"
        value={services}
        onChangeText={setServices}
      />
      <TextInput
        style={styles.input}
        placeholder="License Number"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Pharmacy</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreatePharmacy;
