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