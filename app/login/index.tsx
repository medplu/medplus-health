import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import SignInWithOAuth from '../../components/SignInWithOAuth';
import GlobalApi from '../../Services/GlobalApi';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New state for loading
  const router = useRouter();
  const dispatch = useDispatch(); 

  const handleLoginPress = async () => {
    if (email === '' || password === '') {
      setErrorMessage('Please enter both email and password.');
      return; // Prevent further execution
    }

    setIsLoggingIn(true); // Set loading state to true
    try {
      const response = await GlobalApi.loginUser(email, password);
      setErrorMessage(null);

      // Destructure properties directly from the response
      const {
        token,          // JWT token
        userId,        // User ID
        firstName,     // User's first name
        lastName,      // User's last name
        email: userEmail, // User's email
        userType,      // User type (e.g., client, professional)
        doctorId,       // Doctor ID (may be null)
        professional    // Professional object (may be null)
      } = response.data; // Adjusted to directly destructure from response.data

      // Check for missing names
      if (!firstName || !lastName) {
        console.error('First name or last name is missing:', { firstName, lastName });
      }

      // Dispatch login action with userId included
      dispatch(
        login({
          name: `${firstName} ${lastName}`,
          email: userEmail,
          userType,
          professional,  // Include the professional object
          profileImage: professional?.profileImage || null, // Adjust if profile image is available
          userId,  // Include userId in the dispatched action
        })
      );

      // Determine the route based on userType
      let route = '';
      switch (userType) {
        case 'professional':
          route = '/professional/tabs';
          break;
        case 'client':
          route = '/client/tabs';
          break;
        case 'student':
          route = '/student/tabs';
          break;
        default:
          route = '/student/tabs'; 
      }

      // Navigate to the determined route
      router.push(route);
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsLoggingIn(false); // Set loading state back to false
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
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLoginPress} 
            disabled={isLoggingIn} // Disable button when logging in
          >
            {isLoggingIn ? (
              <ActivityIndicator size="small" color="#fff" /> // Show loading indicator
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Google Login */}
          <SignInWithOAuth setErrorMessage={setErrorMessage} router={router} />

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
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#43C6AC',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  forgotPassword: {
    color: '#43C6AC',
    textAlign: 'center',
    marginTop: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
  },
  signupLink: {
    color: '#43C6AC',
    fontWeight: 'bold',
  },
});
