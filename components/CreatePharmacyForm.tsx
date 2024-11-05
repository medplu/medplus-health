import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { useRouter } from 'expo-router'; // Import useRouter

const CreatePharmacyForm = ({ user }) => {
    const [pharmacyForm, setPharmacyForm] = useState({
        name: '',
        contactNumber: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        operatingHours: { open: new Date(), close: new Date() },
        services: '',
        licenseNumber: '',
        image: null,
    });

    const [showOpenTimePicker, setShowOpenTimePicker] = useState(false);
    const [showCloseTimePicker, setShowCloseTimePicker] = useState(false);
    const [success, setSuccess] = useState(false); // New state for success message
    const router = useRouter(); // Initialize router

    const handleInputChange = (name, value) => {
        if (name === 'operatingHoursOpen' || name === 'operatingHoursClose') {
            setPharmacyForm(prevForm => ({
                ...prevForm,
                operatingHours: {
                    ...prevForm.operatingHours,
                    [name === 'operatingHoursOpen' ? 'open' : 'close']: value
                }
            }));
        } else {
            setPharmacyForm(prevForm => ({ ...prevForm, [name]: value }));
        }
    };

    const handleCreatePharmacy = async () => {
        try {
            const formData = new FormData();
            formData.append('name', pharmacyForm.name);
            formData.append('contactNumber', pharmacyForm.contactNumber);
            formData.append('email', pharmacyForm.email);
            formData.append('street', pharmacyForm.street);
            formData.append('city', pharmacyForm.city);
            formData.append('state', pharmacyForm.state);
            formData.append('zipCode', pharmacyForm.zipCode);
            formData.append('operatingHours', JSON.stringify({
                open: format(pharmacyForm.operatingHours.open, 'HH:mm'),
                close: format(pharmacyForm.operatingHours.close, 'HH:mm'),
            }));
            formData.append('services', pharmacyForm.services);
            formData.append('licenseNumber', pharmacyForm.licenseNumber);
            formData.append('professionalId', user.professional._id);
            if (pharmacyForm.image) {
                formData.append('image', {
                    uri: pharmacyForm.image,
                    type: 'image/jpeg',
                    name: 'pharmacy.jpg',
                });
            }

            const response = await fetch('https://medplus-health.onrender.com/api/pharmacies', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Pharmacy created successfully:', data);
                setSuccess(true); // Set success to true
            } else {
                console.error('Failed to create pharmacy:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating pharmacy:', error);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setPharmacyForm({ ...pharmacyForm, image: result.uri });
        }
    };

    return (
        <View style={styles.pharmacyFormContainer}>
            {success ? (
                <View>
                    <Text style={styles.successMessage}>Pharmacy created successfully!</Text>
                    <Button title="Go to Dashboard" onPress={() => router.push('/pharmacist/dashboard')} />
                </View>
            ) : (
                <>
                    <Text style={styles.sectionTitle}>Create Pharmacy</Text>
                    <TextInput style={styles.input} placeholder="Name" value={pharmacyForm.name} onChangeText={(value) => handleInputChange('name', value)} />
                    <TextInput style={styles.input} placeholder="Contact Number" value={pharmacyForm.contactNumber} onChangeText={(value) => handleInputChange('contactNumber', value)} />
                    <TextInput style={styles.input} placeholder="Email" value={pharmacyForm.email} onChangeText={(value) => handleInputChange('email', value)} />
                    <TextInput style={styles.input} placeholder="Street" value={pharmacyForm.street} onChangeText={(value) => handleInputChange('street', value)} />
                    <TextInput style={styles.input} placeholder="City" value={pharmacyForm.city} onChangeText={(value) => handleInputChange('city', value)} />
                    <TextInput style={styles.input} placeholder="State" value={pharmacyForm.state} onChangeText={(value) => handleInputChange('state', value)} />
                    <TextInput style={styles.input} placeholder="Zip Code" value={pharmacyForm.zipCode} onChangeText={(value) => handleInputChange('zipCode', value)} />
                    
                    <Text>Operating Hours Open</Text>
                    <Button title="Set Open Time" onPress={() => setShowOpenTimePicker(true)} />
                    {showOpenTimePicker && (
                        <DateTimePicker
                            value={pharmacyForm.operatingHours.open}
                            mode="time"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowOpenTimePicker(false);
                                handleInputChange('operatingHoursOpen', selectedDate || pharmacyForm.operatingHours.open);
                            }}
                        />
                    )}
                    <Text>Operating Hours Close</Text>
                    <Button title="Set Close Time" onPress={() => setShowCloseTimePicker(true)} />
                    {showCloseTimePicker && (
                        <DateTimePicker
                            value={pharmacyForm.operatingHours.close}
                            mode="time"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowCloseTimePicker(false);
                                handleInputChange('operatingHoursClose', selectedDate || pharmacyForm.operatingHours.close);
                            }}
                        />
                    )}

                    <TextInput style={styles.input} placeholder="Services" value={pharmacyForm.services} onChangeText={(value) => handleInputChange('services', value)} />
                    <TextInput style={styles.input} placeholder="License Number" value={pharmacyForm.licenseNumber} onChangeText={(value) => handleInputChange('licenseNumber', value)} />
                    <Button title="Pick an image from camera roll" onPress={pickImage} />
                    {pharmacyForm.image && <Image source={{ uri: pharmacyForm.image }} style={{ width: 200, height: 200 }} />}
                    <TouchableOpacity style={styles.createButton} onPress={handleCreatePharmacy}>
                        <Text style={styles.buttonText}>Create Pharmacy</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    pharmacyFormContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    createButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    successMessage: {
        fontSize: 18,
        color: 'green',
        marginBottom: 12,
        textAlign: 'center',
    },
});

export default CreatePharmacyForm;
