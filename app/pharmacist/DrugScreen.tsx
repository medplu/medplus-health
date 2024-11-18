import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useSelector } from 'react-redux'
import { selectUser } from '../store/userSlice'

const DrugScreen = () => {
  const route = useRoute();
  const { pharmacyId } = route.params;

  const user = useSelector(selectUser);
  const customerName = user.name;
  const customerContact = user.email;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [drugs, setDrugs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await fetch(`https://med-pharm.onrender.com/api/${pharmacyId}`);
        const data = await response.json();
        setDrugs(data.drugs);
      } catch (error) {
        console.error('Error fetching drugs:', error);
      }
    };

    fetchDrugs();
  }, [pharmacyId]);

  const handleAddDrug = async () => {
    try {
      const response = await fetch('https://med-pharm.onrender.com/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          category,
          description,
          price,
          quantity,
          manufacturer,
          expiryDate,
          pharmacyId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Drug added successfully');
        setName('');
        setCategory('');
        setDescription('');
        setPrice('');
        setQuantity('');
        setManufacturer('');
        setExpiryDate('');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const addToCart = (drug) => {
    setCart((prevCart) => {
      const existingDrug = prevCart.find(item => item._id === drug._id);
      if (existingDrug) {
        return prevCart.map(item =>
          item._id === drug._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...drug, quantity: 1 }];
      }
    });
    setTotalPrice((prevTotal) => prevTotal + drug.price);
  };

  const handleCheckout = async () => {
    try {
      console.log("Cart items:", cart);
      cart.forEach(item => console.log("Drug ID:", item._id));

      const response = await fetch('https://med-pharm.onrender.com/api/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cart.map(item => ({
            drugId: item._id,
            quantity: item.quantity,
            pharmacyId,
            customerName,
            customerContact,
          })),
          totalPrice,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Checkout successful');
        setCart([]);
        setTotalPrice(0);
        fetchDrugs();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drug List</Text>
      <FlatList
        data={drugs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.drugItem}>
            <Text style={styles.drugName}>{item.name}</Text>
            <Text>Category: {item.category}</Text>
            <Text>Price: ${item.price}</Text>
            <Text>Stock: {item.stock}</Text>
            <Text>Restock Level: {item.restockLevel}</Text>
            <Text>Expiry Date: {item.expiryDate}</Text>
            <Button title="Add to Cart" onPress={() => addToCart(item)} />
          </View>
        )}
      />
      <View style={styles.cartContainer}>
        <Text style={styles.cartTitle}>Cart</Text>
        <FlatList
          data={cart}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Text style={styles.cartItemName}>{item.name}</Text>
              <Text>Quantity: {item.quantity}</Text>
              <Text>Price: ${item.price * item.quantity}</Text>
            </View>
          )}
        />
        <Text style={styles.totalPrice}>Total Price: ${totalPrice}</Text>
        <Button title="Checkout" onPress={handleCheckout} />
      </View>
      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
          <TextInput
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Manufacturer"
            value={manufacturer}
            onChangeText={setManufacturer}
            style={styles.input}
          />
          <TextInput
            placeholder="Expiry Date"
            value={expiryDate}
            onChangeText={setExpiryDate}
            style={styles.input}
            type="date"
          />
          <Button title="Add Drug" onPress={handleAddDrug} />
        </View>
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Ionicons name={showForm ? "close" : "add"} size={24} color="white" />
      </TouchableOpacity>
    </View>
  )
}

export default DrugScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  drugItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  formContainer: {
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cartItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
})