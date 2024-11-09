import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '@/Services/auth';
import axios from 'axios';

const SignupScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [userType, setUserType] = useState<'client' | 'professional' | 'student' | null>(null);
  const [profession, setProfession] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [buttonAnimation] = useState(new Animated.Value(1));
  const [countdown, setCountdown] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
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

    if (userType === 'professional' && (profession === '' || !profession)) {
      setErrorMessage('Please select a profession.');
      return;
    }

    setIsRegistering(true);
    try {
      const userData = {
        firstName,
        lastName,
        email,
        password,
        gender,
        userType,
        ...(userType === 'professional' ? { profession } : {}),
      };

      await registerUser(userData);
      setErrorMessage(null);
      setSuccessMessage('Signup successful! Please check your email for verification.');
      setIsVerifying(true);
      setCountdown(60);
      setTimerActive(true);
    } catch (error) {
      setErrorMessage(error.message || 'Error creating user');
    } finally {
      setIsRegistering(false);
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
      router.push('/login');
    } catch (error) {
      setErrorMessage('Verification failed. Please try again.');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0) {
      setTimerActive(false);
      setErrorMessage('Verification code has expired.');
    }

    return () => clearInterval(timer);
  }, [timerActive, countdown]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Create an Account</Text>
        <Text style={styles.subHeading}>Sign up to get started</Text>

        {!isVerifying ? (
          <>
            <View style={styles.inputContainer}>
              <Image
                style={[styles.icon, styles.inputIcon]}
                source={{ uri: 'https://img.icons8.com/ios-filled/512/user.png' }}
              />
              <TextInput
                style={styles.inputs}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputContainer}>
              <Image
                style={[styles.icon, styles.inputIcon]}
                source={{ uri: 'https://img.icons8.com/ios-filled/512/user.png' }}
              />
              <TextInput
                style={styles.inputs}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputContainer}>
              <Image
                style={[styles.icon, styles.inputIcon]}
                source={{ uri: 'https://img.icons8.com/ios-filled/512/circled-envelope.png' }}
              />
              <TextInput
                style={styles.inputs}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Image
                style={[styles.icon, styles.inputIcon]}
                source={{ uri: 'https://img.icons8.com/ios-glyphs/512/key.png' }}
              />
              <TextInput
                style={styles.inputs}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#888"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Image
                style={[styles.icon, styles.inputIcon]}
                source={{ uri: 'https://img.icons8.com/ios-glyphs/512/key.png' }}
              />
              <TextInput
                style={styles.inputs}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#888"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

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
                style={styles.inputs}
                onValueChange={(itemValue) => setProfession(itemValue)}
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
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
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
            <View style={styles.inputContainer}>
              <Image
                style={[styles.icon, styles.inputIcon]}
                source={{ uri: 'https://img.icons8.com/ios-filled/512/verification-code.png' }}
              />
              <TextInput
                style={styles.inputs}
                placeholder="Verification Code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.countdownText}>
              {countdown > 0 ? `Time remaining: ${countdown}s` : 'Code expired!'}
            </Text>

            {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
            {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

            <TouchableOpacity style={styles.signupButton} onPress={handleVerificationPress}>
              <Text style={styles.signupButtonText}>Verify</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c5f0a4',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
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
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250,
    height: 45,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  icon: {
    width: 30,
    height: 30,
  },
  inputIcon: {
    marginLeft: 15,
    justifyContent: 'center',
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
    backgroundColor: '#226b80',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: 250,
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
  countdownText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
});

export default SignupScreen;
