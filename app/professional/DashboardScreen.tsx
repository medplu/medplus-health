import React from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome';
import { selectUser } from '../store/userSlice';
import { RootState } from '../store/configureStore';
import { useRouter } from 'expo-router';
import useAppointments from '../../hooks/useAppointments';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const DashboardScreen: React.FC = () => {
    const router = useRouter();
    const user = useSelector(selectUser);
    const { appointments, loading, error } = useAppointments();

    const handleViewPatient = (patientId: string) => {
        router.push(`/patient/${patientId}`);
    };

    // Calculate statistics based on real data
    const totalAppointments = appointments.length;
    const upcomingAppointments = appointments.filter(appointment => appointment.status === 'confirmed');
    const requestedAppointments = appointments.filter(appointment => appointment.status === 'requested').length;
    const completedAppointments = appointments.filter(appointment => appointment.status === 'completed').length;

    const patientData = [
        { name: 'Male', population: 40, color: '#4f8bc2', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Female', population: 60, color: '#f15b5b', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'New', population: 30, color: '#FBFF8F', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Returning', population: 20, color: '#8bffff', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    ];

    const consultsData = {
        labels: ['New', 'Returning'],
        datasets: [
            {
                data: [30, 20],
            },
        ],
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {user.isLoggedIn ? (
                user.attachedToClinic ? (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.greetingText}>Welcome, {user.name}!</Text>
                        </View>

                        {/* Dashboard components go here */}
                    </>
                ) : (
                    <View style={styles.noClinicContainer}>
                        <Text style={styles.noClinicText}>You are not attached to a clinic. Please contact admin to attach your profile to a clinic.</Text>
                    </View>
                )
            ) : (
                <Text style={styles.loginPrompt}>Please log in to see your dashboard.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: '#ff7f50',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    noClinicContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noClinicText: {
        fontSize: 16,
        color: '#ff5c5c',
        textAlign: 'center',
    },
    loginPrompt: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
    },
    // other styles...
});

export default DashboardScreen;
