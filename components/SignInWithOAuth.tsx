import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useOAuth, useSession, useClerk } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

interface SignInWithOAuthProps {
  setErrorMessage: (message: string | null) => void;
  router: any; // Ensure this is being passed correctly
}

const SignInWithOAuth: React.FC<SignInWithOAuthProps> = ({ setErrorMessage, router }) => {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { session } = useSession();
  const { signOut } = useClerk();

  const saveUserToBackend = async (user: any) => {
    if (!user) {
      console.error('User object is undefined');
      setErrorMessage('User object is undefined. Please try again.');
      return null;
    }

    try {
      // Save the user to the backend
      const saveResponse = await fetch('https://medplus-health.onrender.com/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email_addresses[0].email_address,
          profileImage: user.image_url,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save user to backend');
      }

      const savedUser = await saveResponse.json();
      console.log('Saved user:', savedUser);

      return savedUser.userId;
    } catch (error) {
      console.error('Error saving user to backend:', error);
      setErrorMessage('Failed to save user to backend. Please try again.');
      return null;
    }
  };

  const onPress = React.useCallback(async () => {
    console.log("Session before sign out:", session);

    if (session) {
      try {
        await signOut();
        console.log("Signed out successfully");
      } catch (err) {
        console.error('Error logging out existing session', err);
        setErrorMessage('Failed to log out existing session. Please try again.');
        return;
      }
    }

    try {
      const { createdSessionId, setActive, user } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/client/tabs', { scheme: 'myapp' }),
      });

      console.log("Created Session ID:", createdSessionId);
      console.log("User object:", user);

      if (createdSessionId && user) {
        await setActive!({ session: createdSessionId });
        await AsyncStorage.setItem('authToken', createdSessionId); // Store session ID as authToken

        // Save user to backend and get userId
        const userId = await saveUserToBackend(user);

        if (!userId) {
          setErrorMessage('Failed to save user to backend. Please try again.');
          return;
        }

        // Save user details to AsyncStorage
        await AsyncStorage.multiSet([
          ['userId', userId],
          ['firstName', user.first_name],
          ['lastName', user.last_name],
          ['email', user.email_addresses[0].email_address],
        ]);

        // Navigate to the main app screen
        router.push('/client/tabs');
      } else {
        setErrorMessage('Failed to login with Google. Please try again.');
      }
    } catch (err) {
      console.error('OAuth error', err);
      setErrorMessage(`Failed to login with Google. Please try again. Error: ${err.message}`);
    }
  }, [startOAuthFlow, setErrorMessage, router, session, signOut]);

  return (
    <TouchableOpacity style={styles.googleButton} onPress={onPress}>
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