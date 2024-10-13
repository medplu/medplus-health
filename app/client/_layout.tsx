// app/client/ClientLayout.tsx
import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header from '../../components/dashboard/Header';
import ClientTabs from './tabs';


const Stack = createNativeStackNavigator();

const ClientLayout = () => {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          header: () => <Header />,
          
        }}
      >
        <Stack.Screen name="tabs" component={ClientTabs} />
      </Stack.Navigator>
    </View>
  );
};

export default ClientLayout;