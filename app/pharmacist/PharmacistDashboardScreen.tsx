import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import CreatePharmacyForm from '../../components/CreatePharmacyForm';
import axios from 'axios';

const PharmacistDashboardScreen: React.FC = () => {
    const user = useSelector(selectUser);
    const [catalogue, setCatalogue] = useState([]);
    const [sales, setSales] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemStock, setNewItemStock] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('');

    useEffect(() => {
        const fetchCatalogue = async () => {
            try {
                const response = await axios.get('https://medplus-health.onrender.com/api/catalogue');
                setCatalogue(response.data);
            } catch (error) {
                console.error('Error fetching catalogue:', error);
            }
        };

        const fetchSales = async () => {
            try {
                const response = await axios.get('/api/sales');
                setSales(response.data);
            } catch (error) {
                console.error('Error fetching sales:', error);
            }
        };

        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/orders');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchCatalogue();
        fetchSales();
        fetchOrders();
    }, []);

    const addItemToCatalogue = async () => {
        const newItem = {
            pharmacyId: user.professional.pharmacyId,
            drugName: newItemName,
            stock: newItemStock,
            price: newItemPrice,
            category: newItemCategory
        };
        try {
            const response = await axios.post('https://medplus-health.onrender.com/api/catalogue/add', newItem);
            setCatalogue([...catalogue, response.data]);
            setNewItemName('');
            setNewItemStock('');
            setNewItemPrice('');
            setNewItemCategory('');
        } catch (error) {
            console.error('Error adding item to catalogue:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.greetingText}>Welcome, {user.name}!</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pharmacy Overview</Text>
                {user.professional.profession === 'pharmacist' ? (
                    user.professional.attachedToPharmacy ? (
                        <>
                            <View style={styles.attachedContainer}>
                                <Text style={styles.attachedText}>You are attached to a pharmacy.</Text>
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Manage Catalogue</Text>
                                {catalogue.map(item => (
                                    <View key={item.id} style={styles.itemContainer}>
                                        <Text>{item.drugName} - {item.price}</Text>
                                    </View>
                                ))}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Item Name"
                                    value={newItemName}
                                    onChangeText={setNewItemName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Item Stock"
                                    value={newItemStock}
                                    onChangeText={setNewItemStock}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Item Price"
                                    value={newItemPrice}
                                    onChangeText={setNewItemPrice}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Item Category"
                                    value={newItemCategory}
                                    onChangeText={setNewItemCategory}
                                />
                                <Button title="Add New Item" onPress={addItemToCatalogue} />
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Sales</Text>
                                {sales.map(sale => (
                                    <View key={sale.id} style={styles.itemContainer}>
                                        <Text>{sale.item} - {sale.amount}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Orders</Text>
                                {orders.map(order => (
                                    <View key={order.id} style={styles.itemContainer}>
                                        <Text>{order.customer} - {order.status}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <CreatePharmacyForm user={user} />
                    )
                ) : (
                    <View style={styles.notPharmacistContainer}>
                        <Text style={styles.notPharmacistText}>You are not a pharmacist. Please contact admin for further assistance.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: '#ff7f50',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    attachedContainer: {
        marginBottom: 20,
    },
    attachedText: {
        fontSize: 16,
        color: '#333',
    },
    notPharmacistContainer: {
        marginBottom: 20,
    },
    notPharmacistText: {
        fontSize: 16,
        color: '#333',
    },
    itemContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
});

export default PharmacistDashboardScreen;
