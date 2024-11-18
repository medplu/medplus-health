
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

const PrescriptionDetails: React.FC = ({ route }) => {
    const { id } = route.params;
    const dispatch = useDispatch();

    const handleAddToCart = (item) => {
        dispatch(addToCart(item));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Prescription Details for ID: {id}</Text>
            {/* Display prescription details here */}
            <Button title="Add to Cart" onPress={() => handleAddToCart({ id, name: 'Medicine', quantity: 1 })} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    text: {
        fontSize: 16,
        marginBottom: 16,
    },
});

export default PrescriptionDetails;