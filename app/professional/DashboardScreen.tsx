import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome';
import { selectUser } from '../store/userSlice'; // Adjust the import based on your project structure
import { RootState } from '../store/configureStore'; // Adjust the import based on your project structure
import { useRouter } from 'expo-router';
import useAppointments from '../../hooks/useAppointments'; // Adjust the import based on your project structure
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const DashboardScreen: React.FC = () => {
    const router = useRouter();
    const user = useSelector(selectUser);
    const { appointments, loading, error } = useAppointments();

    const handleViewPatient = (patientId: string, appointmentId: string) => {
        router.push(`/patient/${patientId}?appointmentId=${appointmentId}`);
    };

    // Calculate statistics based on real data
    const totalAppointments = appointments.length;
    // Filter to get upcoming appointments (keep as an array)
    const upcomingAppointments = appointments.filter(appointment => {
        const appointmentDate = appointment.date && moment(appointment.date);
        return (
            (appointment.status === 'confirmed' || appointment.status === 'pending') &&
            appointmentDate && appointmentDate.isSame(moment(), 'day')
        );
    });
    
    // Log appointments and upcomingAppointments for debugging
    useEffect(() => {
        console.log('All Appointments:', appointments);
        console.log('Upcoming Appointments:', upcomingAppointments);
    }, [appointments, upcomingAppointments]);

    const requestedAppointments = appointments.filter(appointment => appointment.status === 'requested');
    const completedAppointments = appointments.filter(appointment => appointment.status === 'completed');

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
                <>
                    {/* Welcome Card */}
                    <View style={styles.card}>
                        <Text style={styles.greetingText}>Welcome, {user.name}!</Text>
                    </View>

                    {/* Overview Section */}
                    <View style={styles.overviewContainer}>
                        <View style={styles.overviewHeader}>
                            <Text style={styles.sectionTitle}>Overview</Text>
                            <View style={styles.iconContainer}>
                                {upcomingAppointments.length > 0 && (
                                    <View style={styles.badge} />
                                )}
                                <Icon name="calendar" size={24} color="#333" style={styles.icon} />
                            </View>
                        </View>

                        <View style={styles.overviewCard}>
                            <TouchableOpacity style={styles.overviewItem}>
                                <Text style={styles.overviewLabel}>Total Appointments</Text>
                                <Text style={styles.overviewNumber}>{totalAppointments}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.overviewItem}>
                                <Text style={styles.overviewLabel}>Upcoming</Text>
                                <Text style={styles.overviewNumber}>{upcomingAppointments.length}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.overviewItem}>
                                <Text style={styles.overviewLabel}>Requested</Text>
                                <Text style={styles.overviewNumber}>{requestedAppointments.length}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.overviewItem}>
                                <Text style={styles.overviewLabel}>Completed</Text>
                                <Text style={styles.overviewNumber}>{completedAppointments.length}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Upcoming Appointments Section */}
<View style={styles.upcomingContainer}>
    <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
    {upcomingAppointments.length > 0 ? (
        upcomingAppointments.map((appointment) => {
            // Format the date to a friendly format
            const appointmentDate = moment(appointment.date).calendar(null, {
                sameDay: '[Today]', // e.g., Today
                nextDay: '[Tomorrow]', // e.g., Tomorrow
                nextWeek: 'dddd', // e.g., Monday
                sameElse: 'MMMM D, YYYY' // e.g., November 6, 2024
            });
            
            return (
                <View key={appointment._id} style={styles.appointmentCard}>
                    <View style={styles.appointmentDetails}>
                        <Text style={styles.patientName}>{appointment.patientName}</Text>
                        <Text style={styles.appointmentTime}>{appointment.time}</Text>
                        <Text style={styles.appointmentDate}>{appointmentDate}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => handleViewPatient(appointment.patientId._id, appointment._id)}
                    >
                        <Text style={styles.buttonText}>View Patient</Text>
                    </TouchableOpacity>
                </View>
            );
        })
    ) : (
        <Text style={styles.noAppointmentsText}>No upcoming appointments.</Text>
    )}
</View>

                </>
            ) : (
                <Text style={styles.loginPrompt}>Please log in to see your dashboard.</Text>
            )}
        </ScrollView>
    );
};

const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => rgba(0, 0, 0, opacity),
    labelColor: (opacity = 1) => rgba(0, 0, 0, opacity),
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    appointmentDetails: {
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    appointmentTime: {
        fontSize: 14,
        color: '#555',
    },
    viewButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
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
});

export default DashboardScreen;
const rgba = (r: number, g: number, b: number, a: number) => {
    return `rgba(${r},${g},${b},${a})`;
};

