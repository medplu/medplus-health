import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const Index = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Login'); // Navigate to the login screen after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Clear the timer if the component is unmounted
  }, [navigation]);

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
});