import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

const ClientLayout = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Common Header */}
      <View style={{ height: 60, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Common Header</Text>
      </View>

      {/* Content below the header */}
      <View style={{ flex: 1 }}>
        <Stack />
      </View>
    </View>
  );
};

export default ClientLayout;
