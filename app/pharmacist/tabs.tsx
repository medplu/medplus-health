import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PharmacistDashboardScreen from './PharmacistDashboardScreen'; 
import InventoryScreen from './InventoryScreen'; 
import ReportsScreen from './ReportsScreen';

const Tab = createBottomTabNavigator();

const PharmacistTabs = () => {
    return (
        <>
          
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
                
            </Tab.Navigator>
        </>
    );
};

export default PharmacistTabs;
