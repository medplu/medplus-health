import { StyleSheet, Text, View, Image, TouchableOpacity, Button } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const SignInWithOAuth = () => {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/client/tabs', { scheme: 'myapp' }),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [startOAuthFlow]);

  return (
    <Button title="Sign in with Google" onPress={onPress} />
  );
};

const Index = () => {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#E0E0E0']} // Updated gradient colors to shades of white
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Image
          source={require('../assets/images/medical-symbol.png')} // Update the path to your logo image
          style={styles.logo}
        />
        <Text style={styles.companyName}>MedPlus Supat</Text>
      </View>
      <View style={styles.footer}>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
        <SignInWithOAuth />
      </View>
    </LinearGradient>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Darker color for better contrast
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  footer: {
    paddingBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#00796B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 10, // Add margin to separate buttons
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});