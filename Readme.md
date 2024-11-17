import React from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome';
import { selectUser } from '../store/userSlice'; // Updated path if necessary
import { RootState } from '../store/configureStore';
import { useRouter } from 'expo-router';
import useAppointments from '../../hooks/useAppointments';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const DashboardScreen: React.FC = () => {
    const router = useRouter();
    const user = useSelector(selectUser); // Ensure 'selectUser' is correctly imported and defined
    const { appointments = [], loading, error } = useAppointments(); // Default to empty array

    const handleViewPatient = (appointment) => {
        console.log('Received appointment data:', appointment); // Log the entire appointment object
    
        // Access the patient ID directly from the appointment object
        if (appointment && appointment._id) {
            const patientId = appointment._id; // Use the correct property to get the ID
            router.push(`/patient/${patientId}`); // Navigate to the patient page
        } else {
            console.error('Patient ID is not available in the appointment data', appointment);
        }
    };

    const handleAddToSchedule = (appointmentId: string) => {
        // Implement scheduling logic here
        console.log(`Add to schedule clicked for appointment: ${appointmentId}`);
    };

    // Calculate statistics based on real data
    const totalAppointments = Array.isArray(appointments) ? appointments.length : 0;
    const upcomingAppointments = Array.isArray(appointments) ? appointments.filter(appointment => appointment.status === 'confirmed') : [];
    const requestedAppointments = Array.isArray(appointments) ? appointments.filter(appointment => appointment.status === 'requested').length : 0;
    const completedAppointments = Array.isArray(appointments) ? appointments.filter(appointment => appointment.status === 'completed').length : 0;

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

    console.log('Upcoming Appointments:', upcomingAppointments);

    return (
        <ScrollView style={styles.container}>
            {user.isLoggedIn ? (
                user.professional.profession === 'doctor' ? (
                    user.professional.attachedToClinic ? (
                        <View style={styles.doctorContainer}>
                            <Text style={styles.sectionTitle}>Doctor Dashboard</Text>
                            {/* Add more doctor-specific components */}
                        </View>
                    ) : (
                        <View style={styles.noClinicContainer}>
                            <Text style={styles.noClinicText}>You are not attached to a clinic. Please contact admin to attach your profile to a clinic.</Text>
                        </View>
                    )
                ) : (
                    <View style={styles.noClinicContainer}>
                        <Text style={styles.noClinicText}>You are not a doctor. Please contact admin for further assistance.</Text>
                    </View>
                )
            ) : (
                <Text style={styles.loginPrompt}>Please log in to see your dashboard.</Text>
            )}
        </ScrollView>
    );
};

const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
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
    overviewContainer: {
        marginBottom: 20,
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    overviewCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    overviewItem: {
        alignItems: 'center',
        padding: 8,
    },
    overviewLabel: {
        fontSize: 12,
        color: '#666',
    },
    overviewNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    analyticsContainer: {
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 14,
        color: '#666',
        marginVertical: 8,
    },
    customLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColorBox: {
        width: 12,
        height: 12,
        marginRight: 5,
    },
    legendLabel: {
        fontSize: 12,
        color: '#7F7F7F',
    },
    upcomingContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    appointmentCard: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 3, // For Android shadow
    },
    appointmentDetails: {
        marginBottom: 12, // Space between details and buttons
    },
    patientName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    appointmentTime: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
    },
    viewButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    addScheduleButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'flex-start',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    loginPrompt: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 8,
        height: 8,
        backgroundColor: '#f44336',
        borderRadius: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
    patientDetails: {
        fontSize: 14,
        color: '#777',
    },
});

export default DashboardScreen;
