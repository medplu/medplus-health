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
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

const SignupScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [userType, setUserType] = useState<'client' | 'professional' | 'student' | null>(null);
  const [verificationCode, setVerificationCode] = useState(''); // State for verification code
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false); // State for verification process

  const router = useRouter(); // Initialize the useRouter hook

  // Handle signup press
  const handleSignupPress = async () => {
    if (firstName === '' || lastName === '' || email === '' || password === '' || confirmPassword === '' || !gender || !userType) {
      setErrorMessage('Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      // Send POST request to the backend server
      const response = await axios.post('http://localhost:3000/api/register', {
        firstName,
        lastName,
        email,
        password,
        gender,
        userType,
      });

      // Handle successful signup
      setErrorMessage(null);
      setSuccessMessage('Signup successful! Please check your email for verification.');
      setIsVerifying(true); // Set verifying state to true

      // Do NOT reset the email to ensure it's available for verification
      setFirstName('');
      setLastName('');
      setPassword('');
      setConfirmPassword('');
      setGender(null);
      setUserType(null);
    } catch (error) {
      console.error('Error during signup:', error);
      setErrorMessage('Signup failed. Please try again.');
    }
  };

  // Handle verification press
  const handleVerificationPress = async () => {
    if (verificationCode === '') {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    try {
      // Send POST request to the backend server for verification
      const response = await axios.post('http://localhost:3000/api/verify-email', {
        email, // The email should remain in the state
        verificationCode,
      });

      // Extract token and userType from the response
      const { token, userType } = response.data;

      // Handle successful verification
      setErrorMessage(null);
      setSuccessMessage('Email verified successfully!');
      setIsVerifying(false); // Reset verifying state

      // Store the token if needed (e.g., in local storage or state)
      // localStorage.setItem('token', token);

      // Navigate based on userType
      if (userType === 'professional') {
        router.push('/professional');
      } else if (userType === 'client') {
        router.push('/client');
      } else if (userType === 'student') {
        router.push('/student');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setErrorMessage('Verification failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/medical-symbol.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Create an Account</Text>
        <Text style={styles.subHeading}>Sign up to get started</Text>

        {!isVerifying ? (
          <>
            {/* First Name Input */}
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor="#888"
            />

            {/* Last Name Input */}
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor="#888"
            />

            {/* Email Input */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#888"
              secureTextEntry
            />

            {/* Confirm Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#888"
              secureTextEntry
            />

            {/* Gender Selector */}
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'Male' && styles.selectedGender,
                ]}
                onPress={() => setGender('Male')}
              >
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'Female' && styles.selectedGender,
                ]}
                onPress={() => setGender('Female')}
              >
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'Other' && styles.selectedGender,
                ]}
                onPress={() => setGender('Other')}
              >
                <Text style={styles.genderText}>Other</Text>
              </TouchableOpacity>
            </View>

            {/* User Type Selector */}
            <View style={styles.accountTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  userType === 'client' && styles.selectedAccountType,
                ]}
                onPress={() => setUserType('client')}
              >
                <Text style={styles.accountTypeText}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  userType === 'professional' && styles.selectedAccountType,
                ]}
                onPress={() => setUserType('professional')}
              >
                <Text style={styles.accountTypeText}>Professional</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  userType === 'student' && styles.selectedAccountType,
                ]}
                onPress={() => setUserType('student')}
              >
                <Text style={styles.accountTypeText}>Student</Text>
              </TouchableOpacity>
            </View>

            {/* Error and Success Messages */}
            {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
            {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

            {/* Signup Button */}
            <TouchableOpacity style={styles.signupButton} onPress={handleSignupPress}>
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
             {/* Login Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Already have an account? </Text>
          <TouchableOpacity  onPress={() => router.push('/login')}>
            <Text style={styles.signupLink}>Login</Text>
          </TouchableOpacity>
        </View>
          </>
        ) : (
          <>
            <Text style={styles.subHeading}>Enter the verification code sent to your email</Text>

            {/* Verification Code Input */}
            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholderTextColor="#888"
              keyboardType="numeric"
            />

            {/* Error and Success Messages */}
            {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
            {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

            {/* Verify Button */}
            <TouchableOpacity style={styles.signupButton} onPress={handleVerificationPress}>
              <Text style={styles.signupButtonText}>Verify</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
  },
  formContainer: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#00796B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subHeading: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  input: {
    width: width * 0.9,
    padding: 12,
    marginVertical: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.9,
    marginVertical: 16,
  },
  genderButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  selectedGender: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  genderText: {
    color: '#333',
    fontSize: 16,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.9,
    marginVertical: 16,
  },
  accountTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  selectedAccountType: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  accountTypeText: {
    color: '#333',
    fontSize: 16,
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    marginVertical: 8,
  },
  successMessage: {
    color: 'green',
    fontSize: 14,
    marginVertical: 8,
  },
  signupButton: {
    width: width * 0.9,
    padding: 16,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupScreen;