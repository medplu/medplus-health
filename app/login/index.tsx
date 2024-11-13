import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import GlobalApi from '../../Services/GlobalApi';
import SignInWithOAuth from '../../components/SignInWithOAuth';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLoginPress = async () => {
    if (email === '' || password === '') {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await GlobalApi.loginUser(email, password);
    
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      setErrorMessage(null);

      const {
        token,
        userId,
        firstName,
        lastName,
        email: userEmail,
        userType,
        doctorId,
        professional,
        profileImage,
        // Add any other attributes here
      } = response.data;

      if (!firstName || !lastName) {
        console.error('First name or last name is missing:', { firstName, lastName });
      }

      dispatch(
        login({
          name: `${firstName} ${lastName}`,
          email: userEmail,
          userId, 
          userType,
          professional,
          profileImage,
          // Add any other attributes here
        })
      );

      let route = '';
      switch (userType) {
        case 'professional':
          if (professional.profession === 'pharmacist') {
            route = '/pharmacist/tabs';
          } else {
            route = '/professional';
          }
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

      router.push(route);
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
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
          keyboardType="email-address"
          underlineColorAndroid="transparent"
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
          secureTextEntry={!showPassword}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            style={styles.icon}
            source={{ uri: showPassword ? 'https://img.icons8.com/ios-glyphs/512/visible.png' : 'https://img.icons8.com/ios-glyphs/512/invisible.png' }}
          />
        </TouchableOpacity>
      </View>

      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.restoreButtonContainer}>
        <Text>Forgot?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonContainer, styles.loginButton]}
        onPress={handleLoginPress}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonContainer} onPress={() => router.push('/register')}>
        <Text>Register</Text>
      </TouchableOpacity>

      <SignInWithOAuth setErrorMessage={setErrorMessage} router={router} />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c5f0a4',
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
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
  },
  loginButton: {
    backgroundColor: '#226b80',
  },
  fabookButton: {
    backgroundColor: '#3b5998',
  },
  googleButton: {
    backgroundColor: '#ff0000',
  },
  loginText: {
    color: 'white',
  },
  restoreButtonContainer: {
    width: 250,
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  socialButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

