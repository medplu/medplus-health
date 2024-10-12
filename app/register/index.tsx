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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const SignupScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [userType, setUserType] = useState<'client' | 'professional' | 'student' | null>(null);
  const [category, setCategory] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [buttonAnimation] = useState(new Animated.Value(1)); // Animation for buttons

  const router = useRouter();

  // Example button animation for interaction
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
    if (userType === 'professional' && category === '') {
      setErrorMessage('Please enter a category.');
      return;
    }

    try {
      const response = await axios.post('https://medplus-app.onrender.com/api/register', {
        firstName,
        lastName,
        email,
        password,
        gender,
        userType,
        category: userType === 'professional' ? category : undefined,
      });

      setErrorMessage(null);
      setSuccessMessage('Signup successful! Please check your email for verification.');
      setIsVerifying(true);
    } catch (error) {
      setErrorMessage('Signup failed. Please try again.');
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
                  selectedValue={category}
                  style={styles.input}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                >
                  <Picker.Item label="Select Category" value="" />
                  <Picker.Item label="Doctor" value="doctor" />
                  <Picker.Item label="Dentist" value="dentist" />
                  <Picker.Item label="Pharmacist" value="pharmacist" />
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

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  signupButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#555',
  },
  signupLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  genderButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: '#4CAF50',
  },
  genderText: {
    color: '#555',
    fontWeight: 'bold',
  },
  accountTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  accountTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedAccountType: {
    backgroundColor: '#4CAF50',
  },
  accountTypeText: {
    color: '#555',
    fontWeight: 'bold',
  },
});
