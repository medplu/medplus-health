import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PharmacistDashboardScreen from './PharmacistDashboardScreen'; // Adjust path if necessary

const Tab = createBottomTabNavigator();

const PharmacistTabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Dashboard" component={PharmacistDashboardScreen} />
            {/* Add more tabs as needed */}
        </Tab.Navigator>
    );
};

export default PharmacistTabs;
