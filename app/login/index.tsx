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
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalApi from '../../Services/GlobalApi';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';

const { width } = Dimensions.get('window');

const useWarmUpBrowser = () => {
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      void WebBrowser.warmUpAsync();
    }
    return () => {
      if (Platform.OS !== 'web') {
        void WebBrowser.coolDownAsync();
      }
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

interface SignInWithOAuthProps {
  setErrorMessage: (message: string | null) => void;
}

const SignInWithOAuth: React.FC<SignInWithOAuthProps> = ({ setErrorMessage }) => {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/client/tabs', { scheme: 'myapp' }),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        setErrorMessage('Failed to login with Google. Please try again.');
      }
    } catch (err) {
      console.error('OAuth error', err);
      setErrorMessage('Failed to login with Google. Please try again.');
    }
  }, [startOAuthFlow, setErrorMessage]);

  return (
    <TouchableOpacity style={styles.googleButton} onPress={onPress}>
      <Image
        source={require('../../assets/icons/icons8-google-48.png')}
        style={styles.googleIcon}
      />
      <Text style={styles.googleButtonText}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

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
        const response = await GlobalApi.loginUser(email, password);
        setErrorMessage(null);

        const { token, userId, userType, doctorId, firstName, lastName, email: userEmail } = response.data;
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
          <SignInWithOAuth setErrorMessage={setErrorMessage} />

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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
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
