import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useOAuth, useSession, useClerk } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

interface SignInWithOAuthProps {
  setErrorMessage: (message: string | null) => void;
  router: any; // Add router as a prop
}

const SignInWithOAuth: React.FC<SignInWithOAuthProps> = ({ setErrorMessage, router }) => {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { session } = useSession();
  const { signOut } = useClerk();

  const onPress = React.useCallback(async () => {
    if (session) {
      try {
        await signOut();
      } catch (err) {
        console.error('Error logging out existing session', err);
        setErrorMessage('Failed to log out existing session. Please try again.');
        return;
      }
    }

    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/client/tabs', { scheme: 'myapp' }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        await AsyncStorage.setItem('authToken', createdSessionId); // Store session ID as authToken
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