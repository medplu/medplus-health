import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../Shared/Colors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DoctorCardItem = ({ doctor }) => {
    const { firstName, lastName, category, availability, _id } = doctor;
    const router = useRouter();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);
                }
            } catch (error) {
                console.error('Failed to fetch user ID from AsyncStorage', error);
            }
        };

        fetchUserId();
    }, []);
const handleBookPress = async () => {
    try {
        await AsyncStorage.setItem(`doctor_${_id}`, JSON.stringify(doctor));
        router.push(`/doctor/${_id}`);
    } catch (error) {
        console.error('Failed to store doctor data', error);
    }
};

    return (
        <View style={styles.cardContainer}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                {/* Placeholder image as the response does not contain an image URL */}
                <Image
                    source={{ uri: 'https://via.placeholder.com/120x150' }}
                    style={{ width: 120, height: 150, objectFit: 'contain', borderRadius: 15 }}
                />

                <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={styles.headingContainer}>
                            <MaterialIcons name="verified" size={20} color={Colors.primary} />
                            <Text style={{ color: Colors.primary, fontFamily: 'Inter-Black-Semi', fontSize: 15 }}>
                                Professional Doctor
                            </Text>
                        </View>

                        <FontAwesome name="heart" size={20} color={Colors.primary} />
                    </View>

                    {/* doctor name - category - availability */}
                    <View>
                        <Text style={styles.doctorName}>
                            Dr. {firstName} {lastName}
                        </Text>
                        <Text style={styles.categoryName}>
                            {category}
                        </Text>
                        <Text style={[styles.categoryName, { color: Colors.primary }]}>
                            {availability ? 'Available' : 'Not Available'}
                        </Text>
                    </View>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontFamily: 'Inter-Black-Semi' }}>⭐⭐⭐⭐ 4.8 </Text>
                        <Text style={{ color: Colors.gray }}>49 Reviews</Text>
                    </View>
                </View>
            </View>

            {/* make appointment button */}
            <TouchableOpacity style={styles.makeAppointmentContainer} onPress={handleBookPress}>
                <Text style={{ color: Colors.primary, fontFamily: 'Inter-Black-Semi', fontSize: 15 }}>
                    Book Appointment
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    doctorName: {
        fontSize: 16,
        fontFamily: 'Inter-Black-Bold'
    },
    categoryName: {
        fontSize: 16,
        fontFamily: 'Inter-Black',
        color: Colors.gray
    },
    makeAppointmentContainer: {
        backgroundColor: Colors.SECONDARY,
        padding: 10,
        borderRadius: 9,
        alignItems: 'center'
    },
    headingContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.SECONDARY,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 99,
        gap: 5
    },
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 12,
        gap: 10
    }
});

export default DoctorCardItem;