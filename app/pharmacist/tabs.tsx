import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PharmacistDashboardScreen from './PharmacistDashboardScreen'; // Adjust path if necessary
import Sales from './Sales'; // Correct the import path for the Sales component
import InventoryScreen from './InventoryScreen'; // Import the Inventory screen
import ReportsScreen from './ReportsScreen'; // Import the Reports screen
import PharmacistHeader from './PharmacistHeader'; // Import the new header component

const Tab = createBottomTabNavigator();

const PharmacistTabs = () => {
    return (
        <>
            <PharmacistHeader /> {/* Add the header component */}
            <Tab.Navigator>
                <Tab.Screen 
                    name="Dashboard" 
                    component={PharmacistDashboardScreen} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home" color={color} size={size} />
                        ),
                    }}
                />
                <Tab.Screen 
                    name="Sales" 
                    component={Sales} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="cash" color={color} size={size} />
                        ),
                    }}
                />
                <Tab.Screen 
                    name="Inventory" 
                    component={InventoryScreen} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="list" color={color} size={size} />
                        ),
                    }}
                />
                <Tab.Screen 
                    name="Reports" 
                    component={ReportsScreen} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="stats-chart" color={color} size={size} />
                        ),
                    }}
                />
                {/* Add more tabs as needed */}
            </Tab.Navigator>
        </>
    );
};

export default PharmacistTabs;
