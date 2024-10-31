import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { registerUser, verifyEmail } from '@/Services/auth';
import axios from 'axios';


const { width } = Dimensions.get('window');

const SignupScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [userType, setUserType] = useState<'client' | 'professional' | 'student' | null>(null);
  const [profession, setProfession] = useState('');  // Changed from category to profession
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [buttonAnimation] = useState(new Animated.Value(1));

  const router = useRouter();

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSignupPress = async () => {
    if (
      firstName === '' ||
      lastName === '' ||
      email === '' ||
      password === '' ||
      confirmPassword === '' ||
      !gender ||
      !userType
    ) {
      setErrorMessage('Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
  
    // Check for profession if userType is professional
    if (userType === 'professional' && (profession === '' || !profession)) {
      setErrorMessage('Please select a profession.');
      return;
    }
  
    try {
      // Prepare user registration data
      const userData = {
        firstName,
        lastName,
        email,
        password,
        gender,
        userType,
        // Send profession only if userType is professional
        ...(userType === 'professional' ? { profession } : {}),
      };
  
      await registerUser(userData); // Pass user data
  
      setErrorMessage(null);
      setSuccessMessage('Signup successful! Please check your email for verification.');
      setIsVerifying(true);
    } catch (error) {
      setErrorMessage(error.message || 'Error creating user'); // Set error message
    }
  };
  
  const handleVerificationPress = async () => {
    try {
      const response = await axios.post('https://medplus-health.onrender.com/api/verify-email', {
        email,
        verificationCode,
      });

      setErrorMessage(null);
      setSuccessMessage('Verification successful! You can now log in.');
      setIsVerifying(false);
      router.push('/login'); // Route to login page after successful verification
    } catch (error) {
      setErrorMessage('Verification failed. Please try again.');
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.heading}>Create an Account</Text>
          <Text style={styles.subHeading}>Sign up to get started</Text>

          {!isVerifying ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#888"
              />

              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#888"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#888"
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#888"
                secureTextEntry
              />

              {/* Gender Selection */}
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'Male' && styles.selectedGender]}
                  onPress={() => setGender('Male')}
                >
                  <Text style={styles.genderText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'Female' && styles.selectedGender]}
                  onPress={() => setGender('Female')}
                >
                  <Text style={styles.genderText}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'Other' && styles.selectedGender]}
                  onPress={() => setGender('Other')}
                >
                  <Text style={styles.genderText}>Other</Text>
                </TouchableOpacity>
              </View>

              {/* Account Type Selection */}
              <View style={styles.accountTypeContainer}>
                <TouchableOpacity
                  style={[styles.accountTypeButton, userType === 'client' && styles.selectedAccountType]}
                  onPress={() => setUserType('client')}
                >
                  <Text style={styles.accountTypeText}>Client</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.accountTypeButton, userType === 'professional' && styles.selectedAccountType]}
                  onPress={() => setUserType('professional')}
                >
                  <Text style={styles.accountTypeText}>Professional</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.accountTypeButton, userType === 'student' && styles.selectedAccountType]}
                  onPress={() => setUserType('student')}
                >
                  <Text style={styles.accountTypeText}>Student</Text>
                </TouchableOpacity>
              </View>

              {userType === 'professional' && (
                <Picker
                  selectedValue={profession}
                  style={styles.input}
                  onValueChange={(itemValue) => setProfession(itemValue)}  // Update to profession
                >
                  <Picker.Item label="Select Profession" value="" />
                  <Picker.Item label="Doctor" value="doctor" />
                  <Picker.Item label="Dentist" value="dentist" />
                  <Picker.Item label="Pharmacist" value="pharmacist" />
                  <Picker.Item label="Nurse" value="nurse" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              )}

              {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
              {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

              <Animated.View style={{ transform: [{ scale: buttonAnimation }] }}>
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={() => {
                    animateButton();
                    handleSignupPress();
                  }}
                >
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.signupLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.subHeading}>Enter the verification code sent to your email</Text>

              <TextInput
                style={styles.input}
                placeholder="Verification Code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholderTextColor="#888"
                keyboardType="numeric"
              />

              {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
              {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

              <TouchableOpacity style={styles.signupButton} onPress={handleVerificationPress}>
                <Text style={styles.signupButtonText}>Verify</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: width * 0.8,
    alignSelf: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: '#cce5ff',
  },
  genderText: {
    fontSize: 16,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  accountTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedAccountType: {
    backgroundColor: '#cce5ff',
  },
  accountTypeText: {
    fontSize: 16,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
  },
  successMessage: {
    color: 'green',
    marginBottom: 10,
  },
  signupButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    color: '#007BFF',
  },
});

export default SignupScreen;



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
                <>
                    <View style={styles.card}>
                        <Text style={styles.greetingText}>Welcome, {user.name}!</Text>
                    </View>

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
                                <Text style={styles.overviewNumber}>{requestedAppointments}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.overviewItem}>
                                <Text style={styles.overviewLabel}>Completed</Text>
                                <Text style={styles.overviewNumber}>{completedAppointments}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.upcomingContainer}>
                        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((appointment) => (
                                <View key={appointment._id} style={styles.appointmentCard}>
                                    <View style={styles.appointmentDetails}>
                                        <Text style={styles.patientName}>{appointment.patientName}</Text>
                                        <Text style={styles.appointmentTime}>{appointment.date}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() => handleViewPatient(appointment.userId)}
                                    >
                                        <Text style={styles.buttonText}>View Patient</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noAppointmentsText}>No upcoming appointments.</Text>
                        )}
                    </View>

                    <View style={styles.analyticsContainer}>
                        <Text style={styles.sectionTitle}>Patients</Text>
                        <Text style={styles.chartTitle}>Patient Analysis</Text>
                        <PieChart
                            data={patientData}
                            width={screenWidth - 32}
                            height={screenHeight * 0.25}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />

                        <View style={styles.customLegend}>
                            {patientData.map((data, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendColorBox, { backgroundColor: data.color }]} />
                                    <Text style={styles.legendLabel}>{data.name}</Text>
                                </View>
                            ))}
                        </View>
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

function rgba(arg0: number, arg1: number, arg2: number, $: any, arg4: { opacity: number; }) {
    throw new Error('Function not implemented.');
}
