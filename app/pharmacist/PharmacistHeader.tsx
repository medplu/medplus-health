import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../store/userSlice';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

const PharmacistHeader: React.FC = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const handleLogout = useCallback(() => {
        dispatch(logout());
        navigation.navigate('login/index'); // Ensure this matches your login route
    }, [dispatch, navigation]);

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
                <AntDesign name="logout" size={28} color="#fff" />
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
    logoutIcon: {
        padding: 10,
    },
    logo: {
        width: 100,
        height: 40,
        resizeMode: 'contain',
    },
});

export default PharmacistHeader;