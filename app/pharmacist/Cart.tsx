
import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectCart, processCart } from '../store/cartSlice';

const Cart: React.FC = () => {
    const cart = useSelector(selectCart);
    const dispatch = useDispatch();

    const handleProcessCart = () => {
        dispatch(processCart());
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={cart}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.text}>{item.name}</Text>
                        <Text style={styles.text}>Quantity: {item.quantity}</Text>
                    </View>
                )}
            />
            <Button title="Process Cart" onPress={handleProcessCart} />
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

export default Cart;