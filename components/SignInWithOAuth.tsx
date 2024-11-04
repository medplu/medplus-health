import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

interface SignInWithOAuthProps {
  setErrorMessage: (message: string | null) => void;
  router: any; // Ensure this is being passed correctly
}

const SignInWithOAuth: React.FC<SignInWithOAuthProps> = ({ setErrorMessage, router }) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '@parroti/medplus-app',
    androidClientId: '399287117531-s5ea9q7t3v9auj3tspnvi3j70fd9tdg8.apps.googleusercontent.com',
    webClientId: '399287117531-tmvmbo06a5l8svihhb7c7smqt7iobbs0.apps.googleusercontent.com',
    // Updated redirectUri to match authorized URI
    redirectUri: 'https://auth.expo.io/@parroti/medplus-app/auth/google/callback',
  });

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
        // Exchange the Google access token for backend authentication
        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userInfo = await userInfoResponse.json();

        // Send user info to your backend for creation/login
        const response = await fetch('https://medplus-health.onrender.com/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: userInfo.given_name,
                lastName: userInfo.family_name,
                email: userInfo.email,
                profileImage: userInfo.picture,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save user to backend');
        }

        const savedUser = await response.json();
        console.log('Saved user:', savedUser);

        // Save user data in AsyncStorage for future sessions
        await AsyncStorage.multiSet([
            ['authToken', savedUser.token], // Store the received token
            ['userId', savedUser.userId],
            ['firstName', savedUser.firstName],
            ['lastName', savedUser.lastName],
            ['email', savedUser.email],
        ]);

        // Navigate to the client tabs
        router.push('/client/tabs');
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
