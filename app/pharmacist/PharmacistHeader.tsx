
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const PharmacistHeader: React.FC = () => {
    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuText}>☰</Text>
            </TouchableOpacity>
            <Image source={require('../../assets/images/medical-symbol.png')} style={styles.logo} />
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#ff7f50',
    },
    menuButton: {
        padding: 10,
    },
    menuText: {
        fontSize: 24,
        color: '#fff',
    },
    logo: {
        width: 100,
        height: 40,
        resizeMode: 'contain',
    },
});

export default PharmacistHeader;