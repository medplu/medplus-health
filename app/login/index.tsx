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
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { checkUserExists, loginUser, registerUser } from '@/Services/auth';


const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLoginPress = async () => {
    if (email === '' || password === '') {
      setErrorMessage('Please enter both email and password.');
    } else {
      try {
        const response = await loginUser(email, password);
        setErrorMessage(null);

        const { token, userId, userType, doctorId, firstName, lastName, email: userEmail } = response;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('userType', userType);
        await AsyncStorage.setItem('firstName', firstName);
        await AsyncStorage.setItem('lastName', lastName);
        await AsyncStorage.setItem('email', userEmail);

        if (doctorId) await AsyncStorage.setItem('doctorId', doctorId);

        const route = userType === 'professional' ? '/professional/tabs' : userType === 'client' ? '/client/tabs' : '/student/tabs';
        router.push(route as const);
      } catch (error) {
        console.error('Error during login:', error);
        setErrorMessage('Invalid email or password. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { email: googleEmail, givenName, familyName, photo } = userInfo.user;

      // Check if user already exists in your database
      const response = await checkUserExists(googleEmail);
      
      if (response.exists) {
        // User exists
        const { token, userId, userType, doctorId, firstName, lastName } = response.user;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('userType', userType);
        await AsyncStorage.setItem('firstName', firstName);
        await AsyncStorage.setItem('lastName', lastName);
        if (doctorId) await AsyncStorage.setItem('doctorId', doctorId);

        const route = userType === 'professional' ? '/professional/tabs' : userType === 'client' ? '/client/tabs' : '/student/tabs';
        router.push(route as const);
      } else {
        // User does not exist, register them in your database
        const registerResponse = await registerUser({
          firstName: givenName,
          lastName: familyName,
          email: googleEmail,
          profileImage: photo,
        });

        if (registerResponse) {
          const { token, userId, userType, doctorId, firstName, lastName } = registerResponse;
          await AsyncStorage.setItem('authToken', token);
          await AsyncStorage.setItem('userId', userId);
          await AsyncStorage.setItem('userType', userType);
          await AsyncStorage.setItem('firstName', firstName);
          await AsyncStorage.setItem('lastName', lastName);
          if (doctorId) await AsyncStorage.setItem('doctorId', doctorId);

          const route = userType === 'professional' ? '/professional/tabs' : userType === 'client' ? '/client/tabs' : '/student/tabs';
          router.push(route as const);
        } else {
          setErrorMessage('Failed to register user. Please try again.');
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setErrorMessage('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#43C6AC', '#191654']} style={styles.backgroundGradient}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.heading}>Login</Text>
          <Text style={styles.subHeading}>Welcome back, please login to your account</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#888"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#666" style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Google Login */}
          <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButton}>
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subHeading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#00796B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#00796B',
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#00796B',
    fontWeight: 'bold',
  },
});