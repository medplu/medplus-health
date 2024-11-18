
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const prescriptions = [
    { id: '1', patientName: 'John Doe', date: '2023-10-01' },
    { id: '2', patientName: 'Jane Smith', date: '2023-10-02' },
    // Add more prescriptions as needed
];

const PrescriptionList: React.FC = () => {
    const navigation = useNavigation();

    const handleSelectPrescription = (id: string) => {
        navigation.navigate('PrescriptionDetails', { id });
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={prescriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelectPrescription(item.id)} style={styles.item}>
                        <Text style={styles.text}>{item.patientName}</Text>
                        <Text style={styles.text}>{item.date}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    text: {
        fontSize: 16,
    },
});

export default PrescriptionList;