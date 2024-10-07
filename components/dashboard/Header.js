import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Header() {
    const profileImageUrl = 'https://example.com/profile.jpg'; // Replace with actual profile image URL
    const fullName = 'User'; // Replace with actual user name

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Image source={{ uri: profileImageUrl }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                <View>
                    <Text style={{ fontFamily: 'Inter-Black' }}>Hello, 👋</Text>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter-Black-Bold' }}>{fullName}</Text>
                </View>
            </View>
            <TouchableOpacity>
                <MaterialIcons name="notifications" size={28} color="black" />
            </TouchableOpacity>
        </View>
    );
}