import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useNavigation } from '@react-navigation/native';

const PharmacistDashboardScreen = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const professionalId = user.professional?._id;
  const [pharmacy, setPharmacy] = useState(null);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        const response = await fetch(`https://medplus-health.onrender.com/api/pharmacies/professional/${professionalId}`);
        const data = await response.json();
        setPharmacy(data);
      } catch (error) {
        console.error('Error fetching pharmacy:', error);
      }
    };

    if (professionalId) {
      fetchPharmacy();
    }
  }, [professionalId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const salesResponse = await fetch(`https://medplus-health.onrender.com/api/sales/today/${professionalId}`);
        const salesData = await salesResponse.json();
        setTotalSales(salesData.total);

        const ordersResponse = await fetch(`https://medplus-health.onrender.com/api/orders/ongoing/${professionalId}`);
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);

        const clientsResponse = await fetch(`https://medplus-health.onrender.com/api/clients/${professionalId}`);
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (professionalId) {
      fetchDashboardData();
    }
  }, [professionalId]);

  return (
    <View style={styles.container}>
      <View style={styles.introSection}>
        <Image
          source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/men/46.jpg' }}
          style={styles.profileImage}
        />
        <Text style={styles.welcomeText}>Welcome, {user.professional?.firstName || 'Pharmacist'}!</Text>
      </View>
      {pharmacy && <Text style={styles.pharmacyText}>Pharmacy: {pharmacy.name}</Text>}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total Sales Today</Text>
          <Text style={styles.statValue}>${totalSales}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Ongoing Orders</Text>
          <Text style={styles.statValue}>{orders.length}</Text>
        </View>
      </View>
      <View style={styles.ordersContainer}>
        <Text style={styles.sectionTitle}>Ongoing Orders</Text>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <View key={index} style={styles.orderCard}>
              <Text style={styles.orderText}>Order ID: {order._id}</Text>
              <Text style={styles.orderText}>Client: {order.clientName}</Text>
              <Text style={styles.orderText}>Status: {order.status}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No ongoing orders.</Text>
        )}
      </View>
      <View style={styles.clientsContainer}>
        <Text style={styles.sectionTitle}>Clients</Text>
        {clients.length > 0 ? (
          clients.map((client, index) => (
            <View key={index} style={styles.clientCard}>
              <Text style={styles.clientText}>Name: {client.name}</Text>
              <Text style={styles.clientText}>Contact: {client.contact}</Text>
              <Text style={styles.clientText}>Address: {client.address}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No clients available.</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DrugScreen', { pharmacyId: pharmacy?._id })}
      >
        <Text style={styles.cardText}>Catalogue</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PrescriptionScreen', { pharmacyId: pharmacy?._id })}
      >
        <Text style={styles.cardText}>View Prescriptions</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PharmacistDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  introSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pharmacyText: {
    fontSize: 16,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ordersContainer: {
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  orderText: {
    fontSize: 16,
    color: '#333',
  },
  clientsContainer: {
    marginBottom: 20,
  },
  clientCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  clientText: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
