import { Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

const index = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar style="light" />
      <Text>HomePage</Text>
      <Link href="/register" asChild>
        <Button title="open the register page" />
      </Link>
      <Link href='/one' asChild>
      <Button title='open the first tab' />
      </Link>
      <Toast position="bottom" bottomOffset={20} />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});