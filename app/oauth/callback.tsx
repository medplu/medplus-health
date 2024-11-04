import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useClerk } from '@clerk/clerk-expo';

const OAuthCallback: React.FC = () => {
  const router = useRouter();
  const { startSession } = useClerk(); // Use startSession instead of handleOAuthCallback

  useEffect(() => {
    const processCallback = async () => {
      try {
        await startSession(); // Initiates the session parsing
        router.push('/client/tabs');
      } catch (error) {
        console.error('OAuth Callback Error:', error);
        // Optionally, navigate to an error screen or show a message
      }
    };

    processCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OAuthCallback;
