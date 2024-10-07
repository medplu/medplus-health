import { Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const Index = () => {
  return (
    <LinearGradient
      colors={['#ffffff', '#f0f0f0']}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to MedPlus</Text>
        <Text style={styles.subtitle}>Your health, our priority</Text>
      </View>
      <View style={styles.footer}>
        <Link href="/register" asChild>
          <Button title="Register" color="#00796B" />
        </Link>
      </View>
      <Toast position="bottom" bottomOffset={20} />
    </LinearGradient>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  footer: {
    paddingBottom: 30,
  },
});