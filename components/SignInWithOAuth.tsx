import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useDispatch } from 'react-redux';  // Import Redux dispatch
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';  // Using useRouter for navigation
import { login } from '../app/store/userSlice'; // Import the Redux login action

WebBrowser.maybeCompleteAuthSession();

interface SignInWithOAuthProps {
  setErrorMessage: (message: string | null) => void;
  router: any; 
}

const SignInWithOAuth: React.FC<SignInWithOAuthProps> = ({ setErrorMessage, router }) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '@parroti/medplus-app',
    androidClientId: '399287117531-s5ea9q7t3v9auj3tspnvi3j70fd9tdg8.apps.googleusercontent.com',
    webClientId: '399287117531-tmvmbo06a5l8svihhb7c7smqt7iobbs0.apps.googleusercontent.com',
    redirectUri: 'http://localhost:8081/auth/google/callback', // Use custom scheme
  });

  const dispatch = useDispatch();  // Access Redux dispatch
 

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleLoginSuccess(authentication.accessToken);
      } else {
        setErrorMessage('Google login failed. Please try again.');
      }
    }
  }, [response]);

  const handleLoginSuccess = async (accessToken: string) => {
    try {
      // Fetch user information from Google using the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoResponse.json();

      // Send user info to your backend for authentication or account creation
      const response = await fetch('https://medplus-health.onrender.com/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken, // Send the access token
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const savedUser = await response.json();
      console.log('Saved user:', savedUser);

      // Dispatch the user data to Redux
      dispatch(
        login({
          name: `${savedUser.firstName} ${savedUser.lastName}`,
          email: savedUser.email,
          userId: savedUser.userId,
          userType: savedUser.userType,
          profileImage: userInfo.picture, // Save profile image
        })
      );

      // Store the user data and authentication token in AsyncStorage
      await AsyncStorage.multiSet([
        ['authToken', savedUser.token],
        ['userId', savedUser.userId],
        ['firstName', savedUser.firstName],
        ['lastName', savedUser.lastName],
        ['email', savedUser.email],
        ['profileImage', userInfo.picture], // Store profile image URL
      ]);

      // Redirect to the appropriate user tab
      if (savedUser.userType === 'client') {
        router.push('/client/tabs');
      } else if (savedUser.userType === 'professional') {
        router.push('/professional/tabs');
      } else {
        router.push('/student/tabs');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Failed to complete Google login. Please try again.');
    }
  };

  const onPress = () => {
    promptAsync();
  };

  return (
    <TouchableOpacity style={styles.googleButton} onPress={onPress} disabled={!request}>
      <Image
        source={require('../assets/icons/icons8-google-48.png')}
        style={styles.googleIcon}
      />
      <Text style={styles.googleButtonText}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default SignInWithOAuth;
