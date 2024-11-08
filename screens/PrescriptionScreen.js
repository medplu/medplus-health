import React from 'react';
import { View, StyleSheet } from 'react-native';
import PrescriptionTemplate from '@/components/PrescriptionTemplate';
import { useLocalSearchParams } from 'expo-router';

const PrescriptionScreen = () => {
    const { prescription } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <PrescriptionTemplate prescription={prescription} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

export default PrescriptionScreen;
