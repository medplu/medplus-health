import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 10000); // Navigate to login screen after 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']} // Updated gradient colors to a more medical-themed background
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.content}>
        <Image
          source={require('../assets/images/medical-symbol.png')} // Update the path to your logo image
          style={styles.logo}
        />
        <Text style={styles.companyName}>MedPlus Supat</Text>
      </View>
    </LinearGradient>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120, // Adjust the width as needed
    height: 120, // Adjust the height as needed
    marginBottom: 20,
    borderRadius: 60, // Make the logo circular
    borderWidth: 2,
    borderColor: '#fff',
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff', // White color for better contrast
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
});